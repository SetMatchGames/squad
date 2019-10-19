.PHONY: develop
develop:
	# Installing ganache...
	cd curation && npm install
	# Starting ganache...
	-curation/node_modules/.bin/ganache-cli -b 1 &> ganache.log &
	# Deploying contracts...
	cd curation && \
	npm run deploy-dev && \
	cp curation-config.json ../sdk/js/curation-config.json
	# Packaging holochain DNA...
	cd metastore && hc package
	# Starting holochain test conductor...
	echo '{"sdkUrl": "ws://localhost:8888"}' > sdk/js/squad-config.json
	-cd metastore && hc run --logging

.PHONY: react
react:
	# Installing ui packages...
	cd ui && npm install
	# Adding holochain test data (disabled for now)
	# cd ui/test && node makeEntries
	# Starting react app
	cd ui && npm run start
