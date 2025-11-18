SHELL := /bin/bash

install: config

config:
	@echo "------------------- CLOUD EVENTS -------------------"
	$(MAKE) -C ./cloudevents install
	@echo "------------------- ASYNC GENERATOR  -------------------"
	$(MAKE) -C ./asyncapigenerator install-dev
	@echo "------------------- CLOUD EVENT JEKYLL   -------------------"
	$(MAKE) -C ./cloudeventjekylldocs install-dev
	@echo "------------------- CLOUD EVENT IMPORTER   -------------------"
	$(MAKE) -C ./eventcatalogasyncapiimporter install-dev

test:
	$(MAKE) -C ./asyncapigenerator coverage  # Run with coverage to generate coverage.xml for SonarCloud
	$(MAKE) -C ./cloudeventjekylldocs coverage # Run with coverage to generate coverage.xml for SonarCloud
	$(MAKE) -C ./eventcatalogasyncapiimporter coverage  # Run with coverage to generate coverage.xml for SonarCloud
	$(MAKE) -C ./cloudevents test
