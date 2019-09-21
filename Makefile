.PHONY: develop
develop:
	# Installing ganache...
	cd curation && npm install
	# Starting ganache...
	-curation/node_modules/.bin/ganache-cli -b 1 &> ganache.log &
	# Deploying contracts...
	cd curation && npm run deploy-dev
	cd curation && echo '\nDEVELOPMENT=true' >> .env && \
	cp .env ../sdk/js/curation-api/.env && \
	cp .env ../sdk/js/tests/.env
	# Packaging holochain DNA...
	cd metastore && hc package
	# Starting holochain test conductor...
	-cd metastore && hc run --logging &> holochain.log

.PHONY: react
react:
	# Installing ui packages...
	cd ui && npm install
	# Adding holochain test data
	cd ui/test && node makeEntries
	# Starting react app
	cd ui && npm run start
