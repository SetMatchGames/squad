# First run nix-shell https://holochain.love

.PHONY: develop
develop:
	cd curation && npm install
	-ganache-cli -b 1 &> ganache.log &
	cd curation && npm run deploy-local
	cd metastore && hc package
	cd metastore && -hc run &> ../holochain.log &