import time
import json
import hashlib
from redis import Redis
import httpx
from typing import List, Optional, Annotated
from uuid import UUID
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import models 
from models import ProductSchema, UserSchema, OrderSchema, OrderItemSchema, TransactionSchema, FactSalesSchema
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from config import get_settings

app = FastAPI(title="MirTech API", version="1.0.0")
models.Base.metadata.create_all(bind=engine)

# POST   : Create a database
# GET    : Fetch database
# PUT    : Update a database
# DELETE : Hard delete a value in a database


# Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


# ============ Redis Cache Helper Functions ============
def get_cache_key(endpoint: str, **params) -> str:
    """Generate a unique cache key based on endpoint and parameters"""
    param_str = json.dumps(params, sort_keys=True, default=str)
    hash_str = hashlib.md5(param_str.encode()).hexdigest()
    return f"{endpoint}:{hash_str}"


def get_from_cache(redis_client: Redis, cache_key: str):
    """Get data from Redis cache"""
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    return None


def set_to_cache(redis_client: Redis, cache_key: str, data, expire: int = 600):
    """Set data to Redis cache with expiration (adaptive based on data type)"""
    # Longer cache for historical periods (they don't change)
    if any(period in cache_key for period in ['6months', '9months', '1year']):
        expire = 3600 * 24  # 24 hours for historical data
    elif any(period in cache_key for period in ['month', '3months']):
        expire = 3600  # 1 hour for medium-term data
    redis_client.setex(cache_key, expire, json.dumps(data, default=str))


# ============ Pydantic Schemas for Create/Update ============
class ProductCreate(BaseModel):
    """Schema for creating a new product"""
    name: str = Field(..., description="Product name")
    category: str = Field(..., description="Product category")
    price: float = Field(..., gt=0, description="Product price")
    stock: int = Field(..., ge=0, description="Available stock quantity")
    rating: Optional[float] = Field(None, ge=0, le=5, description="Product rating")


class ProductUpdate(BaseModel):
    """Schema for updating a product (all fields optional)"""
    name: Optional[str] = Field(None, description="Product name")
    category: Optional[str] = Field(None, description="Product category")
    price: Optional[float] = Field(None, gt=0, description="Product price")
    stock: Optional[int] = Field(None, ge=0, description="Available stock quantity")
    rating: Optional[float] = Field(None, ge=0, le=5, description="Product rating")


# ============ Root Endpoint ============
@app.get("/")
def root():
    return {
        "title": "MirTech API",
        "version": "1.0.0"
    }

# ============ Fact Table Endpoints ============

@app.get("/all", response_model=List[FactSalesSchema])
def get_all_item(
    db: db_dependency,
    product_category: Optional[str] = None,
    order_status: Optional[str] = None,
    transaction_status: Optional[str] = None,
    payment_method: Optional[str] = None,
    user_email: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_quantity: Optional[int] = None,
    period: Optional[str] = None,  # week, 2weeks, month, 3months, 6months, 9months, 1year
    from_date: Optional[str] = None,  # Start date filter (for backward compatibility)
    skip: int = 0,
    limit: int = 1000  # Increased for better table performance
):
    """Get all fact sales records with comprehensive filtering options including time period"""
    from datetime import datetime, timedelta
    
    # Cap limit to prevent excessive data transfer
    limit = min(limit, 10000)
    
    # Generate cache key including period parameters
    cache_key = get_cache_key(
        "fact_sales",
        product_category=product_category,
        order_status=order_status,
        transaction_status=transaction_status,
        payment_method=payment_method,
        user_email=user_email,
        min_price=min_price,
        max_price=max_price,
        min_quantity=min_quantity,
        period=period,
        from_date=from_date,
        skip=skip,
        limit=limit
    )
    
    # Check cache
    cached_data = get_from_cache(app.state.redis, cache_key)
    if cached_data:
        return cached_data
    
    query = db.query(models.FactSales)
    
    # Date range filtering based on period
    if period:
        now = datetime.now()
        periods_map = {
            "week": timedelta(days=7),
            "2weeks": timedelta(days=14),
            "month": timedelta(days=30),
            "3months": timedelta(days=90),
            "6months": timedelta(days=180),
            "9months": timedelta(days=270),
            "1year": timedelta(days=365),
        }
        
        if period in periods_map:
            start_date = now - periods_map[period]
            query = query.filter(models.FactSales.order_created_at >= start_date)
    elif from_date:
        # Fallback to from_date for backward compatibility
        try:
            start_date = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
            query = query.filter(models.FactSales.order_created_at >= start_date)
        except ValueError:
            pass  # Invalid date format, skip filtering
    
    if product_category:
        query = query.filter(models.FactSales.product_category.ilike(f"%{product_category}%"))
    
    if order_status:
        query = query.filter(models.FactSales.order_status == order_status)
    
    if transaction_status:
        query = query.filter(models.FactSales.transaction_status == transaction_status)
    
    if payment_method:
        query = query.filter(models.FactSales.transaction_payment_method == payment_method)
    
    if user_email:
        query = query.filter(models.FactSales.user_email.ilike(f"%{user_email}%"))
    
    if min_price is not None:
        query = query.filter(models.FactSales.product_price >= min_price)
    
    if max_price is not None:
        query = query.filter(models.FactSales.product_price <= max_price)
    
    if min_quantity is not None:
        query = query.filter(models.FactSales.order_item_quantity >= min_quantity)
    
    fact_sales = query.offset(skip).limit(limit).all()
    
    # Convert to dict for caching
    result = [FactSalesSchema.model_validate(fs).model_dump() for fs in fact_sales]
    
    # Cache for 5 minutes (300 seconds)
    set_to_cache(app.state.redis, cache_key, result, expire=300)
    
    return fact_sales

# ============ Product Endpoints ============
@app.get("/products/search", response_model=List[FactSalesSchema])
def search_products_sales(
    db: db_dependency,
    query: str,
    period: Optional[str] = None,
    skip: int = 0,
    limit: int = 1000
):
    """
    Search products by name and return all sales data (fact_sales) for matching products.
    This allows searching across all products and seeing their transaction history.
    """
    from datetime import datetime, timedelta
    
    # Cap limit to prevent excessive data transfer
    limit = min(limit, 10000)
    
    # Generate cache key
    cache_key = get_cache_key(
        "product_search",
        query=query,
        period=period,
        skip=skip,
        limit=limit
    )
    
    # Check cache
    cached_data = get_from_cache(app.state.redis, cache_key)
    if cached_data:
        return cached_data
    
    # Build base query for fact_sales
    fact_query = db.query(models.FactSales)
    
    # Filter by product name (case-insensitive search)
    fact_query = fact_query.filter(models.FactSales.product_name.ilike(f"%{query}%"))
    
    # Apply time period filter if specified
    if period:
        now = datetime.now()
        periods_map = {
            "week": timedelta(days=7),
            "2weeks": timedelta(days=14),
            "month": timedelta(days=30),
            "3months": timedelta(days=90),
            "6months": timedelta(days=180),
            "9months": timedelta(days=270),
            "1year": timedelta(days=365),
        }
        
        if period in periods_map:
            start_date = now - periods_map[period]
            fact_query = fact_query.filter(models.FactSales.order_created_at >= start_date)
    
    # Execute query with pagination
    results = fact_query.offset(skip).limit(limit).all()
    
    # Convert to dict for caching
    result_data = [FactSalesSchema.model_validate(fs).model_dump() for fs in results]
    
    # Cache for 5 minutes
    set_to_cache(app.state.redis, cache_key, result_data, expire=300)
    
    return results

@app.get("/products", response_model=List[ProductSchema])
def get_all_products(
    db: db_dependency,
    category: Optional[str] = None,
    name: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    in_stock: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
):
    """Get all products with comprehensive filtering options"""
    cache_key = get_cache_key(
        "products",
        category=category,
        name=name,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        in_stock=in_stock,
        skip=skip,
        limit=limit
    )
    
    cached_data = get_from_cache(app.state.redis, cache_key)
    if cached_data:
        return cached_data
    
    query = db.query(models.Product)
    
    if category:
        query = query.filter(models.Product.category.ilike(f"%{category}%"))
    
    if name:
        query = query.filter(models.Product.name.ilike(f"%{name}%"))
    
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    
    if min_rating is not None:
        query = query.filter(models.Product.rating >= min_rating)
    
    if in_stock is not None:
        if in_stock:
            query = query.filter(models.Product.stock > 0)
        else:
            query = query.filter(models.Product.stock == 0)
    
    products = query.offset(skip).limit(limit).all()
    result = [ProductSchema.model_validate(p).model_dump() for p in products]
    set_to_cache(app.state.redis, cache_key, result)
    
    return products




@app.get("/stats/product/{product_id}")
def get_product(product_id: UUID, db: db_dependency):
    """Get a specific product by ID with sales analytics"""
    from sqlalchemy import func
    
    product = db.query(models.Product).filter(
        models.Product.product_id == product_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get sales analytics from fact_sales table
    product_sales = db.query(
        func.sum(models.FactSales.order_total_amount).label('total_revenue'),
        func.count(func.distinct(models.FactSales.order_id)).label('total_orders'),
        func.count(models.FactSales.transaction_id).label('total_transactions'),
        func.sum(models.FactSales.order_item_quantity).label('total_quantity_sold')
    ).filter(
        models.FactSales.product_id == product_id
    ).first()
    
    # Get payment method breakdown
    payment_methods = db.query(
        models.FactSales.transaction_payment_method,
        func.count(models.FactSales.transaction_id).label('count')
    ).filter(
        models.FactSales.product_id == product_id
    ).group_by(models.FactSales.transaction_payment_method).all()
    
    # Get order status breakdown
    order_statuses = db.query(
        models.FactSales.order_status,
        func.count(func.distinct(models.FactSales.order_id)).label('count')
    ).filter(
        models.FactSales.product_id == product_id
    ).group_by(models.FactSales.order_status).all()
    
    # Get transaction status breakdown
    transaction_statuses = db.query(
        models.FactSales.transaction_status,
        func.count(models.FactSales.transaction_id).label('count')
    ).filter(
        models.FactSales.product_id == product_id
    ).group_by(models.FactSales.transaction_status).all()
    
    return {
        "product": ProductSchema.model_validate(product).model_dump(),
        "analytics": {
            "total_revenue": float(product_sales.total_revenue or 0),
            "total_orders": product_sales.total_orders or 0,
            "total_transactions": product_sales.total_transactions or 0,
            "total_quantity_sold": int(product_sales.total_quantity_sold or 0),
            "avg_order_value": float((product_sales.total_revenue or 0) / (product_sales.total_orders or 1)),
            "payment_methods": {pm.transaction_payment_method: pm.count for pm in payment_methods},
            "order_statuses": {os.order_status: os.count for os in order_statuses},
            "transaction_statuses": {ts.transaction_status: ts.count for ts in transaction_statuses}
        }
    }


@app.post("/product/new", response_model=ProductSchema, status_code=201)
def create_product(product: ProductCreate, db: db_dependency):
    """Create a new product in the database"""
    db_product = models.Product(
        name=product.name,
        category=product.category,
        price=product.price,
        stock=product.stock,
        rating=product.rating
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return db_product


@app.put("/product/{product_id}", response_model=ProductSchema)
def update_product(product_id: UUID, updated_product: ProductUpdate, db: db_dependency):
    """Update an existing product"""
    db_product = db.query(models.Product).filter(
        models.Product.product_id == product_id
    ).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Only update fields that were provided
    update_data = updated_product.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    db.commit()
    db.refresh(db_product)
    
    return db_product


@app.delete("/product/{product_id}")
def delete_product(product_id: UUID, db: db_dependency):
    """Delete a product"""
    db_product = db.query(models.Product).filter(
        models.Product.product_id == product_id
    ).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    
    return {"message": "Product deleted successfully", "product_id": str(product_id)}


# ============ User Endpoints ============

@app.get("/users", response_model=List[UserSchema], tags=["Users"])
def get_all_users(
    db: db_dependency,
    name: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """Get all users with filtering options"""
    cache_key = get_cache_key(
        "users",
        name=name,
        email=email,
        phone=phone,
        skip=skip,
        limit=limit
    )
    
    cached_data = get_from_cache(app.state.redis, cache_key)
    if cached_data:
        return cached_data
    
    query = db.query(models.User)
    
    if name:
        query = query.filter(models.User.name.ilike(f"%{name}%"))
    
    if email:
        query = query.filter(models.User.email.ilike(f"%{email}%"))
    
    if phone:
        query = query.filter(models.User.phone.ilike(f"%{phone}%"))
    
    users = query.offset(skip).limit(limit).all()
    result = [UserSchema.model_validate(u).model_dump() for u in users]
    set_to_cache(app.state.redis, cache_key, result)
    
    return users


@app.get("/user/{user_id}", response_model=UserSchema, tags=["Users"])
def get_user(user_id: UUID, db: db_dependency):
    """Get a specific user by ID"""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ============ Order Endpoints ============

@app.get("/orders", response_model=List[OrderSchema], tags=["Orders"])
def get_all_orders(
    db: db_dependency,
    status: Optional[str] = None,
    user_id: Optional[UUID] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    skip: int = 0,
    limit: int = 100
):
    """Get all orders with comprehensive filtering options"""
    cache_key = get_cache_key(
        "orders",
        status=status,
        user_id=user_id,
        min_amount=min_amount,
        max_amount=max_amount,
        skip=skip,
        limit=limit
    )
    
    cached_data = get_from_cache(app.state.redis, cache_key)
    if cached_data:
        return cached_data
    
    query = db.query(models.Order)
    
    if status:
        query = query.filter(models.Order.status == status)
    
    if user_id:
        query = query.filter(models.Order.user_id == user_id)
    
    if min_amount is not None:
        query = query.filter(models.Order.total_amount >= min_amount)
    
    if max_amount is not None:
        query = query.filter(models.Order.total_amount <= max_amount)
    
    orders = query.offset(skip).limit(limit).all()
    result = [OrderSchema.model_validate(o).model_dump() for o in orders]
    set_to_cache(app.state.redis, cache_key, result)
    
    return orders


@app.get("/order/{order_id}", response_model=OrderSchema, tags=["Orders"])
def get_order(order_id: UUID, db: db_dependency):
    """Get a specific order by ID"""
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.get("/order/{order_id}/items", response_model=List[OrderItemSchema], tags=["Orders"])
def get_order_items(order_id: UUID, db: db_dependency):
    """Get all items for a specific order"""
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).all()
    return items


@app.get("/user/{user_id}/orders", response_model=List[OrderSchema], tags=["Users"])
def get_user_orders(user_id: UUID, db: db_dependency):
    """Get all orders for a specific user"""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    orders = db.query(models.Order).filter(models.Order.user_id == user_id).all()
    return orders


# ============ Transaction Endpoints ============

@app.get("/transactions", response_model=List[TransactionSchema], tags=["Transactions"])
def get_all_transactions(
    db: db_dependency,
    status: Optional[str] = None,
    payment_method: Optional[str] = None,
    order_id: Optional[UUID] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    skip: int = 0,
    limit: int = 100
):
    """Get all transactions with comprehensive filtering options"""
    cache_key = get_cache_key(
        "transactions",
        status=status,
        payment_method=payment_method,
        order_id=order_id,
        min_amount=min_amount,
        max_amount=max_amount,
        skip=skip,
        limit=limit
    )
    
    cached_data = get_from_cache(app.state.redis, cache_key)
    if cached_data:
        return cached_data
    
    query = db.query(models.Transaction)
    
    if status:
        query = query.filter(models.Transaction.status == status)
    
    if payment_method:
        query = query.filter(models.Transaction.payment_method == payment_method)
    
    if order_id:
        query = query.filter(models.Transaction.order_id == order_id)
    
    if min_amount is not None:
        query = query.filter(models.Transaction.amount >= min_amount)
    
    if max_amount is not None:
        query = query.filter(models.Transaction.amount <= max_amount)
    
    transactions = query.offset(skip).limit(limit).all()
    result = [TransactionSchema.model_validate(t).model_dump() for t in transactions]
    set_to_cache(app.state.redis, cache_key, result)
    
    return transactions


@app.get("/transaction/{transaction_id}", response_model=TransactionSchema, tags=["Transactions"])
def get_transaction(transaction_id: UUID, db: db_dependency):
    """Get a specific transaction by ID"""
    transaction = db.query(models.Transaction).filter(
        models.Transaction.transaction_id == transaction_id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


# ============ Statistics Endpoint ============

@app.get("/stats", tags=["Admin"])
def get_statistics(db: db_dependency):
    """Get database statistics"""
    return {
        "total_users": db.query(models.User).count(),
        "total_products": db.query(models.Product).count(),
        "total_orders": db.query(models.Order).count(),
        "total_transactions": db.query(models.Transaction).count(),
        "orders_by_status": {
            "pending": db.query(models.Order).filter(models.Order.status == "pending").count(),
            "processing": db.query(models.Order).filter(models.Order.status == "processing").count(),
            "shipped": db.query(models.Order).filter(models.Order.status == "shipped").count(),
            "delivered": db.query(models.Order).filter(models.Order.status == "delivered").count(),
            "cancelled": db.query(models.Order).filter(models.Order.status == "cancelled").count(),
        }
    }

@app.get("/stats/charts", tags=["Admin"])
def get_chart_stats(
    db: db_dependency,
    period: Optional[str] = "week"
):
    """Get pre-aggregated data for charts (much faster than sending raw data)"""
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    cache_key = get_cache_key("chart_stats", period=period)
    cached_data = get_from_cache(app.state.redis, cache_key)
    if cached_data:
        return cached_data
    
    now = datetime.now()
    periods_map = {
        "week": timedelta(days=7),
        "2weeks": timedelta(days=14),
        "month": timedelta(days=30),
        "3months": timedelta(days=90),
        "6months": timedelta(days=180),
        "9months": timedelta(days=270),
        "1year": timedelta(days=365),
    }
    
    start_date = now - periods_map.get(period, timedelta(days=7))
    
    # Revenue by day (for line chart)
    revenue_by_day = db.query(
        func.date(models.FactSales.order_created_at).label('date'),
        func.sum(models.FactSales.order_total_amount).label('revenue'),
        func.count(func.distinct(models.FactSales.order_id)).label('orders')
    ).filter(
        models.FactSales.order_created_at >= start_date
    ).group_by(func.date(models.FactSales.order_created_at)).order_by('date').all()
    
    # Transactions by day
    transactions_by_day = db.query(
        func.date(models.FactSales.transaction_timestamp).label('date'),
        func.count(models.FactSales.transaction_id).label('count')
    ).filter(
        models.FactSales.transaction_timestamp >= start_date
    ).group_by(func.date(models.FactSales.transaction_timestamp)).order_by('date').all()
    
    # Payment methods breakdown
    payment_methods = db.query(
        models.FactSales.transaction_payment_method,
        func.count(models.FactSales.transaction_id).label('count')
    ).filter(
        models.FactSales.transaction_timestamp >= start_date
    ).group_by(models.FactSales.transaction_payment_method).all()
    
    # Order status breakdown
    order_statuses = db.query(
        models.FactSales.order_status,
        func.count(func.distinct(models.FactSales.order_id)).label('count')
    ).filter(
        models.FactSales.order_created_at >= start_date
    ).group_by(models.FactSales.order_status).all()
    
    # Transaction status breakdown
    transaction_statuses = db.query(
        models.FactSales.transaction_status,
        func.count(models.FactSales.transaction_id).label('count')
    ).filter(
        models.FactSales.transaction_timestamp >= start_date
    ).group_by(models.FactSales.transaction_status).all()
    
    result = {
        "period": period,
        "revenue_by_day": [{"date": str(r.date), "revenue": float(r.revenue), "orders": r.orders} for r in revenue_by_day],
        "transactions_by_day": [{"date": str(t.date), "count": t.count} for t in transactions_by_day],
        "payment_methods": {pm.transaction_payment_method: pm.count for pm in payment_methods},
        "order_statuses": {os.order_status: os.count for os in order_statuses},
        "transaction_statuses": {ts.transaction_status: ts.count for ts in transaction_statuses}
    }
    
    # Adaptive cache duration
    cache_duration = 3600 * 24 if period in ['6months', '9months', '1year'] else 600
    set_to_cache(app.state.redis, cache_key, result, expire=cache_duration)
    
    return result


@app.get("/stats/summary", tags=["Admin"])
def get_summary_stats(
    db: db_dependency,
    period: Optional[str] = None  # week, 2weeks, month, 3months, 6months, 9months, 1year
):
    """Get combined summary statistics (revenue, transactions, orders) by time period"""
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    cache_key = get_cache_key("summary_stats", period=period)
    cached_data = get_from_cache(app.state.redis, cache_key)
    if cached_data:
        return cached_data
    
    now = datetime.now()
    periods = {
        "week": timedelta(days=7),
        "2weeks": timedelta(days=14),
        "month": timedelta(days=30),
        "3months": timedelta(days=90),
        "6months": timedelta(days=180),
        "9months": timedelta(days=270),
        "1year": timedelta(days=365),
    }
    
    result = {}
    
    if period and period in periods:
        # Single period
        start_date = now - periods[period]
        
        # Revenue
        total_revenue = db.query(func.sum(models.FactSales.order_total_amount)).filter(
            models.FactSales.order_created_at >= start_date
        ).scalar() or 0
        
        # Orders
        total_orders = db.query(func.count(func.distinct(models.FactSales.order_id))).filter(
            models.FactSales.order_created_at >= start_date
        ).scalar() or 0
        
        # Transactions
        total_transactions = db.query(func.count(models.FactSales.transaction_id)).filter(
            models.FactSales.transaction_timestamp >= start_date
        ).scalar() or 0
        
        # Total users that existed up to that period
        total_users = db.query(func.count(func.distinct(models.FactSales.user_id))).filter(
            models.FactSales.order_created_at >= start_date
        ).scalar() or 0
        
        # Calculate previous period stats for comparison
        prev_period_delta = periods[period] * 2
        prev_start_date = now - prev_period_delta
        prev_end_date = start_date
        
        prev_revenue = db.query(func.sum(models.FactSales.order_total_amount)).filter(
            models.FactSales.order_created_at >= prev_start_date,
            models.FactSales.order_created_at < prev_end_date
        ).scalar() or 0
        
        prev_orders = db.query(func.count(func.distinct(models.FactSales.order_id))).filter(
            models.FactSales.order_created_at >= prev_start_date,
            models.FactSales.order_created_at < prev_end_date
        ).scalar() or 0
        
        prev_transactions = db.query(func.count(models.FactSales.transaction_id)).filter(
            models.FactSales.transaction_timestamp >= prev_start_date,
            models.FactSales.transaction_timestamp < prev_end_date
        ).scalar() or 0
        
        prev_users = db.query(func.count(func.distinct(models.FactSales.user_id))).filter(
            models.FactSales.order_created_at >= prev_start_date,
            models.FactSales.order_created_at < prev_end_date
        ).scalar() or 0
        
        # Calculate percentage changes
        revenue_change = ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0
        orders_change = ((total_orders - prev_orders) / prev_orders * 100) if prev_orders > 0 else 0
        transactions_change = ((total_transactions - prev_transactions) / prev_transactions * 100) if prev_transactions > 0 else 0
        users_change = ((total_users - prev_users) / prev_users * 100) if prev_users > 0 else 0
        
        avg_order_value = float(total_revenue / total_orders) if total_orders > 0 else 0
        prev_avg_order_value = float(prev_revenue / prev_orders) if prev_orders > 0 else 0
        avg_order_value_change = ((avg_order_value - prev_avg_order_value) / prev_avg_order_value * 100) if prev_avg_order_value > 0 else 0
        
        result = {
            "period": period,
            "total_revenue": float(total_revenue),
            "total_orders": total_orders,
            "total_transactions": total_transactions,
            "total_users": total_users,
            "avg_order_value": avg_order_value,
            "start_date": start_date.isoformat(),
            "end_date": now.isoformat(),
            "changes": {
                "revenue_change_percent": round(revenue_change, 2),
                "orders_change_percent": round(orders_change, 2),
                "transactions_change_percent": round(transactions_change, 2),
                "users_change_percent": round(users_change, 2),
                "avg_order_value_change_percent": round(avg_order_value_change, 2)
            }
        }
    else:
        # All periods
        for period_name, delta in periods.items():
            start_date = now - delta
            
            # Revenue
            total_revenue = db.query(func.sum(models.FactSales.order_total_amount)).filter(
                models.FactSales.order_created_at >= start_date
            ).scalar() or 0
            
            # Orders
            total_orders = db.query(func.count(func.distinct(models.FactSales.order_id))).filter(
                models.FactSales.order_created_at >= start_date
            ).scalar() or 0
            
            # Transactions
            total_transactions = db.query(func.count(models.FactSales.transaction_id)).filter(
                models.FactSales.transaction_timestamp >= start_date
            ).scalar() or 0
            
            # Total users that existed up to that period
            total_users = db.query(func.count(func.distinct(models.FactSales.user_id))).filter(
                models.FactSales.order_created_at >= start_date
            ).scalar() or 0
            
            # Calculate previous period stats
            prev_period_delta = delta * 2
            prev_start_date = now - prev_period_delta
            prev_end_date = start_date
            
            prev_revenue = db.query(func.sum(models.FactSales.order_total_amount)).filter(
                models.FactSales.order_created_at >= prev_start_date,
                models.FactSales.order_created_at < prev_end_date
            ).scalar() or 0
            
            prev_orders = db.query(func.count(func.distinct(models.FactSales.order_id))).filter(
                models.FactSales.order_created_at >= prev_start_date,
                models.FactSales.order_created_at < prev_end_date
            ).scalar() or 0
            
            prev_transactions = db.query(func.count(models.FactSales.transaction_id)).filter(
                models.FactSales.transaction_timestamp >= prev_start_date,
                models.FactSales.transaction_timestamp < prev_end_date
            ).scalar() or 0
            
            prev_users = db.query(func.count(func.distinct(models.FactSales.user_id))).filter(
                models.FactSales.order_created_at >= prev_start_date,
                models.FactSales.order_created_at < prev_end_date
            ).scalar() or 0
            
            # Calculate percentage changes
            revenue_change = ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0
            orders_change = ((total_orders - prev_orders) / prev_orders * 100) if prev_orders > 0 else 0
            transactions_change = ((total_transactions - prev_transactions) / prev_transactions * 100) if prev_transactions > 0 else 0
            users_change = ((total_users - prev_users) / prev_users * 100) if prev_users > 0 else 0
            
            avg_order_value = float(total_revenue / total_orders) if total_orders > 0 else 0
            prev_avg_order_value = float(prev_revenue / prev_orders) if prev_orders > 0 else 0
            avg_order_value_change = ((avg_order_value - prev_avg_order_value) / prev_avg_order_value * 100) if prev_avg_order_value > 0 else 0
            
            result[period_name] = {
                "total_revenue": float(total_revenue),
                "total_orders": total_orders,
                "total_transactions": total_transactions,
                "total_users": total_users,
                "avg_order_value": avg_order_value,
                "start_date": start_date.isoformat(),
                "end_date": now.isoformat(),
                "changes": {
                    "revenue_change_percent": round(revenue_change, 2),
                    "orders_change_percent": round(orders_change, 2),
                    "transactions_change_percent": round(transactions_change, 2),
                    "users_change_percent": round(users_change, 2),
                    "avg_order_value_change_percent": round(avg_order_value_change, 2)
                }
            }
    
    set_to_cache(app.state.redis, cache_key, result)
    return result


@app.on_event("startup")
async def startup_event():
    app.state.redis = Redis(host='redis', port=6379)
    app.state.http_client = httpx.AsyncClient()
    
    # Preload cache for longer time periods in background
    import asyncio
    from datetime import datetime, timedelta
    from sqlalchemy import func

    async def preload_cache():
        """Preload 6 months, 9 months, and 1 year data into Redis cache"""
        db = SessionLocal()
        try:
            periods_to_preload = ['6months', '9months', '1year']
            
            for period in periods_to_preload:
                print(f"Preloading {period} data...")
                
                # Preload /stats/charts endpoint (most important for performance)
                try:
                    from datetime import datetime, timedelta
                    from sqlalchemy import func
                    
                    now = datetime.now()
                    periods_map = {
                        "6months": timedelta(days=180),
                        "9months": timedelta(days=270),
                        "1year": timedelta(days=365),
                    }
                    
                    start_date = now - periods_map[period]
                    
                    # Revenue by day
                    revenue_by_day = db.query(
                        func.date(models.FactSales.order_created_at).label('date'),
                        func.sum(models.FactSales.order_total_amount).label('revenue'),
                        func.count(func.distinct(models.FactSales.order_id)).label('orders')
                    ).filter(
                        models.FactSales.order_created_at >= start_date
                    ).group_by(func.date(models.FactSales.order_created_at)).order_by('date').all()
                    
                    # Transactions by day
                    transactions_by_day = db.query(
                        func.date(models.FactSales.transaction_timestamp).label('date'),
                        func.count(models.FactSales.transaction_id).label('count')
                    ).filter(
                        models.FactSales.transaction_timestamp >= start_date
                    ).group_by(func.date(models.FactSales.transaction_timestamp)).order_by('date').all()
                    
                    # Payment methods
                    payment_methods = db.query(
                        models.FactSales.transaction_payment_method,
                        func.count(models.FactSales.transaction_id).label('count')
                    ).filter(
                        models.FactSales.transaction_timestamp >= start_date
                    ).group_by(models.FactSales.transaction_payment_method).all()
                    
                    # Order statuses
                    order_statuses = db.query(
                        models.FactSales.order_status,
                        func.count(func.distinct(models.FactSales.order_id)).label('count')
                    ).filter(
                        models.FactSales.order_created_at >= start_date
                    ).group_by(models.FactSales.order_status).all()
                    
                    # Transaction statuses
                    transaction_statuses = db.query(
                        models.FactSales.transaction_status,
                        func.count(models.FactSales.transaction_id).label('count')
                    ).filter(
                        models.FactSales.transaction_timestamp >= start_date
                    ).group_by(models.FactSales.transaction_status).all()
                    
                    chart_result = {
                        "period": period,
                        "revenue_by_day": [{"date": str(r.date), "revenue": float(r.revenue), "orders": r.orders} for r in revenue_by_day],
                        "transactions_by_day": [{"date": str(t.date), "count": t.count} for t in transactions_by_day],
                        "payment_methods": {pm.transaction_payment_method: pm.count for pm in payment_methods},
                        "order_statuses": {os.order_status: os.count for os in order_statuses},
                        "transaction_statuses": {ts.transaction_status: ts.count for ts in transaction_statuses}
                    }
                    
                    chart_cache_key = get_cache_key("chart_stats", period=period)
                    set_to_cache(app.state.redis, chart_cache_key, chart_result, expire=3600 * 24)
                    print(f"✓ Preloaded {period} chart data")
                except Exception as e:
                    print(f"✗ Error preloading {period} charts: {e}")
                
                # Preload /all endpoint with limited records (for table)
                all_cache_key = get_cache_key(
                    "fact_sales",
                    product_category=None,
                    order_status=None,
                    transaction_status=None,
                    payment_method=None,
                    user_email=None,
                    min_price=None,
                    max_price=None,
                    min_quantity=None,
                    period=period,
                    from_date=None,
                    skip=0,
                    limit=1000  # Only cache first 1000 records
                )
                
                if not app.state.redis.get(all_cache_key):
                    query = db.query(models.FactSales).filter(
                        models.FactSales.order_created_at >= start_date
                    ).limit(1000)
                    
                    fact_sales = query.all()
                    result = [FactSalesSchema.model_validate(fs).model_dump() for fs in fact_sales]
                    set_to_cache(app.state.redis, all_cache_key, result, expire=3600 * 24)
                    print(f"✓ Preloaded {period} table data ({len(result)} records)")
                
                # Preload /stats/summary endpoint
                stats_cache_key = get_cache_key("summary_stats", period=period)
                
                if not app.state.redis.get(stats_cache_key):
                    delta = periods_map[period]
                    start_date = now - delta
                    
                    # Revenue
                    total_revenue = db.query(func.sum(models.FactSales.order_total_amount)).filter(
                        models.FactSales.order_created_at >= start_date
                    ).scalar() or 0
                    
                    # Orders
                    total_orders = db.query(func.count(func.distinct(models.FactSales.order_id))).filter(
                        models.FactSales.order_created_at >= start_date
                    ).scalar() or 0
                    
                    # Transactions
                    total_transactions = db.query(func.count(models.FactSales.transaction_id)).filter(
                        models.FactSales.transaction_timestamp >= start_date
                    ).scalar() or 0
                    
                    # Users
                    total_users = db.query(func.count(func.distinct(models.FactSales.user_id))).filter(
                        models.FactSales.order_created_at >= start_date
                    ).scalar() or 0
                    
                    # Previous period stats
                    prev_period_delta = delta * 2
                    prev_start_date = now - prev_period_delta
                    prev_end_date = start_date
                    
                    prev_revenue = db.query(func.sum(models.FactSales.order_total_amount)).filter(
                        models.FactSales.order_created_at >= prev_start_date,
                        models.FactSales.order_created_at < prev_end_date
                    ).scalar() or 0
                    
                    prev_orders = db.query(func.count(func.distinct(models.FactSales.order_id))).filter(
                        models.FactSales.order_created_at >= prev_start_date,
                        models.FactSales.order_created_at < prev_end_date
                    ).scalar() or 0
                    
                    prev_transactions = db.query(func.count(models.FactSales.transaction_id)).filter(
                        models.FactSales.transaction_timestamp >= prev_start_date,
                        models.FactSales.transaction_timestamp < prev_end_date
                    ).scalar() or 0
                    
                    prev_users = db.query(func.count(func.distinct(models.FactSales.user_id))).filter(
                        models.FactSales.order_created_at >= prev_start_date,
                        models.FactSales.order_created_at < prev_end_date
                    ).scalar() or 0
                    
                    # Calculate changes
                    revenue_change = ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0
                    orders_change = ((total_orders - prev_orders) / prev_orders * 100) if prev_orders > 0 else 0
                    transactions_change = ((total_transactions - prev_transactions) / prev_transactions * 100) if prev_transactions > 0 else 0
                    users_change = ((total_users - prev_users) / prev_users * 100) if prev_users > 0 else 0
                    
                    avg_order_value = float(total_revenue / total_orders) if total_orders > 0 else 0
                    prev_avg_order_value = float(prev_revenue / prev_orders) if prev_orders > 0 else 0
                    avg_order_value_change = ((avg_order_value - prev_avg_order_value) / prev_avg_order_value * 100) if prev_avg_order_value > 0 else 0
                    
                    stats_result = {
                        "period": period,
                        "total_revenue": float(total_revenue),
                        "total_orders": total_orders,
                        "total_transactions": total_transactions,
                        "total_users": total_users,
                        "avg_order_value": avg_order_value,
                        "start_date": start_date.isoformat(),
                        "end_date": now.isoformat(),
                        "changes": {
                            "revenue_change_percent": round(revenue_change, 2),
                            "orders_change_percent": round(orders_change, 2),
                            "transactions_change_percent": round(transactions_change, 2),
                            "users_change_percent": round(users_change, 2),
                            "avg_order_value_change_percent": round(avg_order_value_change, 2)
                        }
                    }
                    
                    set_to_cache(app.state.redis, stats_cache_key, stats_result, expire=3600 * 24)
                    print(f"✓ Preloaded {period} stats")
                    
        except Exception as e:
            print(f"Error preloading cache: {e}")
        finally:
            db.close()
    
    # Run preload in background
    asyncio.create_task(preload_cache())

@app.on_event("shutdown")
async def shutdown_event():
    app.state.redis.close()


@app.get("/entries")
async def read_item():
    value = app.state.redis.get('entries')
    if value is None:
        time.sleep(3)
        
        response = {
            "message" : "It worked!"
        }
        value = response
        app.state.redis.set('entries', json.dumps(value))

        return value
    return json.loads(value)


# ============ CORS Middleware ============
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins= settings.cors_origins, 
    allow_credentials=settings.cors_credentials,
    allow_methods=settings.cors_methods,
    allow_headers=settings.cors_headers,
)

@app.get("/config")
def get_config():
    return {
        "environment": settings.environment,
        "db_pool_size": settings.db_pool_size,
    }

