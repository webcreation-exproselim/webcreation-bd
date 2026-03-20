import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, DollarSign, Trash2, Edit2, X, Check, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DollarTransaction {
  id: string;
  client_name: string;
  client_user_id: string | null;
  dollar_amount: number;
  rate_per_dollar: number;
  total_bdt: number;
  duration_days: number;
  transaction_date: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
}

const emptyForm = {
  client_name: "",
  client_user_id: null as string | null,
  dollar_amount: "",
  rate_per_dollar: "",
  duration_days: "",
  transaction_date: new Date(),
  payment_status: "unpaid",
  notes: "",
};

export function DollarTracker() {
  const [transactions, setTransactions] = useState<DollarTransaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [useExistingClient, setUseExistingClient] = useState(false);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("dollar_transactions")
      .select("*")
      .order("transaction_date", { ascending: false });
    if (data) setTransactions(data as unknown as DollarTransaction[]);
    if (error) console.error(error);
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.rpc("get_admin_users");
    if (data) setProfiles(data.map((u: any) => ({ user_id: u.user_id, full_name: u.full_name, phone: u.phone })));
  };

  useEffect(() => {
    fetchTransactions();
    fetchProfiles();
  }, []);

  const totalBdt = Number(form.dollar_amount || 0) * Number(form.rate_per_dollar || 0);

  const handleSave = async () => {
    if (!form.client_name.trim() || !form.dollar_amount || !form.rate_per_dollar) {
      toast({ title: "সব তথ্য পূরণ করুন", variant: "destructive" });
      return;
    }

    const payload = {
      client_name: form.client_name.trim(),
      client_user_id: form.client_user_id,
      dollar_amount: Number(form.dollar_amount),
      rate_per_dollar: Number(form.rate_per_dollar),
      total_bdt: totalBdt,
      duration_days: Number(form.duration_days) || 0,
      transaction_date: form.transaction_date.toISOString(),
      payment_status: form.payment_status,
      notes: form.notes || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("dollar_transactions")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        toast({ title: "আপডেট ব্যর্থ", variant: "destructive" });
        return;
      }
      toast({ title: "আপডেট সফল হয়েছে" });
    } else {
      const { error } = await supabase
        .from("dollar_transactions")
        .insert(payload);
      if (error) {
        toast({ title: "সেভ ব্যর্থ", variant: "destructive" });
        return;
      }
      toast({ title: "ডলার এন্ট্রি সেভ হয়েছে" });
    }

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchTransactions();
  };

  const handleEdit = (t: DollarTransaction) => {
    setForm({
      client_name: t.client_name,
      client_user_id: t.client_user_id,
      dollar_amount: String(t.dollar_amount),
      rate_per_dollar: String(t.rate_per_dollar),
      duration_days: String(t.duration_days),
      transaction_date: new Date(t.transaction_date),
      payment_status: t.payment_status,
      notes: t.notes || "",
    });
    setEditingId(t.id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("dollar_transactions").delete().eq("id", deleteId);
    toast({ title: "মুছে ফেলা হয়েছে" });
    setDeleteId(null);
    fetchTransactions();
  };

  const toggleStatus = async (t: DollarTransaction) => {
    const newStatus = t.payment_status === "paid" ? "unpaid" : "paid";
    await supabase.from("dollar_transactions").update({ payment_status: newStatus }).eq("id", t.id);
    fetchTransactions();
  };

  const filteredTransactions = transactions.filter(t =>
    t.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProfiles = profiles.filter(p =>
    (p.full_name || "").toLowerCase().includes(clientSearch.toLowerCase()) ||
    (p.phone || "").includes(clientSearch)
  );

  const summary = {
    totalDollars: transactions.reduce((s, t) => s + Number(t.dollar_amount), 0),
    totalBdt: transactions.reduce((s, t) => s + Number(t.total_bdt), 0),
    paid: transactions.filter(t => t.payment_status === "paid").reduce((s, t) => s + Number(t.total_bdt), 0),
    unpaid: transactions.filter(t => t.payment_status === "unpaid").reduce((s, t) => s + Number(t.total_bdt), 0),
    unpaidDollars: transactions.filter(t => t.payment_status === "unpaid").reduce((s, t) => s + Number(t.dollar_amount), 0),
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "মোট ডলার দিয়েছি", value: `$${summary.totalDollars.toLocaleString()}`, gradient: "from-green-500 to-emerald-500" },
          { label: "মোট পাওনা (৳)", value: `৳${summary.totalBdt.toLocaleString()}`, gradient: "from-blue-500 to-indigo-500" },
          { label: "আদায় হয়েছে", value: `৳${summary.paid.toLocaleString()}`, gradient: "from-emerald-500 to-teal-500" },
          { label: "বাকি আছে (৳)", value: `৳${summary.unpaid.toLocaleString()}`, gradient: "from-red-500 to-orange-500" },
          { label: "বাকি ডলার", value: `$${summary.unpaidDollars.toLocaleString()}`, gradient: "from-amber-500 to-orange-500" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${card.gradient} shadow-lg`}
          >
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/10 -mr-4 -mt-4" />
            <p className="text-xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-white/70 font-bengali">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ক্লায়েন্ট সার্চ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 font-bengali"
          />
        </div>
        <Button
          onClick={() => { setForm(emptyForm); setEditingId(null); setUseExistingClient(false); setShowModal(true); }}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bengali"
        >
          <Plus className="w-4 h-4 mr-2" />
          নতুন এন্ট্রি
        </Button>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 font-bengali">লোড হচ্ছে...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-bengali">কোনো ডলার এন্ট্রি নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{t.client_name}</h3>
                    <button
                      onClick={() => toggleStatus(t)}
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                        t.payment_status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {t.payment_status === "paid" ? "পেইড ✓" : "বাকি"}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span>দিয়েছি: ${Number(t.dollar_amount).toLocaleString()}</span>
                    <span>রেট: ৳{Number(t.rate_per_dollar)}/$</span>
                    <span className="font-semibold text-gray-700">পাওনা: ৳{Number(t.total_bdt).toLocaleString()}</span>
                    {t.duration_days > 0 && <span>{t.duration_days} দিনের জন্য</span>}
                    <span>{format(new Date(t.transaction_date), "dd MMM yyyy")}</span>
                  </div>
                  {t.notes && <p className="text-xs text-gray-400 mt-1 truncate">{t.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleEdit(t)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(t.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="font-bengali">{editingId ? "এডিট করুন" : "নতুন ডলার এন্ট্রি"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Client selection toggle */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setUseExistingClient(false)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-bengali transition-all", !useExistingClient ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500")}
              >
                ম্যানুয়াল নাম
              </button>
              <button
                onClick={() => setUseExistingClient(true)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-bengali transition-all", useExistingClient ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500")}
              >
                ক্লায়েন্ট সিলেক্ট
              </button>
            </div>

            {useExistingClient ? (
              <div>
                <Label className="font-bengali text-gray-700">ক্লায়েন্ট সিলেক্ট</Label>
                <Input
                  placeholder="নাম বা ফোন দিয়ে সার্চ..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="mt-1 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
                {clientSearch && (
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg mt-1 bg-white">
                    {filteredProfiles.map(p => (
                      <button
                        key={p.user_id}
                        onClick={() => {
                          setForm({ ...form, client_name: p.full_name || "Unknown", client_user_id: p.user_id });
                          setClientSearch("");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0"
                      >
                        <span className="text-gray-900">{p.full_name || "N/A"}</span>
                        {p.phone && <span className="text-gray-400 ml-2">{p.phone}</span>}
                      </button>
                    ))}
                    {filteredProfiles.length === 0 && (
                      <p className="text-xs text-gray-400 p-2 font-bengali">কোনো ক্লায়েন্ট পাওয়া যায়নি</p>
                    )}
                  </div>
                )}
                {form.client_name && (
                  <p className="text-sm text-green-600 mt-1 font-bengali">সিলেক্টেড: {form.client_name}</p>
                )}
              </div>
            ) : (
              <div>
                <Label className="font-bengali text-gray-700">ক্লায়েন্ট নাম</Label>
                <Input
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value, client_user_id: null })}
                  placeholder="নাম লিখুন"
                  className="mt-1 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-bengali text-gray-700">কত ডলার দিয়েছেন</Label>
                <Input
                  type="number"
                  value={form.dollar_amount}
                  onChange={(e) => setForm({ ...form, dollar_amount: e.target.value })}
                  placeholder="$"
                  className="mt-1 bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <Label className="font-bengali text-gray-700">প্রতি ডলার কত টাকা</Label>
                <Input
                  type="number"
                  value={form.rate_per_dollar}
                  onChange={(e) => setForm({ ...form, rate_per_dollar: e.target.value })}
                  placeholder="৳"
                  className="mt-1 bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
            </div>

            {/* Auto-calculated total */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
              <p className="text-xs text-green-600 font-bengali">ক্লায়েন্টের পাওনা (অটো ক্যালকুলেটেড)</p>
              <p className="text-xl font-bold text-green-700">৳{totalBdt.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-bengali text-gray-700">কত দিনের জন্য</Label>
                <Input
                  type="number"
                  value={form.duration_days}
                  onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                  placeholder="দিন"
                  className="mt-1 bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <Label className="font-bengali text-gray-700">পেমেন্ট স্ট্যাটাস</Label>
                <Select value={form.payment_status} onValueChange={(v) => setForm({ ...form, payment_status: v })}>
                  <SelectTrigger className="mt-1 bg-gray-50 border-gray-200 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">বাকি</SelectItem>
                    <SelectItem value="paid">পেইড</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="font-bengali text-gray-700">তারিখ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full mt-1 justify-start text-left font-normal bg-gray-50 border-gray-200 text-gray-900", !form.transaction_date && "text-gray-400")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.transaction_date ? format(form.transaction_date, "dd MMM yyyy") : "তারিখ বাছুন"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.transaction_date}
                    onSelect={(d) => d && setForm({ ...form, transaction_date: d })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="font-bengali text-gray-700">নোট (ঐচ্ছিক)</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="যেকোনো নোট..."
                className="mt-1 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                rows={2}
              />
            </div>

            <Button onClick={handleSave} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bengali">
              {editingId ? "আপডেট করুন" : "সেভ করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white text-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali">মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="font-bengali">এই এন্ট্রি মুছে ফেলা হবে। এটি আর ফেরানো যাবে না।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 font-bengali">মুছুন</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
