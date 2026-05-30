
-- 1. Fix orders RLS: remove public exposure of guest orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Restrict guest live_chat policies: require matching guest_id via request header
-- Remove blanket guest access; admins and owners still have access via existing policies.
-- Anonymous guests can still INSERT conversations/messages (existing INSERT policy with no qual),
-- but reading/updating now requires either authentication, admin, or a guest_id header match.
DROP POLICY IF EXISTS "Guests view by guest_id" ON public.live_chat_conversations;
DROP POLICY IF EXISTS "Guests update own by guest_id" ON public.live_chat_conversations;

CREATE POLICY "Guests view by guest_id header"
ON public.live_chat_conversations
FOR SELECT
TO anon
USING (
  user_id IS NULL
  AND guest_id IS NOT NULL
  AND guest_id::text = current_setting('request.headers', true)::json->>'x-guest-id'
);

CREATE POLICY "Guests update by guest_id header"
ON public.live_chat_conversations
FOR UPDATE
TO anon
USING (
  user_id IS NULL
  AND guest_id IS NOT NULL
  AND guest_id::text = current_setting('request.headers', true)::json->>'x-guest-id'
);

-- live_chat_messages: tighten SELECT to require guest header for guest conversations
DROP POLICY IF EXISTS "Users view messages in own conversations" ON public.live_chat_messages;
CREATE POLICY "Users view messages in own conversations"
ON public.live_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.live_chat_conversations c
    WHERE c.id = live_chat_messages.conversation_id
      AND (
        c.user_id = auth.uid()
        OR (
          c.user_id IS NULL
          AND c.guest_id IS NOT NULL
          AND c.guest_id::text = current_setting('request.headers', true)::json->>'x-guest-id'
        )
      )
  )
);

-- 3. Schedule cleanup-old-data via pg_cron instead of relying on a public endpoint
-- (We will also harden the edge function in code.)
