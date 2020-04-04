squad-games-web = packages/squad-games-web
app-spec-roshambo = packages/app-spec-roshambo
curation-market = packages/curation-market
metastore-js = packages/metastore/clients/js
metastore = packages/metastore/app
mock-metastore = packages/metastore/mock
sdk-js = packages/squad-sdk/js
js-client-contracts = packages/curation-market/clients/js/contracts
curation-market-contracts = packages/curation-market/app/build/contracts
squad-chess = packages/app-spec-squad-chess
p2p-js = packages/p2p/clients/js
p2p = packages/p2p/app

metastore-shell = cd $(metastore) && nix-shell https://holochain.love --pure --command

.PHONY: ci
ci: metastore-tests mock-metastore-tests squad-chess-tests sdk-js-tests p2p-js-tests p2p-tests

.PHONY: squad-games-web
squad-games-web: build/metastore
	cd $(squad-games-web) && npm run start

.PHONY: squad-chess
squad-chess: build/p2p build/metastore
	cd $(squad-chess) && npm run start
	cd $(squad-chess) && echo "open `pwd`/index.html in your browser"

.PHONY: squad-chess-alpha-server
squad-chess-alpha-server: build/metastore
	cd $(squad-chess) && node scripts/load_defs.js
	cd $(squad-chess) && npm run build
	cd $(squad-chess) && npx http-server

.PHONY: clean
clean:
	-if [ -a build/devnet ]; then kill $(shell cat build/devnet); fi
	-if [ -a build/metastore ]; then kill $(shell cat build/metastore); fi
	-if [ -a build/p2p ]; then kill $(shell cat build/p2p); fi
	-rm -rf build
	-rm -rf packages/curation-market/clients/js/contracts
	-rm -rf packages/metastore/mock/build
	-rm -rf $(js-client-contracts)

.PHONY: very-clean
very-clean: clean
	lerna clean

.PHONY: squad-chess-tests
squad-chess-tests: build/bootstrap
	cd $(squad-chess) && npm run test

.PHONY: mock-metastore-tests
mock-metastore-tests: build/bootstrap
	cd $(mock-metastore) && npm run test

.PHONY: sdk-js-tests
sdk-js-tests: build/bootstrap
	cd $(sdk-js) && npm run test

.PHONY: metastore-tests
metastore-tests: build/bootstrap
	cd $(metastore-js) && npm run test
	echo "Skipping holochain tests, reactivate when on current hc release"
	echo "Skipping holochain tests, reactivate when on current hc release"
	echo "Skipping holochain tests, reactivate when on current hc release"
	echo "Skipping holochain tests, reactivate when on current hc release"
	echo "Skipping holochain tests, reactivate when on current hc release"
#	$(metastore-shell) hc test

.PHONY: squad-games-web-tests
squad-games-web-tests:
	cd $(squad-games-web) && CI=true npm run test

.PHONY: app-spec-roshambo-tests
app-spec-roshambo-tests:
	cd $(app-spec-roshambo) && CI=true npm run test

.PHONY: curation-market-tests
curation-market-tests: build/curation-market
	cd $(curation-market) && npm run test

.PHONY: p2p-js-tests
p2p-js-tests: build/p2p
	cd $(p2p-js) && npm run test

.PHONY: p2p-tests
p2p-tests:
	cd $(p2p) && npm run test

build/p2p: build/bootstrap
	cd $(p2p) && npm run server &
	touch build/p2p

$(curation-market-contracts):
	cd $(curation-market) && npm run build

build/development-curation-market: build/devnet build/bootstrap
	cd $(curation-market) && npm run deploy
	touch build/development-curation-market

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
