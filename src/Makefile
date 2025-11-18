install: config

config:
	$(MAKE) -C ./cloudevents install
	$(MAKE) -C ./asyncapigenerator install-dev
	$(MAKE) -C ./cloudeventjekylldocs install-dev
	$(MAKE) -C ./eventcatalogasyncapiimporter install-dev

test:
	$(MAKE) -C ./asyncapigenerator coverage  # Run with coverage to generate coverage.xml for SonarCloud
	$(MAKE) -C ./cloudeventjekylldocs coverage # Run with coverage to generate coverage.xml for SonarCloud
	$(MAKE) -C ./eventcatalogasyncapiimporter coverage  # Run with coverage to generate coverage.xml for SonarCloud
	$(MAKE) -C ./cloudevents test
