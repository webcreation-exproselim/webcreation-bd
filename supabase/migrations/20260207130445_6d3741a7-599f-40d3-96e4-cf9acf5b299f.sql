
-- Add partial unique index to prevent duplicate incomplete orders for same phone+merchant
CREATE UNIQUE INDEX IF NOT EXISTS idx_incomplete_orders_unique_active 
ON incomplete_orders (merchant_id, phone_number) 
WHERE is_converted = false;
