# First run nix-shell https://holochain.love

.PHONY: develop
develop:
	echo 'Installing ganache...'
	cd curation && npm install
	echo 'Starting ganache...'
	-ganache-cli -b 1 &> ganache.log &
	echo 'Deploying contracts...'
	cd curation && npm run deploy-local
	echo 'Packaging holochain DNA...'
	cd metastore && hc package
	echo 'Starting holochain test conductor...'
	-cd metastore && hc run &> ../holochain.log
	# echo 'Starting React app...'
	# cd ui && npm run start

.PHONY: react
react:
	echo 'Installing ui packages...'
	cd ui && npm install
	echo 'Linking ui to sdk, adding holochain test entries, and starting React app...'
	cd sdk/js && npm link && cd ../../ui && npm link squad-sdk && cd test && node makeEntries && cd .. && npm run start