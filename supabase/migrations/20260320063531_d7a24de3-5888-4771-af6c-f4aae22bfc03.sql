CREATE TABLE public.dollar_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_user_id UUID NULL,
  dollar_amount NUMERIC NOT NULL DEFAULT 0,
  rate_per_dollar NUMERIC NOT NULL DEFAULT 0,
  total_bdt NUMERIC NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 0,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dollar_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all dollar transactions"
  ON public.dollar_transactions
  FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));
