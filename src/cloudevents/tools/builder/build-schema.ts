#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let rootDir: string | undefined;
  const filtered: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--root-dir' && i + 1 < args.length) {
      rootDir = args[i + 1];
      i++; // Skip the next argument as it's the root dir value
    } else {
      filtered.push(a);
    }
  }

  return { rootDir, filtered };
}

const { rootDir, filtered } = parseArgs();
const [sourceSchemaPath, outputDir, baseUrl] = filtered;

if (!sourceSchemaPath || !outputDir) {
  console.error(
    "Usage: ts-node build-schema.ts [--root-dir <path>] <source-schema.json|yaml> <output-dir> [base-url]"
  );
  console.error(
    "Example: ts-node build-schema.ts src/common/2025-10/nhs-notify-profile.schema.yaml output/common/2025-10"
  );
  console.error(
    "With URL: ts-node build-schema.ts src/common/2025-10/nhs-notify-profile.schema.yaml output/common/2025-10 https://schema.notify.nhs.uk"
  );
  console.error(
    "With root: ts-node build-schema.ts --root-dir /path/to/repo src/common/2025-10/nhs-notify-profile.schema.yaml output/common/2025-10"
  );
  process.exit(1);
}

interface JsonSchema {
  $id?: string;
  $ref?: string;
  [key: string]: any;
}

/**
 * Recursively process a schema object to update $ref paths
 * Converts relative file paths to either absolute URLs or built paths
 */
function processRefs(
  schema: any,
  sourceDir: string,
  outputBaseDir: string,
  sourceSchemaPath: string,
  baseUrl?: string
): any {
  if (typeof schema !== "object" || schema === null) {
    return schema;
  }

  if (Array.isArray(schema)) {
    return schema.map((item) =>
      processRefs(item, sourceDir, outputBaseDir, sourceSchemaPath, baseUrl)
    );
  }

  const result: any = {};

  for (const [key, value] of Object.entries(schema)) {
    if (key === "$ref" && typeof value === "string") {
      // Skip fragment-only references (e.g., "#/definitions/foo")
      if (value.startsWith("#")) {
        result[key] = value;
      }
      // Keep absolute URLs as-is (http://, https://, etc.)
      else if (value.startsWith("http://") || value.startsWith("https://")) {
        result[key] = value;
      }
      // Transform relative file path references (including simple filenames)
      else if (value.startsWith("..") || value.startsWith(".") || value.endsWith(".json") || value.endsWith(".yaml") || value.endsWith(".yml") || value.includes(".yaml#") || value.includes(".yml#") || value.includes(".json#")) {
        // Split ref into path and fragment
        const [refPath, fragment] = value.split("#");

        // Resolve the absolute path of the referenced schema
        const resolvedPath = path.resolve(sourceDir, refPath);

        // Calculate what the output path would be for this referenced schema
        // Assumes the same directory structure is maintained in output
        const relativePath = path.relative(
          path.join(process.cwd(), "src"),
          resolvedPath
        );

        // Convert YAML extensions to JSON for the output references
        const outputRelativePath = relativePath
          .replace(/\.yaml$/, '.json')
          .replace(/\.yml$/, '.json');

        if (baseUrl) {
          // Convert to URL (output will be .json)
          const urlPath = outputRelativePath.replace(/\\/g, "/");
          result[key] = fragment ? `${baseUrl}/${urlPath}#${fragment}` : `${baseUrl}/${urlPath}`;
        } else {
          // Keep as relative path but update to point to built location (output will be .json)
          // Calculate where our current file will be in output
          const sourceRelativePath = path.relative(
            path.join(process.cwd(), "src"),
            sourceSchemaPath
          );
          const outputFileRelativePath = sourceRelativePath
            .replace(/\.yaml$/, '.json')
            .replace(/\.yml$/, '.json');
          const fromOutputFile = path.join(
            process.cwd(),
            "output",
            path.dirname(outputFileRelativePath)
          );

          // Calculate where the referenced file will be in output
          const toBuiltFile = path.join(
            process.cwd(),
            "output",
            outputRelativePath
          );

          let relativeRef = path
            .relative(fromOutputFile, toBuiltFile)
            .replace(/\\/g, "/");
          relativeRef = relativeRef.startsWith(".")
            ? relativeRef
            : `./${relativeRef}`;
          result[key] = fragment ? `${relativeRef}#${fragment}` : relativeRef;
        }
      } else {
        // Keep absolute URLs as-is
        result[key] = value;
      }
    } else if (key === "const" && typeof value === "string" && !value.startsWith("http://") && !value.startsWith("https://") && (value.endsWith(".yaml") || value.endsWith(".yml") || value.endsWith(".json") || value.includes(".yaml#") || value.includes(".yml#") || value.includes(".json#") || (value.startsWith("./") && value.includes("schema")))) {
      // Transform const values that reference schema files (skip absolute URLs)
      // First convert .yaml to .json
      let constValue = value.replace(/\.yaml(#|$)/, '.json$1').replace(/\.yml(#|$)/, '.json$1');

      // If it's a relative path and we have a baseUrl, convert to full URL
      if ((constValue.startsWith("./") || constValue.startsWith("../")) && baseUrl) {
        const [refPath, fragment] = constValue.split("#");
        const resolvedPath = path.resolve(sourceDir, refPath);
        const relativePath = path.relative(
          path.join(process.cwd(), "src"),
          resolvedPath
        );
        const urlPath = relativePath.replace(/\\/g, "/");
        constValue = fragment ? `${baseUrl}/${urlPath}#${fragment}` : `${baseUrl}/${urlPath}`;
      }

      result[key] = constValue;
    } else if (key === "examples" && Array.isArray(value)) {
      // Transform examples array - convert .yaml to .json in string values, and apply URL if baseUrl is set
      result[key] = value.map(example => {
        if (typeof example === "string") {
          let exampleValue = example.replace(/\.yaml$/, '.json').replace(/\.yml$/, '.json');

          // If it's a relative path and we have a baseUrl, convert to full URL
          if ((exampleValue.startsWith("./") || exampleValue.startsWith("../")) && baseUrl && exampleValue.includes("schema")) {
            const resolvedPath = path.resolve(sourceDir, exampleValue);
            const relativePath = path.relative(
              path.join(process.cwd(), "src"),
              resolvedPath
            );
            const urlPath = relativePath.replace(/\\/g, "/");
            exampleValue = `${baseUrl}/${urlPath}`;
          }

          return exampleValue;
        }
        return example;
      });
    } else if (typeof value === "object") {
      result[key] = processRefs(value, sourceDir, outputBaseDir, sourceSchemaPath, baseUrl);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Build a schema from source to output with proper $id
 */
function buildSchema(
  sourceSchemaPath: string,
  outputDir: string,
  baseUrl?: string
): void {
  // Read source schema
  const sourceAbsolutePath = path.resolve(sourceSchemaPath);
  const sourceDir = path.dirname(sourceAbsolutePath);
  const sourceContent = fs.readFileSync(sourceAbsolutePath, "utf-8");

  // Parse based on file extension
  let schema: JsonSchema;
  if (sourceSchemaPath.endsWith('.yaml') || sourceSchemaPath.endsWith('.yml')) {
    schema = yaml.load(sourceContent) as JsonSchema;
  } else {
    schema = JSON.parse(sourceContent);
  }

  // Calculate the output path - always output as JSON
  const schemaFileName = path.basename(sourceSchemaPath)
    .replace(/\.yaml$/, '.json')
    .replace(/\.yml$/, '.json');
  const outputPath = path.join(outputDir, schemaFileName);

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Calculate the $id
  let schemaId: string;
  if (baseUrl) {
    // Use provided base URL - output will be .json
    const repoRoot = rootDir ? path.resolve(rootDir) : process.cwd();
    const relativePath = path.relative(
      path.join(repoRoot, "src"),
      sourceAbsolutePath
    );
    const jsonRelativePath = relativePath
      .replace(/\.yaml$/, '.json')
      .replace(/\.yml$/, '.json');
    schemaId = `${baseUrl}/${jsonRelativePath.replace(/\\/g, "/")}`;
  } else {
    // Use relative path from output root with leading /
    // This allows relative $refs to resolve correctly in AJV
    const repoRoot = rootDir ? path.resolve(rootDir) : process.cwd();
    const outputRoot = path.join(repoRoot, "output");
    const relativePath = path.relative(outputRoot, outputPath);
    schemaId = "/" + relativePath.replace(/\\/g, "/");
  }

  // Process the schema: add $id and transform $refs
  const builtSchema = {
    $id: schemaId,
    ...processRefs(schema, sourceDir, outputDir, sourceAbsolutePath, baseUrl),
  };

  // Write the built schema
  fs.writeFileSync(outputPath, JSON.stringify(builtSchema, null, 2) + "\n");

  console.log(`Built: ${sourceSchemaPath}`);
  console.log(`  -> ${outputPath}`);
  console.log(`  $id: ${schemaId}`);
}

// Run the build
try {
  buildSchema(sourceSchemaPath, outputDir, baseUrl);
} catch (error) {
  console.error("Error building schema:", error);
  process.exit(1);
}
