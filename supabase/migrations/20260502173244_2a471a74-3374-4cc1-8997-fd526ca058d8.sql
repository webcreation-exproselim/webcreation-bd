CREATE OR REPLACE FUNCTION public.notify_admin_on_user_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  conv RECORD;
  display_name TEXT;
  payload JSONB;
BEGIN
  IF NEW.sender_type <> 'user' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO conv FROM public.live_chat_conversations WHERE id = NEW.conversation_id;

  -- Resolve a display name without touching non-existent columns
  IF conv.user_id IS NOT NULL THEN
    SELECT full_name INTO display_name FROM public.profiles WHERE user_id = conv.user_id LIMIT 1;
  END IF;

  display_name := COALESCE(display_name, conv.guest_name, 'Customer');

  payload := jsonb_build_object(
    'conversation_id', NEW.conversation_id,
    'message_id', NEW.id,
    'sender_name', display_name,
    'message_type', NEW.message_type,
    'content', LEFT(COALESCE(NEW.content, ''), 200)
  );

  -- Best-effort push; do NOT fail the message insert if push call errors
  BEGIN
    PERFORM net.http_post(
      url := 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/send-chat-push',
      headers := jsonb_build_object('Content-Type','application/json'),
      body := payload
    );
  EXCEPTION WHEN OTHERS THEN
    -- swallow errors so customer can still send messages
    NULL;
  END;

  RETURN NEW;
END;
$function$;

-- Cleanup test row
DELETE FROM public.live_chat_conversations WHERE guest_id = 'test-debug-guest-001';