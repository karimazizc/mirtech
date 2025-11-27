# 🚀 Quick Start Guide - Docker Setup

## TL;DR - Get Started in 3 Commands

```bash
# 1. Build the containers
make build

# 2. Start everything
make up

# 3. Seed the database (first time only)
make seed-db && make create-indexes
```

Access your app at **http://localhost:3000** 🎉

---

## What Just Happened?

You now have a fully containerized stack running:

- ✅ **Next.js Frontend** - Modern React dashboard (port 3000)
- ✅ **FastAPI Backend** - High-performance API (port 8000)
- ✅ **PostgreSQL** - Production database (port 5432)
- ✅ **Redis** - Lightning-fast cache (port 6379)

---

## Common Tasks

### Development Mode (Hot Reload)

```bash
make dev
```

This enables:
- Automatic code reload on file changes
- No need to rebuild containers
- Faster development cycle

### View Logs

```bash
# All services
make logs

# Just backend
make logs-backend

# Just frontend
make logs-frontend
```

### Stop Everything

```bash
make down
```

### Complete Cleanup (⚠️ Deletes all data)

```bash
make clean
```

---

## Accessing Services

### Web Interfaces

- **Dashboard**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **API Root**: http://localhost:8000

### Database Access

```bash
# PostgreSQL
make shell-db

# Redis
make shell-redis
```

### Container Shell

```bash
# Backend
make shell-backend

# Frontend  
make shell-frontend
```

---

## First Time Setup Checklist

1. ✅ Build containers: `make build`
2. ✅ Start services: `make up`
3. ✅ Wait for health checks (~30 seconds)
4. ✅ Seed database: `make seed-db`
5. ✅ Create indexes: `make create-indexes`
6. ✅ Open browser: http://localhost:3000

---

## Troubleshooting

### Services won't start?

Check if ports are available:
```bash
# Check what's using ports
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

### Database connection errors?

```bash
# Check service health
make status

# Restart services
make restart
```

### Want to start fresh?

```bash
# Nuclear option - complete reset
make clean
make build
make up
make seed-db
make create-indexes
```

---

## Production vs Development

### Production Mode
```bash
make up
```
- Optimized builds
- Smaller image sizes
- No hot reload
- Better performance

### Development Mode
```bash
make dev
```
- Hot reload enabled
- Source code mounted
- Faster iteration
- Debug-friendly

---

## Need Help?

```bash
# Show all available commands
make help
```

Read the full documentation in `DOCKER_README.md`

---

## Performance Tips

- First build takes ~5-10 minutes
- Subsequent builds are much faster
- Use `make dev` for development work
- Use `make up` for production testing
- Redis caches long-term data for 24h
- Database indexes are critical for performance

---

**Happy Coding! 🚀**
