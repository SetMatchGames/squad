squad-games-web = packages/squad-games-web
app-spec-web = packages/app-spec-web
curation-market-js = packages/curation-market/clients/js
curation-market = packages/curation-market/app
metastore-js = packages/metastore/clients/js
metastore = packages/metastore/app
sdk-js = packages/squad-sdk/js
js-client-contracts = packages/curation-market/clients/js/contracts
curation-market-contracts = packages/curation-market/app/build/contracts


metastore-shell = cd $(metastore) && nix-shell https://holochain.love --pure --command


.PHONY: squad-games-web
squad-games-web: build/bootstrap $(curation-market-js)/curation-config.json
squad-games-web: $(js-client-contracts)
	cd $(squad-games-web) && npm run load_dev_defs
	cd $(squad-games-web) && npm run start


.PHONY: app-spec-web
app-spec-web: build/bootstrap $(curation-market-js)/curation-config.json
app-spec-web: $(js-client-contracts)
#	cd $(app-spec-web) && npm run load_dev_defs
	cd $(app-spec-web) && npm run start


.PHONY: metastore
metastore: build/bootstrap
	$(metastore-shell) 'hc package && hc run --logging'


.PHONY test:
test: test-curation-market test-squad-games-web test-app-spec-web test-metastore


.PHONY: clean
clean:
	rm -rf build
	rm -rf packages/curation-market/clients/js/contracts
	rm -rf packages/curation-market/app/build
	-docker stop devnet
	-docker rm devnet
	lerna clean


.PHONY: test-metastore
test-metastore:
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


.PHONY: test-app-spec-web
test-app-spec-web:
	cd $(app-spec-web) && CI=true npm run test


.PHONY: test-curation-market
test-curation-market: build/curation-market $(curation-market-js)/curation-config.json
	cd $(curation-market) && npm run test
	cd $(curation-market-js) && npm run test


$(js-client-contracts): build/curation-market
	cp -r $(curation-market-contracts) $(curation-market-js)


$(curation-market-js)/curation-config.json: build/curation-market
	cp $(curation-market)/curation-config.json $(curation-market-js)/curation-config.json


build/curation-market: build/devnet build/bootstrap
	cd $(curation-market) && npm run deploy-dev
	touch build/curation-market


build/devnet: build/.
	-docker run -d --rm --name devnet -p 8545:8545 trufflesuite/ganache-cli -b 1
	touch build/devnet


build/bootstrap: build/.
	lerna bootstrap
	touch build/bootstrap


build/.:
	mkdir build
