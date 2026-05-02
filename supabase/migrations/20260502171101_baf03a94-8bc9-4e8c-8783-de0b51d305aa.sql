-- Push subscriptions table for admin web push notifications
CREATE TABLE IF NOT EXISTS public.admin_push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage own push subs"
ON public.admin_push_subscriptions
FOR ALL
TO authenticated
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access push subs"
ON public.admin_push_subscriptions
FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- Quick reply templates table
CREATE TABLE IF NOT EXISTS public.live_chat_quick_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  message TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.live_chat_quick_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage own quick replies"
ON public.live_chat_quick_replies
FOR ALL
TO authenticated
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

-- Trigger: notify edge function on new user message via pg_net (we'll use Realtime + edge function instead)
-- The edge function 'send-chat-push' will be invoked from a DB trigger using pg_net

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_admin_on_user_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv RECORD;
  payload JSONB;
BEGIN
  IF NEW.sender_type <> 'user' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO conv FROM public.live_chat_conversations WHERE id = NEW.conversation_id;

  payload := jsonb_build_object(
    'conversation_id', NEW.conversation_id,
    'message_id', NEW.id,
    'sender_name', COALESCE(conv.user_name, conv.guest_name, 'Customer'),
    'message_type', NEW.message_type,
    'content', LEFT(COALESCE(NEW.content, ''), 200)
  );

  PERFORM net.http_post(
    url := 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/send-chat-push',
    headers := jsonb_build_object('Content-Type','application/json'),
    body := payload
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_on_user_message ON public.live_chat_messages;
CREATE TRIGGER trg_notify_admin_on_user_message
AFTER INSERT ON public.live_chat_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_user_message();