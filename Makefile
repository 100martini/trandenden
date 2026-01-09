.PHONY: help install start stop restart dev backend frontend logs

GREEN := \033[0;32m
BLUE := \033[0;34m
YELLOW := \033[0;33m
RED := \033[0;31m
CYAN := \033[0;36m
NC := \033[0m

PROJECT_NAME := trandenden
MONGO_CONTAINER := mongodb
MARIADB_CONTAINER := mariadb
BACKEND_PORT := 3000
FRONTEND_PORT := 5173

help:
	@echo ""
	@echo "  $(YELLOW)make install$(NC)       - Install all dependencies"
	@echo "  $(YELLOW)make start$(NC)         - Start MongoDB + MariaDB + Backend + Frontend"
	@echo "  $(YELLOW)make stop$(NC)          - Stop all servers"
	@echo "  $(YELLOW)make restart$(NC)       - Restart everything"
	@echo "  $(YELLOW)make dev$(NC)           - Start in development mode"
	@echo "  $(YELLOW)make backend$(NC)       - Start only backend"
	@echo "  $(YELLOW)make frontend$(NC)      - Start only frontend"
	@echo "  $(YELLOW)make logs$(NC)          - Show all logs"
	@echo ""

install:
	@echo "$(BLUE)Installing dependencies$(NC)"
	@cd backend && npm install
	@cd frontend && npm install
	@echo "$(GREEN)All dependencies installed$(NC)"

_mongo:
	@docker ps -a | grep $(MONGO_CONTAINER) > /dev/null 2>&1 && \
		docker start $(MONGO_CONTAINER) > /dev/null 2>&1 || \
		docker run -d -p 27017:27017 --name $(MONGO_CONTAINER) mongo:latest > /dev/null 2>&1
	@sleep 2

_mariadb:
	@docker ps -a | grep $(MARIADB_CONTAINER) > /dev/null 2>&1 && \
		docker start $(MARIADB_CONTAINER) > /dev/null 2>&1 || \
		docker run -d -p 3306:3306 --name $(MARIADB_CONTAINER) \
			-e MYSQL_ROOT_PASSWORD=root \
			-e MYSQL_DATABASE=trandenden \
			-e MYSQL_USER=transcendence \
			-e MYSQL_PASSWORD=transcendence \
			mariadb:latest > /dev/null 2>&1
	@sleep 2

start: _mongo _mariadb
	@echo ""
	@trap 'kill 0' EXIT; \
	(cd backend && npm run dev 2>&1 | while IFS= read -r line; do printf "\033[0;34m[BACKEND]\033[0m  %s\n" "$$line"; done) & \
	(cd frontend && npm run dev 2>&1 | while IFS= read -r line; do printf "\033[0;36m[FRONTEND]\033[0m %s\n" "$$line"; done) & \
	wait

dev: start

backend: _mongo _mariadb
	@cd backend && npm run dev

frontend:
	@cd frontend && npm run dev

stop:
	@echo "$(RED)Stopping all servers.$(NC)"
	@-killall -q node 2>/dev/null || true
	@-killall -q vite 2>/dev/null || true

restart: stop start

logs:
	@echo "$(BLUE)Docker Containers:$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|mongo|mariadb" || echo "No containers running"
	@echo ""
	@echo "$(BLUE)Node Processes:$(NC)"
	@ps aux | grep -E "node.*server|vite" | grep -v grep | awk '{print "  "$$11" "$$12" "$$13}' || echo "No processes running"

.DEFAULT_GOAL := help
