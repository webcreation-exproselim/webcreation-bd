SELECT cron.unschedule('cleanup-incomplete-orders-daily')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-incomplete-orders-daily');

SELECT cron.unschedule('cleanup-incomplete-orders-monthly')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-incomplete-orders-monthly');

SELECT cron.schedule(
  'cleanup-incomplete-orders-monthly',
  '0 3 1 * *',
  $$SELECT public.cleanup_old_incomplete_orders();$$
);