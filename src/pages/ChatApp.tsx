import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Send, Image as ImageIcon, Mic, StopCircle, Loader2, Search,
  Smile, Bell, BellOff, Zap, Plus, Trash2, X, Check, MessageCircle, Download, Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";

const VAPID_PUBLIC = "BLoVXFXI54mSbAuYdZYwlktIJ-a_lHCMP-ABjfWyFhJUqvSNTG1_K5OQn-stGh3LGqkls_A_BfnTVdeXv1JGjdw";

interface Conversation {
  id: string;
  user_id: string | null;
  guest_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  status: string;
  last_message_at: string;
  unread_admin_count: number;
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

interface QuickReply { id: string; label: string; message: string; }

function urlB64ToUint8Array(b64: string) {
  const padding = "=".repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export default function ChatApp() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(params.get("c"));
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [recording, setRecording] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showQRManager, setShowQRManager] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auth + admin gate
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { navigate("/admin-login"); return; }
      setUserId(data.user.id);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      const ok = roles?.some((r: any) => r.role === "admin");
      setIsAdmin(!!ok);
      if (!ok) navigate("/admin-login");
    })();
  }, [navigate]);

  // Service worker registration & push state
  useEffect(() => {
    if (!isAdmin) return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/chat-sw.js").catch(() => {});
      navigator.serviceWorker.ready.then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        setPushEnabled(!!sub);
      });
    }
  }, [isAdmin]);

  // Swap manifest to chat-only manifest so install opens /chat-app, not /
  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    const prev = link?.getAttribute("href") || "/manifest.json";
    if (link) link.setAttribute("href", "/chat-manifest.json");
    const prevTitle = document.title;
    document.title = "WCBD Chat";
    return () => {
      if (link) link.setAttribute("href", prev);
      document.title = prevTitle;
    };
  }, []);

  // PWA install prompt detection
  useEffect(() => {
    // Detect if already installed (running as PWA)
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallEvent(null);
      toast.success("✅ App install হয়ে গেছে!");
    });
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const handleInstall = async () => {
    if (installEvent) {
      try {
        installEvent.prompt();
        const { outcome } = await installEvent.userChoice;
        if (outcome === "accepted") {
          setInstallEvent(null);
        }
      } catch {
        setShowInstallHelp(true);
      }
    } else {
      // No native prompt — show manual instructions (iOS Safari, etc.)
      setShowInstallHelp(true);
    }
  };

  const enablePush = async () => {
    try {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        toast.error("এই ব্রাউজার সাপোর্ট করে না");
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { toast.error("Notification permission দিন"); return; }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC),
        });
      }
      const json = sub.toJSON() as any;
      await supabase.from("admin_push_subscriptions").upsert({
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        user_agent: navigator.userAgent,
      }, { onConflict: "endpoint" });
      setPushEnabled(true);
      toast.success("✅ Background notification চালু");
    } catch (e: any) {
      toast.error("ব্যর্থ: " + (e?.message || ""));
    }
  };

  const disablePush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.from("admin_push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setPushEnabled(false);
      toast.success("Notification বন্ধ");
    } catch {}
  };

  // Conversations + realtime
  const loadConvs = async () => {
    const { data } = await supabase
      .from("live_chat_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(100);
    setConvs((data as any) || []);
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadConvs();
    loadQuickReplies();
    const ch = supabase
      .channel("chatapp_admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_chat_conversations" }, loadConvs)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin]);

  // Active messages + realtime
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    (async () => {
      const { data } = await supabase
        .from("live_chat_messages").select("*")
        .eq("conversation_id", activeId).order("created_at", { ascending: true });
      setMessages((data as any) || []);
      // mark read
      await supabase.from("live_chat_conversations").update({ unread_admin_count: 0 }).eq("id", activeId);
    })();
    const ch = supabase
      .channel(`chatapp_msgs_${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_chat_messages", filter: `conversation_id=eq.${activeId}` },
        (p) => setMessages((prev) => [...prev, p.new as Msg]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, activeId]);

  // Quick replies
  const loadQuickReplies = async () => {
    const { data } = await supabase.from("live_chat_quick_replies").select("*").order("sort_order");
    setQuickReplies((data as any) || []);
  };

  const insertQuickReply = (m: string) => {
    setText((t) => (t ? t + " " : "") + m);
    setShowQuickReplies(false);
    setTimeout(() => taRef.current?.focus(), 50);
  };

  // Send
  const sendMessage = async (
    payload: { content?: string; type?: "text" | "image" | "voice"; url?: string }
  ) => {
    if (!activeId) return;
    setSending(true);
    try {
      await supabase.from("live_chat_messages").insert({
        conversation_id: activeId,
        sender_type: "admin",
        sender_id: userId,
        content: payload.content || null,
        message_type: payload.type || "text",
        attachment_url: payload.url || null,
      });
      setText("");
    } catch (e: any) {
      toast.error(e?.message || "পাঠানো যায়নি");
    } finally { setSending(false); }
  };

  const handleSendText = () => {
    const t = text.trim();
    if (!t) return;
    sendMessage({ content: t, type: "text" });
  };

  const handleImage = async (file: File) => {
    if (!file || !activeId) return;
    try {
      const path = `${activeId}/${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const { error } = await supabase.storage.from("chat-attachments").upload(path, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from("chat-attachments").getPublicUrl(path);
      await sendMessage({ type: "image", url: pub.publicUrl });
    } catch (e: any) { toast.error(e?.message || "Image fail"); }
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const path = `${activeId}/${Date.now()}_voice.webm`;
        const { error } = await supabase.storage.from("chat-attachments").upload(path, blob);
        if (error) { toast.error(error.message); return; }
        const { data: pub } = supabase.storage.from("chat-attachments").getPublicUrl(path);
        await sendMessage({ type: "voice", url: pub.publicUrl });
      };
      mr.start();
      mediaRecRef.current = mr;
      setRecording(true);
    } catch { toast.error("Mic access fail"); }
  };
  const stopRec = () => { mediaRecRef.current?.stop(); setRecording(false); };

  const filtered = convs.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.guest_name || "").toLowerCase().includes(q) ||
           (c.guest_phone || "").includes(q) ||
           (c.user_id || "").includes(q);
  });
  const active = convs.find((c) => c.id === activeId);

  if (isAdmin === null) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Loader2 className="animate-spin text-white w-8 h-8" />
    </div>
  );

  // Conversation list view (no active chat)
  if (!activeId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              <h1 className="text-lg font-bold">Live Chat</h1>
            </div>
            <div className="flex items-center gap-1">
              {!isInstalled && (
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-9 w-9"
                  onClick={handleInstall} title="Install App">
                  <Download className="w-5 h-5" />
                </Button>
              )}
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-9 w-9"
                onClick={pushEnabled ? disablePush : enablePush} title="Notifications">
                {pushEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </Button>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-9 w-9"
                onClick={() => setShowQRManager(true)} title="Quick Replies">
                <Zap className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/15 border-white/20 text-white placeholder:text-white/60 h-9"
            />
          </div>
        </div>

        {/* Install App banner — top priority */}
        {!isInstalled && (
          <div className="m-3 mb-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-3 flex items-start gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">📱 Phone এ App হিসেবে Install করুন</p>
              <p className="text-xs text-white/90 mt-0.5">Home screen থেকে এক tap এ খুলবে — full screen, fast</p>
              <Button size="sm" className="mt-2 bg-white text-emerald-700 hover:bg-white/90 h-8 font-semibold"
                onClick={handleInstall}>
                <Download className="w-3.5 h-3.5 mr-1" /> Install App
              </Button>
            </div>
          </div>
        )}

        {!pushEnabled && (
          <div className="m-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Background notification চালু করুন</p>
              <p className="text-xs text-amber-700 mt-0.5">App বন্ধ থাকলেও notification পাবেন</p>
              <Button size="sm" className="mt-2 bg-amber-600 hover:bg-amber-700 text-white h-8" onClick={enablePush}>
                Enable Now
              </Button>
            </div>
          </div>
        )}

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>কোন চ্যাট নাই</p>
            </div>
          ) : filtered.map((c) => (
            <button key={c.id} onClick={() => setActiveId(c.id)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 text-left transition">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                {(c.guest_name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 truncate">
                    {c.guest_name || (c.user_id ? "Logged-in User" : "Guest")}
                  </p>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(c.last_message_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{c.guest_phone || c.user_id || "—"}</p>
              </div>
              {c.unread_admin_count > 0 && (
                <span className="min-w-5 h-5 px-1.5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {c.unread_admin_count}
                </span>
              )}
            </button>
          ))}
        </div>

        <QuickReplyManager
          open={showQRManager} onOpenChange={setShowQRManager}
          quickReplies={quickReplies} userId={userId} onChanged={loadQuickReplies}
        />
        <InstallHelpDialog open={showInstallHelp} onOpenChange={setShowInstallHelp} />
      </div>
    );
  }

  // Active chat view
  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2.5 flex items-center gap-2 shadow-lg shrink-0">
        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-9 w-9" onClick={() => setActiveId(null)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
          {(active?.guest_name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{active?.guest_name || "Customer"}</p>
          <p className="text-[11px] text-white/80 truncate">{active?.guest_phone || "online"}</p>
        </div>
        {active?.guest_phone && (
          <a href={`https://wa.me/${active.guest_phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
            className="text-[11px] bg-emerald-500 px-2 py-1 rounded-full font-semibold">WhatsApp</a>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m) => {
          const mine = m.sender_type === "admin";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-3 py-2 shadow-sm ${
                mine ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-gray-900 rounded-bl-sm"
              }`}>
                {m.message_type === "image" && m.attachment_url && (
                  <img src={m.attachment_url} alt="" className="rounded-lg max-w-full mb-1" />
                )}
                {m.message_type === "voice" && m.attachment_url && (
                  <audio controls src={m.attachment_url} className="max-w-[220px]" />
                )}
                {m.content && <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>}
                <p className={`text-[10px] mt-0.5 ${mine ? "text-white/70" : "text-gray-400"}`}>
                  {new Date(m.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick replies bar */}
      {showQuickReplies && quickReplies.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-2 py-2 flex gap-1.5 overflow-x-auto shrink-0">
          {quickReplies.map((q) => (
            <button key={q.id} onClick={() => insertQuickReply(q.message)}
              className="shrink-0 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100 hover:bg-blue-100">
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="shrink-0">
          <EmojiPicker
            width="100%" height={320}
            onEmojiClick={(e) => { setText((t) => t + e.emoji); }}
          />
        </div>
      )}

      {/* Input bar */}
      <div className="bg-white border-t border-gray-200 px-2 py-2 shrink-0">
        {recording ? (
          <div className="flex items-center gap-2 px-2 py-2 bg-red-50 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-red-700 flex-1">Recording...</span>
            <Button size="sm" variant="destructive" onClick={stopRec}>
              <StopCircle className="w-4 h-4 mr-1" /> Send
            </Button>
          </div>
        ) : (
          <div className="flex items-end gap-1">
            <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-600 shrink-0"
              onClick={() => { setShowEmoji((s) => !s); setShowQuickReplies(false); }}>
              <Smile className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-600 shrink-0"
              onClick={() => { setShowQuickReplies((s) => !s); setShowEmoji(false); }}>
              <Zap className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-600 shrink-0"
              onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="w-5 h-5" />
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])} />
            <Textarea
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
              placeholder="Reply..."
              rows={1}
              className="flex-1 min-h-[36px] max-h-24 resize-none rounded-2xl text-sm bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500"
            />
            {text.trim() ? (
              <Button size="icon" className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 shrink-0"
                onClick={handleSendText} disabled={sending}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            ) : (
              <Button size="icon" className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 shrink-0" onClick={startRec}>
                <Mic className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickReplyManager({ open, onOpenChange, quickReplies, userId, onChanged }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  quickReplies: QuickReply[]; userId: string | null; onChanged: () => void;
}) {
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!label.trim() || !message.trim() || !userId) return;
    setSaving(true);
    const { error } = await supabase.from("live_chat_quick_replies").insert({
      user_id: userId, label: label.trim(), message: message.trim(),
      sort_order: quickReplies.length,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setLabel(""); setMessage(""); onChanged();
    toast.success("যোগ হয়েছে");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("live_chat_quick_replies").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    onChanged();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" /> Quick Reply Templates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {quickReplies.map((q) => (
            <div key={q.id} className="bg-gray-50 rounded-lg p-2.5 flex items-start justify-between gap-2 border border-gray-100">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{q.label}</p>
                <p className="text-xs text-gray-600 truncate">{q.message}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => remove(q.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {quickReplies.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">কোন template নাই</p>
          )}
        </div>

        <div className="border-t pt-3 space-y-2">
          <Input placeholder="Label (e.g. Salam)" value={label} onChange={(e) => setLabel(e.target.value)}
            className="bg-white border-gray-200 text-gray-900" />
          <Textarea placeholder="Message text..." value={message} onChange={(e) => setMessage(e.target.value)}
            rows={2} className="bg-white border-gray-200 text-gray-900 resize-none" />
          <Button onClick={add} disabled={saving || !label.trim() || !message.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-1" /> যোগ করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InstallHelpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/i.test(ua);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" /> App Install করুন
          </DialogTitle>
        </DialogHeader>

        {isIOS ? (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              <p className="font-semibold mb-1">📱 iPhone / iPad এ:</p>
              <p className="text-xs">Safari browser ব্যবহার করুন (Chrome এ কাজ করবে না)</p>
            </div>
            <ol className="space-y-3 text-sm text-gray-800">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  Safari এর নিচে <Share2 className="inline w-4 h-4 text-blue-600" /> <b>Share</b> button এ tap করুন
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div>Scroll করে <b>"Add to Home Screen"</b> select করুন</div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div>উপরে ডানে <b>"Add"</b> এ tap করুন</div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
                <div>✅ Home screen এ "WCBD Chat" icon দেখবেন</div>
              </li>
            </ol>
          </div>
        ) : isAndroid ? (
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-900">
              <p className="font-semibold mb-1">📱 Android এ:</p>
              <p className="text-xs">Chrome browser ব্যবহার করুন (best result এর জন্য)</p>
            </div>
            <ol className="space-y-3 text-sm text-gray-800">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <div>Chrome এর উপরে ডানে <b>⋮ (3 dots)</b> menu এ tap করুন</div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div><b>"Install app"</b> বা <b>"Add to Home screen"</b> select করুন</div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div><b>"Install"</b> button এ tap করুন</div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
                <div>✅ Home screen এ "WCBD Chat" icon দেখবেন — সাধারণ app এর মত খুলবে</div>
              </li>
            </ol>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800">
              💡 যদি "Install app" option না দেখেন, page টা refresh করে আবার চেষ্টা করুন
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-gray-800">
            <p>Phone থেকে এই page খুলুন (Android: Chrome / iPhone: Safari)</p>
            <p>তারপর browser menu থেকে <b>"Install app"</b> অথবা <b>"Add to Home Screen"</b> select করুন</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-600">
              💻 Desktop/Laptop এ install করার দরকার নেই — phone এ install করুন
            </div>
          </div>
        )}

        <Button onClick={() => onOpenChange(false)} className="w-full bg-emerald-600 hover:bg-emerald-700">
          বুঝেছি
        </Button>
      </DialogContent>
    </Dialog>
  );
}
