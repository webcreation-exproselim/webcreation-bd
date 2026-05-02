import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, X, Send, Image as ImageIcon, Mic, StopCircle, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const GUEST_KEY = "wcbd_live_chat_guest_id";
const CONV_KEY = "wcbd_live_chat_conv_id";

interface Msg {
  id: string;
  conversation_id: string;
  sender_type: "user" | "admin";
  content: string | null;
  message_type: "text" | "image" | "voice";
  attachment_url: string | null;
  created_at: string;
}

function getOrCreateGuestId() {
  let g = localStorage.getItem(GUEST_KEY);
  if (!g) {
    g = "g_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(GUEST_KEY, g);
  }
  return g;
}

export default function LiveChatWidget() {
  const location = useLocation();
  const hideOn = ["/admin", "/admin/live-chat", "/admin-login", "/checkout"];
  const shouldHide = hideOn.some((p) => location.pathname.startsWith(p));

  const [open, setOpen] = useState(false);
  const [welcomeShow, setWelcomeShow] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [recording, setRecording] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [needsInfo, setNeedsInfo] = useState(false);

  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load auth user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Welcome bubble — shows once per session, auto hides after 8s
  useEffect(() => {
    if (shouldHide) return;
    const seen = sessionStorage.getItem("wcbd_chat_welcome_seen");
    if (seen) return;
    const showT = setTimeout(() => setWelcomeShow(true), 2500);
    const hideT = setTimeout(() => {
      setWelcomeShow(false);
      sessionStorage.setItem("wcbd_chat_welcome_seen", "1");
    }, 10500);
    return () => { clearTimeout(showT); clearTimeout(hideT); };
  }, [shouldHide]);

  // Init or load conversation when opened
  useEffect(() => {
    if (!open) return;
    initConversation();
  }, [open, user]);

  // Realtime
  useEffect(() => {
    if (!conversationId) return;
    const ch = supabase
      .channel(`live_chat_${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_chat_messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const m = payload.new as Msg;
          setMessages((prev) => (prev.find((x) => x.id === m.id) ? prev : [...prev, m]));
          if (m.sender_type === "admin" && !open) {
            setUnread((u) => u + 1);
            try { new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=").play(); } catch {}
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [conversationId, open]);

  // Poll unread when widget closed
  useEffect(() => {
    if (!conversationId || open) return;
    const t = setInterval(async () => {
      const { data } = await supabase
        .from("live_chat_conversations")
        .select("unread_user_count")
        .eq("id", conversationId)
        .maybeSingle();
      if (data) setUnread(data.unread_user_count || 0);
    }, 8000);
    return () => clearInterval(t);
  }, [conversationId, open]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function initConversation() {
    let convId = localStorage.getItem(CONV_KEY);
    if (user) {
      // Find existing for user
      const { data: existing } = await supabase
        .from("live_chat_conversations")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing) {
        convId = existing.id;
      } else {
        const { data: created } = await supabase
          .from("live_chat_conversations")
          .insert({ user_id: user.id, status: "open" })
          .select()
          .single();
        if (created) convId = created.id;
      }
      setConversationId(convId);
      localStorage.setItem(CONV_KEY, convId!);
      await markRead(convId!);
      await loadMessages(convId!);
    } else {
      const guestId = getOrCreateGuestId();
      // Try existing conversation by guest_id
      const { data: existing } = await supabase
        .from("live_chat_conversations")
        .select("*")
        .eq("guest_id", guestId)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing) {
        setConversationId(existing.id);
        localStorage.setItem(CONV_KEY, existing.id);
        await markRead(existing.id);
        await loadMessages(existing.id);
      } else {
        // Need name/phone first
        setNeedsInfo(true);
      }
    }
  }

  async function createGuestConversation() {
    if (!guestName.trim() || !guestPhone.trim()) {
      toast.error("নাম ও ফোন নাম্বার দিন");
      return;
    }
    const guestId = getOrCreateGuestId();
    const { data, error } = await supabase
      .from("live_chat_conversations")
      .insert({
        guest_id: guestId,
        guest_name: guestName.trim(),
        guest_phone: guestPhone.trim(),
        status: "open",
      })
      .select()
      .single();
    if (error || !data) {
      toast.error("শুরু করা যায়নি, আবার চেষ্টা করুন");
      return;
    }
    setConversationId(data.id);
    localStorage.setItem(CONV_KEY, data.id);
    setNeedsInfo(false);
    await loadMessages(data.id);
  }

  async function loadMessages(cid: string) {
    const { data } = await supabase
      .from("live_chat_messages")
      .select("*")
      .eq("conversation_id", cid)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Msg[]);
  }

  async function markRead(cid: string) {
    setUnread(0);
    await supabase
      .from("live_chat_conversations")
      .update({ unread_user_count: 0 })
      .eq("id", cid);
  }

  async function sendMessage(payload: { content?: string; type?: "text" | "image" | "voice"; url?: string }) {
    if (!conversationId) return;
    setSending(true);
    const messageType = payload.type ?? "text";
    const messageContent = payload.content ?? null;
    const { error } = await supabase.from("live_chat_messages").insert({
      conversation_id: conversationId,
      sender_type: "user",
      sender_id: user?.id ?? null,
      content: messageContent,
      message_type: messageType,
      attachment_url: payload.url ?? null,
    });
    setSending(false);
    if (error) {
      toast.error("পাঠাতে সমস্যা হয়েছে");
      return;
    }
    void supabase.functions.invoke("send-chat-push", {
      body: {
        conversation_id: conversationId,
        sender_name: user?.user_metadata?.full_name || guestName.trim() || "Customer",
        message_type: messageType,
        content: messageContent || "",
      },
    });
  }

  async function handleSendText() {
    if (!text.trim()) return;
    const t = text.trim();
    setText("");
    await sendMessage({ content: t, type: "text" });
  }

  async function uploadFile(file: File, type: "image" | "voice") {
    const ext = file.name.split(".").pop() || (type === "image" ? "png" : "webm");
    const path = `${conversationId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("chat-attachments").upload(path, file, { upsert: false });
    if (error) {
      toast.error("আপলোড ব্যর্থ");
      return;
    }
    const { data } = supabase.storage.from("chat-attachments").getPublicUrl(path);
    await sendMessage({ type, url: data.publicUrl, content: type === "image" ? "📷 Image" : "🎤 Voice" });
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    await uploadFile(f, "image");
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await uploadFile(file, "voice");
      };
      mr.start();
      setRecording(true);
    } catch {
      toast.error("Microphone access দিন");
    }
  }

  function stopRecording() {
    mediaRecRef.current?.stop();
    setRecording(false);
  }

  function handleOpen() {
    setOpen(true);
    if (conversationId) markRead(conversationId);
  }

  if (shouldHide) return null;

  return (
    <>
      {/* Floating button — clean professional design */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-2.5">
          {/* Welcome bubble */}
          {welcomeShow && (
            <div className="max-w-[280px] animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="relative bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 p-3.5 pr-9">
                <button
                  onClick={() => { setWelcomeShow(false); sessionStorage.setItem("wcbd_chat_welcome_seen", "1"); }}
                  className="absolute top-2 right-2 p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Online</span>
                </div>
                <p className="text-[13.5px] font-semibold text-gray-900 leading-snug">কোনো সাহায্য লাগবে?</p>
                <p className="text-[11.5px] text-gray-500 mt-0.5 leading-snug">এখনই আমাদের সাথে chat করুন — দ্রুত reply পাবেন।</p>
                <div className="absolute -bottom-1.5 right-7 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45" />
              </div>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleOpen}
            className="group relative h-[58px] w-[58px] rounded-full bg-blue-600 hover:bg-blue-700 shadow-[0_8px_24px_-4px_rgba(37,99,235,0.5)] flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Live chat"
          >
            <MessageCircle className="h-[26px] w-[26px]" strokeWidth={2.2} />
            {/* Online dot */}
            <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-[2.5px] border-white" />
            {/* Unread badge */}
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 h-[22px] min-w-[22px] px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-md">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-[9999] sm:w-[380px] sm:h-[560px] sm:max-h-[80vh] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-sm">Web Creation BD Support</div>
                <div className="text-[11px] flex items-center gap-1.5 opacity-90">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" /> Online — দ্রুত reply পাবেন
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          {needsInfo ? (
            <div className="flex-1 p-5 flex flex-col gap-3 bg-gray-50">
              <div className="text-center mt-4 mb-2">
                <div className="mx-auto h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <User className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-gray-900 font-bold">Chat শুরু করুন</h3>
                <p className="text-xs text-gray-600 mt-1">আপনার নাম ও ফোন নাম্বার দিন</p>
              </div>
              <Input
                placeholder="আপনার নাম"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="bg-white text-gray-900"
              />
              <Input
                placeholder="ফোন নাম্বার (01XXXXXXXXX)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="bg-white text-gray-900"
              />
              <Button
                onClick={createGuestConversation}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                Chat শুরু করুন
              </Button>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-gradient-to-b from-gray-50 to-white">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>আসসালামু আলাইকুম! 👋</p>
                    <p className="text-xs mt-1">যেকোনো প্রশ্ন লিখে পাঠান।</p>
                  </div>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                        m.sender_type === "user"
                          ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm"
                          : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm"
                      }`}
                    >
                      {m.message_type === "image" && m.attachment_url && (
                        <a href={m.attachment_url} target="_blank" rel="noreferrer">
                          <img src={m.attachment_url} alt="attachment" className="rounded-lg max-h-48 mb-1" />
                        </a>
                      )}
                      {m.message_type === "voice" && m.attachment_url && (
                        <audio controls src={m.attachment_url} className="max-w-full" />
                      )}
                      {m.message_type === "text" && <div className="whitespace-pre-wrap break-words">{m.content}</div>}
                      <div className={`text-[10px] mt-1 ${m.sender_type === "user" ? "text-white/70" : "text-gray-500"}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Composer */}
              <div className="border-t bg-white p-2 flex items-center gap-1.5">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Image"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className={`p-2 rounded-lg ${recording ? "text-red-600 bg-red-50 animate-pulse" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"}`}
                  title="Voice"
                >
                  {recording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
                  placeholder="Message লিখুন..."
                  className="flex-1 bg-gray-50 text-gray-900 border-gray-200"
                  disabled={sending || recording}
                />
                <Button
                  onClick={handleSendText}
                  disabled={sending || !text.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
