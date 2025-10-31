.PHONY: help install generate generate-service clean test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pip install -r requirements.txt

generate: ## Generate AsyncAPI specs for all services
	python generate_asyncapi.py --config config.yaml

generate-service: ## Generate AsyncAPI for a specific service (use SERVICE=name)
	@if [ -z "$(SERVICE)" ]; then \
		echo "Error: SERVICE not specified. Usage: make generate-service SERVICE='MESH Services'"; \
		exit 1; \
	fi
	python generate_asyncapi.py --config config.yaml --service "$(SERVICE)"

clean: ## Remove generated output files
	rm -rf output/

test: ## Run the generator with default config (for testing)
	@echo "Running AsyncAPI generator..."
	python generate_asyncapi.py --config config.yaml

validate: ## Validate generated AsyncAPI specs (requires asyncapi CLI)
	@echo "Validating AsyncAPI specifications..."
	@for file in output/*.yaml; do \
		echo "Validating $$file..."; \
		asyncapi validate $$file || echo "Note: Install AsyncAPI CLI with 'npm install -g @asyncapi/cli' for validation"; \
	done
