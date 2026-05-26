.PHONY: docker-build
docker-build:
	@echo "Building app image..."
	docker build -f Dockerfile -t tarot-core:latest .

.PHONY: helm-install
helm-install:
	helm upgrade --install tarot-core ./deploy/chart \
		--namespace tarot-core --create-namespace \
		$(HELM_VALUES)

.PHONY: helm-uninstall
helm-uninstall:
	helm uninstall tarot-core --namespace tarot-core
