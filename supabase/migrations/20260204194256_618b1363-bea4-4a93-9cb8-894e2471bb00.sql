-- Create merchants table
CREATE TABLE public.merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url text,
  api_key uuid DEFAULT gen_random_uuid() NOT NULL,
  cooldown_period_days integer DEFAULT 30 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id),
  UNIQUE (api_key)
);

-- Create fraud_logs table
CREATE TABLE public.fraud_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  phone_number text,
  ip_address text,
  device_fingerprint text,
  status text DEFAULT 'allowed' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create blacklist table
CREATE TABLE public.blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  blocked_value text NOT NULL,
  block_type text DEFAULT 'phone' NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for merchants
CREATE POLICY "Users can view own merchant data"
ON public.merchants FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own merchant data"
ON public.merchants FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own merchant data"
ON public.merchants FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for fraud_logs
CREATE POLICY "Merchants can view own logs"
ON public.fraud_logs FOR SELECT
USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

-- RLS Policies for blacklist
CREATE POLICY "Merchants can view own blacklist"
ON public.blacklist FOR SELECT
USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can insert to blacklist"
ON public.blacklist FOR INSERT
WITH CHECK (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can delete from blacklist"
ON public.blacklist FOR DELETE
USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

-- Admin policies
CREATE POLICY "Admins can manage all merchants"
ON public.merchants FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all logs"
ON public.fraud_logs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all blacklists"
ON public.blacklist FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating merchants updated_at
CREATE TRIGGER update_merchants_updated_at
BEFORE UPDATE ON public.merchants
FOR EACH ROW
EXECUTE FUNCTION public.update_orders_updated_at();