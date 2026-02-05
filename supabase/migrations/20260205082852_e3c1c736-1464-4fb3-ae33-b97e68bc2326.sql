-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a more secure policy that still allows public order creation
-- but ensures required fields are provided (basic validation)
CREATE POLICY "Anyone can create orders with valid data" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Ensure required fields are not empty
  customer_name IS NOT NULL AND
  customer_name != '' AND
  customer_phone IS NOT NULL AND
  customer_phone != '' AND
  payment_method IS NOT NULL AND
  payment_method != '' AND
  -- If user is logged in, ensure user_id matches their ID
  (user_id IS NULL OR user_id = auth.uid())
);

-- Also fix the "Public can view orders" policy which is too permissive
-- Everyone can see all orders which is a privacy issue
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;

-- Users should only see their own orders or orders they created (by phone/email)
-- Keep the existing "Users can view own orders" policy which is correct