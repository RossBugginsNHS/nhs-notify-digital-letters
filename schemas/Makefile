# Variables
SCHEMA_SRC_DIR := src
OUTPUT_DIR := output
DOCS_DIR := docs
SCRIPTS_DIR := scripts
YAML_TO_JSON_SCRIPT := $(SCRIPTS_DIR)/yaml_to_json.py
GENERATE_DOCS_SCRIPT := $(SCRIPTS_DIR)/generate_docs.py
YAML_SCHEMAS := $(shell find $(SCHEMA_SRC_DIR) -name "*.schema.yaml" -type f)
JSON_OUTPUTS := $(patsubst $(SCHEMA_SRC_DIR)/%.schema.yaml,$(OUTPUT_DIR)/%.schema.json,$(YAML_SCHEMAS))

# Default target
.PHONY: all clean build build-schemas convert-schemas config check-deps build-docs

all: build

# Create output directory
$(OUTPUT_DIR):
	@mkdir -p $(OUTPUT_DIR)

# Setup dependencies
config:
	@echo "Setting up dependencies for YAML to JSON conversion..."
	@echo "Checking Python installation..."
	@python3 --version || (echo "Error: Python 3 is required" && exit 1)
	@echo "Checking PyYAML installation..."
	@python3 -c "import yaml; print('PyYAML is already installed')" 2>/dev/null || \
		(echo "Installing PyYAML..." && pip install PyYAML)
	@echo "Dependencies setup complete!"

# Check dependencies before building
check-deps:
	@python3 -c "import yaml" 2>/dev/null || \
		(echo "PyYAML not found. Run 'make config' to install dependencies." && exit 1)

# Convert all YAML schemas to JSON
convert-schemas: check-deps $(OUTPUT_DIR)
	@echo "Converting YAML schemas to JSON..."
	@for yaml_file in $(YAML_SCHEMAS); do \
		relative_path=$${yaml_file#$(SCHEMA_SRC_DIR)/}; \
		output_file="$(OUTPUT_DIR)/$${relative_path%.schema.yaml}.schema.json"; \
		output_dir=$$(dirname "$$output_file"); \
		mkdir -p "$$output_dir"; \
		echo "Converting $$yaml_file to $$output_file"; \
		python3 $(YAML_TO_JSON_SCRIPT) "$$yaml_file" "$$output_file"; \
	done

# Build all schemas
build-schemas: convert-schemas
	@echo "Building schemas complete!"
	@echo "Found $(words $(YAML_SCHEMAS)) YAML schema(s):"
	@for schema in $(YAML_SCHEMAS); do echo "  - $$schema"; done
	@echo "Generated JSON schemas in $(OUTPUT_DIR)/"

# Build everything (schemas and docs)
build: build-schemas build-docs
	@echo "Build complete! Generated JSON schemas and documentation."

# Generate documentation from schemas
build-docs: check-deps
	@echo "Generating documentation from YAML schemas..."
	@python3 $(GENERATE_DOCS_SCRIPT) $(SCHEMA_SRC_DIR) $(DOCS_DIR)
	@echo "Documentation generated in $(DOCS_DIR)/"

# Clean output directory
clean:
	@echo "Cleaning output and docs directories..."
	@rm -rf $(OUTPUT_DIR) $(DOCS_DIR)
	@echo "Clean complete!"

# Show help
help:
	@echo "Available targets:"
	@echo "  all           - Build everything (schemas + docs) (default)"
	@echo "  build         - Build everything (schemas + docs)"
	@echo "  build-schemas - Convert YAML schemas from src/ to JSON in output/ (preserving folder structure)"
	@echo "  build-docs    - Generate Markdown documentation from YAML schemas"
	@echo "  config        - Setup dependencies (Python, PyYAML)"
	@echo "  list          - List all YAML schema files that would be processed"
	@echo "  clean         - Remove output and docs directories"
	@echo "  help          - Show this help message"
	@echo ""
	@echo "Source schemas are looked for in: $(SCHEMA_SRC_DIR)/"
	@echo "Output JSON files are generated in: $(OUTPUT_DIR)/ (with preserved folder structure)"
	@echo "Documentation files are generated in: $(DOCS_DIR)/ (with preserved folder structure)"

# List all YAML schema files
list:
	@echo "YAML schema files found:"
	@for schema in $(YAML_SCHEMAS); do echo "  - $$schema"; done
	@echo "Total: $(words $(YAML_SCHEMAS)) file(s)"
