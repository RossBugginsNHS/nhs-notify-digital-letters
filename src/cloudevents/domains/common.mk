# common.mk - Shared Makefile rules for domain schemas
# Include this file in domain Makefiles with: include ../common.mk
#
# This Makefile uses dynamic dependency discovery to automatically determine
# which profile schemas need to be validated against for each event schema.
# Instead of hardcoding profile versions, it recursively follows allOf references
# in the schema files to discover all dependencies, ensuring version mismatches
# are avoided (e.g., supplier-allocation 2025-12 correctly uses common 2025-11-draft).

# Variables that must be set by the including Makefile:
# - DOMAIN: The domain name (e.g., supplier-allocation, examples)
# - PUBLISH_VERSION: The version directory (e.g., 2025-10)
# - ROOT_DIR: Absolute path to repository root

# Computed variables
SCHEMA_BASE_URL ?= https://notify.nhs.uk/cloudevents/schemas
# Strip "cloudevents/domains" from schema URLs to get cleaner GitHub Pages URLs
SCHEMA_URL_STRIP_PREFIX ?= cloudevents/domains
OUTPUT_BASE_DIR = $(ROOT_DIR)/output/$(DOMAIN)
SCHEMAS_BASE_DIR = $(ROOT_DIR)/schemas/$(DOMAIN)
OUTPUT_DIR = $(OUTPUT_BASE_DIR)/$(PUBLISH_VERSION)
SCHEMAS_DIR = $(SCHEMAS_BASE_DIR)/$(PUBLISH_VERSION)
EVENTS_DIR = $(OUTPUT_DIR)/example-events
SRC_DIR = $(ROOT_DIR)/src/cloudevents/domains/$(DOMAIN)/$(PUBLISH_VERSION)
CLOUD_EVENTS_DIR = $(ROOT_DIR)/src/cloudevents

# Discover YAML schema files by category
PROFILE_SCHEMAS = $(wildcard $(SRC_DIR)/*.schema.yaml)
DATA_SCHEMAS = $(wildcard $(SRC_DIR)/data/*.schema*.yaml)
DEFS_SCHEMAS = $(wildcard $(SRC_DIR)/defs/*.yaml)
EVENT_SCHEMAS = $(wildcard $(SRC_DIR)/events/*.schema.yaml)

# Extract base names for each category
PROFILE_NAMES = $(sort $(patsubst %.schema.yaml,%,$(notdir $(PROFILE_SCHEMAS))))
DATA_NAMES = $(sort $(patsubst %.yaml,%,$(notdir $(DATA_SCHEMAS))))
DEFS_NAMES = $(sort $(patsubst %.yaml,%,$(notdir $(DEFS_SCHEMAS))))
EVENT_NAMES = $(sort $(patsubst %.schema.yaml,%,$(notdir $(EVENT_SCHEMAS))))

.PHONY: build publish publish-json publish-yaml generate test deploy clean

build:
	@echo "Building $(DOMAIN) schemas to output/..."
	@if [ -n "$(PROFILE_NAMES)" ]; then \
		echo "Building profile schemas..."; \
		for schema in $(PROFILE_NAMES); do \
			echo "  - $$schema"; \
			cd $(CLOUD_EVENTS_DIR) && npm run build -- --root-dir $(ROOT_DIR) $(SRC_DIR)/$$schema.schema.yaml $(OUTPUT_DIR) || exit 1; \
		done; \
	fi
	@if [ -n "$(DEFS_NAMES)" ]; then \
		echo "Building defs schemas..."; \
		for schema in $(DEFS_NAMES); do \
			echo "  - $$schema"; \
			cd $(CLOUD_EVENTS_DIR) && npm run build -- --root-dir $(ROOT_DIR) $(SRC_DIR)/defs/$$schema.yaml $(OUTPUT_DIR)/defs || exit 1; \
		done; \
	fi
	@if [ -n "$(DATA_NAMES)" ]; then \
		echo "Building data schemas..."; \
		for schema in $(DATA_NAMES); do \
			echo "  - $$schema"; \
			cd $(CLOUD_EVENTS_DIR) && npm run build -- --root-dir $(ROOT_DIR) $(SRC_DIR)/data/$$schema.yaml $(OUTPUT_DIR)/data || exit 1; \
		done; \
	fi
	@if [ -n "$(EVENT_NAMES)" ]; then \
		echo "Building event schemas..."; \
		for schema in $(EVENT_NAMES); do \
			echo "  - $$schema"; \
			cd $(CLOUD_EVENTS_DIR) && npm run build -- --root-dir $(ROOT_DIR) $(SRC_DIR)/events/$$schema.schema.yaml $(OUTPUT_DIR)/events || exit 1; \
		done; \
		echo "Bundling and flattening event schemas..."; \
		for schema in $(EVENT_NAMES); do \
			echo "  - $$schema (bundle & flatten)"; \
			cd $(CLOUD_EVENTS_DIR) && npm run bundle -- --root-dir $(ROOT_DIR) $(OUTPUT_DIR)/events/$$schema.schema.json $(OUTPUT_DIR)/events/$$schema.bundle.schema.json || exit 1; \
			cd $(CLOUD_EVENTS_DIR) && npm run bundle -- --flatten --root-dir $(ROOT_DIR) $(OUTPUT_DIR)/events/$$schema.schema.json $(OUTPUT_DIR)/events/$$schema.flattened.schema.json || exit 1; \
		done; \
	fi

publish-json:
	@echo "Publishing $(DOMAIN) schemas with public URLs..."
	@if [ -n "$(PROFILE_NAMES)" ]; then \
		echo "Publishing profile schemas..."; \
		for schema in $(PROFILE_NAMES); do \
			echo "  - $$schema"; \
			if [ -n "$(SCHEMA_URL_STRIP_PREFIX)" ]; then \
				cd $(CLOUD_EVENTS_DIR) && npm run build -- --root-dir $(ROOT_DIR) --strip-prefix $(SCHEMA_URL_STRIP_PREFIX) $(SRC_DIR)/$$schema.schema.yaml $(SCHEMAS_DIR) $(SCHEMA_BASE_URL) || exit 1; \
			else \
				cd $(CLOUD_EVENTS_DIR) && npm run build -- --root-dir $(ROOT_DIR) $(SRC_DIR)/$$schema.schema.yaml $(SCHEMAS_DIR) $(SCHEMA_BASE_URL) || exit 1; \
			fi; \
		done; \
	fi
	@if [ -n "$(DEFS_NAMES)" ]; then \
		echo "Publishing defs schemas..."; \
		for schema in $(DEFS_NAMES); do \
			echo "  - $$schema"; \
			if [ -n "$(SCHEMA_URL_STRIP_PREFIX)" ]; then \
				cd $(CLOUD_EVENTS_DIR) && npm run build -- --root-dir $(ROOT_DIR) --strip-prefix $(SCHEMA_URL_STRIP_PREFIX) $(SRC_DIR)/defs/$$schema.yaml $(SCHEMAS_DIR)/defs $(SCHEMA_BASE_URL) || exit 1; \
			else \
				cd $(CLOUD_EVENTS_DIR) && npm run build -- --root-dir $(ROOT_DIR) $(SRC_DIR)/defs/$$schema.yaml $(SCHEMAS_DIR)/defs $(SCHEMA_BASE_URL) || exit 1; \
			fi; \
		done; \
	fi
	@if [ -n "$(DATA_NAMES)" ]; then \
		echo "Publishing data schemas..."; \
		for schema in $(DATA_NAMES); do \
			echo "  - $$schema"; \
			if [ -n "$(SCHEMA_URL_STRIP_PREFIX)" ]; then \
				cd $(CLOUD_EVENTS_DIR) && npm run build -- --root-dir $(ROOT_DIR) --strip-prefix $(SCHEMA_URL_STRIP_PREFIX) $(SRC_DIR)/data/$$schema.yaml $(SCHEMAS_DIR)/data $(SCHEMA_BASE_URL) || exit 1; \
			else \
				cd $(CLOUD_EVENTS_DIR) && npm run build -- --root-dir $(ROOT_DIR) $(SRC_DIR)/data/$$schema.yaml $(SCHEMAS_DIR)/data $(SCHEMA_BASE_URL) || exit 1; \
			fi; \
		done; \
	fi
	@if [ -n "$(EVENT_NAMES)" ]; then \
		echo "Publishing event schemas..."; \
		for schema in $(EVENT_NAMES); do \
			echo "  - $$schema"; \
			if [ -n "$(SCHEMA_URL_STRIP_PREFIX)" ]; then \
				cd $(CLOUD_EVENTS_DIR) && npm run build -- --root-dir $(ROOT_DIR) --strip-prefix $(SCHEMA_URL_STRIP_PREFIX) $(SRC_DIR)/events/$$schema.schema.yaml $(SCHEMAS_DIR)/events $(SCHEMA_BASE_URL) || exit 1; \
			else \
				cd $(CLOUD_EVENTS_DIR) && npm run build -- --root-dir $(ROOT_DIR) $(SRC_DIR)/events/$$schema.schema.yaml $(SCHEMAS_DIR)/events $(SCHEMA_BASE_URL) || exit 1; \
			fi; \
		done; \
		echo "Bundling and flattening published event schemas..."; \
		for schema in $(EVENT_NAMES); do \
			echo "  - $$schema (bundle & flatten)"; \
			cd $(CLOUD_EVENTS_DIR) && npm run bundle -- --root-dir $(ROOT_DIR) $(OUTPUT_DIR)/events/$$schema.schema.json $(SCHEMAS_DIR)/events/$$schema.bundle.schema.json || exit 1; \
			cd $(CLOUD_EVENTS_DIR) && npm run bundle -- --flatten --root-dir $(ROOT_DIR) $(OUTPUT_DIR)/events/$$schema.schema.json $(SCHEMAS_DIR)/events/$$schema.flattened.schema.json || exit 1; \
		done; \
	fi

publish-yaml:
	@echo "Publishing $(DOMAIN) YAML schemas alongside JSON..."
	@if [ -n "$(PROFILE_NAMES)" ]; then \
		echo "Converting profile schemas to YAML..."; \
		for schema in $(PROFILE_NAMES); do \
			echo "  - $$schema"; \
			node $(ROOT_DIR)/src/cloudevents/tools/generator/json-to-yaml.cjs $(SCHEMAS_DIR)/$$schema.schema.json $(SCHEMAS_DIR)/$$schema.schema.yaml || exit 1; \
		done; \
	fi
	@if [ -n "$(DEFS_NAMES)" ]; then \
		echo "Converting defs schemas to YAML..."; \
		for schema in $(DEFS_NAMES); do \
			echo "  - $$schema"; \
			node $(ROOT_DIR)/src/cloudevents/tools/generator/json-to-yaml.cjs $(SCHEMAS_DIR)/defs/$$schema.json $(SCHEMAS_DIR)/defs/$$schema.yaml || exit 1; \
		done; \
	fi
	@if [ -n "$(DATA_NAMES)" ]; then \
		echo "Converting data schemas to YAML..."; \
		for schema in $(DATA_NAMES); do \
			echo "  - $$schema"; \
			node $(ROOT_DIR)/src/cloudevents/tools/generator/json-to-yaml.cjs $(SCHEMAS_DIR)/data/$$schema.json $(SCHEMAS_DIR)/data/$$schema.yaml || exit 1; \
		done; \
	fi
	@if [ -n "$(EVENT_NAMES)" ]; then \
		echo "Converting event schemas to YAML..."; \
		for schema in $(EVENT_NAMES); do \
			echo "  - $$schema (including bundle & flatten)"; \
			node $(ROOT_DIR)/src/cloudevents/tools/generator/json-to-yaml.cjs $(SCHEMAS_DIR)/events/$$schema.schema.json $(SCHEMAS_DIR)/events/$$schema.schema.yaml || exit 1; \
			node $(ROOT_DIR)/src/cloudevents/tools/generator/json-to-yaml.cjs $(SCHEMAS_DIR)/events/$$schema.bundle.schema.json $(SCHEMAS_DIR)/events/$$schema.bundle.schema.yaml || exit 1; \
			node $(ROOT_DIR)/src/cloudevents/tools/generator/json-to-yaml.cjs $(SCHEMAS_DIR)/events/$$schema.flattened.schema.json $(SCHEMAS_DIR)/events/$$schema.flattened.schema.yaml || exit 1; \
		done; \
	fi

publish:
	@echo "Publishing $(DOMAIN) schemas (JSON + YAML)..."
	$(MAKE) publish-json
	$(MAKE) publish-yaml

generate:
	@if [ -n "$(EVENT_NAMES)" ]; then \
		echo "Generating $(DOMAIN) events..."; \
		for schema in $(EVENT_NAMES); do \
			echo "  - $$schema"; \
			cd $(CLOUD_EVENTS_DIR) && npm run generate -- $(OUTPUT_DIR)/events/$$schema.schema.json $(EVENTS_DIR)/$$schema-event.json || exit 1; \
		done; \
	fi

test:
	@if [ -n "$(EVENT_NAMES)" ]; then \
		echo "Testing $(DOMAIN) events..."; \
		FAILED=0; \
		for schema in $(EVENT_NAMES); do \
			echo "Testing $$schema event..."; \
			echo "Discovering schema dependencies for $$schema..."; \
			SCHEMA_DEPS=$$(node $(ROOT_DIR)/src/cloudevents/tools/discover-schema-dependencies.js $(SRC_DIR)/events/$$schema.schema.yaml $(ROOT_DIR)/output 2>/dev/null); \
			if [ $$? -ne 0 ]; then \
				echo "❌ Failed to discover dependencies for $$schema"; \
				FAILED=1; \
				continue; \
			fi; \
			$(ROOT_DIR)/tests/run-validations.sh \
				$(ROOT_DIR)/output \
				$(EVENTS_DIR)/$$schema-event.json \
				$(OUTPUT_DIR)/events/$$schema.schema.json \
				$(OUTPUT_DIR)/events/$$schema.bundle.schema.json \
				$(OUTPUT_DIR)/events/$$schema.flattened.schema.json \
				$$SCHEMA_DEPS || FAILED=1; \
		done; \
		exit $$FAILED; \
	fi

deploy:
	@echo "=== Deploying $(DOMAIN) schemas ==="
	$(MAKE) build
	$(MAKE) generate
	$(MAKE) test
	$(MAKE) publish
	@echo ""

clean:
	@echo "Cleaning $(DOMAIN) output..."
	rm -rf $(OUTPUT_DIR)/*
	rm -rf $(SCHEMAS_DIR)/*
	rm -rf $(EVENTS_DIR)/*
