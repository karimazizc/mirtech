# Docker Setup for MirTech

This project is fully dockerized with both production and development configurations.

## Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)

## Quick Start

### Production Mode

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Development Mode (with hot reload)

```bash
# Build and start all services in development mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

## Services

The stack includes:

1. **PostgreSQL** (port 5432) - Database
2. **Redis** (port 6379) - Cache
3. **FastAPI Backend** (port 8000) - API server
4. **Next.js Frontend** (port 3000) - Web application

## Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Database Setup

### Initial Setup

After starting the containers for the first time, you need to seed the database:

```bash
# Enter the backend container
docker exec -it mirtech-backend bash

# Run database migrations/seed script
python seed_data.py

# Create indexes for performance
python -c "from database import engine; from sqlalchemy import text; 
conn = engine.connect()
try:
    conn.execute(text('CREATE INDEX IF NOT EXISTS idx_fact_sales_order_created_at ON fact_sales(order_created_at)'))
    conn.execute(text('CREATE INDEX IF NOT EXISTS idx_fact_sales_product_id ON fact_sales(product_id)'))
    conn.execute(text('CREATE INDEX IF NOT EXISTS idx_fact_sales_order_status ON fact_sales(order_status)'))
    conn.execute(text('CREATE INDEX IF NOT EXISTS idx_fact_sales_transaction_status ON fact_sales(transaction_status)'))
    conn.execute(text('CREATE INDEX IF NOT EXISTS idx_fact_sales_payment_method ON fact_sales(transaction_payment_method)'))
    conn.execute(text('CREATE INDEX IF NOT EXISTS idx_fact_sales_transaction_timestamp ON fact_sales(transaction_timestamp)'))
    conn.commit()
    print('✅ All indexes created successfully')
except Exception as e:
    print(f'Error creating indexes: {e}')
finally:
    conn.close()
"

# Exit container
exit
```

## Environment Variables

Copy `.env.docker` to `.env` and adjust as needed:

```bash
cp .env.docker .env
```

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `NEXT_PUBLIC_API_URL` - API endpoint for frontend

## Common Commands

### Rebuild services

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Execute commands in containers

```bash
# Backend shell
docker exec -it mirtech-backend bash

# Frontend shell
docker exec -it mirtech-frontend sh

# PostgreSQL shell
docker exec -it mirtech-postgres psql -U mirtech_admin -d mirtech

# Redis CLI
docker exec -it mirtech-redis redis-cli
```

### Clean up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (⚠️ deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Troubleshooting

### Port already in use

If you get port conflict errors:

```bash
# Change ports in docker-compose.yml
# For example, change "3000:3000" to "3001:3000"
```

### Database connection errors

1. Check if PostgreSQL is healthy:
   ```bash
   docker-compose ps
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Restart services:
   ```bash
   docker-compose restart backend
   ```

### Frontend can't connect to backend

1. Check if backend is running:
   ```bash
   curl http://localhost:8000/
   ```

2. Verify NEXT_PUBLIC_API_URL in frontend:
   ```bash
   docker exec mirtech-frontend env | grep NEXT_PUBLIC_API_URL
   ```

### Redis connection issues

```bash
# Test Redis connection
docker exec -it mirtech-redis redis-cli ping
```

## Performance Notes

- **First build** takes 5-10 minutes depending on your internet connection
- **Subsequent builds** are much faster due to Docker layer caching
- **Development mode** uses volume mounts for hot reload
- **Production mode** optimizes Next.js build with standalone output

## Data Persistence

Data is persisted in Docker volumes:
- `postgres_data` - Database files
- `redis_data` - Redis cache

These volumes persist even when containers are removed. To completely reset:

```bash
docker-compose down -v
```

## Production Deployment

For production deployment:

1. Update `.env` with secure credentials
2. Change `SECRET_KEY` to a strong random value
3. Update `CORS_ORIGINS` to your production domains
4. Consider using Docker secrets for sensitive data
5. Set up proper SSL/TLS termination (nginx/traefik)
6. Configure backup strategy for PostgreSQL volume

## Architecture

```
┌─────────────────┐
│   Next.js       │ :3000
│   Frontend      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│   FastAPI       │────▶│  PostgreSQL  │ :5432
│   Backend       │     └──────────────┘
└────────┬────────┘
         │          ┌──────────────┐
         └─────────▶│    Redis     │ :6379
                    └──────────────┘
```

All services communicate via the `mirtech-network` Docker network.
