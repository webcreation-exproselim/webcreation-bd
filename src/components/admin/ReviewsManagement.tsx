import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Loader2,
  Upload,
  X,
  Eye,
  EyeOff,
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  name: string;
  photo: string | null;
  rating: number;
  service: string;
  review: string;
  service_gradient: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const serviceOptions = [
  { value: "ওয়েব ডেভেলপমেন্ট", gradient: "from-green-500 to-emerald-400" },
  { value: "গ্রাফিক্স ডিজাইন", gradient: "from-purple-500 to-pink-400" },
  { value: "ল্যান্ডিং পেজ", gradient: "from-blue-500 to-cyan-400" },
  { value: "ভিডিও এডিটিং", gradient: "from-red-500 to-orange-400" },
  { value: "মোশন গ্রাফিক্স", gradient: "from-yellow-500 to-amber-400" },
  { value: "ফেসবুক অ্যাডস", gradient: "from-indigo-500 to-blue-400" },
];

export const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    photo: "",
    rating: 5,
    service: "ওয়েব ডেভেলপমেন্ট",
    review: "",
    is_active: true,
    display_order: 0,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingReview(null);
    setFormData({
      name: "",
      photo: "",
      rating: 5,
      service: "ওয়েব ডেভেলপমেন্ট",
      review: "",
      is_active: true,
      display_order: reviews.length,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setFormData({
      name: review.name,
      photo: review.photo || "",
      rating: review.rating,
      service: review.service,
      review: review.review,
      is_active: review.is_active,
      display_order: review.display_order,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.review.trim()) {
      toast({ title: "নাম ও রিভিউ আবশ্যক", variant: "destructive" });
      return;
    }

    setSaving(true);
    const serviceGradient =
      serviceOptions.find((s) => s.value === formData.service)?.gradient ||
      "from-yellow-500 to-amber-400";

    try {
      if (editingReview) {
        const { error } = await supabase
          .from("customer_reviews")
          .update({
            name: formData.name,
            photo: formData.photo || null,
            rating: formData.rating,
            service: formData.service,
            review: formData.review,
            service_gradient: serviceGradient,
            is_active: formData.is_active,
            display_order: formData.display_order,
          })
          .eq("id", editingReview.id);

        if (error) throw error;
        toast({ title: "রিভিউ আপডেট হয়েছে" });
      } else {
        const { error } = await supabase.from("customer_reviews").insert({
          name: formData.name,
          photo: formData.photo || null,
          rating: formData.rating,
          service: formData.service,
          review: formData.review,
          service_gradient: serviceGradient,
          is_active: formData.is_active,
          display_order: formData.display_order,
        });

        if (error) throw error;
        toast({ title: "রিভিউ যোগ হয়েছে" });
      }

      setIsModalOpen(false);
      fetchReviews();
    } catch (error) {
      console.error(error);
      toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("customer_reviews")
      .delete()
      .eq("id", id);

    if (!error) {
      toast({ title: "রিভিউ ডিলিট হয়েছে" });
      fetchReviews();
    } else {
      toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    }
    setDeleteConfirm(null);
  };

  const toggleActive = async (review: Review) => {
    const { error } = await supabase
      .from("customer_reviews")
      .update({ is_active: !review.is_active })
      .eq("id", review.id);

    if (!error) {
      toast({
        title: review.is_active ? "নিষ্ক্রিয় করা হয়েছে" : "সক্রিয় করা হয়েছে",
      });
      fetchReviews();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-bengali font-bold text-xl text-gray-900">
          কাস্টমার রিভিউ ({reviews.length})
        </h2>
        <Button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 font-bengali shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          নতুন রিভিউ যোগ করুন
        </Button>
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Star className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-bengali">কোনো রিভিউ নেই</p>
          <Button onClick={openAddModal} className="mt-4 font-bengali">
            প্রথম রিভিউ যোগ করুন
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`bg-white rounded-2xl border p-5 transition-all duration-300 group ${
                review.is_active
                  ? "border-gray-100 hover:shadow-lg hover:shadow-gray-100/50"
                  : "border-red-200 bg-red-50/30 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {review.photo ? (
                    <img
                      src={review.photo}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400/50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center text-white font-bold">
                      {review.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bengali font-semibold text-gray-900 text-sm">
                      {review.name}
                    </h4>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full bg-gradient-to-r ${
                        review.service_gradient || "from-yellow-500 to-amber-400"
                      } text-white`}
                    >
                      {review.service}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-600 text-sm line-clamp-3 font-bengali mb-4">
                "{review.review}"
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  onClick={() => toggleActive(review)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                    review.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {review.is_active ? (
                    <>
                      <Eye className="w-3 h-3" />
                      সক্রিয়
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      নিষ্ক্রিয়
                    </>
                  )}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(review)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(review.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bengali">
              {editingReview ? "রিভিউ এডিট করুন" : "নতুন রিভিউ যোগ করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="font-bengali">নাম *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="কাস্টমারের নাম"
                className="font-bengali"
              />
            </div>

            <div>
              <Label className="font-bengali">ছবির URL</Label>
              <Input
                value={formData.photo}
                onChange={(e) =>
                  setFormData({ ...formData, photo: e.target.value })
                }
                placeholder="https://example.com/photo.jpg"
              />
              {formData.photo && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-xs text-gray-500">প্রিভিউ</span>
                </div>
              )}
            </div>

            <div>
              <Label className="font-bengali">সার্ভিস *</Label>
              <Select
                value={formData.service}
                onValueChange={(v) => setFormData({ ...formData, service: v })}
              >
                <SelectTrigger className="font-bengali">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="font-bengali">
                      {opt.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-bengali">রেটিং *</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setFormData({ ...formData, rating: num })}
                    className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        num <= formData.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="font-bengali">রিভিউ *</Label>
              <Textarea
                value={formData.review}
                onChange={(e) =>
                  setFormData({ ...formData, review: e.target.value })
                }
                placeholder="কাস্টমারের মতামত লিখুন..."
                className="font-bengali min-h-[100px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="font-bengali cursor-pointer">
                সক্রিয় (হোমপেজে দেখাবে)
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
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
                ) : null}
                {editingReview ? "আপডেট করুন" : "যোগ করুন"}
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
              রিভিউ ডিলিট করতে চান?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-bengali">
              এই রিভিউ স্থায়ীভাবে মুছে যাবে। এটি পূর্বাবস্থায় ফেরানো যাবে না।
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
};
