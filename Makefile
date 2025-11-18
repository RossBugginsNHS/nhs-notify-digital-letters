# This file is for you! Edit it to implement your own hooks (make targets) into
# the project as automated steps to be executed on locally and in the CD pipeline.

include scripts/init.mk

# ==============================================================================

# Example CI/CD targets are: dependencies, build, publish, deploy, clean, etc.

quick-start: config clean test-docs build serve-docs # Quick start target to setup, build and serve docs @Pipeline

_install-apt-packages:
	@echo "Installing apt packages listed in packages.txt..."
	sudo apt-get update && cat packages.txt | xargs sudo apt-get install -y || echo "Couldn't get apt packages, continuing..."

_install-asdf:
	curl -LO https://github.com/asdf-vm/asdf/releases/download/v0.18.0/asdf-v0.18.0-linux-amd64.tar.gz && \
	sudo tar -xvzf asdf-v0.18.0-linux-amd64.tar.gz -C /usr/local/bin && \
	sudo chmod +x /usr/local/bin/asdf && \
	rm asdf-v0.18.0-linux-amd64.tar.gz && \
	pwd && \
	ls -la && \
	/usr/local/bin/asdf --version && \
	export ASDF_DATA_DIR=$$HOME/.asdf && \
	export PATH=$$ASDF_DATA_DIR/shims:$$ASDF_DATA_DIR/bin:/usr/local/bin:$$PATH && \
	echo "export ASDF_DATA_DIR=$$HOME/.asdf" >> $$HOME/.bashrc && \
	echo "export PATH=$$ASDF_DATA_DIR/shims:$$ASDF_DATA_DIR/bin:/usr/local/bin:$$PATH" >> $$HOME/.bashrc && \
	echo "export ASDF_DATA_DIR=$$HOME/.asdf" >> $$HOME/.zshrc && \
	echo "export PATH=$$ASDF_DATA_DIR/shims:$$ASDF_DATA_DIR/bin:/usr/local/bin:$$PATH" >> $$HOME/.zshrc && \
	asdf --version

dependencies: _install-asdf _install-apt-packages _dependancies

_dependancies: _install-dependencies version # Configure development environment (main) @Configuration
	@echo "Installing project dependencies..."
	@echo "Installing documentation dependencies..."
	@echo "ASDF data dir: $ASDF_DATA_DIR"
	@echo "PATH: $PATH"

	$(MAKE) -C docs install
	@echo "Installing CloudEvents source dependencies..."
	$(MAKE) -C src/cloudevents install
	@echo "Installing Event Catalog AsyncAPI Importer source dependencies..."
	$(MAKE) -C src/eventcatalogasyncapiimporter install


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
	$(MAKE) -C docs clean
	$(MAKE) -C src/cloudevents clean
	$(MAKE) -C src/eventcatalogasyncapiimporter clean
	$(MAKE) -C src/eventcatalogasyncapiimporter clean-output
	rm -f .version

config:: _dependancies

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
