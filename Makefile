SHELL := /bin/bash

# This file is for you! Edit it to implement your own hooks (make targets) into
# the project as automated steps to be executed on locally and in the CD pipeline.

include scripts/init.mk

# ==============================================================================

# Example CI/CD targets are: dependencies, build, publish, deploy, clean, etc.

quick-start: dependancies clean test-docs build serve-docs # Quick start target to setup, build and serve docs @Pipeline

dependencies:
	./dependancies.sh

test-docs:
	$(MAKE) -C docs test

build: # Build the project artefact @Pipeline
	$(MAKE) -C docs build

debug:
	$(MAKE) -C docs debug

publish: # Publish the project artefact @Pipeline
	# Implement the artefact publishing step

deploy: # Deploy the project artefact to the target environment @Pipeline
	# Implement the artefact deployment step

clean:: # Clean-up project resources (main) @Operations
	$(MAKE) -C docs clean && \
	$(MAKE) -C src/cloudevents clean && \
	$(MAKE) -C src/eventcatalogasyncapiimporter clean && \
	$(MAKE) -C src/eventcatalogasyncapiimporter clean-output && \
	rm -f .version

config:: _install-dependencies version

serve-docs:
	$(MAKE) -C docs s

version:
	rm -f .version
	make version-create-effective-file dir=.
	echo "{ \"schemaVersion\": 1, \"label\": \"version\", \"message\": \"$$(head -n 1 .version 2> /dev/null || echo unknown)\", \"color\": \"orange\" }" > version.json
# ==============================================================================

${VERBOSE}.SILENT: \
	build \
	clean \
	config \
	dependencies \
	deploy \
