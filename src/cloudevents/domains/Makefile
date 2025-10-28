# Makefile for all domain schemas - orchestrates subdomain Makefiles
MAKEFILE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

DOMAINS = digital-letters
PUBLISH_VERSION ?= 2025-10

.PHONY: build publish publish-json publish-yaml generate test deploy clean

build:
	@echo "=== Building all domains (version: $(PUBLISH_VERSION)) ==="
	@for domain in $(DOMAINS); do \
		echo ""; \
		echo "--- Building domain: $$domain ---"; \
		$(MAKE) -C $(MAKEFILE_DIR)$$domain build PUBLISH_VERSION=$(PUBLISH_VERSION) || exit 1; \
	done
	@echo ""
	@echo "✅ All domains built successfully!"

publish:
	@echo "=== Publishing all domains (version: $(PUBLISH_VERSION)) ==="
	@for domain in $(DOMAINS); do \
		echo ""; \
		echo "--- Publishing domain: $$domain ---"; \
		$(MAKE) -C $(MAKEFILE_DIR)$$domain publish PUBLISH_VERSION=$(PUBLISH_VERSION) || exit 1; \
	done
	@echo ""
	@echo "✅ All domains published successfully!"

publish-json:
	@echo "=== Publishing all domains JSON (version: $(PUBLISH_VERSION)) ==="
	@for domain in $(DOMAINS); do \
		echo ""; \
		$(MAKE) -C $(MAKEFILE_DIR)$$domain publish-json PUBLISH_VERSION=$(PUBLISH_VERSION) || exit 1; \
	done
	@echo ""
	@echo "✅ All domains published (JSON) successfully!"

publish-yaml:
	@echo "=== Publishing all domains YAML (version: $(PUBLISH_VERSION)) ==="
	@for domain in $(DOMAINS); do \
		echo ""; \
		$(MAKE) -C $(MAKEFILE_DIR)$$domain publish-yaml PUBLISH_VERSION=$(PUBLISH_VERSION) || exit 1; \
	done
	@echo ""
	@echo "✅ All domains published (YAML) successfully!"

generate:
	@echo "=== Generating events for all domains (version: $(PUBLISH_VERSION)) ==="
	@for domain in $(DOMAINS); do \
		echo ""; \
		$(MAKE) -C $(MAKEFILE_DIR)$$domain generate PUBLISH_VERSION=$(PUBLISH_VERSION) || exit 1; \
	done
	@echo ""
	@echo "✅ All events generated successfully!"

test:
	@echo "=== Testing all domains (version: $(PUBLISH_VERSION)) ==="
	@FAILED=0; \
	for domain in $(DOMAINS); do \
		echo ""; \
		$(MAKE) -C $(MAKEFILE_DIR)$$domain test PUBLISH_VERSION=$(PUBLISH_VERSION) || FAILED=1; \
	done; \
	if [ $$FAILED -eq 1 ]; then \
		echo ""; echo "❌ Some tests failed"; exit 1; \
	else \
		echo ""; echo "✅ All tests passed"; \
	fi

deploy:
	@echo "=== Deploying all domains (version: $(PUBLISH_VERSION)) ==="
	@for domain in $(DOMAINS); do \
		echo ""; \
		echo "--- Deploying domain: $$domain $(PUBLISH_VERSION) ---"; \
		$(MAKE) -C $(MAKEFILE_DIR)$$domain deploy PUBLISH_VERSION=$(PUBLISH_VERSION) || exit 1; \
	done
	@echo ""
	@echo "✅ All domains deployed successfully!"

clean:
	@echo "=== Cleaning all domains (version: $(PUBLISH_VERSION)) ==="
	@for domain in $(DOMAINS); do \
		$(MAKE) -C $(MAKEFILE_DIR)$$domain clean PUBLISH_VERSION=$(PUBLISH_VERSION); \
	done
	@echo ""
	@echo "✅ All domains cleaned!"
