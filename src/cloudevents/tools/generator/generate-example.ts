import $RefParser from "json-schema-ref-parser";
import jsf from "json-schema-faker";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import https from "https";
import http from "http";

// Utility random helpers (non-cryptographic; deterministic constraints only)
function randomInt(max: number) { return Math.floor(Math.random() * max); }
function randomChoice<T>(arr: T[]): T { return arr[randomInt(arr.length)]; }
function randomHex(len: number) {
  let out = ""; for (let i=0;i<len;i++) out += randomChoice("0123456789abcdef".split("")); return out;
}

// Register a custom UUID format for jsf
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
jsf.format('uuid', uuid);

// Custom property generator for 'source' to match the required pattern
//jsf.define('source', () => {
//  return `/customer/${uuid()}/ordering/${uuid()}/item/${uuid()}`;
//});

// Ensure jsf uses pattern for string generation
jsf.option({ alwaysFakeOptionals: true });

async function main() {
  const args = process.argv.slice(2);

  const [ schemaPathRaw, outputPath ] = args;
  if (!schemaPathRaw || !outputPath) {
    console.error("Usage: ts-node generate-example.ts <schema.json|yaml> <output.json>");
    process.exit(1);
  }
  // Add cache-busting query param if schemaPath is a URL
  let schemaPath = schemaPathRaw;
  try {
    const url = new URL(schemaPathRaw);
    url.searchParams.set('_cb', Date.now().toString());
    schemaPath = url.toString();
  } catch (e) {
    // Not a URL, use as-is
  }

  console.log(`[GENERATE] Starting schema resolution for: ${schemaPath}`);

  const dereferencedSchema = await $RefParser.dereference(schemaPath, {
    resolve: {
      file: { order: 1 },
      http: {
        order: 2,
        timeout: 10000, // 10 seconds
        redirects: 5,
        headers: {
          'User-Agent': 'nhs-notify-schema-builder/1.0',
          'Accept': 'application/json, application/schema+json, */*'
        },
        canRead(file: any) {
          console.log(`[GENERATE] HTTP: canRead called for ${file.url}`);
          // Check if it's an HTTP/HTTPS URL
          const isHttp = /^https?:/i.test(file.url);
          console.log(`[GENERATE] HTTP: canRead returning ${isHttp}`);
          return isHttp;
        },
        read(file: any) {
          console.log(`\n========== HTTP REQUEST START ==========`);
          console.log(`[GENERATE] HTTP: Attempting to fetch URL`);
          console.log(`[GENERATE] HTTP: Full URL: ${file.url}`);
          console.log(`[GENERATE] HTTP: Protocol: ${file.url.startsWith('https:') ? 'HTTPS' : 'HTTP'}`);
          console.log(`[GENERATE] HTTP: Request headers that will be sent:`, JSON.stringify({
            'User-Agent': 'nhs-notify-schema-builder/1.0',
            'Accept': 'application/json, application/schema+json, */*'
          }, null, 2));

          // Generate equivalent curl command
          const curlCommand = `curl -v \\
  -H "User-Agent: nhs-notify-schema-builder/1.0" \\
  -H "Accept: application/json, application/schema+json, */*" \\
  "${file.url}"`;
          console.log(`\n[GENERATE] HTTP: Equivalent curl command:\n${curlCommand}\n`);

          try {
            const promise = new Promise((resolve, reject) => {
            const client = file.url.startsWith('https:') ? https : http;
            const options = {
              headers: {
                'User-Agent': 'nhs-notify-schema-builder/1.0',
                'Accept': 'application/json, application/schema+json, */*'
              }
            };

            console.log(`[GENERATE] HTTP: Initiating request to: ${file.url}`);

            try {
              const req = client.get(file.url, options, (res: any) => {
              console.log(`\n========== HTTP RESPONSE RECEIVED ==========`);
              console.log(`[GENERATE] HTTP: Response status code: ${res.statusCode}`);
              console.log(`[GENERATE] HTTP: Response status message: ${res.statusMessage}`);
              console.log(`[GENERATE] HTTP: Full response headers:`, JSON.stringify(res.headers, null, 2));

              if (res.statusCode !== 200) {
                let body = '';
                res.on('data', (chunk: any) => { body += chunk; });
                res.on('end', () => {
                  console.error(`\n========== HTTP REQUEST FAILED ==========`);
                  console.error(`[GENERATE] HTTP: Request URL: ${file.url}`);
                  console.error(`[GENERATE] HTTP: Response Status: ${res.statusCode} ${res.statusMessage}`);
                  console.error(`[GENERATE] HTTP: Response Headers:`, JSON.stringify(res.headers, null, 2));
                  console.error(`[GENERATE] HTTP: Response Body (first 1000 chars):`, body.substring(0, 1000));
                  console.error(`========== HTTP REQUEST FAILED END ==========\n`);
                  const error = new Error(`HTTP ERROR ${res.statusCode}`);
                  reject(error);
                });
                return;
              }

              let data = '';
              res.on('data', (chunk: any) => { data += chunk; });
              res.on('end', () => {
                console.log(`[GENERATE] HTTP: Successfully fetched ${file.url} (${data.length} bytes)`);
                console.log(`========== HTTP REQUEST SUCCESS ==========\n`);
                resolve(data);
              });
            });

            req.on('error', (err: any) => {
              console.error(`\n========== HTTP NETWORK ERROR ==========`);
              console.error(`[GENERATE] HTTP: Network error occurred while fetching: ${file.url}`);
              console.error(`[GENERATE] HTTP: Error code:`, err.code);
              console.error(`[GENERATE] HTTP: Error message:`, err.message);
              console.error(`[GENERATE] HTTP: Error syscall:`, err.syscall);
              console.error(`[GENERATE] HTTP: Error hostname:`, err.hostname);
              console.error(`[GENERATE] HTTP: Full error details:`, JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
              console.error(`========== HTTP NETWORK ERROR END ==========\n`);
              reject(err);
            });

            req.on('timeout', () => {
              console.error(`\n========== HTTP TIMEOUT ==========`);
              console.error(`[GENERATE] HTTP: Request timeout for ${file.url}`);
              console.error(`[GENERATE] HTTP: Configured timeout: 10000 ms`);
              console.error(`========== HTTP TIMEOUT END ==========\n`);
              req.destroy();
              reject(new Error('Request timeout'));
            });
            } catch (err: any) {
              console.error(`\n========== HTTP EXCEPTION ==========`);
              console.error(`[GENERATE] HTTP: Exception occurred while creating request for: ${file.url}`);
              console.error(`[GENERATE] HTTP: Exception message:`, err.message);
              console.error(`[GENERATE] HTTP: Exception stack:`, err.stack);
              console.error(`========== HTTP EXCEPTION END ==========\n`);
              reject(err);
            }
          });

          console.log(`[GENERATE] HTTP: Returning promise...`);
          return promise;
          } catch (outerErr: any) {
            console.error(`[GENERATE] HTTP: Exception in read() function:`, outerErr.message);
            console.error(`[GENERATE] HTTP: Exception stack:`, outerErr.stack);
            throw outerErr;
          }
        }
      }
    }
  });

  console.log(`[GENERATE] Schema dereferenced successfully`);
  console.log(`[GENERATE] Schema properties keys:`, Object.keys(dereferencedSchema.properties || {}));

  if (dereferencedSchema.properties?.data) {
    console.log(`[GENERATE] Data property found in schema:`, JSON.stringify(dereferencedSchema.properties.data, null, 2));
  } else {
    console.log(`[GENERATE] No data property found in schema`);
  }

  console.log(`[GENERATE] Generating example with jsf...`);
  console.log(`[GENERATE] JSF options set`);

  // Try to generate the data field separately first to see if that works
  let separateDataExample = null;
  if (dereferencedSchema.properties?.data && typeof dereferencedSchema.properties.data === 'object') {
    console.log(`[GENERATE] Attempting to generate data field separately...`);
    try {
      separateDataExample = jsf.generate(dereferencedSchema.properties.data as any);
      console.log(`[GENERATE] Data field generated separately successfully`);
    } catch (e) {
      console.log(`[GENERATE] Failed to generate data field separately:`, e);
    }
  }

  const example = jsf.generate(dereferencedSchema);

  console.log(`[GENERATE] Example generated. Type:`, typeof example);
  console.log(`[GENERATE] Example keys:`, example && typeof example === 'object' ? Object.keys(example) : 'Not an object');
  console.log(`[GENERATE] Example data field:`, example && typeof example === 'object' ? JSON.stringify(example.data) : 'Example not an object');

  // If the main generation didn't include data field but we generated it separately, add it
  if (example && typeof example === 'object' && !example.data && separateDataExample) {
    console.log(`[GENERATE] Adding separately generated data field to main example`);
    example.data = separateDataExample;
    console.log(`[GENERATE] Data field added successfully`);
  }
  // Apply constrained overrides so we always satisfy combined pattern + semantic requirements.
  if (example && typeof example === 'object') {
    // 1. Enforce required CloudEvents profile fields if missing (some schemas rely on profile ref)
    example.specversion = '1.0';


    // 2. Generate a stable type if schema didn't const it (avoid banned verbs)
    if (!example.type || typeof example.type !== 'string') {
      example.type = 'uk.nhs.notify.ordering.order.read.v1';
    }

    // 3. Generate IDs
    example.id = uuid();

    // 4. Generate source from the most specific pattern (properties level, not allOf)
    // jsf might generate from parent allOf pattern, so regenerate from properties.source directly
    const sourceSchema = (dereferencedSchema as any).properties?.source;
    if (sourceSchema && typeof sourceSchema === 'object' && sourceSchema.pattern) {
      // Generate specifically from the properties.source schema to get the most specific pattern
      const generatedSource = jsf.generate(sourceSchema);
      if (typeof generatedSource === 'string') {
        example.source = generatedSource;
      }
    }

    // 5. Generate subject from the most specific pattern (properties level, not allOf)
    // Only override if properties.subject actually has a pattern (not inherited from parent)
    const subjectSchema = (dereferencedSchema as any).properties?.subject;
    const hasSpecificSubjectPattern = subjectSchema &&
                                       typeof subjectSchema === 'object' &&
                                       subjectSchema.pattern &&
                                       !subjectSchema.$ref; // Make sure it's not just a ref

    if (hasSpecificSubjectPattern) {
      // Generate specifically from the properties.subject schema to get the most specific pattern
      const generatedSubject = jsf.generate(subjectSchema);
      if (typeof generatedSubject === 'string') {
        // Force lowercase to satisfy parent profile pattern requirements
        example.subject = generatedSubject.toLowerCase();
      }
    } else {
      // No specific subject pattern, check if there are conditionals (if/then) in allOf
      // that apply based on other property values (like source)
      // Recursively search through nested allOf arrays
      const findConditionals = (schema: any): any[] => {
        const conditionals: any[] = [];
        if (Array.isArray(schema.allOf)) {
          for (const item of schema.allOf) {
            if (item.if && item.then) {
              conditionals.push(item);
            }
            // Recursively search nested allOfs
            conditionals.push(...findConditionals(item));
          }
        }
        return conditionals;
      };

      const conditionals = findConditionals(dereferencedSchema);

      for (const conditional of conditionals) {
        // Check if the 'if' condition matches current example values
        const ifMatches = Object.keys(conditional.if.properties || {}).every(propName => {
          const ifPropSchema = conditional.if.properties[propName];
          const exampleValue = (example as any)[propName];
          // Check pattern match
          if (ifPropSchema.pattern && exampleValue) {
            const pattern = new RegExp(ifPropSchema.pattern);
            return pattern.test(exampleValue);
          }
          return true;
        });

        // If condition matches, use the 'then' subject pattern
        if (ifMatches && conditional.then?.properties?.subject?.pattern) {
          const thenSubjectSchema = conditional.then.properties.subject;
          const generatedSubject = jsf.generate(thenSubjectSchema);
          if (typeof generatedSubject === 'string') {
            example.subject = generatedSubject.toLowerCase();
            break; // Use first matching conditional
          }
        }
      }
    }

    // 6. Time & recordedtime: generate recent ISO times (UTC) ensuring recorded >= time
    const now = new Date();
    const timeDate = new Date(now.getTime() - 1000); // 1s earlier
    example.time = timeDate.toISOString();
    example.recordedtime = now.toISOString();

    // 7. traceparent (00-<32hex>-<16hex>-<2hex>) with sampled flag 01
    example.traceparent = `00-${randomHex(32)}-${randomHex(16)}-01`;
    if (!example.tracestate) {
      example.tracestate = 'rojo=00f067aa0ba902b7';
    }

    // 8. Severity coherent pair
    const severities = [
      { text: 'TRACE', number: 0 },
      { text: 'DEBUG', number: 1 },
      { text: 'INFO', number: 2 },
      { text: 'WARN', number: 3 },
      { text: 'ERROR', number: 4 },
      { text: 'FATAL', number: 5 }
    ];
    const sev = randomChoice(severities);
    example.severitytext = sev.text;
    example.severitynumber = sev.number;

    // 9. Partition key (prefer customer segment prefix)
    const customerId = example.subject.split('/')[1] || uuid();
    example.partitionkey = `customer-${customerId.substring(0,8)}`.toLowerCase();

    // 10. Sequence: zero padded 20-digit
    const seq = Math.floor(Math.random() * 1e9); // smaller number but still valid when padded
    example.sequence = seq.toString().padStart(20,'0');

    // 11. Sample rate default 1 (avoid absurd large numbers failing intent)
    example.sampledrate = 1;

    // 12. Data payload enforcement
    console.log(`[GENERATE] Before data processing - example.data:`, JSON.stringify(example.data));
    console.log(`[GENERATE] Data field type:`, typeof example.data);
    console.log(`[GENERATE] Data field is object:`, example.data && typeof example.data === 'object');

    if (!example.data || typeof example.data !== 'object') {
      console.log(`[GENERATE] Data field is missing or not an object, setting to empty object`);
      example.data = {} as any;
    } else {
      console.log(`[GENERATE] Data field already exists with keys:`, Object.keys(example.data));
    }

    // Recursively find and set any nhsNumber property to a valid value
    const setValidNhsNumber = (obj: any): void => {
      if (!obj || typeof obj !== 'object') return;

      for (const key in obj) {
        if (key === 'nhsNumber' && typeof obj[key] === 'string') {
          console.log(`[GENERATE] Found nhsNumber field, setting to valid value`);
          // Set to known valid NHS number with correct checksum
          obj[key] = '9434765919';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          // Recursively search nested objects and arrays
          setValidNhsNumber(obj[key]);
        }
      }
    };

    console.log(`[GENERATE] About to process NHS numbers in data:`, JSON.stringify(example.data));
    setValidNhsNumber(example.data);
    console.log(`[GENERATE] After NHS number processing - data:`, JSON.stringify(example.data));

    // 13. datacontenttype & dataschema stable defaults
    example.datacontenttype = 'application/json';


    // 14. Data classification defaults (pick consistent set)
    example.dataclassification = example.dataclassification || 'restricted';
    example.dataregulation = example.dataregulation || 'ISO-27001';
    example.datacategory = example.datacategory || 'sensitive';
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(example, null, 2));
  console.log(`Example written to ${outputPath}`);
}

main();
