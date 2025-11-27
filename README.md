# MirTech Analytics Dashboard

A full-stack analytics dashboard built with FastAPI, PostgreSQL, Redis, Next.js, and React for visualizing and analyzing sales data across 262,500+ records.

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [Performance Optimization Techniques](#performance-optimization-techniques)
- [Architecture Decisions](#architecture-decisions)
- [UI/UX Considerations](#uiux-considerations)
- [Future Improvements](#future-improvements)

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose (optional)

### Quick Setup (Automated Scripts)

The `scripts/` folder contains automated setup scripts for faster deployment:

**1. Database Setup:**
```zsh
chmod +x scripts/sql-setup.sh
./scripts/sql-setup.sh
```
This script will:
- Start PostgreSQL service
- Create the `mirtech` database
- Create `mirtech_admin` user with appropriate privileges

**2. Seed Data:**
```zsh
chmod +x scripts/data-setup.sh
./scripts/data-setup.sh
```
This script will:
- Generate 262,500+ mock records using Python Faker
- Apply performance indexes to the database

**3. Start Application:**
```zsh
chmod +x scripts/application-setup.sh
./scripts/application-setup.sh
```
This script will:
- Start FastAPI backend in a new terminal
- Start Next.js frontend in a new terminal

**4. Delete Data (Optional):**
```zsh
chmod +x scripts/delete-data.sh
./scripts/delete-data.sh
```

### Manual Setup

#### Database Setup

1. **Start PostgreSQL**:
IMPORTANT 
before you're able to run the backend or frontend. 
You need to create a table on PostgreSQL and generate the mock up data there.

Download PostgreSQL on your machine [here](https://www.postgresql.org/download/)


Run these manually or run`scripts/sql-setup.sh`

```zsh
brew services start postgresql

psql postgresql

CREATE DATABASE mirtech;
CREATE USER mirtech_admin WITH PASSWORD 'mirtech1345';
GRANT ALL PRIVILEGES ON DATABASE mirtech TO mirtech_admin;
\q
```

To login :
```zsh

psql postgresql
# or
psql mirtech
# or 
psql -U mirtech_admin -d mirtech -p 5432 -h localhost
```

Populate tables and create indexes,
Run these manually or run`scripts/data-setup.sh` 
```zsh

python api/mockdata.py
cd scripts && psql -d mirtech -f create_indexes.sql

```
Now the database is setup and running.

If you want to modify the population or demographic of the data via `seed_database()` from `api/mockdata.py` you should reset the data clean.
To reset you can go to `scripts/delete-data.sh` or delete them manually via logging in and execute:
```zsh
DELETE FROM fact_sales;
DELETE FROM transactions;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM users;
```

make sure to run these commands and delete again to ensure if they've been deleted or not.

```zsh
SELECT COUNT(*) FROM fact_sales;
SELECT COUNT(*) FROM fact_sales;
SELECT COUNT(*) FROM order_items;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM transactions;
SELECT COUNT(*) FROM users;
```

2. **Database Design**: View the complete schema at [dbdiagram.io](https://dbdiagram.io/d/69280639a0c4ebcc2bf31328)

### Backend Setup (FastAPI) 

You are now ready to deploy the backend. 

1. Navigate to the API directory:
```zsh
cd api
```

2. Create and activate virtual environment:
```zsh
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```zsh
pip install -r requirements.txt
```

4. Configure environment variables (create `.env` file):
```env
# Database Configuration
DATABASE_URL=postgresql+psycopg2://mirtech_admin:mirtech1345@localhost:5432/mirtech
DATABASE_USERNAME=mirtech_admin
DATABASE_PASSWORD=mirtech1345
# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Configuration
ENVIRONMENT=development
# SECRET_KEY=your-secret-key-change-in-production-use-openssl-rand-hex-32

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000"]
```


5. Start the FastAPI server:
```zsh
uvicorn main:app --reload
```

### Frontend Setup (Next.js)

1. Navigate to the project root:
```zsh
cd ..
```

2. Install dependencies:
```zsh
npm install
```

3. Start the development server:
```zsh
npm run dev
```

4. Access the dashboard at `http://localhost:3000`

### Docker Setup (Alternative)

For a complete containerized setup:

Install [docker](https://docs.docker.com/get-started/get-docker/) on your machine.

```zsh
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

##  Performance Optimization Techniques

### 1. Database Indexing
Implemented 7 strategic indexes on the `fact_sales` table:
- `idx_fact_sales_order_created_at` - Optimizes time-based queries
- `idx_fact_sales_product_id` - Speeds up product lookups
- `idx_fact_sales_order_status` - Accelerates status filtering
- `idx_fact_sales_transaction_status` - Improves transaction queries
- `idx_fact_sales_payment_method` - Enhances payment method filtering
- `idx_fact_sales_transaction_timestamp` - Optimizes transaction timeline queries
- `idx_fact_sales_user_id` - Speeds up user-based queries

**Impact**: 10-37x performance improvement for 6-12 month periods (from 15-30s down to 500-800ms)

### 2. Adaptive Redis Caching
Implemented intelligent caching with period-based TTL:
- **Historical data (>3 months)**: 24-hour cache
- **Medium-term data (1-3 months)**: 1-hour cache
- **Recent data (<1 month)**: 10-minute cache

**Impact**: Reduced repeated query time by 95%+ for cached periods

### 3. Pre-Aggregated API Endpoints
Created `/stats/charts` endpoint that pre-calculates:
- Daily revenue and order counts
- Transaction timelines
- Payment method distributions
- Order and transaction status breakdowns

**Impact**: Reduced data transfer from 20-50MB to ~50KB (400-1000x reduction)

### 4. Frontend Optimizations
- **Parallel Data Fetching**: Simultaneous API calls for charts, stats, and table data
- **Virtual Scrolling**: Renders only visible rows with 60px height optimization
- **Infinite Scrolling**: Loads 1000 records at a time on demand
- **Period-Aware Rendering**: Hides chart point markers for periods >3 months
- **Background Prefetching**: Preloads 6-month, 9-month, and 1-year data

## Architecture Decisions

### Technology Stack
**Backend**: FastAPI 8.0+ + PostgreSQL 15+ + Redis 7+  
**Frontend**: Next.js 16.0.3 + React 19.2.0 + TypeScript 5+ + Tailwind CSS 4.0  
**Charts**: Chart.js 4.x with custom period-aware configurations  
**Containerization**: Docker with multi-stage builds + Docker Compose

### Key Design Choices

1. **Redis for Intelligent Caching**
   - Handles high-traffic scenarios with adaptive TTL
   - MD5-hashed cache keys for period-based separation
   - Preloads frequently accessed periods (6m, 9m, 1y)

2. **PostgreSQL for Data Integrity**
   - Normalized schema with 5 dimension tables + 1 fact table
   - 262,500+ records in fact_sales table
   - ACID compliance for transactional consistency

3. **FastAPI for High-Performance APIs**
   - Async/await for concurrent request handling
   - Pydantic for automatic data validation and serialization
   - SQLAlchemy 2.0+ ORM with optimized queries

4. **Next.js for Modern Frontend**
   - App Router for improved performance and SEO
   - Server-side rendering capabilities
   - Optimized bundling with Turbopack
   - TypeScript for type safety

5. **Mock Data Generation**
   - Python Faker library generates realistic test data
   - 262,500+ transaction records across multiple categories
   - Simulates real-world data distribution patterns

### Data Flow
```
User Request → Next.js Frontend → FastAPI Backend → Redis Cache Check
                                                    ↓ (Cache Miss)
                                                PostgreSQL Query
                                                    ↓
                                                Cache Result
                                                    ↓
                                            JSON Response
```

##  UI/UX Considerations

### Design Philosophy
- **Color Palette**: Inspired by modern SaaS dashboards with professional blue accent (#1a7faf)
- **Responsive Layout**: Grid-based design that adapts to all screen sizes
- **Visual Hierarchy**: Clear separation between stats, charts, and data tables
- **Loading States**: Skeleton screens and spinners for better perceived performance

### User Experience Features
1. **Time Period Selector**: Dropdown with 7 predefined periods (1 week to 1 year)
2. **Interactive Charts**: Hover tooltips, period-aware rendering
3. **Advanced Filtering**: Price, quantity, total, status, and payment method filters
4. **Product Search**: Search across 262K+ records with button/enter trigger
5. **Infinite Scrolling**: Seamless data loading with visual feedback
6. **Virtual Scrolling**: Smooth performance even with large datasets
7. **Visual Indicators**: "Product Search Active" badge, filter count badges
8. **Error Handling**: Graceful 404 handling with empty state messages

### Accessibility
- Keyboard navigation support (Enter key for search)
- Clear visual feedback for interactive elements
- Disabled states for loading buttons
- Color contrast meeting WCAG standards

## Future Improvements

Given more development time, several enhancements would significantly improve the platform's capabilities and user experience. On the feature front, implementing a comprehensive dark mode would reduce eye strain for users working extended hours, while integrating GraphQL would provide more flexible and efficient data querying options beyond the current REST API. Advanced visualizations like Sankey diagrams for revenue flow analysis and additional product/transaction plots would offer deeper insights into business patterns. Predictive analytics capabilities, including quarterly sales forecasting by category and automated Q1-Q4 quarterly reports, would transform the dashboard from a reactive to a proactive business intelligence tool.

From a security and collaboration perspective, implementing robust authentication and authorization systems would enable multi-user access with role-based permissions. A shareable link feature would allow stakeholders to access read-only sales reports without requiring full system access. The integration of Large Language Model (LLM) capabilities could revolutionize user interaction through built-in report generation and AI-powered search with Retrieval-Augmented Generation (RAG), enabling natural language queries like "Show me top-performing products in Q3" or "Generate a sales summary for electronics category." These enhancements would elevate the platform from a data visualization tool to a comprehensive, intelligent analytics solution that anticipates user needs and provides actionable insights through both traditional and AI-driven interfaces.
