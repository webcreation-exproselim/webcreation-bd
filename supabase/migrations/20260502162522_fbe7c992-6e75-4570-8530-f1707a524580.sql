-- Live chat conversations
CREATE TABLE public.live_chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  guest_id TEXT NULL,
  guest_name TEXT NULL,
  guest_phone TEXT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unread_admin_count INTEGER NOT NULL DEFAULT 0,
  unread_user_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lcc_user ON public.live_chat_conversations(user_id);
CREATE INDEX idx_lcc_guest ON public.live_chat_conversations(guest_id);
CREATE INDEX idx_lcc_last_msg ON public.live_chat_conversations(last_message_at DESC);

ALTER TABLE public.live_chat_conversations ENABLE ROW LEVEL SECURITY;

-- Admins manage all
CREATE POLICY "Admins manage all live chat conversations"
ON public.live_chat_conversations FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Logged-in users view/manage own
CREATE POLICY "Users view own conversations"
ON public.live_chat_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own conversations"
ON public.live_chat_conversations FOR INSERT
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL AND guest_id IS NOT NULL));

CREATE POLICY "Users update own conversations"
ON public.live_chat_conversations FOR UPDATE
USING (auth.uid() = user_id);

-- Guests can read/insert/update by guest_id (public access for guest chat)
CREATE POLICY "Guests view by guest_id"
ON public.live_chat_conversations FOR SELECT
USING (user_id IS NULL AND guest_id IS NOT NULL);

CREATE POLICY "Guests update own by guest_id"
ON public.live_chat_conversations FOR UPDATE
USING (user_id IS NULL AND guest_id IS NOT NULL);

-- Live chat messages
CREATE TABLE public.live_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.live_chat_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL DEFAULT 'user',
  sender_id UUID NULL,
  content TEXT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  attachment_url TEXT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lcm_conv ON public.live_chat_messages(conversation_id, created_at);

ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

-- Admins manage all messages
CREATE POLICY "Admins manage all live chat messages"
ON public.live_chat_messages FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users view messages in their conversations
CREATE POLICY "Users view messages in own conversations"
ON public.live_chat_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.live_chat_conversations c
  WHERE c.id = live_chat_messages.conversation_id
  AND (c.user_id = auth.uid() OR (c.user_id IS NULL AND c.guest_id IS NOT NULL))
));

-- Users insert messages in their conversations
CREATE POLICY "Users insert messages in own conversations"
ON public.live_chat_messages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.live_chat_conversations c
  WHERE c.id = live_chat_messages.conversation_id
  AND (c.user_id = auth.uid() OR (c.user_id IS NULL AND c.guest_id IS NOT NULL))
));

-- Trigger: update conversation last_message_at + unread counts
CREATE OR REPLACE FUNCTION public.update_live_chat_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.sender_type = 'user' THEN
    UPDATE public.live_chat_conversations
    SET last_message_at = NEW.created_at,
        unread_admin_count = unread_admin_count + 1,
        updated_at = now()
    WHERE id = NEW.conversation_id;
  ELSIF NEW.sender_type = 'admin' THEN
    UPDATE public.live_chat_conversations
    SET last_message_at = NEW.created_at,
        unread_user_count = unread_user_count + 1,
        updated_at = now()
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_live_chat_conversation
AFTER INSERT ON public.live_chat_messages
FOR EACH ROW EXECUTE FUNCTION public.update_live_chat_conversation_on_message();

-- updated_at trigger
CREATE TRIGGER trg_lcc_updated_at
BEFORE UPDATE ON public.live_chat_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_orders_updated_at();

-- Realtime
ALTER TABLE public.live_chat_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.live_chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;

-- Storage bucket for chat attachments (images + voice)
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view chat attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');

CREATE POLICY "Anyone can upload chat attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-attachments');