BASE_URL ?= "/"
VERSION ?= ""
SCHEMA_PATTERN = *.schema.json
SCHEMA_BASE_INPUT_DIR = ../schemas
SCHEMA_INPUT_DIR = $(SCHEMA_BASE_INPUT_DIR)/output
BASE_OUTPUT_DIR = _site
SCHEMA_OUTPUT_DIR = $(BASE_OUTPUT_DIR)/schemas
SHELL = /bin/bash

default: install

h help:
	@egrep '^\S|^$$' Makefile

install:
	npm install
	bundle config set --local path vendor/bundle
	bundle install

s serve:
	bundle exec jekyll serve --trace --livereload

define baseurlparam =
$(if $(BASE_URL),-- --baseurl $(BASE_URL),-- --baseurl "")
endef

build: build-docs build-schemas show-build-output

build-docs: version
	npm run build $(baseurlparam)

build-schemas: clean-schemas
	(cd $(SCHEMA_BASE_INPUT_DIR) && make config && make build)
	mkdir -p $(SCHEMA_OUTPUT_DIR)
	@echo "Finding schema files..."
	@find $(SCHEMA_INPUT_DIR) -name "$(SCHEMA_PATTERN)" -print
	@echo "Copying schema files..."
	rsync -av --include="*/" --include="$(SCHEMA_PATTERN)" --exclude="*" $(SCHEMA_INPUT_DIR)/ $(SCHEMA_OUTPUT_DIR)/
	@echo "Output in $(SCHEMA_OUTPUT_DIR):"
	@find $(SCHEMA_OUTPUT_DIR) -type f -name "*" | sort

show-build-output:
	@echo "Build output in $(BASE_OUTPUT_DIR):"
	@find $(BASE_OUTPUT_DIR) -type f -name "*" | sort

clean-schemas:
	rm -rf $(SCHEMA_OUTPUT_DIR)

debug: version
	npm run debug

version:
	touch _config.version.yml
	if [[ $(VERSION) == "" ]]; then \
		(cd .. && make version); \
		ver=$$(head -n 1 ../.version 2> /dev/null || echo unknown); \
		echo "version: $$ver" > _config.version.yml; \
		echo "$$ver" > .version; \
	else \
		echo "version: $(VERSION)" > _config.version.yml; \
		echo "$(VERSION)" > .version; \
	fi

	echo "{ \"schemaVersion\": 1, \"label\": \"version\", \"message\": \"$$(head -n 1 .version 2> /dev/null || echo unknown)\", \"color\": \"orange\" }" > version.json
