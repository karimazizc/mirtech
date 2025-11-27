#!/bin/bash

echo "Starting data deletion from mirtech database..."

while true; do
    psql -d mirtech <<EOF
DELETE FROM fact_sales;
DELETE FROM transactions;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM users;
EOF
    COUNT=$(psql -d mirtech -t -c "SELECT COUNT(*) FROM fact_sales UNION ALL SELECT COUNT(*) FROM order_items UNION ALL SELECT COUNT(*) FROM orders UNION ALL SELECT COUNT(*) FROM products UNION ALL SELECT COUNT(*) FROM transactions UNION ALL SELECT COUNT(*) FROM users;" | awk '{s+=$1} END {print s}')
    
    if [ "$COUNT" -eq 0 ]; then
        echo "All tables are empty"
        break
    else
        echo "Tables still have $COUNT rows, deleting again..."
    fi
done
psql -d mirtech <<EOF
SELECT COUNT(*) FROM fact_sales;
SELECT COUNT(*) FROM fact_sales;
SELECT COUNT(*) FROM order_items;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM transactions;
SELECT COUNT(*) FROM users;
EOF

