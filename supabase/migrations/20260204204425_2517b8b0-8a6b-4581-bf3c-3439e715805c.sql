-- Add new columns to merchants table for subscription management
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS cooldown_period_minutes integer NOT NULL DEFAULT 1440,
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS current_plan text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS plan_expires_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS requests_used integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_requests integer NOT NULL DEFAULT 0;

-- Create subscription_orders table
CREATE TABLE public.subscription_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  transaction_id text NOT NULL,
  sender_number text NOT NULL,
  payment_screenshot_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone DEFAULT NULL
);

-- Enable RLS on subscription_orders
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_orders

-- Admins can manage all subscription orders
CREATE POLICY "Admins can manage all subscription orders"
ON public.subscription_orders
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Merchants can view their own subscription orders
CREATE POLICY "Merchants can view own subscription orders"
ON public.subscription_orders
FOR SELECT
USING (merchant_id IN (
  SELECT id FROM merchants WHERE user_id = auth.uid()
));

-- Merchants can create subscription orders for themselves
CREATE POLICY "Merchants can create subscription orders"
ON public.subscription_orders
FOR INSERT
WITH CHECK (merchant_id IN (
  SELECT id FROM merchants WHERE user_id = auth.uid()
));