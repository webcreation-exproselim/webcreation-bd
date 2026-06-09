import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, Loader2, ArrowRight, User, Mail } from "lucide-react";

interface TransferMerchantModalProps {
  open: boolean;
  onClose: () => void;
  merchant: {
    id: string;
    user_id: string;
    website_url: string | null;
    profile?: { full_name: string | null; phone: string | null };
  } | null;
  onSuccess: () => void;
}

interface AdminUser {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
}

export function TransferMerchantModal({ open, onClose, merchant, onSuccess }: TransferMerchantModalProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedUser(null);
      setConfirming(false);
      return;
    }
    (async () => {
      setLoadingUsers(true);
      const { data, error } = await supabase.rpc("get_admin_users");
      if (error) {
        toast({ title: "User list load failed", description: error.message, variant: "destructive" });
      } else {
        setUsers((data as any[]) || []);
      }
      setLoadingUsers(false);
    })();
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = users.filter(u => u.user_id !== merchant?.user_id);
    if (!q) return list.slice(0, 30);
    return list.filter(u =>
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    ).slice(0, 30);
  }, [users, search, merchant?.user_id]);

  const handleTransfer = async () => {
    if (!merchant || !selectedUser) return;
    setTransferring(true);
    try {
      const { error } = await supabase
        .from("merchants")
        .update({ user_id: selectedUser.user_id, updated_at: new Date().toISOString() })
        .eq("id", merchant.id);

      if (error) {
        // Likely unique conflict (user_id, lower(website_url))
        if (error.code === "23505") {
          toast({
            title: "Transfer ব্যর্থ",
            description: "এই user-এর কাছে একই domain-এর merchant ইতিমধ্যে আছে।",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({ title: "✅ Transfer সম্পন্ন", description: `Merchant ${selectedUser.email || selectedUser.full_name}-এ স্থানান্তর হয়েছে` });
      onSuccess();
      onClose();
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Transfer failed", variant: "destructive" });
    } finally {
      setTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="font-bengali text-gray-900">Merchant Transfer করুন</DialogTitle>
          <DialogDescription className="font-bengali text-gray-600">
            Fraud Guard subscription + domain অন্য account-এ স্থানান্তর করুন
          </DialogDescription>
        </DialogHeader>

        {merchant && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
            <div className="text-gray-600 font-bengali">বর্তমান মালিক:</div>
            <div className="font-medium text-gray-900">{merchant.profile?.full_name || "—"} · {merchant.profile?.phone || "—"}</div>
            <div className="text-xs text-gray-500 mt-1">Domain: {merchant.website_url || "—"}</div>
          </div>
        )}

        {!confirming ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Email / নাম / ফোন দিয়ে user খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>

            <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-xl divide-y">
              {loadingUsers ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
              ) : filtered.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500 font-bengali">কোনো user পাওয়া যায়নি</div>
              ) : (
                filtered.map(u => (
                  <button
                    key={u.user_id}
                    onClick={() => { setSelectedUser(u); setConfirming(true); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{u.full_name || "নাম নেই"}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3" /> {u.email || "—"} {u.phone ? `· ${u.phone}` : ""}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <p className="text-amber-900 font-bengali font-medium mb-2">⚠️ নিশ্চিত করুন</p>
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-xs text-gray-500 font-bengali">থেকে</div>
                  <div className="font-medium text-gray-900">{merchant?.profile?.full_name || "—"}</div>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="text-xs text-gray-500 font-bengali">এ</div>
                  <div className="font-medium text-gray-900">{selectedUser?.full_name || selectedUser?.email}</div>
                  <div className="text-xs text-gray-500">{selectedUser?.email}</div>
                </div>
              </div>
              <p className="text-xs text-amber-700 mt-3 font-bengali">
                Subscription, API key, domain, plan সবকিছু নতুন account-এ চলে যাবে। পুরাতন account-এ আর access থাকবে না।
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setConfirming(false)} disabled={transferring} className="flex-1">
                ফিরে যান
              </Button>
              <Button onClick={handleTransfer} disabled={transferring} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {transferring ? <Loader2 className="w-4 h-4 animate-spin" /> : "Transfer করুন"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
