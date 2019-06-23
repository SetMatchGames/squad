.PHONY: develop
develop:
	docker-compose up
	docker-compose exec curation npm run deploy-local
