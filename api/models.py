from sqlalchemy import (
    Column, String, Integer, DECIMAL, ForeignKey,
    DateTime, Enum, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship
import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from decimal import Decimal

# SQL models
class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    email = Column(String, unique=True)
    phone = Column(String)
    address = Column(String)
    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    orders = relationship("Order", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    product_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    category = Column(String)
    price = Column(DECIMAL, CheckConstraint('price >= 0'))
    stock = Column(Integer,CheckConstraint('stock >= 0'))
    rating = Column(DECIMAL, CheckConstraint('rating >= 0'))

    # Reverse relationship for convenience
    order_items = relationship("OrderItem", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    total_amount = Column(DECIMAL)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    transaction = relationship("Transaction", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.order_id"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id"))
    quantity = Column(Integer)
    unit_price = Column(DECIMAL, CheckConstraint('unit_price >= 0'))

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.order_id"))
    amount = Column(DECIMAL, CheckConstraint('amount >= 0'))
    payment_method = Column(String)
    status = Column(String)
    timestamp = Column(DateTime, default=datetime.now)

    # Relationship
    order = relationship("Order", back_populates="transaction")


# Pydantic schemas
class UserSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    user_id: uuid.UUID = Field(..., description="Unique user identifier")
    name: str = Field(..., min_length=4, max_length=30, description="User name")
    email: EmailStr = Field(..., description="User email address")
    phone: Optional[str] = Field(None, description="Contact phone number")
    address: Optional[str] = Field(None, description="User address")
    created_at: datetime = Field(..., description="Account creation timestamp")


class ProductSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    product_id: uuid.UUID = Field(..., description="Unique product identifier")
    name: str = Field(..., description="Product name")
    category: str = Field(..., description="Product category")
    price: Decimal = Field(...,ge=1, description="Product price")
    stock: int = Field(...,ge=1, description="Available stock quantity")
    rating: Optional[Decimal] = Field(...,ge=0.5, description="Product rating")


class OrderItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    order_item_id: uuid.UUID = Field(..., description="Unique order item identifier")
    order_id: uuid.UUID = Field(..., description="Associated order identifier")
    product_id: uuid.UUID = Field(..., description="Associated product identifier")
    quantity: int = Field(..., ge=1, description="Quantity ordered")
    unit_price: Decimal = Field(...,ge=1, description="Price per unit")


class TransactionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    transaction_id: uuid.UUID = Field(..., description="Unique transaction identifier")
    order_id: uuid.UUID = Field(..., description="Associated order identifier")
    amount: Decimal = Field(..., description="Transaction amount")
    payment_method: str = Field(..., description="Payment method used")
    status: str = Field(..., description="Transaction status")
    timestamp: datetime = Field(..., description="Transaction timestamp")


class OrderSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    order_id: uuid.UUID = Field(..., description="Unique order identifier")
    user_id: uuid.UUID = Field(..., description="Associated user identifier")
    total_amount: Decimal = Field(..., description="Total order amount")
    status: str = Field(..., description="Order status")
    created_at: datetime = Field(..., description="Order creation timestamp")


# ============ Fact Table (Denormalized) ============
class FactSales(Base):
    __tablename__ = "fact_sales"

    fact_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # User dimension
    user_id = Column(UUID(as_uuid=True))
    user_name = Column(String(30))
    user_email = Column(String(255))
    user_phone = Column(String(50))
    user_address = Column(String)
    user_created_at = Column(DateTime)
    
    # Product dimension
    product_id = Column(UUID(as_uuid=True))
    product_name = Column(String(255))
    product_category = Column(String(100))
    product_price = Column(DECIMAL)
    product_stock = Column(Integer)
    product_rating = Column(DECIMAL)
    
    # Order dimension
    order_id = Column(UUID(as_uuid=True))
    order_total_amount = Column(DECIMAL)
    order_status = Column(String(50))
    order_created_at = Column(DateTime)
    
    # Order Item dimension
    order_item_id = Column(UUID(as_uuid=True))
    order_item_quantity = Column(Integer)
    order_item_unit_price = Column(DECIMAL)
    
    # Transaction dimension
    transaction_id = Column(UUID(as_uuid=True))
    transaction_amount = Column(DECIMAL)
    transaction_payment_method = Column(String(50))
    transaction_status = Column(String(50))
    transaction_timestamp = Column(DateTime)


class FactSalesSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    fact_id: uuid.UUID = Field(..., description="Unique fact record identifier")
    
    # User dimension
    user_id: uuid.UUID = Field(..., description="User identifier")
    user_name: str = Field(..., description="User name")
    user_email: EmailStr = Field(..., description="User email")
    user_phone: Optional[str] = Field(None, description="User phone")
    user_address: Optional[str] = Field(None, description="User address")
    user_created_at: datetime = Field(..., description="User creation timestamp")
    
    # Product dimension
    product_id: uuid.UUID = Field(..., description="Product identifier")
    product_name: str = Field(..., description="Product name")
    product_category: str = Field(..., description="Product category")
    product_price: Decimal = Field(..., description="Product price")
    product_stock: int = Field(..., description="Product stock")
    product_rating: Optional[Decimal] = Field(None, description="Product rating")
    
    # Order dimension
    order_id: uuid.UUID = Field(..., description="Order identifier")
    order_total_amount: Decimal = Field(..., description="Order total amount")
    order_status: str = Field(..., description="Order status")
    order_created_at: datetime = Field(..., description="Order creation timestamp")
    
    # Order Item dimension
    order_item_id: uuid.UUID = Field(..., description="Order item identifier")
    order_item_quantity: int = Field(..., description="Order item quantity")
    order_item_unit_price: Decimal = Field(..., description="Order item unit price")
    
    # Transaction dimension
    transaction_id: uuid.UUID = Field(..., description="Transaction identifier")
    transaction_amount: Decimal = Field(..., description="Transaction amount")
    transaction_payment_method: str = Field(..., description="Payment method")
    transaction_status: str = Field(..., description="Transaction status")
    transaction_timestamp: datetime = Field(..., description="Transaction timestamp")
