
-- Create courier_check_subscriptions table
CREATE TABLE public.courier_check_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  api_key UUID NOT NULL DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL DEFAULT false,
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  website_url TEXT,
  requests_used INTEGER NOT NULL DEFAULT 0,
  max_requests INTEGER NOT NULL DEFAULT 5000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courier_check_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own courier check subscription"
  ON public.courier_check_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own courier check subscription"
  ON public.courier_check_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courier check subscription"
  ON public.courier_check_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all courier check subscriptions"
  ON public.courier_check_subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create courier_check_orders table
CREATE TABLE public.courier_check_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.courier_check_subscriptions(id),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 899,
  payment_method TEXT NOT NULL,
  sender_number TEXT NOT NULL,
  payment_screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.courier_check_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own courier check orders"
  ON public.courier_check_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own courier check orders"
  ON public.courier_check_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all courier check orders"
  ON public.courier_check_orders FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.courier_check_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courier_check_orders;
