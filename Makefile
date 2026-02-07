.PHONY: help install start stop restart clean logs build up down status

GREEN := \033[0;32m
BLUE := \033[0;34m
YELLOW := \033[0;33m
RED := \033[0;31m
CYAN := \033[0;36m
NC := \033[0m

help:
	@echo ""
	@echo "  $(YELLOW)make build$(NC)         - Build Docker images"
	@echo "  $(YELLOW)make up$(NC)            - Start all services (detached mode)"
	@echo "  $(YELLOW)make start$(NC)         - Alias for 'make up'"
	@echo "  $(YELLOW)make down$(NC)          - Stop all services"
	@echo "  $(YELLOW)make stop$(NC)          - Alias for 'make down'"
	@echo "  $(YELLOW)make restart$(NC)       - Restart all services"
	@echo "  $(YELLOW)make status$(NC)        - Show running containers"
	@echo "  $(YELLOW)make logs$(NC)          - Show all logs (follow mode)"
	@echo "  $(YELLOW)make logs-backend$(NC)  - Show backend logs only"
	@echo "  $(YELLOW)make logs-frontend$(NC) - Show frontend logs only"
	@echo "  $(YELLOW)make clean$(NC)         - Stop containers (preserve data)"
	@echo "  $(YELLOW)make fclean$(NC)        - Remove everything including volumes"
	@echo ""

build:
	@echo "$(BLUE)Building Docker images...$(NC)"
	@docker-compose build --quiet
	@echo "$(GREEN)✓ Docker images built$(NC)"

up:
	@echo "$(GREEN)Starting all services...$(NC)"
	@docker-compose up -d
	@sleep 2
	@echo ""
	@echo "$(GREEN)✓ All services started!$(NC)"
	@echo ""
	@echo "  Frontend:  $(CYAN)http://localhost:5173$(NC)"
	@echo "  Backend:   $(CYAN)http://localhost:3000$(NC)"
	@echo "  MongoDB:   $(CYAN)localhost:27017$(NC)"
	@echo "  MariaDB:   $(CYAN)localhost:3306$(NC)"
	@echo ""
	@echo "  View logs: $(YELLOW)make logs$(NC)"
	@echo "  Stop:      $(YELLOW)make stop$(NC)"
	@echo ""

start: up

down:
	@echo "$(RED)Stopping all services...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✓ All services stopped$(NC)"

stop: down

restart:
	@echo "$(YELLOW)Restarting all services...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)✓ All services restarted$(NC)"

status:
	@echo "$(BLUE)Running containers:$(NC)"
	@docker-compose ps

logs:
	@docker-compose logs -f

logs-backend:
	@docker-compose logs -f backend

logs-frontend:
	@docker-compose logs -f frontend

clean:
	@echo "$(RED)Stopping containers (data preserved)...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✓ Containers stopped$(NC)"

fclean:
	@echo "$(RED)Removing everything including volumes...$(NC)"
	@docker-compose down -v
	@docker system prune -f
	@echo "$(GREEN)✓ Full cleanup complete$(NC)"

.DEFAULT_GOAL := help