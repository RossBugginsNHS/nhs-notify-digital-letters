# Makefile for cloudevents - orchestrates src/ subdomain Makefiles

# Get absolute path of this Makefile's directory
DOCS_RELATIVE_PATH = ../../docs/cloudevents
MAKEFILE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))



# Allow version override (default is set in src/Makefile)



PUBLISH_VERSION ?= all
CLOUDEVENTS_BASE_PATH = $(shell mkdir -p $(MAKEFILE_DIR)domains && cd $(MAKEFILE_DIR)domains && pwd)
OUTPUT_BASE_PATH = $(shell mkdir -p $(MAKEFILE_DIR)../../output && cd $(MAKEFILE_DIR)../../output && pwd)
SCHEMAS_BASE_PATH = $(shell mkdir -p $(MAKEFILE_DIR)../../schemas && cd $(MAKEFILE_DIR)../../schemas && pwd)
DOCS_BASE_PATH = $(shell mkdir -p $(MAKEFILE_DIR)$(DOCS_RELATIVE_PATH) && cd $(MAKEFILE_DIR)$(DOCS_RELATIVE_PATH) && pwd)
TOOLS_BASE_PATH = $(shell mkdir -p $(MAKEFILE_DIR)tools && cd $(MAKEFILE_DIR)tools && pwd)

.PHONY: build publish publish-json publish-yaml generate test-domains deploy clean build-docs update-readme

config:: _install-dependencies version # Configure development environment (main) @Configuration
	npm install

build:
	@echo "=== Building all schemas (version: $(PUBLISH_VERSION)) ==="
	$(MAKE) -C $(CLOUDEVENTS_BASE_PATH) build PUBLISH_VERSION=$(PUBLISH_VERSION)

publish:
	@echo "=== Publishing all schemas (JSON + YAML, version: $(PUBLISH_VERSION)) ==="
	$(MAKE) -C $(CLOUDEVENTS_BASE_PATH) publish PUBLISH_VERSION=$(PUBLISH_VERSION)

publish-json:
	@echo "=== Publishing all schemas (JSON only, version: $(PUBLISH_VERSION)) ==="
	$(MAKE) -C $(CLOUDEVENTS_BASE_PATH) publish-json PUBLISH_VERSION=$(PUBLISH_VERSION)

publish-yaml:
	@echo "=== Publishing all schemas (YAML only, version: $(PUBLISH_VERSION)) ==="
	$(MAKE) -C $(CLOUDEVENTS_BASE_PATH) publish-yaml PUBLISH_VERSION=$(PUBLISH_VERSION)

generate:
	@echo "=== Generating all events (version: $(PUBLISH_VERSION)) ==="
	$(MAKE) -C $(CLOUDEVENTS_BASE_PATH) generate PUBLISH_VERSION=$(PUBLISH_VERSION)

test-domains:
	@echo "=== Running all tests (version: $(PUBLISH_VERSION)) ==="
	$(MAKE) -C $(CLOUDEVENTS_BASE_PATH) test PUBLISH_VERSION=$(PUBLISH_VERSION)

deploy:
	@echo "=== Deploying all schemas (version: $(PUBLISH_VERSION)) ==="
	$(MAKE) clean
	$(MAKE) -C $(CLOUDEVENTS_BASE_PATH) deploy PUBLISH_VERSION=$(PUBLISH_VERSION)
	make build-docs
	make update-readme
	@echo ""
	@echo "✅ Build complete: local schemas tested and distribution schemas ready!"

clean::
	@echo "=== Cleaning output/ and schemas/ directories ==="
	rm -rf $(OUTPUT_BASE_PATH)
	rm -rf $(SCHEMAS_BASE_PATH)
	rm -rf $(DOCS_BASE_PATH)
	rm -rf .version
	rm -f version.json
	@echo ""

build-docs:
	@echo "=== Generating documentation for all schemas ==="
	@echo "OUTPUT_BASE_PATH: $(OUTPUT_BASE_PATH)"
	@echo "DOCS_BASE_PATH: $(DOCS_BASE_PATH)"
	@echo "MAKEFILE_DIR: $(MAKEFILE_DIR)"
	@echo "DOCS_RELATIVE_PATH: $(DOCS_RELATIVE_PATH)"
	@echo "COMPUTED PATH: $(shell cd $(MAKEFILE_DIR)$(DOCS_RELATIVE_PATH) && pwd)"

	npm run build-docs -- $(OUTPUT_BASE_PATH) $(DOCS_BASE_PATH)

update-readme:
	@echo "=== Updating README tables ==="
	npm run update-readme -- $(DOCS_BASE_PATH)
#	node $(TOOLS_BASE_PATH)/generator/update-readme.cjs $(DOCS_BASE_PATH)
	@echo ""

