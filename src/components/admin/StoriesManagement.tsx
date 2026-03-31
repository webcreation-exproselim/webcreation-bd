import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, ExternalLink, GripVertical, Eye, EyeOff, Facebook, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Story {
  id: string;
  title: string;
  facebook_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export function StoriesManagement() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Story | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", facebook_url: "", thumbnail_url: "", caption: "" });
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStories();
    const channel = supabase
      .channel("stories-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, fetchStories)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchStories = async () => {
    const { data } = await supabase
      .from("stories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setStories(data as Story[]);
    setLoading(false);
  };

  const autoFetchOG = useCallback(async (url: string) => {
    if (!url.trim() || fetching) return;
    const trimmed = url.trim();
    if (!trimmed.startsWith("http")) return;

    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-og", {
        body: { url: trimmed },
      });

      if (!error && data) {
        setForm(f => ({
          ...f,
          title: f.title || data.title || "",
          caption: f.caption || data.description || "",
          thumbnail_url: f.thumbnail_url || data.image || "",
        }));
        if (data.title || data.image) {
          toast({ title: "✨ অটো-ফেচ সফল!", description: "টাইটেল, ইমেজ ও ক্যাপশন পাওয়া গেছে" });
        }
      }
    } catch (e) {
      console.error("OG fetch error:", e);
    } finally {
      setFetching(false);
    }
  }, [fetching, toast]);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", facebook_url: "", thumbnail_url: "", caption: "" });
    setModalOpen(true);
  };

  const openEdit = (s: Story) => {
    setEditing(s);
    setForm({ title: s.title, facebook_url: s.facebook_url, thumbnail_url: s.thumbnail_url || "", caption: s.caption || "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.facebook_url.trim()) {
      toast({ title: "Title এবং Facebook URL দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      facebook_url: form.facebook_url.trim(),
      thumbnail_url: form.thumbnail_url.trim() || null,
      caption: form.caption.trim() || null,
    };

    if (editing) {
      const { error } = await supabase.from("stories").update(payload).eq("id", editing.id);
      if (error) toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
      else toast({ title: "স্টোরি আপডেট হয়েছে" });
    } else {
      const maxOrder = stories.length > 0 ? Math.max(...stories.map(s => s.sort_order)) + 1 : 0;
      const { error } = await supabase.from("stories").insert({ ...payload, sort_order: maxOrder });
      if (error) toast({ title: "যোগ করা ব্যর্থ", variant: "destructive" });
      else toast({ title: "নতুন স্টোরি যোগ হয়েছে" });
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("stories").delete().eq("id", id);
    toast({ title: "স্টোরি ডিলিট হয়েছে" });
    setDeleteConfirm(null);
  };

  const toggleActive = async (s: Story) => {
    await supabase.from("stories").update({ is_active: !s.is_active }).eq("id", s.id);
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const current = stories[index];
    const prev = stories[index - 1];
    await Promise.all([
      supabase.from("stories").update({ sort_order: prev.sort_order }).eq("id", current.id),
      supabase.from("stories").update({ sort_order: current.sort_order }).eq("id", prev.id),
    ]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-bengali">স্টোরি ম্যানেজমেন্ট</h2>
          <p className="text-xs sm:text-sm text-gray-500 font-bengali">Facebook পোস্টের লিংক দিলে অটো ইমেজ ও ক্যাপশন আসবে</p>
        </div>
        <Button onClick={openAdd} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bengali">
          <Plus className="w-4 h-4 mr-1" /> নতুন স্টোরি
        </Button>
      </div>

      {/* Stories List */}
      {stories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Facebook className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-bengali">কোনো স্টোরি নেই। নতুন স্টোরি যোগ করুন।</p>
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence>
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 w-full sm:flex-1 min-w-0">
                  <button onClick={() => moveUp(index)} className="text-gray-300 hover:text-gray-500 cursor-grab hidden sm:block" title="উপরে নিন">
                    <GripVertical className="w-5 h-5" />
                  </button>

                  {/* Card preview */}
                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {story.thumbnail_url ? (
                      <img src={story.thumbnail_url} alt={story.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50">
                        <Facebook className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-gray-900 font-bengali truncate">{story.title}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">{story.facebook_url}</p>
                    {story.caption && <p className="text-[10px] sm:text-xs text-gray-500 font-bengali truncate mt-0.5">{story.caption}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-center">
                  <Switch checked={story.is_active} onCheckedChange={() => toggleActive(story)} />
                  <span className="text-xs text-gray-400">{story.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</span>
                  <a href={story.facebook_url} target="_blank" rel="noopener noreferrer" className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => openEdit(story)} className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(story.id)} className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-white border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bengali">{editing ? "স্টোরি এডিট করুন" : "নতুন স্টোরি যোগ করুন"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="font-bengali">Facebook পোস্ট URL *</Label>
              <div className="relative">
                <Input
                  value={form.facebook_url}
                  onChange={e => setForm(f => ({ ...f, facebook_url: e.target.value }))}
                  onBlur={e => {
                    if (e.target.value.trim()) autoFetchOG(e.target.value);
                  }}
                  placeholder="https://www.facebook.com/..."
                />
                {fetching && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  </div>
                )}
              </div>
              <p className="text-xs text-purple-500 mt-1 font-bengali flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> লিংক পেস্ট করে বাইরে ক্লিক করলে অটো ইমেজ ও ক্যাপশন আসবে
              </p>
            </div>
            <div>
              <Label className="font-bengali">টাইটেল *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="যেমন: নতুন ওয়েবসাইট লঞ্চ" />
            </div>
            <div>
              <Label className="font-bengali">থাম্বনেইল URL</Label>
              <Input value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} placeholder="অটো আসবে বা নিজে দিন" />
              {form.thumbnail_url && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 w-full aspect-video bg-gray-50">
                  <img src={form.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <Label className="font-bengali">ক্যাপশন</Label>
              <Textarea
                value={form.caption}
                onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                placeholder="অটো আসবে বা নিজে লিখুন"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              {!editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => autoFetchOG(form.facebook_url)}
                  disabled={fetching || !form.facebook_url.trim()}
                  className="font-bengali"
                >
                  {fetching ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
                  অটো ফেচ
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bengali">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {editing ? "আপডেট করুন" : "যোগ করুন"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali">স্টোরি ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription className="font-bengali">এটি স্থায়ীভাবে ডিলিট হবে।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="bg-red-600 hover:bg-red-700 font-bengali">
              ডিলিট করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
