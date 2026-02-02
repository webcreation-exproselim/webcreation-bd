import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Save,
  Trash2,
  Edit2,
  Image,
  Type,
  Link as LinkIcon,
  Palette,
  Search,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAllSiteContent } from "@/hooks/useSiteContent";
import { useToast } from "@/hooks/use-toast";

interface ContentItem {
  id: string;
  page: string;
  section: string;
  content_key: string;
  content_value: string | null;
  content_type: string;
}

const pages = [
  { id: "home", label: "হোম পেজ" },
  { id: "facebook-ads", label: "ফেসবুক অ্যাডস" },
  { id: "web-development", label: "ওয়েব ডেভেলপমেন্ট" },
  { id: "graphics-design", label: "গ্রাফিক্স ডিজাইন" },
  { id: "video-editing", label: "ভিডিও এডিটিং" },
  { id: "motion-graphics", label: "মোশন গ্রাফিক্স" },
  { id: "landing-page", label: "ল্যান্ডিং পেজ" },
];

const sections = [
  { id: "hero", label: "হিরো সেকশন" },
  { id: "stats", label: "স্ট্যাটস সেকশন" },
  { id: "why-choose", label: "কেন বেছে নেবেন" },
  { id: "services", label: "সার্ভিস সমূহ" },
  { id: "comparison", label: "তুলনা সেকশন" },
  { id: "footer", label: "ফুটার" },
  { id: "header", label: "হেডার" },
];

const contentTypes = [
  { id: "text", label: "টেক্সট", icon: Type },
  { id: "image", label: "ইমেজ URL", icon: Image },
  { id: "link", label: "লিংক", icon: LinkIcon },
  { id: "color", label: "কালার", icon: Palette },
];

export function ContentManagement() {
  const { content, loading, upsertContent, deleteContent, refetch } = useAllSiteContent();
  const { toast } = useToast();
  
  const [selectedPage, setSelectedPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    page: "home",
    section: "hero",
    content_key: "",
    content_value: "",
    content_type: "text",
  });

  // Filter content by selected page
  const filteredContent = content.filter((item) => {
    const matchesPage = item.page === selectedPage;
    const matchesSearch =
      searchQuery === "" ||
      item.content_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content_value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.section.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPage && matchesSearch;
  });

  // Group content by section
  const groupedContent = filteredContent.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleSave = async () => {
    if (!formData.content_key || !formData.content_value) {
      toast({
        title: "সব তথ্য দিন",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { error } = await upsertContent(
      formData.page,
      formData.section,
      formData.content_key,
      formData.content_value,
      formData.content_type
    );

    if (error) {
      toast({
        title: "সমস্যা হয়েছে",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: editingItem ? "আপডেট হয়েছে" : "যোগ হয়েছে",
      });
      setIsAddModalOpen(false);
      setEditingItem(null);
      setFormData({
        page: selectedPage,
        section: "hero",
        content_key: "",
        content_value: "",
        content_type: "text",
      });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteContent(id);
    if (error) {
      toast({
        title: "ডিলিট ব্যর্থ",
        variant: "destructive",
      });
    } else {
      toast({
        title: "ডিলিট হয়েছে",
      });
    }
    setDeleteConfirm(null);
  };

  const openEditModal = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      page: item.page,
      section: item.section,
      content_key: item.content_key,
      content_value: item.content_value || "",
      content_type: item.content_type,
    });
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      page: selectedPage,
      section: "hero",
      content_key: "",
      content_value: "",
      content_type: "text",
    });
    setIsAddModalOpen(true);
  };

  const getTypeIcon = (type: string) => {
    const typeData = contentTypes.find((t) => t.id === type);
    return typeData?.icon || Type;
  };

  const getSectionLabel = (sectionId: string) => {
    return sections.find((s) => s.id === sectionId)?.label || sectionId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Page Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setSelectedPage(page.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bengali whitespace-nowrap transition-all ${
                selectedPage === page.id
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-100 hover:border-gray-200"
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>

        {/* Search & Add */}
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48 font-bengali bg-white border-gray-100 rounded-xl"
            />
          </div>
          <Button
            onClick={openAddModal}
            className="bg-red-600 hover:bg-red-700 font-bengali shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            নতুন কন্টেন্ট
          </Button>
        </div>
      </div>

      {/* Content Sections */}
      {Object.keys(groupedContent).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-bengali mb-4">
            এই পেজে কোনো কন্টেন্ট নেই
          </p>
          <Button
            onClick={openAddModal}
            variant="outline"
            className="font-bengali"
          >
            <Plus className="w-4 h-4 mr-2" />
            কন্টেন্ট যোগ করুন
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedContent).map(([section, items]) => {
            const isExpanded = expandedSections.includes(section);
            return (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bengali font-semibold text-gray-900">
                        {getSectionLabel(section)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {items.length} আইটেম
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="px-6 pb-4 space-y-3 border-t border-gray-50">
                    {items.map((item, index) => {
                      const TypeIcon = getTypeIcon(item.content_type);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          {/* Type Icon */}
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="w-4 h-4 text-gray-500" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 font-mono mb-1">
                              {item.content_key}
                            </p>
                            {item.content_type === "image" ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={item.content_value || ""}
                                  alt=""
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                                <p className="text-sm text-gray-600 truncate">
                                  {item.content_value}
                                </p>
                              </div>
                            ) : item.content_type === "color" ? (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-lg border border-gray-200"
                                  style={{ backgroundColor: item.content_value || "#000" }}
                                />
                                <p className="text-sm text-gray-600 font-mono">
                                  {item.content_value}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-700 font-bengali line-clamp-2">
                                {item.content_value}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(item)}
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(item.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bengali">
              {editingItem ? "কন্টেন্ট এডিট করুন" : "নতুন কন্টেন্ট যোগ করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Page & Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bengali">পেজ</Label>
                <Select
                  value={formData.page}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, page: val }))
                  }
                  disabled={!!editingItem}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-bengali">সেকশন</Label>
                <Select
                  value={formData.section}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, section: val }))
                  }
                  disabled={!!editingItem}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content Key */}
            <div>
              <Label className="font-bengali">কন্টেন্ট Key</Label>
              <Input
                value={formData.content_key}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content_key: e.target.value }))
                }
                placeholder="e.g. title, subtitle, button_text"
                className="mt-1 font-mono"
                disabled={!!editingItem}
              />
              <p className="text-xs text-gray-400 mt-1">
                যেমন: title, subtitle, button_text, image_url
              </p>
            </div>

            {/* Content Type */}
            <div>
              <Label className="font-bengali">ধরণ</Label>
              <Select
                value={formData.content_type}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, content_type: val }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Value */}
            <div>
              <Label className="font-bengali">ভ্যালু</Label>
              {formData.content_type === "color" ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={formData.content_value || "#000000"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content_value: e.target.value,
                      }))
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.content_value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content_value: e.target.value,
                      }))
                    }
                    placeholder="#000000"
                    className="flex-1 font-mono"
                  />
                </div>
              ) : formData.content_type === "text" ? (
                <Textarea
                  value={formData.content_value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content_value: e.target.value,
                    }))
                  }
                  placeholder="কন্টেন্ট লিখুন..."
                  className="mt-1 font-bengali min-h-[120px]"
                />
              ) : (
                <Input
                  value={formData.content_value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content_value: e.target.value,
                    }))
                  }
                  placeholder={
                    formData.content_type === "image"
                      ? "https://example.com/image.jpg"
                      : formData.content_type === "link"
                      ? "https://example.com"
                      : "ভ্যালু লিখুন..."
                  }
                  className="mt-1"
                />
              )}
            </div>

            {/* Preview for image */}
            {formData.content_type === "image" && formData.content_value && (
              <div>
                <Label className="font-bengali">প্রিভিউ</Label>
                <img
                  src={formData.content_value}
                  alt="Preview"
                  className="mt-2 max-h-32 rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 font-bengali"
              >
                বাতিল
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 font-bengali"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                সেভ করুন
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali">
              ডিলিট করতে চান?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-bengali">
              এই কন্টেন্ট ডিলিট করলে ফিরিয়ে আনা যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700 font-bengali"
            >
              ডিলিট করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
