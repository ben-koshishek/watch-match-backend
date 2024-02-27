.PHONY: help

help: ## list all the Makefile commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

###########
# general #
###########
up: ## start docker
	docker-compose -f docker-compose.yml up

stop: ## stop docker
	docker-compose -f docker-compose.yml down

down: ## delete db volumes
	docker-compose -f docker-compose.yml down -v

restart: down up ## restart docker containers

logs:
	docker-compose -f docker-compose.yml logs -f --tail 200
