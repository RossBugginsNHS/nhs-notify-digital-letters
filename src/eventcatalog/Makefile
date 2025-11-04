BASE_URL ?= ""
EVENT_CAT_PATH ?= "/eventcatalog"

define baseurlparam =
$(if $(BASE_URL),-- --base $(BASE_URL)$(EVENT_CAT_PATH),-- --base $(EVENT_CAT_PATH))
endef


build: clean
	ls -la
	make -C ../asyncapigenerator generate
	make -C ../eventcatalogasyncapiimporter import
	npm install
	npm run build $(baseurlparam)


serve:
	npm run dev

clean:
	rm -rf .eventcatalog-core
	rm -rf dist
	rm -rf node_modules
