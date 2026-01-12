.PHONY: help install start stop restart clean logs check-node

GREEN := \033[0;32m
BLUE := \033[0;34m
YELLOW := \033[0;33m
RED := \033[0;31m
CYAN := \033[0;36m
NC := \033[0m

PROJECT_NAME := trandenden
MARIADB_CONTAINER := mariadb
NETWORK_NAME := transcendence-net
BACKEND_PORT := 3001
FRONTEND_PORT := 5173

help:
	@echo ""
	@echo "  $(YELLOW)make check-node$(NC)    - Check Node.js version (needs v18+)"
	@echo "  $(YELLOW)make install$(NC)       - Install all dependencies"
	@echo "  $(YELLOW)make start$(NC)         - Start MariaDB + Backend + Frontend"
	@echo "  $(YELLOW)make stop$(NC)          - Stop all servers"
	@echo "  $(YELLOW)make restart$(NC)       - Restart everything"
	@echo "  $(YELLOW)make clean$(NC)         - Clean up Docker containers and network"
	@echo "  $(YELLOW)make logs$(NC)          - Show all logs"
	@echo ""

check-node:
	@NODE_VERSION=$$(node --version | cut -d'v' -f2 | cut -d'.' -f1); \
	if [ $$NODE_VERSION -lt 18 ]; then \
		echo "$(RED)Error: Node.js version $$NODE_VERSION detected. Need v18 or higher.$(NC)"; \
		exit 1; \
	else \
		echo "$(GREEN)Node.js v$$NODE_VERSION - OK$(NC)"; \
	fi

install: check-node
	@echo "$(BLUE)Installing dependencies$(NC)"
	@cd backend && npm install
	@cd frontend && npm install
	@echo "$(GREEN)All dependencies installed$(NC)"

_network:
	@docker network inspect $(NETWORK_NAME) >/dev/null 2>&1 || \
		docker network create $(NETWORK_NAME) >/dev/null 2>&1

_mariadb: _network
	@docker rm -f $(MARIADB_CONTAINER) 2>/dev/null || true
	@docker run -d \
		--name $(MARIADB_CONTAINER) \
		--network $(NETWORK_NAME) \
		-e MYSQL_ROOT_PASSWORD=root \
		-e MYSQL_DATABASE=trandenden \
		-e MYSQL_USER=transcendence \
		-e MYSQL_PASSWORD=transcendence \
		mariadb:latest >/dev/null 2>&1
	@sleep 3

start: _mariadb
	@echo ""
	@trap 'kill 0' EXIT; \
	(cd backend && npm run dev 2>&1 | while IFS= read -r line; do printf "$(BLUE)[BACKEND]$(NC)  %s\n" "$$line"; done) & \
	(cd frontend && npm run dev 2>&1 | while IFS= read -r line; do printf "$(CYAN)[FRONTEND]$(NC) %s\n" "$$line"; done) & \
	wait

stop:
	@echo "$(RED)Stopping all servers$(NC)"
	@-killall -q node 2>/dev/null || true
	@-docker stop $(MARIADB_CONTAINER) 2>/dev/null || true

clean: stop
	@echo "$(RED)Cleaning up Docker resources$(NC)"
	@docker rm -f $(MARIADB_CONTAINER) 2>/dev/null || true
	@docker network rm $(NETWORK_NAME) 2>/dev/null || true
	@echo "$(GREEN)Cleanup complete$(NC)"

restart: stop start

logs:
	@echo "$(BLUE)Docker Status:$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|mariadb" || echo "No containers running"

.DEFAULT_GOAL := help