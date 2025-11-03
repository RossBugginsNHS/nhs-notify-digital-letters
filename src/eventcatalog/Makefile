
build: clean
	ls -la
	make -C ../asyncapigenerator generate
	make -C ../eventcatalogasyncapiimporter import
	npm install
	npm run build


serve:
	npm run dev

clean:
	rm -rf .eventcatalog-core
	rm -rf dist
	rm -rf node_modules
