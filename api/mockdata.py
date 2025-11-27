"""
Generate realistic data for MirTech API

"""
import random
import faker
import datetime
from typing import List
import uuid
from models import UserSchema, ProductSchema, OrderSchema, OrderItemSchema, TransactionSchema
from models import User, Product, Order, OrderItem, Transaction, Base, FactSales
from database import engine, SessionLocal
from decimal import Decimal
import faker_commerce

EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "proton.me"]
ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]
PAYMENT_METHODS = {"credit_card": 33, "debit_card":40, "paypal":21, "bank_transfer":10, "apple_pay":10, "google_pay":20, "crypto":5}
TRANSACTION_STATUSES = {"pending": 20, "completed":50, "failed":20, "refunded":10}

def generate_user(n: int = 10000) -> List[UserSchema]:
    fake = faker.Faker()
    users = []
    address_by_lastname = {}  # Cache addresses by last name
    
    for _ in range(n):
        first_name = fake.first_name()
        last_name = fake.last_name()
        
        user_name = f"{first_name} {last_name}"
        
        # Generate unique email using first and last name with random domain
        email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 9999)}@{random.choice(EMAIL_DOMAINS)}"
        
        # Generate unique phone
        phone = fake.phone_number()
        
        # Reuse address if last name already exists, otherwise create new one
        if last_name in address_by_lastname:
            address = address_by_lastname[last_name]
        else:
            address = fake.address()
            address_by_lastname[last_name] = address
        
        user = UserSchema(
            user_id=uuid.uuid4(),
            name=user_name,
            email=email,
            phone=phone,
            address=address,
            created_at=datetime.datetime.now()
        )
        
        users.append(user)
    
    return users


def generate_product(n: int = 20000) -> List[ProductSchema]:
    fake = faker.Faker()

    products = []
    fake.add_provider(faker_commerce.Provider)
    
    generated_names = set()  # Track unique product names
    
    for _ in range(n):
        # Generate unique product name
        attempts = 0
        while attempts < 100:  # Prevent infinite loop
            name = fake.ecommerce_name()
            if name not in generated_names:
                generated_names.add(name)
                break
            attempts += 1
        else:
            # If we can't find unique name, append a unique identifier
            name = f"{fake.ecommerce_name()} - {uuid.uuid4().hex[:8]}"
            generated_names.add(name)

        product = ProductSchema(
            product_id=uuid.uuid4(),
            name=name,
            category = fake.ecommerce_category(),
            price = round(random.uniform(5, 50000), 2),
            stock = random.randint(8,10000),
            rating = round(random.uniform(1, 5), 2)
        )
        products.append(product)
    return products


def generate_order(n: int = 15000, users: List[UserSchema] = None) -> List[OrderSchema]:
    """
    Generate n orders. If users list is provided, orders will reference those user IDs.
    """
    fake = faker.Faker()
    orders = []
    
    for _ in range(n):
        # Use provided user_id or generate random one
        user_id = random.choice(users).user_id if users else uuid.uuid4()
        
        # Generate order date within the last year
        days_ago = random.randint(0, 365)
        created_at = datetime.datetime.now() - datetime.timedelta(days=days_ago)
        
        order = OrderSchema(
            order_id=uuid.uuid4(),
            user_id=user_id,
            total_amount=Decimal(str(round(random.uniform(10, 10000), 2))),
            status=random.choice(ORDER_STATUSES),
            created_at=created_at
        )
        orders.append(order)
    
    return orders


def generate_order_item(n: int = 45000, orders: List[OrderSchema] = None, products: List[ProductSchema] = None) -> List[OrderItemSchema]:
    """
    Generate n order items. If orders and products lists are provided, 
    items will reference those order and product IDs.
    """
    order_items = []
    
    for _ in range(n):
        # Use provided IDs or generate random ones
        order_id = random.choice(orders).order_id if orders else uuid.uuid4()
        product_id = random.choice(products).product_id if products else uuid.uuid4()
        
        quantity = random.randint(1, 10)
        unit_price = Decimal(str(round(random.uniform(5, 5000), 2)))
        
        order_item = OrderItemSchema(
            order_item_id=uuid.uuid4(),
            order_id=order_id,
            product_id=product_id,
            quantity=quantity,
            unit_price=unit_price
        )
        order_items.append(order_item)
    
    return order_items


def generate_transaction(n: int = 15000, orders: List[OrderSchema] = None) -> List[TransactionSchema]:
    """
    Generate n transactions. If orders list is provided, transactions will reference those order IDs.
    Each transaction is linked to one order.
    """
    transactions = []
    
    # If orders provided, create one transaction per order (up to n)
    order_ids_used = set()
    
    for _ in range(n):
        if orders:
            # Find an order that hasn't been used yet
            available_orders = [o for o in orders if o.order_id not in order_ids_used]
            if available_orders:
                selected_order = random.choice(available_orders)
                order_id = selected_order.order_id
                order_ids_used.add(order_id)
                amount = selected_order.total_amount
            else:
                # All orders used, generate random order_id
                order_id = uuid.uuid4()
                amount = Decimal(str(round(random.uniform(10, 10000), 2)))
        else:
            order_id = uuid.uuid4()
            amount = Decimal(str(round(random.uniform(10, 10000), 2)))
        
        # Generate timestamp within last year
        days_ago = random.randint(0, 365)
        timestamp = datetime.datetime.now() - datetime.timedelta(days=days_ago)
        
        transaction = TransactionSchema(
            transaction_id=uuid.uuid4(),
            order_id=order_id,
            amount=amount,
            payment_method=random.choices(list(PAYMENT_METHODS.keys()), 
                                  weights=list(PAYMENT_METHODS.values()), 
                                  k=1)[0],
            status=random.choices(list(TRANSACTION_STATUSES.keys()), 
                                  weights=list(TRANSACTION_STATUSES.values()), 
                                  k=1)[0],
            timestamp=timestamp
        )
        transactions.append(transaction)
    
    return transactions


def seed_database(
    n_users: int = 25000,
    n_products: int = 50000,
    n_orders: int = 37500,
    n_order_items: int = 112500,
    n_transactions: int = 37500,
    batch_size: int = 1000
) -> dict:
    """
    Generate mock data and store it in the PostgreSQL database.
    
    Args:
        n_users: Number of users to generate
        n_products: Number of products to generate
        n_orders: Number of orders to generate
        n_order_items: Number of order items to generate
        n_transactions: Number of transactions to generate
        batch_size: Number of records to insert per batch (for performance)
    
    Returns:
        Dictionary with counts of inserted records
    """
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    session = SessionLocal()
    
    try:
        # Generate all mock data
        print("Generating mock data...")
        
        print(f"  Generating {n_users} users...")
        users_schema = generate_user(n=n_users)
        
        print(f"  Generating {n_products} products...")
        products_schema = generate_product(n=n_products)
        
        print(f"  Generating {n_orders} orders...")
        orders_schema = generate_order(n=n_orders, users=users_schema)
        
        print(f"  Generating {n_order_items} order items...")
        order_items_schema = generate_order_item(n=n_order_items, orders=orders_schema, products=products_schema)
        
        print(f"  Generating {n_transactions} transactions...")
        transactions_schema = generate_transaction(n=n_transactions, orders=orders_schema)
        
        print("\nInserting data into database...")
        
        # Insert Users
        print(f"  Inserting users...")
        users_db = [
            User(
                user_id=u.user_id,
                name=u.name,
                email=u.email,
                phone=u.phone,
                address=u.address,
                created_at=u.created_at
            ) for u in users_schema
        ]
        for i in range(0, len(users_db), batch_size):
            session.bulk_save_objects(users_db[i:i + batch_size])
            session.commit()
        print(f"    ✓ Inserted {len(users_db)} users")
        
        # Insert Products
        print(f"  Inserting products...")
        products_db = [
            Product(
                product_id=p.product_id,
                name=p.name,
                category=p.category,
                price=p.price,
                stock=p.stock,
                rating=p.rating
            ) for p in products_schema
        ]
        for i in range(0, len(products_db), batch_size):
            session.bulk_save_objects(products_db[i:i + batch_size])
            session.commit()
        print(f"    ✓ Inserted {len(products_db)} products")
        
        # Insert Orders
        print(f"  Inserting orders...")
        orders_db = [
            Order(
                order_id=o.order_id,
                user_id=o.user_id,
                total_amount=o.total_amount,
                status=o.status,
                created_at=o.created_at
            ) for o in orders_schema
        ]
        for i in range(0, len(orders_db), batch_size):
            session.bulk_save_objects(orders_db[i:i + batch_size])
            session.commit()
        print(f"    ✓ Inserted {len(orders_db)} orders")
        
        # Insert Order Items
        print(f"  Inserting order items...")
        order_items_db = [
            OrderItem(
                order_item_id=oi.order_item_id,
                order_id=oi.order_id,
                product_id=oi.product_id,
                quantity=oi.quantity,
                unit_price=oi.unit_price
            ) for oi in order_items_schema
        ]
        for i in range(0, len(order_items_db), batch_size):
            session.bulk_save_objects(order_items_db[i:i + batch_size])
            session.commit()
        print(f"    ✓ Inserted {len(order_items_db)} order items")
        
        # Insert Transactions
        print(f"  Inserting transactions...")
        transactions_db = [
            Transaction(
                transaction_id=t.transaction_id,
                order_id=t.order_id,
                amount=t.amount,
                payment_method=t.payment_method,
                status=t.status,
                timestamp=t.timestamp
            ) for t in transactions_schema
        ]
        for i in range(0, len(transactions_db), batch_size):
            session.bulk_save_objects(transactions_db[i:i + batch_size])
            session.commit()
        print(f"    ✓ Inserted {len(transactions_db)} transactions")
        
        # Populate Fact Sales Table
        print(f"\n  Populating fact_sales table...")
        print(f"    Joining data from all tables...")
        
        # Create a mapping for quick lookups
        user_map = {u.user_id: u for u in users_schema}
        product_map = {p.product_id: p for p in products_schema}
        order_map = {o.order_id: o for o in orders_schema}
        transaction_map = {t.order_id: t for t in transactions_schema}
        
        fact_sales_records = []
        
        for order_item in order_items_schema:
            order = order_map.get(order_item.order_id)
            if not order:
                continue
                
            user = user_map.get(order.user_id)
            product = product_map.get(order_item.product_id)
            transaction = transaction_map.get(order_item.order_id)
            
            if not (user and product and transaction):
                continue
            
            fact_record = FactSales(
                fact_id=uuid.uuid4(),
                # User dimension
                user_id=user.user_id,
                user_name=user.name,
                user_email=user.email,
                user_phone=user.phone,
                user_address=user.address,
                user_created_at=user.created_at,
                # Product dimension
                product_id=product.product_id,
                product_name=product.name,
                product_category=product.category,
                product_price=product.price,
                product_stock=product.stock,
                product_rating=product.rating,
                # Order dimension
                order_id=order.order_id,
                order_total_amount=order.total_amount,
                order_status=order.status,
                order_created_at=order.created_at,
                # Order Item dimension
                order_item_id=order_item.order_item_id,
                order_item_quantity=order_item.quantity,
                order_item_unit_price=order_item.unit_price,
                # Transaction dimension
                transaction_id=transaction.transaction_id,
                transaction_amount=transaction.amount,
                transaction_payment_method=transaction.payment_method,
                transaction_status=transaction.status,
                transaction_timestamp=transaction.timestamp
            )
            fact_sales_records.append(fact_record)
        
        # Insert fact sales in batches
        for i in range(0, len(fact_sales_records), batch_size):
            session.bulk_save_objects(fact_sales_records[i:i + batch_size])
            session.commit()
        print(f"    ✓ Inserted {len(fact_sales_records):,} fact_sales records")
        
        total_records = len(users_db) + len(products_db) + len(orders_db) + len(order_items_db) + len(transactions_db) + len(fact_sales_records)
        
        print(f"\n{'='*50}")
        print(f"Database seeding completed!")
        print(f"{'='*50}")
        print(f"  Users:        {len(users_db):,}")
        print(f"  Products:     {len(products_db):,}")
        print(f"  Orders:       {len(orders_db):,}")
        print(f"  Order Items:  {len(order_items_db):,}")
        print(f"  Transactions: {len(transactions_db):,}")
        print(f"  Fact Sales:   {len(fact_sales_records):,}")
        print(f"{'='*50}")
        print(f"  TOTAL:        {total_records:,} records")
        print(f"{'='*50}")
        
        return {
            "users": len(users_db),
            "products": len(products_db),
            "orders": len(orders_db),
            "order_items": len(order_items_db),
            "transactions": len(transactions_db),
            "fact_sales": len(fact_sales_records),
            "total": total_records
        }
        
    except Exception as e:
        session.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        session.close()



    
if __name__ == "__main__":
    

    seed_database()
    # print(f"Generating Product... ")
    # products = generate_product()
    # print(f"✓ Generated {len(products)} products")

    # print(f"\nGenerating Users... ")
    # users = generate_user()
    # print(f"✓ Generated {len(users)} users")

    # print(f"\nGenerating Orders... ")
    # orders = generate_order(users=users)
    # print(f"✓ Generated {len(orders)} orders")

    # print(f"\nGenerating Order Items...")
    # order_items = generate_order_item(orders=orders, products=products)
    # print(f"✓ Generated {len(order_items)} order items")

    # print(f"\nGenerating Transactions...")
    # transactions = generate_transaction(orders=orders)
    # print(f"✓ Generated {len(transactions)} transactions")
    
    # print(f"\n{'='*50}")
    # print(f"Summary:")
    # print(f"  Products:     {len(products)}")
    # print(f"  Users:        {len(users)}")
    # print(f"  Orders:       {len(orders)}")
    # print(f"  Order Items:  {len(order_items)}")
    # print(f"  Transactions: {len(transactions)}")
    # print(f"{'='*50}")
    
    # print(f"\n{'='*50}")
    # print(f"Sample Data:")
    # print(f"{'='*50}")
    
    # print(f"\nSample Product:")
    # print(f"  ID:       {products[0].product_id}")
    # print(f"  Name:     {products[0].name}")
    # print(f"  Category: {products[0].category}")
    # print(f"  Price:    ${products[0].price}")
    # print(f"  Stock:    {products[0].stock}")
    # print(f"  Rating:   {products[0].rating}")
    
    # print(f"\nSample User:")
    # print(f"  ID:         {users[0].user_id}")
    # print(f"  Name:       {users[0].name}")
    # print(f"  Email:      {users[0].email}")
    # print(f"  Phone:      {users[0].phone}")
    # print(f"  Address:    {users[0].address}")
    # print(f"  Created at: {users[0].created_at}")
    
    # print(f"\nSample Order:")
    # print(f"  ID:           {orders[0].order_id}")
    # print(f"  User ID:      {orders[0].user_id}")
    # print(f"  Total Amount: ${orders[0].total_amount}")
    # print(f"  Status:       {orders[0].status}")
    # print(f"  Created at:   {orders[0].created_at}")
    
    # print(f"\nSample Order Item:")
    # print(f"  ID:         {order_items[0].order_item_id}")
    # print(f"  Order ID:   {order_items[0].order_id}")
    # print(f"  Product ID: {order_items[0].product_id}")
    # print(f"  Quantity:   {order_items[0].quantity}")
    # print(f"  Unit Price: ${order_items[0].unit_price}")
    
    # print(f"\nSample Transaction:")
    # print(f"  ID:             {transactions[0].transaction_id}")
    # print(f"  Order ID:       {transactions[0].order_id}")
    # print(f"  Amount:         ${transactions[0].amount}")
    # print(f"  Payment Method: {transactions[0].payment_method}")
    # print(f"  Status:         {transactions[0].status}")
    # print(f"  Timestamp:      {transactions[0].timestamp}")
    # print(f"{'='*50}")


    
    
    