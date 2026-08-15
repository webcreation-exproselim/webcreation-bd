CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.cleanup_old_incomplete_orders()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.incomplete_orders
  WHERE created_at < now() - interval '7 days';
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_incomplete_orders() FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule('cleanup-incomplete-orders-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-incomplete-orders-daily');

SELECT cron.schedule(
  'cleanup-incomplete-orders-daily',
  '15 2 * * *',
  $$SELECT public.cleanup_old_incomplete_orders();$$
);