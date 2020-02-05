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
squad-games-web: build/bootstrap squad-sdk-js build/devnet metastore
	cd $(squad-games-web) && npm run start


.PHONY: app-spec-roshambo
app-spec-roshambo: build/bootstrap squad-sdk-js
	cd $(app-spec-roshambo) && npm run start


.PHONY: squad-chess
squad-chess: build/bootstrap squad-sdk-js
# TODO make this depend on metastore like things depend on build/devnet
	cd $(squad-chess) && node scripts/load_defs.js
	cd $(squad-chess) && npm run start
	echo "open `pwd`/index.html in your browser"


.PHONY: metastore
metastore: build/bootstrap
ifeq ($(MOCK_METASTORE), true)
	cd $(mock-metastore) && npm run start
else
	$(metastore-shell) 'hc package && hc run --logging'
endif


.PHONY test:
test: test-curation-market test-squad-games-web test-app-spec-roshambo
test: test-metastore test-squad-chess


.PHONY: clean
clean:
	rm -rf build
	rm -rf packages/curation-market/clients/js/contracts
	rm -rf packages/curation-market/app/build
	rm -rf packages/metastore/mock/build
	rm -rf $(js-client-contracts)
	rm $(curation-market-js)/curation-config.json
	if [ -a build/devnet ]; then kill $(shell cat build/devnet); fi


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
test-sdk-js: build/bootstrap squad-sdk-js
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
test-curation-market: build/curation-market $(curation-market-js)/curation-config.json
	cd $(curation-market) && npm run test
	cd $(curation-market-js) && npm run test

.PHONY: squad-sdk-js
squad-sdk-js: $(js-client-contracts) $(curation-market-js)/curation-config.json

$(js-client-contracts): build/curation-market
	cp -r $(curation-market-contracts) $(curation-market-js)


$(curation-market-js)/curation-config.json: build/curation-market
	cp $(curation-market)/curation-config.json $(curation-market-js)/curation-config.json


build/curation-market: build/devnet build/bootstrap
	cd $(curation-market) && npm run deploy-dev
	touch build/curation-market


build/devnet: build/.
	cd $(curation-market) && npx ganache-cli -b 1 &
	echo "$!" > build/devnet


build/bootstrap: build/.
	lerna bootstrap
	touch build/bootstrap


build/.:
	mkdir build

