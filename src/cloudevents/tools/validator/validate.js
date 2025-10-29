import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Parse command line arguments
const args = process.argv.slice(2);
let schemaPath, dataPath, baseDir;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--base" && i + 1 < args.length) {
    baseDir = path.resolve(args[i + 1]);
    i++; // skip the next argument
  } else if (!schemaPath) {
    schemaPath = args[i];
  } else if (!dataPath) {
    dataPath = args[i];
  }
}

if (!schemaPath || !dataPath) {
  console.error(
    "Usage: node validate.js [--base <base-dir>] <schema.json|yaml> <data.json>"
  );
  console.error(
    "  --base: Base directory for resolving schema references (default: auto-detect 'src' or schema directory)"
  );
  process.exit(1);
}

// Determine schema directory for loading all schemas
let schemaDir;
if (baseDir) {
  // Use provided base directory
  schemaDir = baseDir;
} else {
  // Find the 'src' directory by walking up from the schema path
  schemaDir = path.dirname(schemaPath);
  while (schemaDir !== path.dirname(schemaDir)) {
    // Stop at root
    if (
      path.basename(schemaDir) === "src" ||
      path.basename(schemaDir) === "output"
    ) {
      break;
    }
    schemaDir = path.dirname(schemaDir);
  }
  // If we didn't find 'src' or 'output', fall back to the schema's directory
  if (
    path.basename(schemaDir) !== "src" &&
    path.basename(schemaDir) !== "output"
  ) {
    schemaDir = path.dirname(schemaPath);
  }
}

// Load all .schema.json and .schema.yaml files in the schema directory
function findAllSchemaFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findAllSchemaFiles(filePath));
    } else if (
      file.endsWith(".json") ||
      file.endsWith(".schema.json") ||
      file.endsWith(".yaml") ||
      file.endsWith(".yml")
    ) {
      results.push(filePath);
    }
  }
  return results;
}

const allSchemaFiles = findAllSchemaFiles(schemaDir);
const schemas = {};
const schemasById = {};

for (const fullPath of allSchemaFiles) {
  const relPath = "./" + path.relative(schemaDir, fullPath).replace(/\\/g, "/");
  const file = path.basename(fullPath);
  const absolutePath = path.resolve(fullPath);
  let content;
  try {
    const fileContent = fs.readFileSync(fullPath, "utf-8");
    if (fullPath.endsWith(".yaml") || fullPath.endsWith(".yml")) {
      content = yaml.load(fileContent);
    } else {
      content = JSON.parse(fileContent);
    }
  } catch (e) {
    continue;
  }
  if (
    typeof content !== "object" ||
    content === null ||
    Array.isArray(content)
  ) {
    continue;
  }

  // Keep the original $id if it exists
  const originalId = content.$id;

  // Register by absolute file path (for proper relative $ref resolution)
  schemas[absolutePath] = content;
  // Also register by relative paths for flexible resolution
  schemas[relPath] = content;
  schemas[file] = content;
  schemas[relPath.substring(2)] = content; // without leading './'
  schemas["/" + relPath.substring(2)] = content; // with leading '/'
  schemas["./" + file] = content; // basename with ./

  if (originalId) {
    schemasById[originalId] = content;
  }
}

// Function to load external HTTP/HTTPS schemas or base-relative paths
const httpCache = new Map(); // Cache for external HTTP/HTTPS schemas
const requestCounts = new Map(); // Track request counts per URI
const MAX_REQUESTS_PER_URI = 5; // Prevent infinite loops

async function loadExternalSchema(uri) {
  // Detect metaschema self-references and block them
  const normalizedUri = uri.replace(/#$/, ''); // Remove trailing fragment
  if (normalizedUri === 'http://json-schema.org/draft-07/schema' ||
      normalizedUri === 'https://json-schema.org/draft-07/schema') {
    console.log(`[FETCH] BLOCKED: Metaschema self-reference detected for ${uri} - skipping to prevent infinite loop`);
    // Return a minimal schema that won't cause validation issues
    return { type: "object" };
  }

  // Track request count to prevent infinite loops
  const currentCount = requestCounts.get(uri) || 0;
  if (currentCount >= MAX_REQUESTS_PER_URI) {
    console.log(`[FETCH] BLOCKED: Too many requests (${currentCount}) for ${uri} - returning cached result`);
    if (httpCache.has(uri)) {
      return httpCache.get(uri);
    }
    throw new Error(`Maximum requests exceeded for ${uri} and no cached result available`);
  }
  requestCounts.set(uri, currentCount + 1);

  // Check cache first
  if (httpCache.has(uri)) {
    console.log(`[FETCH] Using cached schema: ${uri} (request #${currentCount + 1})`);
    return httpCache.get(uri);
  }

  // Handle HTTP/HTTPS URLs
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    console.log(`[FETCH] Loading external schema: ${uri}`);
    try {
      const https = await import('https');
      const http = await import('http');
      const url = await import('url');

      return new Promise((resolve, reject) => {
        const maxRedirects = 5;
        let redirectCount = 0;
        const startTime = Date.now();

        function fetchUrl(currentUri) {
          console.log(`[FETCH] Requesting: ${currentUri} (attempt ${redirectCount + 1})`);
          const parsedUrl = new url.URL(currentUri);
          const protocol = parsedUrl.protocol === 'https:' ? https : http;

          const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            timeout: 10000, // 10 second timeout
            headers: {
              'User-Agent': 'nhs-notify-schema-validator/1.0',
              'Accept': 'application/json, application/schema+json, */*'
            }
          };

          const req = protocol.get(options, (res) => {
            console.log(`[FETCH] Response ${res.statusCode} from ${currentUri}`);

            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
              if (redirectCount >= maxRedirects) {
                console.error(`[FETCH] Too many redirects (${maxRedirects}) when fetching ${uri}`);
                reject(new Error(`Too many redirects (${maxRedirects}) when fetching ${uri}`));
                return;
              }
              redirectCount++;

              // Handle relative redirects
              let redirectUrl = res.headers.location;
              if (!redirectUrl.startsWith('http')) {
                redirectUrl = new url.URL(redirectUrl, currentUri).href;
              }

              console.log(`[FETCH] Following redirect ${res.statusCode}: ${currentUri} -> ${redirectUrl}`);
              fetchUrl(redirectUrl);
              return;
            }

            if (res.statusCode !== 200) {
              console.error(`[FETCH] HTTP ${res.statusCode} when fetching ${uri}`);
              reject(new Error(`HTTP ${res.statusCode} when fetching ${uri}`));
              return;
            }

            let data = '';
            let bytesReceived = 0;
            res.on('data', (chunk) => {
              data += chunk;
              bytesReceived += chunk.length;
              if (bytesReceived % 1024 === 0) {
                console.log(`[FETCH] Received ${bytesReceived} bytes from ${currentUri}`);
              }
            });
            res.on('end', () => {
              const elapsed = Date.now() - startTime;
              console.log(`[FETCH] Download complete: ${bytesReceived} bytes in ${elapsed}ms from ${currentUri}`);
              try {
                console.log(`[FETCH] Parsing JSON schema from ${currentUri}`);
                const schema = JSON.parse(data);
                console.log(`[FETCH] Successfully parsed schema from ${uri} (request #${currentCount + 1})`);

                // Cache the schema
                httpCache.set(uri, schema);
                console.log(`[FETCH] Cached schema: ${uri}`);

                resolve(schema);
              } catch (e) {
                console.error(`[FETCH] Failed to parse JSON from ${uri}: ${e.message}`);
                reject(new Error(`Failed to parse JSON from ${uri}: ${e.message}`));
              }
            });
          });

          req.on('timeout', () => {
            console.error(`[FETCH] Timeout after 10s when fetching ${currentUri}`);
            req.destroy();
            reject(new Error(`Timeout when fetching ${uri}`));
          });

          req.on('error', (e) => {
            console.error(`[FETCH] Network error when fetching ${currentUri}: ${e.message}`);
            reject(new Error(`Failed to fetch ${uri}: ${e.message}`));
          });
        }

        fetchUrl(uri);
      });
    } catch (e) {
      console.error(`[FETCH] Exception when loading external schema ${uri}: ${e.message}`);
      throw new Error(`Failed to load external schema ${uri}: ${e.message}`);
    }
  }  // Handle base-relative paths (starting with /)
  if (uri.startsWith('/')) {
    // First check if the schema is already loaded
    if (schemas[uri]) {
      // Return a copy without the $id to avoid conflicts when AJV tries to add it
      const schemaCopy = { ...schemas[uri] };
      delete schemaCopy.$id;
      return schemaCopy;
    }

    // Try to load from file system relative to baseDir/schemaDir
    // Remove the leading slash to make it relative
    let relativePath = uri.substring(1);

    // If the URI starts with a directory that matches the basename of schemaDir, remove it
    // e.g. if schemaDir is /path/to/output and URI is /output/common/..., strip the /output part
    const baseName = path.basename(schemaDir);
    if (relativePath.startsWith(baseName + '/')) {
      relativePath = relativePath.substring(baseName.length + 1);
    }

    const filePath = path.join(schemaDir, relativePath);
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        let content;
        if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) {
          content = yaml.load(fileContent);
        } else {
          content = JSON.parse(fileContent);
        }
        // Cache it for future use
        schemas[uri] = content;
        // Return a copy without the $id to avoid conflicts when AJV tries to add it
        const schemaCopy = { ...content };
        delete schemaCopy.$id;
        return schemaCopy;
      } catch (e) {
        throw new Error(`Failed to load schema from ${filePath}: ${e.message}`);
      }
    }
  }

  throw new Error(`Cannot load schema from URI: ${uri}`);
}

const ajv = new Ajv2020({ strict: false, loadSchema: loadExternalSchema });
addFormats(ajv);

// Only add schemas by absolute file paths (ignore any relative $id in the schema files)
// This ensures proper $ref resolution based on file system location
const schemasByAbsolutePath = new Map();

// Collect schemas by absolute path
for (const [id, s] of Object.entries(schemas)) {
  if (path.isAbsolute(id)) {
    schemasByAbsolutePath.set(id, s);
  }
}

// Add each schema - use original $id if it exists and is not a file path, otherwise use absolute path
const added = new Set();
for (const [absolutePath, s] of schemasByAbsolutePath.entries()) {
  if (!added.has(absolutePath)) {
    try {
      // Prefer the original $id if it's a URL or schema-relative path
      let schemaId;
      const originalId = s.$id;
      if (originalId && typeof originalId === 'string') {
        // URLs
        if (originalId.startsWith('http://') || originalId.startsWith('https://')) {
          schemaId = originalId;
        }
        // Schema-relative paths (start with / but don't look like file system paths)
        else if (originalId.startsWith('/') && !originalId.startsWith('/home') && !originalId.startsWith('/tmp') && !originalId.startsWith('/var')) {
          schemaId = originalId;
        } else {
          // File system path, use absolute path
          schemaId = absolutePath;
        }
      } else {
        // No $id, use absolute path
        schemaId = absolutePath;
      }
      const schemaCopy = { ...s, $id: schemaId };
      ajv.addSchema(schemaCopy);
      // Also register by the ID
      if (schemaId !== absolutePath) {
        added.add(schemaId);
      }
    } catch (e) {
      // Silently ignore duplicate schema errors
    }
    added.add(absolutePath);
  }
}

ajv.addFormat("nhs-number", {
  type: "string",
  validate: (value) => {
    const digits = value.replace(/\s+/g, "");
    if (!/^\d{10}$/.test(digits)) return false;
    const nums = digits.split("").map((d) => parseInt(d, 10));
    const check = nums[9];
    const sum = nums.slice(0, 9).reduce((acc, d, i) => acc + d * (10 - i), 0);
    const remainder = sum % 11;
    const expected = 11 - remainder === 11 ? 0 : 11 - remainder;
    if (expected === 10) return false;
    return check === expected;
  },
});

// Detailed NHS Number diagnosis helper (used only for enriched error output)
function diagnoseNhsNumber(raw) {
  const original = raw;
  if (typeof raw !== "string") {
    return { valid: false, reason: "Value is not a string", original };
  }
  const digits = raw.replace(/\s+/g, "");
  if (!/^\d{10}$/.test(digits)) {
    return {
      valid: false,
      reason:
        "Must contain exactly 10 digits (spaces optional for readability)",
      original,
    };
  }
  const nums = digits.split("").map((d) => parseInt(d, 10));
  const providedCheck = nums[9];
  const sum = nums.slice(0, 9).reduce((acc, d, i) => acc + d * (10 - i), 0);
  const remainder = sum % 11;
  let expected = 11 - remainder;
  if (expected === 11) expected = 0; // 11 -> 0 per algorithm
  if (expected === 10) {
    return {
      valid: false,
      reason: "Computed check digit is 10 (reserved = invalid number)",
      expectedCheck: expected,
      providedCheck,
      original,
    };
  }
  if (providedCheck !== expected) {
    return {
      valid: false,
      reason: "Checksum mismatch",
      expectedCheck: expected,
      providedCheck,
      original,
    };
  }
  return {
    valid: true,
    reason: "OK",
    expectedCheck: expected,
    providedCheck,
    original,
  };
}

// Determine the main schema and its ID
let mainSchemaFile = allSchemaFiles.find(
  (f) => path.resolve(schemaPath) === path.resolve(f)
);
let mainSchema;
let mainSchemaId;
if (mainSchemaFile) {
  mainSchema = schemas[path.resolve(mainSchemaFile)];
  // Prefer the original $id if it exists and is not a file system path
  const originalId = mainSchema.$id;
  if (originalId && typeof originalId === 'string') {
    // Check if it's an absolute URL
    if (originalId.startsWith('http://') || originalId.startsWith('https://')) {
      mainSchemaId = originalId;
    }
    // Check if it's a schema-relative path - starts with / but doesn't look like a full file system path
    // (doesn't contain the actual output directory structure)
    else if (originalId.startsWith('/') && !originalId.startsWith('/home') && !originalId.startsWith('/tmp') && !originalId.startsWith('/var')) {
      mainSchemaId = originalId;
    } else {
      // It's likely a file path, use absolute path
      mainSchemaId = path.resolve(mainSchemaFile);
    }
  } else {
    mainSchemaId = path.resolve(mainSchemaFile);
  }
} else {
  // Schema file not found in the loaded schemas
  // Check if the file exists locally
  if (fs.existsSync(schemaPath)) {
    const mainContent = fs.readFileSync(schemaPath, "utf-8");
    if (schemaPath.endsWith(".yaml") || schemaPath.endsWith(".yml")) {
      mainSchema = yaml.load(mainContent);
    } else {
      mainSchema = JSON.parse(mainContent);
    }
    mainSchemaId = mainSchema.$id || path.resolve(schemaPath);
  } else {
    // File doesn't exist locally
    // Try to construct an HTTP URL based on the file path
    // Example: /home/rb/.../output/common/2025-11-draft/nhs-notify-profile.schema.json
    // becomes: https://notify.nhs.uk/cloudevents/schemas/common/2025-11-draft/nhs-notify-profile.schema.json

    const match = schemaPath.match(/\/(common|examples|supplier-allocation)\/([^\/]+)\/(.+\.schema\.json)$/);
    if (match) {
      const [, domain, version, filename] = match;
      mainSchemaId = `https://notify.nhs.uk/cloudevents/schemas/${domain}/${version}/${filename}`;
      console.log(`⚠️  Local schema not found: ${schemaPath}`);
      console.log(`   Will attempt to load from: ${mainSchemaId}`);
      // We'll let AJV's loadSchema handle fetching this
      mainSchema = null; // Will be loaded asynchronously
    } else {
      console.error(`❌ Schema file not found: ${schemaPath}`);
      console.error(`   Could not determine HTTP URL for remote loading`);
      process.exit(1);
    }
  }
}
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Use async validation to support external schema loading
(async () => {
  let validate;

  // Remove the schema from AJV if it was already added, so we can compile it async
  try {
    ajv.removeSchema(mainSchemaId);
  } catch (e) {
    // Schema wasn't registered, that's fine
  }

  // Always use compileAsync to support loading external schemas
  // If mainSchema is null, we use mainSchemaId as a reference to let AJV fetch it
  if (mainSchema === null) {
    // Use mainSchemaId as a $ref to trigger async loading
    validate = await ajv.compileAsync({ $ref: mainSchemaId });
  } else {
    validate = await ajv.compileAsync(mainSchema);
  }
  const valid = validate(data);

  if (valid) {
    console.log("Valid!");
    process.exit(0);
  } else {
    console.error("Invalid:", validate.errors);
    // Print more debug info for each error
    for (const err of validate.errors || []) {
      // Traverse data to the error path
      let value = data;
      if (err.instancePath) {
        for (const part of err.instancePath.replace(/^\//, "").split("/")) {
          if (part) value = value && value[part];
        }
      }
      console.error(`\nError at path: ${err.instancePath}`);
      console.error("  Value:", JSON.stringify(value));
      console.error("  Schema path:", err.schemaPath);
      console.error("  Keyword:", err.keyword);
      if (err.params) console.error("  Params:", JSON.stringify(err.params));
      if (err.message) console.error("  Message:", err.message);
      // Enrich nhs-number format failures with checksum details
      if (
        err.keyword === "format" &&
        err.params &&
        err.params.format === "nhs-number"
      ) {
        const diag = diagnoseNhsNumber(value);
        if (!diag.valid) {
          const extra =
            `NHS Number invalid: ${diag.reason}` +
            (diag.expectedCheck !== undefined
              ? ` (expected check ${diag.expectedCheck}, got ${diag.providedCheck})`
              : "");
          console.error("  Detail:", extra);
        }
      }
    }
    process.exit(1);
  }
})().catch((err) => {
  console.error("Validation error:", err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
