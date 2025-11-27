#!/bin/bash
# Backend startup script with database wait and initialization

set -e

echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - checking Redis..."
until redis-cli -h redis ping; do
  >&2 echo "Redis is unavailable - sleeping"
  sleep 1
done

echo "All services are up!"

# Run the FastAPI application
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
