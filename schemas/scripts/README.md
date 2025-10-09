# Schema Scripts

This directory contains utility scripts for schema processing.

## Files

- `yaml_to_json.py` - Converts YAML schema files to JSON format using PyYAML
- `generate_docs.py` - Generates Markdown documentation from YAML schema files

## Usage

The scripts are automatically used by the Makefile targets. You can also run them directly:

```bash
# Convert a single YAML file to JSON
python3 scripts/yaml_to_json.py input.schema.yaml output.schema.json

# Generate documentation for all schemas in a directory
python3 scripts/generate_docs.py src/ docs/
```

## Dependencies

- Python 3.x
- PyYAML (automatically installed via `make config`)
