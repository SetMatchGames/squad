squad-games-web = packages/squad-games-web
app-spec-web = packages/app-spec-web
curation-market-js = packages/curation-market/clients/js
curation-market = packages/curation-market/app
metastore-js = packages/metastore/clients/js
metastore = packages/metastore/app
sdk-js = packages/squad-sdk/js
js-client-contracts = packages/curation-market/clients/js/contracts
curation-market-contracts = packages/curation-market/app/build/contracts


.PHONY: squad-games-web
squad-games-web: build/bootstrap $(curation-market-js)/curation-config.json
squad-games-web: $(js-client-contracts)
	cd $(squad-games-web) && npm run start


.PHONY: app-spec-web
app-spec-web: build/bootstrap $(curation-market-js)/curation-config.json
app-spec-web: $(js-client-contracts)
	cd $(app-spec-web) && npm run start


# TODO update ./holonix to https://holochain.love
metastore-shell = cd $(metastore) && nix-shell ./holonix --pure --command
.PHONY: metastore
metastore: build/bootstrap
	$(metastore-shell) 'hc package && hc run --logging'


.PHONY: clean
clean:
	rm -rf build
	rm -rf packages/curation-market/clients/js/contracts
	rm -rf packages/curation-market/app/build
	-docker stop devnet
	lerna clean


$(js-client-contracts): build/curation-market
	cp -r $(curation-market-contracts) $(curation-market-js)


$(curation-market-js)/curation-config.json: build/curation-market
	cp $(curation-market)/curation-config.json $(curation-market-js)/curation-config.json


build/curation-market: build/devnet
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
