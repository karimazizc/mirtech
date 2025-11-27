-- Performance optimization indexes for fact_sales table

CREATE INDEX IF NOT EXISTS idx_fact_sales_order_created_at ON fact_sales(order_created_at);
CREATE INDEX IF NOT EXISTS idx_fact_sales_product_id ON fact_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_fact_sales_order_status ON fact_sales(order_status);
CREATE INDEX IF NOT EXISTS idx_fact_sales_transaction_status ON fact_sales(transaction_status);
CREATE INDEX IF NOT EXISTS idx_fact_sales_payment_method ON fact_sales(transaction_payment_method);
CREATE INDEX IF NOT EXISTS idx_fact_sales_transaction_timestamp ON fact_sales(transaction_timestamp);
CREATE INDEX IF NOT EXISTS idx_fact_sales_user_id ON fact_sales(user_id);

-- Verify indexes were created
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename = 'fact_sales';
