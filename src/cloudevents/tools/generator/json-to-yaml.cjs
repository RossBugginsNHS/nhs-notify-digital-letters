#!/usr/bin/env node

/**
 * Convert JSON schema files to YAML
 *
 * Usage: node json-to-yaml.cjs <input.json> <output.yaml>
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function convertJsonToYaml(inputFile, outputFile) {
  try {
    // Read JSON file
    const jsonContent = fs.readFileSync(inputFile, "utf8");
    const jsonData = JSON.parse(jsonContent);

    // Convert to YAML
    const yamlContent = yaml.dump(jsonData, {
      lineWidth: -1, // No line wrapping
      noRefs: true, // Don't use YAML references
      sortKeys: false, // Preserve order
      quotingType: '"', // Use double quotes
      forceQuotes: false, // Only quote when necessary
    });

    // Ensure output directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write YAML file
    fs.writeFileSync(outputFile, yamlContent, "utf8");

    return true;
  } catch (error) {
    console.error(`Error converting ${inputFile}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.error("Usage: node json-to-yaml.cjs <input.json> <output.yaml>");
    process.exit(1);
  }

  const [inputFile, outputFile] = args;

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const success = convertJsonToYaml(inputFile, outputFile);

  if (!success) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { convertJsonToYaml };
