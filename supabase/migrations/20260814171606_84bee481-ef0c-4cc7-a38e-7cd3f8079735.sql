-- 1. Move courier credentials out of merchants into a server-only table
CREATE TABLE IF NOT EXISTS public.merchant_courier_credentials (
  merchant_id uuid PRIMARY KEY REFERENCES public.merchants(id) ON DELETE CASCADE,
  steadfast_api_key text,
  steadfast_secret_key text,
  pathao_client_id text,
  pathao_client_secret text,
  pathao_username text,
  pathao_password text,
  redx_api_token text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.merchant_courier_credentials TO service_role;
ALTER TABLE public.merchant_courier_credentials ENABLE ROW LEVEL SECURITY;

INSERT INTO public.merchant_courier_credentials (merchant_id, steadfast_api_key, steadfast_secret_key, pathao_client_id, pathao_client_secret, pathao_username, pathao_password, redx_api_token)
SELECT id, steadfast_api_key, steadfast_secret_key, pathao_client_id, pathao_client_secret, pathao_username, pathao_password, redx_api_token
FROM public.merchants
WHERE COALESCE(steadfast_api_key, steadfast_secret_key, pathao_client_id, pathao_client_secret, pathao_username, pathao_password, redx_api_token) IS NOT NULL
ON CONFLICT (merchant_id) DO NOTHING;

ALTER TABLE public.merchants
  DROP COLUMN IF EXISTS steadfast_api_key,
  DROP COLUMN IF EXISTS steadfast_secret_key,
  DROP COLUMN IF EXISTS pathao_client_id,
  DROP COLUMN IF EXISTS pathao_client_secret,
  DROP COLUMN IF EXISTS pathao_username,
  DROP COLUMN IF EXISTS pathao_password,
  DROP COLUMN IF EXISTS redx_api_token;

-- 2. Guest chat inserts must present a matching guest id header
DROP POLICY IF EXISTS "Users insert messages in own conversations" ON public.live_chat_messages;
CREATE POLICY "Users insert messages in own conversations"
ON public.live_chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.live_chat_conversations c
    WHERE c.id = live_chat_messages.conversation_id
      AND (
        c.user_id = auth.uid()
        OR (
          c.user_id IS NULL
          AND c.guest_id IS NOT NULL
          AND c.guest_id = ((current_setting('request.headers', true))::json ->> 'x-guest-id')
        )
      )
  )
);

-- 3. Clients can read their own dollar transactions
CREATE POLICY "Users can view own dollar transactions"
ON public.dollar_transactions
FOR SELECT
TO authenticated
USING (client_user_id = auth.uid());

-- 4. Clients can read only projects tied to their own orders
CREATE POLICY "Clients can view own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = projects.order_id AND o.user_id = auth.uid()
  )
);

-- 5. Remove broad storage listing policies (public buckets still serve files by URL)
DROP POLICY IF EXISTS "Anyone can view payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat attachments" ON storage.objects;

-- 6. Lock down direct execution of definer/trigger functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_user_message() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_live_chat_conversation_on_message() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_orders_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_admin_users() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;