-- Re-attach the notification trigger so push works even when admin app is closed
DROP TRIGGER IF EXISTS trg_notify_admin_on_user_message ON public.live_chat_messages;
DROP TRIGGER IF EXISTS trg_update_conversation_on_message ON public.live_chat_messages;

CREATE TRIGGER trg_update_conversation_on_message
AFTER INSERT ON public.live_chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_live_chat_conversation_on_message();

CREATE TRIGGER trg_notify_admin_on_user_message
AFTER INSERT ON public.live_chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_on_user_message();