CLIENT_PATH=client
DOCKER_REPO=proj-mgmt-sys
TAG?=latest
VERSION?=$(TAG)

init:
	npm install
	git submodule init
	git submodule update
	cd "$(CLIENT_PATH)" && npm install
	make build-client

build-client:
	cd "$(CLIENT_PATH)" && npm run build-production

build:
	npm run build

build-production:
	npm run build-production

docker: build-production
	rm -rf docker-build/
	mkdir docker-build/
	mv .compiled-server/* docker-build/
	# Shrinkwrap NPM modules
	npm shrinkwrap
	mv npm-shrinkwrap.json docker-build/
	docker build --build-arg VERSION=$(VERSION) -t '$(DOCKER_REPO):$(TAG)' .
	rm -rf docker-build/


