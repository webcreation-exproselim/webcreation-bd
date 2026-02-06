-- Add cart_items column to store product details in incomplete orders
ALTER TABLE public.incomplete_orders 
ADD COLUMN IF NOT EXISTS cart_items jsonb DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.incomplete_orders.cart_items IS 'Cart product details: [{name, price, quantity, product_id}]';