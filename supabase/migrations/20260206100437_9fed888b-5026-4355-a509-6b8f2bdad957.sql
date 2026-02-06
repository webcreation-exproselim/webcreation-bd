-- Enable Realtime broadcasts for incomplete order tracking
-- (Required for dashboard to update instantly)
ALTER PUBLICATION supabase_realtime ADD TABLE public.incomplete_orders;