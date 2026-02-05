-- =====================================================
-- WCBD Fraud Guard v4.0 - Database Changes
-- =====================================================

-- Part 1: Add popup settings columns to merchants table
ALTER TABLE public.merchants
ADD COLUMN IF NOT EXISTS popup_timer_seconds integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS popup_language text DEFAULT 'bn',
ADD COLUMN IF NOT EXISTS msg_cooldown text DEFAULT 'আপনি সম্প্রতি অর্ডার করেছেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।',
ADD COLUMN IF NOT EXISTS msg_blacklist text DEFAULT 'আপনার অর্ডার ব্লক করা হয়েছে। সমস্যা হলে যোগাযোগ করুন।',
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS show_contact_buttons boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_abandoned_tracking boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS abandoned_timeout_minutes integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS steadfast_api_key text,
ADD COLUMN IF NOT EXISTS steadfast_secret_key text,
ADD COLUMN IF NOT EXISTS pathao_client_id text,
ADD COLUMN IF NOT EXISTS pathao_client_secret text,
ADD COLUMN IF NOT EXISTS pathao_username text,
ADD COLUMN IF NOT EXISTS pathao_password text;

-- Part 2: Create abandoned_checkouts table
CREATE TABLE IF NOT EXISTS public.abandoned_checkouts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    customer_phone text NOT NULL,
    customer_name text,
    customer_email text,
    device_fingerprint text,
    ip_address text,
    cart_data jsonb,
    checkout_url text,
    is_recovered boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    recovered_at timestamp with time zone
);

-- Enable RLS on abandoned_checkouts
ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for abandoned_checkouts
CREATE POLICY "Admins can manage all abandoned checkouts"
    ON public.abandoned_checkouts
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Merchants can view own abandoned checkouts"
    ON public.abandoned_checkouts
    FOR SELECT
    USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can update own abandoned checkouts"
    ON public.abandoned_checkouts
    FOR UPDATE
    USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can delete own abandoned checkouts"
    ON public.abandoned_checkouts
    FOR DELETE
    USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));

-- Part 3: Create courier_orders table
CREATE TABLE IF NOT EXISTS public.courier_orders (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    courier_type text NOT NULL CHECK (courier_type IN ('steadfast', 'pathao')),
    invoice_number text,
    consignment_id text,
    tracking_code text,
    recipient_name text,
    recipient_phone text,
    recipient_address text,
    cod_amount numeric DEFAULT 0,
    status text DEFAULT 'pending',
    delivery_fee numeric DEFAULT 0,
    last_synced_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on courier_orders
ALTER TABLE public.courier_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for courier_orders
CREATE POLICY "Admins can manage all courier orders"
    ON public.courier_orders
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Merchants can view own courier orders"
    ON public.courier_orders
    FOR SELECT
    USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can insert own courier orders"
    ON public.courier_orders
    FOR INSERT
    WITH CHECK (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can update own courier orders"
    ON public.courier_orders
    FOR UPDATE
    USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can delete own courier orders"
    ON public.courier_orders
    FOR DELETE
    USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_merchant_id ON public.abandoned_checkouts(merchant_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_phone ON public.abandoned_checkouts(customer_phone);
CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_created_at ON public.abandoned_checkouts(created_at);
CREATE INDEX IF NOT EXISTS idx_courier_orders_merchant_id ON public.courier_orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_courier_orders_invoice ON public.courier_orders(invoice_number);
CREATE INDEX IF NOT EXISTS idx_courier_orders_consignment ON public.courier_orders(consignment_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.abandoned_checkouts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courier_orders;