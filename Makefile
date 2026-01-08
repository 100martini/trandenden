.PHONY: help install start stop clean dev backend frontend logs

GREEN := \033[0;32m
BLUE := \033[0;34m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

help:
	@echo "$(BLUE)ft_transcendence - Available commands:$(NC)"
	@echo "  $(GREEN)make install$(NC)  - Install all dependencies"
	@echo "  $(GREEN)make start$(NC)    - Start both frontend and backend"
	@echo "  $(GREEN)make dev$(NC)      - Start development servers"
	@echo "  $(GREEN)make stop$(NC)     - Stop all running servers"
	@echo "  $(GREEN)make clean$(NC)    - Clean node_modules and reinstall"
	@echo "  $(GREEN)make backend$(NC)  - Start only backend"
	@echo "  $(GREEN)make frontend$(NC) - Start only frontend"
	@echo "  $(GREEN)make logs$(NC)     - Show logs"

install:
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	cd backend && npm install
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)✓ All dependencies installed!$(NC)"

start: dev

dev:
	@echo "$(GREEN)Starting ft_transcendence...$(NC)"
	@echo "$(BLUE)Backend: http://localhost:3000$(NC)"
	@echo "$(BLUE)Frontend: http://localhost:5173$(NC)"
	@echo ""
	@trap 'kill 0' EXIT; \
	(cd backend && npm run dev) & \
	(cd frontend && npm run dev) & \
	wait

backend:
	@echo "$(GREEN)Starting backend only...$(NC)"
	cd backend && npm run dev

frontend:
	@echo "$(GREEN)Starting frontend only...$(NC)"
	cd frontend && npm run dev

stop:
	@echo "$(YELLOW)Stopping all servers...$(NC)"
	@pkill -f "node.*server.js" || true
	@pkill -f "vite" || true
	@echo "$(GREEN)✓ All servers stopped$(NC)"

clean:
	@echo "$(YELLOW)Cleaning node_modules...$(NC)"
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	rm -rf backend/package-lock.json
	rm -rf frontend/package-lock.json
	@echo "$(GREEN)✓ Cleaned! Run 'make install' to reinstall$(NC)"

logs:
	@echo "$(BLUE)Checking running processes...$(NC)"
	@ps aux | grep -E "node|vite" | grep -v grep || echo "No processes running"

.DEFAULT_GOAL := help