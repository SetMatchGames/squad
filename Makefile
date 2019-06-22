.PHONY: develop
develop: build
	docker-compose up
	docker-compose exec curation npm run deploy-local