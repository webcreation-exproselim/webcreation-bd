-- Ensure pg_net is available for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Drop existing triggers if any (safety)
DROP TRIGGER IF EXISTS trg_notify_admin_on_user_message ON public.live_chat_messages;
DROP TRIGGER IF EXISTS trg_update_conversation_on_message ON public.live_chat_messages;

-- Trigger: update conversation metadata on every new message
CREATE TRIGGER trg_update_conversation_on_message
AFTER INSERT ON public.live_chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_live_chat_conversation_on_message();

-- Trigger: send admin push notification when a user (customer) sends a message
CREATE TRIGGER trg_notify_admin_on_user_message
AFTER INSERT ON public.live_chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_on_user_message();