
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

  BEGIN
    PERFORM net.http_post(
      url := 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/send-chat-push',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0am1mdndrYXRyb3JodXlycGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzQ0NTMsImV4cCI6MjA4NTMxMDQ1M30.w4sOcDwCFNZPXLPKi4qJ87-8fIHvc86K5DsAyxQo7mM',
        'x-internal-secret','wcbd_push_2026_8f7e3a92b1c4d5e6f7a8b9c0d1e2f3a4'
      ),
      body := payload
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
END;
$function$;
