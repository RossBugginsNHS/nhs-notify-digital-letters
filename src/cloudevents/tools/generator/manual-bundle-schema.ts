import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import https from 'https';
import { getCachedSchema, setCachedSchema, clearCache, displayCacheInfo } from '../cache/schema-cache.ts';

/**
 * Schema bundler with two modes:
 *
 * Bundle mode:
 * - Keeps allOf with $refs intact (doesn't expand them)
 * - Only dereferences $refs in properties (inlines property schemas)
 * - Preserves inheritance structure
 *
 * Flatten mode:
 * - Resolves entire allOf chain
 * - Merges properties from all schemas in the chain
 * - When same property exists in multiple schemas, uses allOf at property level to combine constraints
 */

interface SchemaObject {
  [key: string]: any;
  $ref?: string;
}

function isExternalRef(ref: string): boolean {
  return ref.startsWith('http://') || ref.startsWith('https://');
}

function resolveRefPath(currentFilePath: string, ref: string): string {
  const currentDir = path.dirname(currentFilePath);
  const [refPath] = ref.split('#');
  return path.resolve(currentDir, refPath);
}

function loadSchema(filePath: string): SchemaObject {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
    return yaml.load(content) as SchemaObject;
  }
  return JSON.parse(content);
}

async function fetchExternalSchema(url: string): Promise<SchemaObject> {
  // Check cache (which now handles fetching with retry)
  const cached = await getCachedSchema(url);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error(`[CACHE] Failed to parse cached schema for ${url}:`, error);
      throw new Error(`Failed to parse schema from ${url}`);
    }
  }

  // If cache returns null, fetching failed
  throw new Error(`Failed to fetch schema from ${url} after retries`);
}

// Post-process: convert remaining relative file refs to external URLs
function convertRelativeRefsToUrls(
  schema: any,
  sourceFile: string,
  repoRoot: string,
  baseUrl: string
): any {
  if (!schema || typeof schema !== 'object') return schema;

  if (Array.isArray(schema)) {
    return schema.map(item => convertRelativeRefsToUrls(item, sourceFile, repoRoot, baseUrl));
  }

  const result: any = {};

  for (const [key, value] of Object.entries(schema)) {
    if ((key === '$ref' || key === 'const') && typeof value === 'string') {
      const ref = value;

      // Only process relative file refs (not external http/https or internal #/)
      // Also handle file:// URIs
      const isFileUri = ref.startsWith('file://../') || ref.startsWith('file://./');
      const isRelative = ref.startsWith('./') || ref.startsWith('../');

      if (!isExternalRef(ref) && !ref.startsWith('#/') && (isFileUri || isRelative)) {
        try {
          // Strip file:// prefix if present
          let cleanRef = ref;
          if (isFileUri) {
            cleanRef = ref.replace(/^file:\/\//, '');
          }

          // Split into path and fragment
          const [refPath, fragment] = cleanRef.split('#');

          // Resolve the relative path from the source file's directory
          // sourceFile is in output/, so this gives us an absolute path in output/
          const resolvedPath = resolveRefPath(sourceFile, refPath);

          // Calculate the path relative to output/ root
          const outputPath = path.join(repoRoot, 'output');
          const relativeToOutput = path.relative(outputPath, resolvedPath);

          // This relative path mirrors the structure under src/cloudevents/domains/
          // Convert to URL path (normalize slashes)
          let urlPath = relativeToOutput.replace(/\\/g, '/');

          // Strip "cloudevents/domains/" prefix if present (same as build-schema.ts does with stripPrefix)
          if (urlPath.startsWith('cloudevents/domains/')) {
            urlPath = urlPath.substring('cloudevents/domains/'.length);
          }

          // Construct the final URL
          const fragmentPart = fragment ? `#${fragment}` : '';
          result[key] = `${baseUrl}/${urlPath}${fragmentPart}`;
        } catch (error: any) {
          console.warn(`Warning: Could not convert ${ref} to external URL: ${error.message}`);
          result[key] = value;
        }
      } else {
        // Keep external, internal, or already processed refs as-is
        result[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively process nested objects
      result[key] = convertRelativeRefsToUrls(value, sourceFile, repoRoot, baseUrl);
    } else {
      result[key] = value;
    }
  }

  return result;
}

async function bundleSchema(
  entryPath: string,
  flatten: boolean = false
): Promise<SchemaObject> {

  // For bundled: only dereference $refs in properties, not in allOf
  function dereferencePropertiesOnly(schema: any, currentFile: string, inAllOf: boolean = false): any {
    if (!schema || typeof schema !== 'object') {
      return schema;
    }

    if (Array.isArray(schema)) {
      return schema.map(item => dereferencePropertiesOnly(item, currentFile, inAllOf));
    }

    // If this is a $ref in allOf context, keep it as-is
    if (inAllOf && schema.$ref) {
      return schema;
    }

    // If this is a $ref in properties context, dereference it
    if (!inAllOf && schema.$ref && typeof schema.$ref === 'string') {
      const ref = schema.$ref;

      // Keep external HTTP/HTTPS refs
      if (isExternalRef(ref)) {
        return schema;
      }

      // Keep internal fragment refs
      if (ref.startsWith('#/')) {
        return schema;
      }

      // Dereference local file refs
      const [refPath, fragment] = ref.split('#');
      if (refPath) {
        try {
          const resolvedPath = resolveRefPath(currentFile, refPath);
          const refSchema = loadSchema(resolvedPath);

          let target = refSchema;
          if (fragment) {
            const fragmentPath = fragment.substring(1).split('/');
            for (const segment of fragmentPath) {
              if (target && typeof target === 'object') {
                target = target[segment];
              }
            }
          }

          const dereferenced = dereferencePropertiesOnly(target, resolvedPath, false);

          // Clean up and add source comment
          let result = dereferenced;
          if (dereferenced && typeof dereferenced === 'object') {
            result = { ...dereferenced };

            // Remove $id to avoid conflicts
            if (result.$id) {
              delete result.$id;
            }

            // Add $comment to track source of dereferenced schema
            const sourceComment = `Dereferenced from: ${ref}`;
            if (result.$comment) {
              result.$comment = `${result.$comment} | ${sourceComment}`;
            } else {
              result.$comment = sourceComment;
            }
          }

          return result;
        } catch (error: any) {
          console.warn(`Warning: Could not load ${refPath}: ${error.message}`);
          return schema;
        }
      }
    }

    const result: any = {};

    for (const [key, value] of Object.entries(schema)) {
      // Mark allOf context
      if (key === 'allOf') {
        result[key] = dereferencePropertiesOnly(value, currentFile, true);
      } else {
        result[key] = dereferencePropertiesOnly(value, currentFile, inAllOf);
      }
    }

    return result;
  }

  // For flattened: resolve allOf chain and merge properties
  async function flattenAllOf(schema: any, currentFile: string): Promise<any> {
    if (!schema || typeof schema !== 'object') {
      return schema;
    }

    if (Array.isArray(schema)) {
      return Promise.all(schema.map(item => flattenAllOf(item, currentFile)));
    }

    // Helper to fully resolve a schema by following $refs and allOf
    async function resolveSchema(s: any, file: string): Promise<{ schema: any; resolvedPath: string }> {
      if (!s || typeof s !== 'object') return { schema: s, resolvedPath: file };

      // Resolve $ref
      if (s.$ref && typeof s.$ref === 'string') {
        const ref = s.$ref;

        // Fetch external refs
        if (isExternalRef(ref)) {
          try {
            const externalSchema = await fetchExternalSchema(ref);
            // Prefix internal refs in external schemas with the base URL
            const prefixedSchema = prefixInternalRefs(externalSchema, ref);
            return resolveSchema(prefixedSchema, ref);
          } catch (error: any) {
            console.error(`Error fetching external ref ${ref}: ${error.message}`);
            return { schema: s, resolvedPath: file }; // Return original on error
          }
        }

        if (ref.startsWith('#/')) {
          return { schema: s, resolvedPath: file }; // Keep internal refs for now
        }

        const [refPath, fragment] = ref.split('#');
        if (refPath) {
          try {
            const resolvedPath = resolveRefPath(file, refPath);
            const refSchema = loadSchema(resolvedPath);

            let target = refSchema;
            if (fragment) {
              const fragmentPath = fragment.substring(1).split('/');
              for (const segment of fragmentPath) {
                if (target && typeof target === 'object') {
                  target = target[segment];
                }
              }
            }

            return resolveSchema(target, resolvedPath);
          } catch (error: any) {
            console.warn(`Warning: Could not resolve ${ref} from ${file}: ${error.message}`);
            return { schema: s, resolvedPath: file };
          }
        }
      }

      return { schema: s, resolvedPath: file };
    }

    // Helper to prefix internal refs (#/...) in a schema with an external base URL
    function prefixInternalRefs(schema: any, baseUrl: string): any {
      if (!schema || typeof schema !== 'object') return schema;

      if (Array.isArray(schema)) {
        return schema.map(item => prefixInternalRefs(item, baseUrl));
      }

      const result: any = {};

      for (const [key, value] of Object.entries(schema)) {
        if (key === '$ref' && typeof value === 'string' && value.startsWith('#/')) {
          // Prefix internal ref with base URL
          const baseWithoutFragment = baseUrl.split('#')[0];
          result[key] = `${baseWithoutFragment}${value}`;
        } else if (typeof value === 'object') {
          result[key] = prefixInternalRefs(value, baseUrl);
        } else {
          result[key] = value;
        }
      }

      return result;
    }

    // Helper to dereference local file refs (for flattening) - keeps external and internal refs
    async function dereferenceLocalRefs(schema: any, file: string): Promise<any> {
      if (!schema || typeof schema !== 'object') return schema;

      if (Array.isArray(schema)) {
        return Promise.all(schema.map(item => dereferenceLocalRefs(item, file)));
      }

      const result: any = {};

      for (const [key, value] of Object.entries(schema)) {
        if (key === '$ref' && typeof value === 'string') {
          // Process the $ref value
          const ref = value;

          // Keep external refs as-is
          if (isExternalRef(ref)) {
            result[key] = value;
            continue;
          }

          // Keep internal fragment refs as-is
          if (ref.startsWith('#/')) {
            result[key] = value;
            continue;
          }

          // Dereference local file refs
          const [refPath, fragment] = ref.split('#');
          if (refPath) {
            try {
              const resolvedPath = resolveRefPath(file, refPath);
              const refSchema = loadSchema(resolvedPath);

              let target = refSchema;
              if (fragment) {
                const fragmentPath = fragment.substring(1).split('/');
                for (const segment of fragmentPath) {
                  if (target && typeof target === 'object') {
                    target = target[segment];
                  }
                }
              }

              // Merge the dereferenced schema with any other properties from the parent
              const merged: any = {};

              // First copy the dereferenced target (but skip $id and $schema to avoid conflicts)
              for (const [k, v] of Object.entries(target)) {
                if (k !== '$id' && k !== '$schema') {
                  merged[k] = v;
                }
              }

              // Then overlay any other properties from the schema object (except $ref)
              for (const [k, v] of Object.entries(schema)) {
                if (k !== '$ref') {
                  merged[k] = v;
                }
              }

              // Add $comment to track source of dereferenced schema
              const sourceComment = `Dereferenced from: ${ref}`;
              if (merged.$comment) {
                merged.$comment = `${merged.$comment} | ${sourceComment}`;
              } else {
                merged.$comment = sourceComment;
              }

              // Recursively dereference in the merged result
              return await dereferenceLocalRefs(merged, resolvedPath);
            } catch (error: any) {
              console.warn(`Warning: Could not dereference ${ref} from ${file}: ${error.message}`);
              result[key] = value;
            }
          } else {
            result[key] = value;
          }
        } else if (typeof value === 'object' && value !== null) {
          // Recursively process nested objects/arrays
          result[key] = await dereferenceLocalRefs(value, file);
        } else {
          result[key] = value;
        }
      }

      return result;
    }

    // Merge property schemas using allOf when they conflict
    function mergePropertySchemas(prop1: any, prop2: any, sources?: string[]): any {
      // If they're the same, just return one
      if (JSON.stringify(prop1) === JSON.stringify(prop2)) {
        return prop1;
      }

      // Helper function to extract a property's schema into allOf items
      function extractAllOfItems(prop: any, source?: string): any[] {
        const items: any[] = [];

        // If property has allOf, extract those items first
        if (prop.allOf && Array.isArray(prop.allOf)) {
          for (const item of prop.allOf) {
            if (source && !item.$comment) {
              items.push({ ...item, $comment: `From: ${source}` });
            } else {
              items.push(item);
            }
          }
        }

        // Extract root-level constraints (everything except allOf)
        const rootConstraints: any = {};
        let hasRootConstraints = false;

        for (const [key, value] of Object.entries(prop)) {
          if (key !== 'allOf' && key !== '$comment') {
            rootConstraints[key] = value;
            hasRootConstraints = true;
          }
        }

        // If there are root constraints, add them as an allOf item
        if (hasRootConstraints) {
          if (source) {
            rootConstraints.$comment = `From: ${source}`;
          }
          // If there was no allOf, this becomes the first item
          // If there was an allOf, this should come first (base constraints)
          if (prop.allOf && Array.isArray(prop.allOf)) {
            items.unshift(rootConstraints); // Put root constraints first
          } else {
            items.push(rootConstraints);
          }
        }

        return items;
      }

      // Collect all allOf items from both properties
      const allOfItems: any[] = [];

      // Extract items from prop1
      const items1 = extractAllOfItems(
        prop1,
        sources && sources.length >= 1 ? sources[0] : undefined
      );
      allOfItems.push(...items1);

      // Extract items from prop2
      const items2 = extractAllOfItems(
        prop2,
        sources && sources.length >= 2 ? sources[sources.length - 1] : undefined
      );
      allOfItems.push(...items2);

      // Return merged allOf
      return { allOf: allOfItems };
    }

    // Process allOf if present
    if (Array.isArray(schema.allOf)) {
      const mergedProperties: Record<string, any> = {};
      const propertySourceMap: Record<string, string[]> = {}; // Track which schemas contributed to each property
      const mergedRequired: Set<string> = new Set();
      const remainingAllOf: any[] = [];

      for (const item of schema.allOf) {
        const { schema: resolved, resolvedPath } = await resolveSchema(item, currentFile);

        // After resolving, we shouldn't have external refs anymore
        // but keep them just in case resolution failed
        if (resolved.$ref && isExternalRef(resolved.$ref)) {
          remainingAllOf.push(resolved);
          continue;
        }

        // Get source identifier for this schema
        let schemaSource = 'unknown';
        if (resolved.$id) {
          schemaSource = resolved.$id;
        } else if (resolved.title) {
          schemaSource = resolved.title;
        } else if (item.$ref) {
          schemaSource = item.$ref;
        }

        // Recursively flatten nested allOf - use resolvedPath as context
        let flattened = await flattenAllOf(resolved, resolvedPath);

        // If this item came from an external source, dereference any local refs to inline them
        if (isExternalRef(item.$ref || '')) {
          flattened = await dereferenceLocalRefs(flattened, resolvedPath);
        }

        // Merge properties
        if (flattened.properties) {
          for (const [propName, propSchema] of Object.entries(flattened.properties)) {
            if (mergedProperties[propName]) {
              // Property exists - track source and merge with allOf
              if (!propertySourceMap[propName]) {
                propertySourceMap[propName] = [];
              }
              propertySourceMap[propName].push(schemaSource);

              mergedProperties[propName] = mergePropertySchemas(
                mergedProperties[propName],
                propSchema, // Don't flatten property schemas - preserve their allOf
                propertySourceMap[propName]
              );
            } else {
              // First occurrence of this property
              propertySourceMap[propName] = [schemaSource];
              mergedProperties[propName] = propSchema; // Keep property schema as-is
            }
          }
        }

        // Merge required
        if (Array.isArray(flattened.required)) {
          flattened.required.forEach((r: string) => mergedRequired.add(r));
        }
      }

      // Build result
      const result: any = {};

      // Copy metadata fields first
      if (schema.$schema) result.$schema = schema.$schema;
      if (schema.title) result.title = schema.title;
      if (schema.description) result.description = schema.description;
      if (schema.type) result.type = schema.type;

      // Add remaining allOf if any
      if (remainingAllOf.length > 0) {
        result.allOf = remainingAllOf;
      }

      // Merge with root properties
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          if (mergedProperties[propName]) {
            // Track current schema as source too
            const currentSource = schema.$id || schema.title || currentFile;
            const sources = [...(propertySourceMap[propName] || []), currentSource];

            mergedProperties[propName] = mergePropertySchemas(
              mergedProperties[propName],
              propSchema, // Don't flatten property schemas - preserve their allOf
              sources
            );
          } else {
            mergedProperties[propName] = propSchema; // Keep property schema as-is
          }
        }
      }

      if (Object.keys(mergedProperties).length > 0) {
        // Dereference any remaining local refs in the merged properties
        const dereferencedProperties: Record<string, any> = {};
        for (const [propName, propSchema] of Object.entries(mergedProperties)) {
          dereferencedProperties[propName] = await dereferenceLocalRefs(propSchema, currentFile);
        }
        result.properties = dereferencedProperties;
      }

      // Merge required
      if (Array.isArray(schema.required)) {
        schema.required.forEach((r: string) => mergedRequired.add(r));
      }
      if (mergedRequired.size > 0) {
        result.required = Array.from(mergedRequired);
      }

      // Copy other fields
      for (const [key, value] of Object.entries(schema)) {
        if (!['$schema', 'title', 'description', 'type', 'allOf', 'properties', 'required'].includes(key)) {
          result[key] = await flattenAllOf(value, currentFile);
        }
      }

      return result;
    }

    // No allOf - just process recursively
    const result: any = {};
    for (const [key, value] of Object.entries(schema)) {
      result[key] = await flattenAllOf(value, currentFile);
    }
    return result;
  }

  // Load entry schema
  const entrySchema = loadSchema(entryPath);

  if (flatten) {
    return await flattenAllOf(entrySchema, entryPath);
  } else {
    return dereferencePropertiesOnly(entrySchema, entryPath, false);
  }
}

async function main() {
  const args = process.argv.slice(2);

  // Handle cache management commands
  if (args[0] === '--clear-cache') {
    clearCache();
    process.exit(0);
  }

  if (args[0] === '--cache-info') {
    displayCacheInfo();
    process.exit(0);
  }

  let flatten = false;
  let rootDir: string | undefined;
  let baseUrl: string | undefined;
  const filtered: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--flatten' || a === '--flatten-allof') {
      flatten = true;
    } else if (a === '--root-dir' && i + 1 < args.length) {
      rootDir = args[i + 1];
      i++;
    } else if (a === '--base-url' && i + 1 < args.length) {
      baseUrl = args[i + 1];
      i++;
    } else {
      filtered.push(a);
    }
  }

  const [entry, outFile] = filtered;
  if (!entry || !outFile) {
    console.error('Usage: ts-node manual-bundle-schema.ts [--flatten] [--root-dir <path>] [--base-url <url>] <entry-schema> <output-file>');
    console.error('       ts-node manual-bundle-schema.ts --clear-cache');
    console.error('       ts-node manual-bundle-schema.ts --cache-info');
    console.error('');
    console.error('Environment variables:');
    console.error('  SCHEMA_CACHE_DIR - Custom cache directory (default: system tmp)');
    process.exit(1);
  }

  const entryPath = path.isAbsolute(entry) ? entry : path.join(process.cwd(), entry);
  if (!fs.existsSync(entryPath)) {
    console.error(`Entry schema not found: ${entryPath}`);
    process.exit(1);
  }

  try {
    let result = await bundleSchema(entryPath, flatten);

    // Calculate $id
    const outFileAbs = path.isAbsolute(outFile) ? outFile : path.join(process.cwd(), outFile);
    const repoRoot = rootDir ? path.resolve(rootDir) : process.cwd();

    // Post-process: convert relative refs to external URLs if baseUrl provided
    if (baseUrl && rootDir) {
      result = convertRelativeRefsToUrls(result, entryPath, repoRoot, baseUrl);
    }

    const outputRoot = path.join(repoRoot, 'output');

    let schemaId: string;
    if (outFileAbs.startsWith(outputRoot)) {
      schemaId = "/" + path.relative(outputRoot, outFileAbs).replace(/\\/g, '/');
    } else if (outFileAbs.includes('/schemas/')) {
      const schemasRoot = path.join(repoRoot, 'schemas');
      const relativePath = path.relative(schemasRoot, outFileAbs).replace(/\\/g, '/');
      schemaId = `https://notify.nhs.uk/cloudevents/schemas/${relativePath}`;
    } else {
      schemaId = path.basename(outFile);
    }

    // Build properly ordered output
    const orderedOutput: any = {};

    orderedOutput.$id = schemaId;
    if (result.$schema) orderedOutput.$schema = result.$schema;
    if (result.title) orderedOutput.title = result.title;
    if (result.description) orderedOutput.description = result.description;
    if (result.type) orderedOutput.type = result.type;
    if (result.allOf) orderedOutput.allOf = result.allOf;
    if (result.properties) orderedOutput.properties = result.properties;
    if (result.required) orderedOutput.required = result.required;

    // Copy other fields
    for (const [key, value] of Object.entries(result)) {
      if (!['$id', '$schema', 'title', 'description', 'type', 'allOf', 'properties', 'required', '$comment'].includes(key)) {
        orderedOutput[key] = value;
      }
    }

    orderedOutput.$comment = ((result.$comment ? result.$comment + ' | ' : '') +
      (flatten ? 'Flattened (allOf resolved, properties merged with per-property allOf for conflicts).' : 'Bundled (allOf preserved, property $refs dereferenced).'));

    const outDir = path.dirname(path.resolve(outFile));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(orderedOutput, null, 2));
    console.log(`✅ ${flatten ? 'Flattened' : 'Bundled'} schema written to ${outFile}`);
  } catch (err) {
    console.error('Failed to process schema:', err);
    process.exit(1);
  }
}

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
