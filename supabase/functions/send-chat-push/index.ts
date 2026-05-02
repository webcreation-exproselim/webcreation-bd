// Sends Web Push to all admin subscriptions when a customer messages
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const PUB = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const PRIV = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const SUB = Deno.env.get("VAPID_SUBJECT") || "mailto:webcreationbd99@gmail.com";
    webpush.setVapidDetails(SUB, PUB, PRIV);

    const body = await req.json().catch(() => ({}));
    const { conversation_id, sender_name, message_type, content } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: subs } = await supabase
      .from("admin_push_subscriptions")
      .select("id, endpoint, p256dh, auth");

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let preview = content || "";
    if (message_type === "image") preview = "📷 ছবি পাঠিয়েছে";
    else if (message_type === "voice") preview = "🎤 ভয়েস মেসেজ";

    const payload = JSON.stringify({
      title: `💬 ${sender_name || "Customer"}`,
      body: preview || "নতুন মেসেজ",
      url: `/chat-app?c=${conversation_id}`,
      conversation_id,
      tag: `chat-${conversation_id}`,
    });

    let sent = 0;
    const dead: string[] = [];
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
            { TTL: 86400, urgency: "high", topic: `chat-${conversation_id}`.slice(0, 32) },
          );
          sent++;
        } catch (e: any) {
          if (e?.statusCode === 410 || e?.statusCode === 404) dead.push(s.id);
        }
      }),
    );

    if (dead.length) {
      await supabase.from("admin_push_subscriptions").delete().in("id", dead);
    }

    return new Response(JSON.stringify({ ok: true, sent, removed: dead.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("send-chat-push error", e);
    return new Response(JSON.stringify({ error: e?.message || "failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
