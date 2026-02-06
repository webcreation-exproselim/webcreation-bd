-- Create incomplete_orders table for tracking failed checkout attempts
CREATE TABLE public.incomplete_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  customer_name TEXT,
  ip_address TEXT,
  device_fingerprint TEXT,
  cart_total DECIMAL(10,2),
  failure_reason TEXT NOT NULL DEFAULT 'phone_blur',
  is_suspicious BOOLEAN NOT NULL DEFAULT false,
  is_converted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_incomplete_orders_merchant_id ON public.incomplete_orders(merchant_id);
CREATE INDEX idx_incomplete_orders_phone ON public.incomplete_orders(phone_number);
CREATE INDEX idx_incomplete_orders_created_at ON public.incomplete_orders(created_at);
CREATE INDEX idx_incomplete_orders_is_suspicious ON public.incomplete_orders(is_suspicious);

-- Enable RLS
ALTER TABLE public.incomplete_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Merchants can view own incomplete orders"
ON public.incomplete_orders
FOR SELECT
USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can update own incomplete orders"
ON public.incomplete_orders
FOR UPDATE
USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can delete own incomplete orders"
ON public.incomplete_orders
FOR DELETE
USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all incomplete orders"
ON public.incomplete_orders
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add enable_incomplete_tracking column to merchants table
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS enable_incomplete_tracking BOOLEAN DEFAULT false;

-- Add incomplete_auto_block_threshold column (default 5 attempts)
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS incomplete_auto_block_threshold INTEGER DEFAULT 5;

-- Add incomplete_time_window_minutes column (default 60 minutes)
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS incomplete_time_window_minutes INTEGER DEFAULT 60;