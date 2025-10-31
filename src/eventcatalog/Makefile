
build:
	ls -la
	make -C ../asyncapigenerator generate
	make -C ../eventcatalogasyncapiimporter import
	cd digital-letters && npm run build
