squad-games-web = packages/squad-games-web
app-spec-roshambo = packages/app-spec-roshambo
curation-market-js = packages/curation-market/clients/js
curation-market = packages/curation-market/app
metastore-js = packages/metastore/clients/js
metastore = packages/metastore/app
mock-metastore = packages/metastore/mock
sdk-js = packages/squad-sdk/js
js-client-contracts = packages/curation-market/clients/js/contracts
curation-market-contracts = packages/curation-market/app/build/contracts
squad-chess = packages/app-spec-squad-chess


metastore-shell = cd $(metastore) && nix-shell https://holochain.love --pure --command

.PHONY: ci
ci: build/bootstrap test-metastore test-mock-metastore test-squad-chess
ci: test-sdk-js

.PHONY: squad-games-web
squad-games-web: build/squad-sdk-js build/metastore
	cd $(squad-games-web) && npm run start

#!!! clean up and remove roshambo completely?
.PHONY: app-spec-roshambo
app-spec-roshambo: build/metastore build/squad-sdk-js
	cd $(app-spec-roshambo) && npm run start

.PHONY: squad-chess
squad-chess: build/metastore build/squad-sdk-js
	cd $(squad-chess) && node scripts/load_defs.js
	cd $(squad-chess) && npm run start
	cd $(squad-chess) && echo "open `pwd`/index.html in your browser"

.PHONY: %-squad-chess
%-squad-chess: build/metastore build/%-squad-sdk-js
#	cd $(squad-chess) && node scripts/load_defs.js
	cd $(squad-chess) && npm run start
	cd $(squad-chess) && echo "open `pwd`/index.html in your browser"

.PHONY: squad-chess-alpha-server
squad-chess-alpha-server: build/metastore build/squad-sdk-js
	cd $(squad-chess) && node scripts/load_defs.js
	cd $(squad-chess) && npm run build
	cd $(squad-chess) && npx http-server

.PHONY test:
test: test-curation-market test-squad-games-web test-app-spec-roshambo
test: test-metastore test-squad-chess


.PHONY: clean
clean:
	-if [ -a build/devnet ]; then kill $(shell cat build/devnet); fi
	-if [ -a build/metastore ]; then kill $(shell cat build/metastore); fi
	-rm -rf build
	-rm -rf packages/curation-market/clients/js/contracts
	-rm -rf packages/curation-market/app/build
	-rm -rf packages/metastore/mock/build
	-rm -rf $(js-client-contracts)
	-rm $(curation-market-js)/development-curation-config.json


.PHONY: very-clean
very-clean: clean
	lerna clean


.PHONY: test-squad-chess
test-squad-chess: build/bootstrap
	cd $(squad-chess) && npm run test


.PHONY: test-mock-metastore
test-mock-metastore: build/bootstrap
	cd $(mock-metastore) && npm run test


.PHONY: test-sdk-js
test-sdk-js: build/bootstrap build/squad-sdk-js
	cd $(sdk-js) && npm run test


.PHONY: test-metastore
test-metastore: build/bootstrap
	cd $(metastore-js) && npm run test
	echo "Skipping holochain tests, reactivate when on current hc release"
	echo "Skipping holochain tests, reactivate when on current hc release"
	echo "Skipping holochain tests, reactivate when on current hc release"
	echo "Skipping holochain tests, reactivate when on current hc release"
	echo "Skipping holochain tests, reactivate when on current hc release"
#	$(metastore-shell) hc test


.PHONY: test-squad-games-web
test-squad-games-web:
	cd $(squad-games-web) && CI=true npm run test


.PHONY: test-app-spec-roshambo
test-app-spec-roshambo:
	cd $(app-spec-roshambo) && CI=true npm run test


.PHONY: test-curation-market
test-curation-market: build/curation-market $(curation-market-js)/development-curation-config.json
	cd $(curation-market) && npm run test
	cd $(curation-market-js) && npm run test

build/squad-sdk-js: $(js-client-contracts) $(curation-market-js)/development-curation-config.json
	touch build/squad-sdk-js

build/%-squad-sdk-js: $(js-client-contracts) $(curation-market-js)/%-curation-config.json
	touch build/$*-squad-sdk-js

$(js-client-contracts): $(curation-market-contracts)
	cp -r $(curation-market-contracts) $(curation-market-js)

$(curation-market-contracts):
	cd $(curation-market) && npm run build

$(curation-market-js)/%-curation-config.json: build/%-curation-market
	cp $(curation-market)/$*-curation-config.json $(curation-market-js)/$*-curation-config.json

build/development-curation-market: build/devnet build/bootstrap
	echo "makeing because of $?"
	cd $(curation-market) && npm run deploy
	touch build/development-curation-market

build/%-curation-market: build/bootstrap
	cd $(curation-market) && npm run deploy-$*
	touch build/$*-curation-market

build/metastore: build/bootstrap
ifeq ($(MOCK_METASTORE), true)
	cd $(mock-metastore) && { npm run start & echo $$! > PID; }
	mv $(mock-metastore)/PID build/metastore
else
	$(metastore-shell) 'hc package && hc run --logging'
endif

build/devnet:
	mkdir -p build
	cd $(curation-market) && { npx ganache-cli -b 1 & echo $$! > PID; }
	mv $(curation-market)/PID build/devnet

build/bootstrap:
	mkdir -p build
	lerna bootstrap
	touch build/bootstrap
