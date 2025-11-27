.PHONY: help build up down logs clean restart shell-backend shell-frontend shell-db seed-db test

# Default target
help:
	@echo "MirTech Docker Management"
	@echo ""
	@echo "Available commands:"
	@echo "  make build          - Build all Docker images"
	@echo "  make up             - Start all services (production)"
	@echo "  make dev            - Start all services (development with hot reload)"
	@echo "  make down           - Stop all services"
	@echo "  make logs           - View logs from all services"
	@echo "  make logs-backend   - View backend logs"
	@echo "  make logs-frontend  - View frontend logs"
	@echo "  make restart        - Restart all services"
	@echo "  make clean          - Remove containers and volumes"
	@echo "  make shell-backend  - Open shell in backend container"
	@echo "  make shell-frontend - Open shell in frontend container"
	@echo "  make shell-db       - Open PostgreSQL shell"
	@echo "  make shell-redis    - Open Redis CLI"
	@echo "  make seed-db        - Seed the database with initial data"
	@echo "  make create-indexes - Create database indexes"
	@echo "  make rebuild        - Rebuild and restart all services"

# Build all images
build:
	docker-compose build

# Start production services
up:
	docker-compose up -d
	@echo "Services started! Access at:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"

# Start development services with hot reload
dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development services started with hot reload!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"

# Stop all services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# Restart services
restart:
	docker-compose restart

# Clean up everything (removes volumes)
clean:
	docker-compose down -v
	@echo "All containers and volumes removed!"

# Rebuild and restart
rebuild:
	docker-compose down
	docker-compose build
	docker-compose up -d
	@echo "Services rebuilt and restarted!"

# Shell access
shell-backend:
	docker exec -it mirtech-backend bash

shell-frontend:
	docker exec -it mirtech-frontend sh

shell-db:
	docker exec -it mirtech-postgres psql -U mirtech_admin -d mirtech

shell-redis:
	docker exec -it mirtech-redis redis-cli

# Database operations
seed-db:
	docker exec -it mirtech-backend python seed_data.py
	@echo "Database seeded successfully!"

create-indexes:
	docker exec -it mirtech-backend python -c "from database import engine; from sqlalchemy import text; \
	conn = engine.connect(); \
	try: \
	    conn.execute(text('CREATE INDEX IF NOT EXISTS idx_fact_sales_order_created_at ON fact_sales(order_created_at)')); \
	    conn.execute(text('CREATE INDEX IF NOT EXISTS idx_fact_sales_product_id ON fact_sales(product_id)')); \
	    conn.execute(text('CREATE INDEX IF NOT EXISTS idx_fact_sales_order_status ON fact_sales(order_status)')); \
	    conn.execute(text('CREATE INDEX IF NOT EXISTS idx_fact_sales_transaction_status ON fact_sales(transaction_status)')); \
	    conn.execute(text('CREATE INDEX IF NOT EXISTS idx_fact_sales_payment_method ON fact_sales(transaction_payment_method)')); \
	    conn.execute(text('CREATE INDEX IF NOT EXISTS idx_fact_sales_transaction_timestamp ON fact_sales(transaction_timestamp)')); \
	    conn.commit(); \
	    print('✅ All indexes created successfully'); \
	except Exception as e: \
	    print(f'Error creating indexes: {e}'); \
	finally: \
	    conn.close();"
	@echo "Database indexes created!"

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:8000/ > /dev/null 2>&1 && echo "✅ Backend is healthy" || echo "❌ Backend is down"
	@curl -f http://localhost:3000/ > /dev/null 2>&1 && echo "✅ Frontend is healthy" || echo "❌ Frontend is down"

# Show container status
status:
	docker-compose ps
