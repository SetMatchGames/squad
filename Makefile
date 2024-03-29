squad-games-web = packages/squad-games-web
app-spec-roshambo = packages/app-spec-roshambo
curation-market = packages/curation-market/app
curation-market-js = packages/curation-market/clients/js
metastore-js = packages/metastore/clients/js
metastore = packages/metastore/app
mock-metastore = packages/metastore/mock
sdk-js = packages/squad-sdk/js
js-client-contracts = packages/curation-market/clients/js/contracts
curation-market-contracts = packages/curation-market/app/build/contracts
squad-chess = packages/app-spec-squad-chess
matchmaking-js = packages/matchmaking/clients/js
matchmaking = packages/matchmaking/server

metastore-shell = cd $(metastore) && nix-shell https://holochain.love --pure --command

.PHONY: ci
ci: squad-chess-tests sdk-js-tests matchmaking-js-tests matchmaking-tests

.PHONY: squad-games-web
squad-games-web: build/metastore
	cd $(squad-games-web) && npm run start

.PHONY: squad-chess
squad-chess: build/matchmaking build/metastore
	cd $(squad-chess) && npm run start &
	cd $(squad-chess) && npx http-server -c-1
	cd $(squad-chess) && echo "open localhost:8080 in your browser"

.PHONY: squad-chess-dev
squad-chess-dev: build/matchmaking build/metastore 

.PHONY: squad-chess-alpha-server
squad-chess-alpha-server: build/metastore
	cd $(squad-chess) && node scripts/load_defs.js
	cd $(squad-chess) && npm run build
	cd $(squad-chess) && npx http-server

.PHONY: clean
clean:
	-if [ -a build/devnet ]; then kill $(shell cat build/devnet); fi
	-if [ -a build/metastore ]; then kill $(shell cat build/metastore); fi
	-if [ -a build/matchmaking ]; then kill $(shell cat build/matchmaking); fi
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
curation-market-tests: build/development-curation-market
	cd $(curation-market) && npm run test

.PHONY: curation-market-js-tests
curation-market-js-tests: build/development-curation-market
	cd $(curation-market-js) && npm run test

.PHONY: matchmaking-js-tests
matchmaking-js-tests: build/matchmaking
	cd $(matchmaking-js) && npm run test

.PHONY: matchmaking-tests
matchmaking-tests:
	cd $(matchmaking) && npm run test

build/matchmaking: build/bootstrap
	cd $(matchmaking) && npm run server &
	touch build/matchmaking

$(curation-market-contracts):
	cd $(curation-market) && npm run build

build/development-curation-market: build/devnet build/bootstrap
	cd $(curation-market) && npm run deploy
	touch build/development-curation-market

build/metastore: build/bootstrap
# ifeq ($(MOCK_METASTORE), true)
	cd $(mock-metastore) && { npm run start & echo $$! > PID; }
	mv $(mock-metastore)/PID build/metastore
# else
# 	$(metastore-shell) 'hc package && hc run --logging'
# endif

build/devnet:
	mkdir -p build
	cd $(curation-market) && { npx ganache-cli -b 1 & echo $$! > PID; }
	mv $(curation-market)/PID build/devnet

build/bootstrap:
	mkdir -p build
	lerna bootstrap
	touch build/bootstrap
