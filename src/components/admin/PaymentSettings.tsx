import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, Plus, Edit2, Trash2, Check, X, 
  Smartphone, Building2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentSetting {
  id: string;
  method: string;
  account_number: string;
  account_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const methodLabels: Record<string, { label: string; icon: any; color: string }> = {
  bkash: { label: "বিকাশ", icon: Smartphone, color: "bg-pink-500" },
  nagad: { label: "নগদ", icon: Smartphone, color: "bg-orange-500" },
  rocket: { label: "রকেট", icon: Smartphone, color: "bg-purple-500" },
  bank: { label: "ব্যাংক ট্রান্সফার", icon: Building2, color: "bg-blue-500" },
};

export function PaymentSettings() {
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<PaymentSetting | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    method: "bkash",
    account_number: "",
    account_name: "",
    is_active: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payment_settings")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (!error && data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingSetting(null);
    setForm({
      method: "bkash",
      account_number: "",
      account_name: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (setting: PaymentSetting) => {
    setEditingSetting(setting);
    setForm({
      method: setting.method,
      account_number: setting.account_number,
      account_name: setting.account_name || "",
      is_active: setting.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const saveSetting = async () => {
    if (!form.account_number.trim()) {
      toast({ title: "অ্যাকাউন্ট নম্বর দিন", variant: "destructive" });
      return;
    }

    if (editingSetting) {
      // Update
      const { error } = await supabase
        .from("payment_settings")
        .update({
          method: form.method,
          account_number: form.account_number.trim(),
          account_name: form.account_name.trim() || null,
          is_active: form.is_active,
        })
        .eq("id", editingSetting.id);

      if (!error) {
        toast({ title: "পেমেন্ট সেটিংস আপডেট হয়েছে" });
        setIsModalOpen(false);
        fetchSettings();
      } else {
        toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
      }
    } else {
      // Create
      const { error } = await supabase
        .from("payment_settings")
        .insert({
          method: form.method,
          account_number: form.account_number.trim(),
          account_name: form.account_name.trim() || null,
          is_active: form.is_active,
        });

      if (!error) {
        toast({ title: "পেমেন্ট সেটিংস যোগ হয়েছে" });
        setIsModalOpen(false);
        fetchSettings();
      } else {
        toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
      }
    }
  };

  const deleteSetting = async (id: string) => {
    const { error } = await supabase
      .from("payment_settings")
      .delete()
      .eq("id", id);

    if (!error) {
      toast({ title: "পেমেন্ট সেটিংস ডিলিট হয়েছে" });
      setDeleteConfirm(null);
      fetchSettings();
    } else {
      toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("payment_settings")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (!error) {
      toast({ title: isActive ? "নিষ্ক্রিয় করা হয়েছে" : "সক্রিয় করা হয়েছে" });
      fetchSettings();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bengali font-bold text-gray-900">পেমেন্ট সেটিংস</h2>
          <p className="text-sm text-gray-500">পেমেন্ট মেথড ম্যানেজ করুন</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 font-bengali shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          নতুন যোগ করুন
        </Button>
      </div>

      {/* Settings List */}
      <div className="grid gap-4">
        {settings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bengali">কোনো পেমেন্ট মেথড নেই</p>
            <Button
              onClick={openAddModal}
              variant="outline"
              className="mt-4 font-bengali"
            >
              প্রথম মেথড যোগ করুন
            </Button>
          </div>
        ) : (
          settings.map((setting, index) => {
            const methodInfo = methodLabels[setting.method] || {
              label: setting.method,
              icon: CreditCard,
              color: "bg-gray-500",
            };
            const Icon = methodInfo.icon;

            return (
              <motion.div
                key={setting.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 ${
                  setting.is_active ? "border-gray-100" : "border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${methodInfo.color} rounded-xl flex items-center justify-center text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bengali font-semibold text-gray-900">
                          {methodInfo.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          setting.is_active 
                            ? "bg-green-100 text-green-600" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {setting.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-mono">{setting.account_number}</p>
                      {setting.account_name && (
                        <p className="text-xs text-gray-400">{setting.account_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={setting.is_active ?? true}
                      onCheckedChange={() => toggleActive(setting.id, setting.is_active ?? true)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(setting)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(setting.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">
              {editingSetting ? "পেমেন্ট মেথড এডিট করুন" : "নতুন পেমেন্ট মেথড যোগ করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="font-bengali">পেমেন্ট মেথড</Label>
              <Select
                value={form.method}
                onValueChange={(val) => setForm((prev) => ({ ...prev, method: val }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bkash" className="font-bengali">বিকাশ</SelectItem>
                  <SelectItem value="nagad" className="font-bengali">নগদ</SelectItem>
                  <SelectItem value="rocket" className="font-bengali">রকেট</SelectItem>
                  <SelectItem value="bank" className="font-bengali">ব্যাংক ট্রান্সফার</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-bengali">অ্যাকাউন্ট নম্বর *</Label>
              <Input
                placeholder={form.method === "bank" ? "অ্যাকাউন্ট নম্বর" : "01XXXXXXXXX"}
                value={form.account_number}
                onChange={(e) => setForm((prev) => ({ ...prev, account_number: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="font-bengali">অ্যাকাউন্টধারীর নাম (ঐচ্ছিক)</Label>
              <Input
                placeholder="নাম"
                value={form.account_name}
                onChange={(e) => setForm((prev) => ({ ...prev, account_name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label className="font-bengali">সক্রিয় রাখুন</Label>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
              />
            </div>

            <Button
              onClick={saveSetting}
              className="w-full bg-red-600 hover:bg-red-700 font-bengali"
            >
              {editingSetting ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali">পেমেন্ট মেথড ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription className="font-bengali">
              এই পেমেন্ট মেথডটি স্থায়ীভাবে ডিলিট হয়ে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteSetting(deleteConfirm)}
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
