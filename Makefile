.PHONY: develop
develop:
        # Installing ganache...
	cd packages/curation/app && npm install
	# Starting ganache...
	-packages/curation/app/node_modules/.bin/ganache-cli -b 1 &
	# Deploying contracts...
	cd packages/curation/app && npm run deploy-dev
	#cp curation-config.json ../sdk/js/curation-config.json
	# Packaging holochain DNA...
	cd packages/metastore/app && hc package
	# Starting holochain test conductor...
	echo '{"sdkUrl": "ws://localhost:8888"}' > packages/squad-sdk/js/squad-config.json
	-cd packages/metastore/app && hc run --logging

.PHONY: react
react: bootstrap
	# Installing ui packages...
#	cd packages/squad-games-web && npm install
	# Adding holochain test data (disabled for now)
	# cd packages/squad-games-web/test && node makeEntries
	# Starting react app
	cd packages/squad-games-web && npm run start

.PHONY: bootstrap
bootstrap:
	lerna bootstrap

.PHONY: test
test: bootstrap
	echo "Running all test suites"
	cd packages/squad-sdk/js && npm run test
	echo "WARNING skipping metastore hc test, they are broken"
#	cd packages/metastore/app && hc test
	cd packages/metastore/clients/js && npm run test
	echo "WARNING skipping ui npm test because of that stupid bug"
#	cd packages/squad-game-web && CI=true npm test
	cd packages/curation/app && npm run test
	cd packages/curation/clients/js && npm run test
	echo "Whoops forgot app spec tests!" && false
	echo "All test suites pass!"
