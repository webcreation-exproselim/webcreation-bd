import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Copy, ExternalLink, Edit2, X, Check, Link2, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClientLink {
  id: string;
  title: string;
  url: string;
  category: string;
  description: string | null;
  created_at: string;
}

const categoryOptions = [
  { value: "landing-page", label: "ল্যান্ডিং পেজ" },
  { value: "web-development", label: "ওয়েব ডেভেলপমেন্ট" },
  { value: "facebook-ads", label: "ফেসবুক অ্যাডস" },
  { value: "graphics-design", label: "গ্রাফিক্স ডিজাইন" },
  { value: "video-editing", label: "ভিডিও এডিটিং" },
  { value: "motion-graphics", label: "মোশন গ্রাফিক্স" },
  { value: "other", label: "অন্যান্য" },
];

export function ClientLinksManagement() {
  const [links, setLinks] = useState<ClientLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ClientLink | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", url: "", category: "landing-page", description: "" });
  const { toast } = useToast();

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("client_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setLinks(data as ClientLink[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();

    const channel = supabase
      .channel("admin-client-links")
      .on("postgres_changes", { event: "*", schema: "public", table: "client_links" }, () => fetchLinks())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({ title: "লিংক কপি হয়েছে!" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = async () => {
    const allUrls = filtered.map((link) => `${link.title}: ${link.url}`).join("\n");
    await navigator.clipboard.writeText(allUrls);
    toast({ title: `${filtered.length}টি লিংক কপি হয়েছে!` });
  };

  const openAddModal = () => {
    setEditingLink(null);
    setForm({ title: "", url: "", category: "landing-page", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (link: ClientLink) => {
    setEditingLink(link);
    setForm({ title: link.title, url: link.url, category: link.category, description: link.description || "" });
    setIsModalOpen(true);
  };

  const saveLink = async () => {
    if (!form.title || !form.url) {
      toast({ title: "টাইটেল ও URL দিন", variant: "destructive" });
      return;
    }

    if (editingLink) {
      const { error } = await supabase
        .from("client_links")
        .update({ title: form.title, url: form.url, category: form.category, description: form.description || null })
        .eq("id", editingLink.id);
      if (!error) toast({ title: "লিংক আপডেট হয়েছে" });
      else toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    } else {
      const { error } = await supabase
        .from("client_links")
        .insert({ title: form.title, url: form.url, category: form.category, description: form.description || null });
      if (!error) toast({ title: "লিংক যোগ হয়েছে" });
      else toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    }

    setIsModalOpen(false);
    fetchLinks();
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase.from("client_links").delete().eq("id", id);
    if (!error) {
      toast({ title: "লিংক ডিলিট হয়েছে" });
      setDeleteConfirm(null);
      fetchLinks();
    }
  };

  const filtered = links.filter((link) => {
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) || link.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || link.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (val: string) => categoryOptions.find((c) => c.value === val)?.label || val;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-bengali text-gray-900">ক্লায়েন্ট লিংক</h2>
          <p className="text-gray-500 text-sm font-bengali mt-1">পোর্টফোলিও ও ল্যান্ডিং পেজের লিংক ম্যানেজ করুন</p>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && (
            <Button onClick={handleCopyAll} variant="outline" className="rounded-xl border-gray-200 font-bengali">
              <Copy className="w-4 h-4 mr-2" /> সব কপি ({filtered.length})
            </Button>
          )}
          <Button onClick={openAddModal} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg">
            <Plus className="w-4 h-4 mr-2" /> নতুন লিংক
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="সার্চ করুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-gray-200"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl border-gray-200">
            <SelectValue placeholder="ক্যাটাগরি" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
            {categoryOptions.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((link, index) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shrink-0">
                  <Link2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate font-bengali">{link.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bengali border border-blue-100">
                    {getCategoryLabel(link.category)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(link)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button onClick={() => setDeleteConfirm(link.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>

            {link.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{link.description}</p>
            )}

            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
              <p className="text-xs text-gray-600 truncate flex-1 font-mono">{link.url}</p>
              <button
                onClick={() => handleCopy(link.url, link.id)}
                className="p-1.5 hover:bg-white rounded-lg transition-colors shrink-0"
                title="কপি করুন"
              >
                {copiedId === link.id ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-white rounded-lg transition-colors shrink-0"
                title="ওপেন করুন"
              >
                <ExternalLink className="w-4 h-4 text-blue-500" />
              </a>
            </div>

            <p className="text-[10px] text-gray-400 mt-2">
              {new Date(link.created_at).toLocaleDateString("bn-BD")}
            </p>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <Link2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bengali">কোনো লিংক নেই</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="font-bengali">{editingLink ? "লিংক এডিট করুন" : "নতুন লিংক যোগ করুন"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="font-bengali">টাইটেল *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="যেমন: ABC Company Landing Page"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label className="font-bengali">URL *</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://example.com"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label className="font-bengali">ক্যাটাগরি</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-bengali">বিবরণ (ঐচ্ছিক)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="ক্লায়েন্টের জন্য নোট..."
                className="mt-1 rounded-xl"
                rows={3}
              />
            </div>
            <Button onClick={saveLink} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
              {editingLink ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali">লিংক ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription className="font-bengali">এটি আর ফেরত আনা যাবে না।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && deleteLink(deleteConfirm)} className="bg-red-500 hover:bg-red-600 font-bengali">
              ডিলিট
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
