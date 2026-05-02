import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Send, Image as ImageIcon, Mic, StopCircle, Loader2, Search, Phone, User as UserIcon, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Conversation {
  id: string;
  user_id: string | null;
  guest_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  status: string;
  last_message_at: string;
  unread_admin_count: number;
  profile?: { full_name: string | null; phone: string | null } | null;
}

interface Msg {
  id: string;
  conversation_id: string;
  sender_type: "user" | "admin";
  content: string | null;
  message_type: "text" | "image" | "voice";
  attachment_url: string | null;
  created_at: string;
}

const NOTIFY_KEY = "wcbd_admin_chat_sound";
const NOTIFY_SOUND = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQwAADB3xLAAAAAA==";

export default function LiveChatAdmin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [recording, setRecording] = useState(false);
  const [soundOn, setSoundOn] = useState(localStorage.getItem(NOTIFY_KEY) !== "off");

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth + admin check
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { navigate("/admin-login"); return; }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      const ok = roles?.some((r: any) => r.role === "admin");
      setIsAdmin(!!ok);
      if (!ok) navigate("/admin-login");
    })();
  }, [navigate]);

  // Load conversations
  useEffect(() => {
    if (!isAdmin) return;
    loadConvs();
    // realtime: any new message refreshes convs + adds to active
    const ch = supabase
      .channel("admin_live_chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_chat_conversations" }, () => {
        loadConvs();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_chat_messages" }, (payload) => {
        const m = payload.new as Msg;
        if (m.sender_type === "user") {
          if (soundOn) try { new Audio(NOTIFY_SOUND).play(); } catch {}
          if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
            new Notification("নতুন message", { body: m.content || "📎 attachment" });
          }
        }
        if (activeId && m.conversation_id === activeId) {
          setMessages((prev) => prev.find((x) => x.id === m.id) ? prev : [...prev, m]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin, activeId, soundOn]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Load messages on active change
  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    // mark admin's unread as read
    supabase.from("live_chat_conversations").update({ unread_admin_count: 0 }).eq("id", activeId).then(() => loadConvs());
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function loadConvs() {
    const { data } = await supabase
      .from("live_chat_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(100);
    if (!data) return;
    // Enrich with profile names for logged-in users
    const userIds = data.filter((c: any) => c.user_id).map((c: any) => c.user_id);
    let profMap: Record<string, any> = {};
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id,full_name,phone")
        .in("user_id", userIds);
      profs?.forEach((p: any) => { profMap[p.user_id] = p; });
    }
    setConvs(data.map((c: any) => ({ ...c, profile: c.user_id ? profMap[c.user_id] : null })));
  }

  async function loadMessages(cid: string) {
    const { data } = await supabase
      .from("live_chat_messages")
      .select("*")
      .eq("conversation_id", cid)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Msg[]);
  }

  async function sendMsg(payload: { content?: string; type?: "text" | "image" | "voice"; url?: string }) {
    if (!activeId) return;
    const { data: u } = await supabase.auth.getUser();
    setSending(true);
    const { error } = await supabase.from("live_chat_messages").insert({
      conversation_id: activeId,
      sender_type: "admin",
      sender_id: u.user?.id ?? null,
      content: payload.content ?? null,
      message_type: payload.type ?? "text",
      attachment_url: payload.url ?? null,
    });
    setSending(false);
    if (error) toast.error("পাঠানো যায়নি");
  }

  async function handleSend() {
    if (!text.trim()) return;
    const t = text.trim();
    setText("");
    await sendMsg({ content: t, type: "text" });
  }

  async function uploadFile(file: File, type: "image" | "voice") {
    const ext = file.name.split(".").pop() || (type === "image" ? "png" : "webm");
    const path = `${activeId}/admin-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("chat-attachments").upload(path, file);
    if (error) { toast.error("আপলোড ব্যর্থ"); return; }
    const { data } = supabase.storage.from("chat-attachments").getPublicUrl(path);
    await sendMsg({ type, url: data.publicUrl, content: type === "image" ? "📷" : "🎤" });
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    await uploadFile(f, "image");
  }

  async function startRec() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecRef.current = mr; chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await uploadFile(file, "voice");
      };
      mr.start(); setRecording(true);
    } catch { toast.error("Microphone access দিন"); }
  }
  function stopRec() { mediaRecRef.current?.stop(); setRecording(false); }

  function toggleSound() {
    const v = !soundOn;
    setSoundOn(v);
    localStorage.setItem(NOTIFY_KEY, v ? "on" : "off");
  }

  function getName(c: Conversation) {
    return c.profile?.full_name || c.guest_name || "Anonymous";
  }
  function getPhone(c: Conversation) {
    return c.profile?.phone || c.guest_phone || "—";
  }

  const filtered = convs.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return getName(c).toLowerCase().includes(q) || getPhone(c).toLowerCase().includes(q);
  });

  const active = convs.find((c) => c.id === activeId);

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Mobile: show list OR conversation */}
      <div className="md:hidden">
        {!activeId ? (
          <div className="flex flex-col h-screen">
            <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
              <button onClick={() => navigate("/admin")} className="p-1.5"><ArrowLeft className="h-5 w-5" /></button>
              <div className="flex-1">
                <h1 className="font-bold text-gray-900">Live Chat</h1>
                <p className="text-xs text-gray-500">{convs.filter(c => c.unread_admin_count > 0).length} unread</p>
              </div>
              <button onClick={toggleSound} className="p-2 rounded-lg bg-gray-100">
                {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            <div className="px-3 py-2 bg-white border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-8 bg-gray-50 text-gray-900" />
              </div>
            </div>
            <ConvList convs={filtered} onSelect={setActiveId} getName={getName} getPhone={getPhone} />
          </div>
        ) : (
          <ChatView
            active={active!} messages={messages} text={text} setText={setText} sending={sending}
            onBack={() => setActiveId(null)} onSend={handleSend} onImage={() => fileInputRef.current?.click()}
            recording={recording} onMic={() => recording ? stopRec() : startRec()} scrollRef={scrollRef}
            getName={getName} getPhone={getPhone}
          />
        )}
      </div>

      {/* Desktop: split */}
      <div className="hidden md:flex h-screen">
        <div className="w-[360px] border-r bg-white flex flex-col">
          <div className="px-4 py-3 border-b flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="p-1.5 hover:bg-gray-100 rounded"><ArrowLeft className="h-5 w-5" /></button>
            <div className="flex-1">
              <h1 className="font-bold">Live Chat</h1>
              <p className="text-xs text-gray-500">{convs.length} conversations</p>
            </div>
            <button onClick={toggleSound} className="p-2 rounded-lg hover:bg-gray-100">
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-gray-400" />}
            </button>
          </div>
          <div className="px-3 py-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-8 bg-gray-50 text-gray-900" />
            </div>
          </div>
          <ConvList convs={filtered} onSelect={setActiveId} getName={getName} getPhone={getPhone} activeId={activeId} />
        </div>
        <div className="flex-1 flex flex-col">
          {active ? (
            <ChatView
              active={active} messages={messages} text={text} setText={setText} sending={sending}
              onBack={() => setActiveId(null)} onSend={handleSend} onImage={() => fileInputRef.current?.click()}
              recording={recording} onMic={() => recording ? stopRec() : startRec()} scrollRef={scrollRef}
              getName={getName} getPhone={getPhone} hideBack
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>একটি conversation নির্বাচন করুন</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
    </div>
  );
}

function ConvList({ convs, onSelect, getName, getPhone, activeId }: any) {
  return (
    <div className="flex-1 overflow-y-auto">
      {convs.length === 0 && (
        <div className="text-center text-gray-400 py-12 text-sm">কোনো conversation নেই</div>
      )}
      {convs.map((c: Conversation) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 flex items-start gap-3 ${activeId === c.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {getName(c).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-gray-900 text-sm truncate">{getName(c)}</span>
              <span className="text-[10px] text-gray-500 shrink-0">
                {new Date(c.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="text-xs text-gray-600 truncate flex items-center gap-1">
                <Phone className="h-3 w-3" /> {getPhone(c)}
              </span>
              {c.unread_admin_count > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                  {c.unread_admin_count}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {c.user_id ? (
                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Client</span>
              ) : (
                <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Guest</span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function ChatView({ active, messages, text, setText, sending, onBack, onSend, onImage, recording, onMic, scrollRef, getName, getPhone, hideBack }: any) {
  return (
    <div className="flex flex-col h-screen md:h-full bg-gray-50">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        {!hideBack && <button onClick={onBack} className="p-1.5"><ArrowLeft className="h-5 w-5" /></button>}
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold">
          {getName(active).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 truncate">{getName(active)}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Phone className="h-3 w-3" /> {getPhone(active)}
          </div>
        </div>
        {getPhone(active) !== "—" && (
          <a href={`https://wa.me/${getPhone(active).replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
             className="p-2 bg-green-500 text-white rounded-lg" title="WhatsApp">
            <Phone className="h-4 w-4" />
          </a>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && <div className="text-center text-gray-400 py-8 text-sm">No messages yet</div>}
        {messages.map((m: Msg) => (
          <div key={m.id} className={`flex ${m.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
              m.sender_type === "admin"
                ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm"
                : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm"
            }`}>
              {m.message_type === "image" && m.attachment_url && (
                <a href={m.attachment_url} target="_blank" rel="noreferrer">
                  <img src={m.attachment_url} alt="" className="rounded-lg max-h-56 mb-1" />
                </a>
              )}
              {m.message_type === "voice" && m.attachment_url && (
                <audio controls src={m.attachment_url} className="max-w-full" />
              )}
              {m.message_type === "text" && <div className="whitespace-pre-wrap break-words">{m.content}</div>}
              <div className={`text-[10px] mt-1 ${m.sender_type === "admin" ? "text-white/70" : "text-gray-500"}`}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t bg-white p-2 flex items-center gap-1.5 sticky bottom-0">
        <button onClick={onImage} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><ImageIcon className="h-5 w-5" /></button>
        <button onClick={onMic} className={`p-2 rounded-lg ${recording ? "text-red-600 bg-red-50 animate-pulse" : "text-gray-600 hover:bg-gray-100"}`}>
          {recording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder="Reply লিখুন..."
          className="flex-1 bg-gray-50 text-gray-900 border-gray-200"
          disabled={sending || recording}
        />
        <Button onClick={onSend} disabled={sending || !text.trim()} size="icon" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
