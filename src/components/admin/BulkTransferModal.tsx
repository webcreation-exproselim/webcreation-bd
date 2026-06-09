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
import { Search, Loader2, ArrowRight, User, Mail, Shield, Truck, ArrowRightLeft } from "lucide-react";

interface BulkTransferModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AdminUser {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
}

type Side = "source" | "target";

export function BulkTransferModal({ open, onClose, onSuccess }: BulkTransferModalProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [source, setSource] = useState<AdminUser | null>(null);
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [pickerOpen, setPickerOpen] = useState<Side | null>(null);
  const [search, setSearch] = useState("");
  const [merchants, setMerchants] = useState<any[]>([]);
  const [courierSubs, setCourierSubs] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const { toast } = useToast();

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSource(null); setTarget(null); setMerchants([]); setCourierSubs([]); setPickerOpen(null); setSearch("");
      return;
    }
    (async () => {
      setLoadingUsers(true);
      const { data, error } = await supabase.rpc("get_admin_users");
      if (error) toast({ title: "User list load failed", description: error.message, variant: "destructive" });
      else setUsers((data as any[]) || []);
      setLoadingUsers(false);
    })();
  }, [open]);

  // Load assets when source changes
  useEffect(() => {
    if (!source) { setMerchants([]); setCourierSubs([]); return; }
    (async () => {
      setLoadingAssets(true);
      const [m, c] = await Promise.all([
        supabase.from("merchants").select("id, website_url, current_plan, is_active, plan_expires_at").eq("user_id", source.user_id),
        supabase.from("courier_check_subscriptions").select("id, website_url, is_active, plan_expires_at").eq("user_id", source.user_id),
      ]);
      setMerchants(m.data || []);
      setCourierSubs(c.data || []);
      setLoadingAssets(false);
    })();
  }, [source]);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    const excludeId = pickerOpen === "source" ? target?.user_id : source?.user_id;
    const list = users.filter(u => u.user_id !== excludeId);
    if (!q) return list.slice(0, 50);
    return list.filter(u =>
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    ).slice(0, 50);
  }, [users, search, pickerOpen, source, target]);

  const totalCount = merchants.length + courierSubs.length;

  const handleBulkTransfer = async () => {
    if (!source || !target || totalCount === 0) return;
    setTransferring(true);
    let okM = 0, failM = 0, okC = 0, failC = 0;

    for (const m of merchants) {
      const { error } = await supabase
        .from("merchants")
        .update({ user_id: target.user_id, updated_at: new Date().toISOString() })
        .eq("id", m.id);
      if (error) failM++; else okM++;
    }
    for (const c of courierSubs) {
      const { error } = await supabase
        .from("courier_check_subscriptions")
        .update({ user_id: target.user_id, updated_at: new Date().toISOString() })
        .eq("id", c.id);
      if (error) failC++; else okC++;
    }

    setTransferring(false);
    const failTotal = failM + failC;
    toast({
      title: failTotal === 0 ? "✅ সব Transfer সফল" : "⚠️ আংশিক Transfer",
      description: `Fraud Guard: ${okM}/${merchants.length} · Courier Check: ${okC}/${courierSubs.length}${failTotal ? ` · ${failTotal} ব্যর্থ (domain conflict হতে পারে)` : ""}`,
      variant: failTotal === 0 ? "default" : "destructive",
    });
    onSuccess();
    if (failTotal === 0) onClose();
    else {
      // reload assets to show remaining
      const [m, c] = await Promise.all([
        supabase.from("merchants").select("id, website_url, current_plan, is_active, plan_expires_at").eq("user_id", source.user_id),
        supabase.from("courier_check_subscriptions").select("id, website_url, is_active, plan_expires_at").eq("user_id", source.user_id),
      ]);
      setMerchants(m.data || []);
      setCourierSubs(c.data || []);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bengali text-gray-900 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            Bulk Transfer (সব Subscription একসাথে)
          </DialogTitle>
          <DialogDescription className="font-bengali text-gray-600">
            একটি account-এর সব Fraud Guard + Courier Check subscription অন্য account-এ পাঠান
          </DialogDescription>
        </DialogHeader>

        {/* Source + Target */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <UserSlot label="থেকে (Source)" user={source} onPick={() => { setPickerOpen("source"); setSearch(""); }} />
          <ArrowRight className="w-6 h-6 text-blue-500 mx-auto" />
          <UserSlot label="এ (Target)" user={target} onPick={() => { setPickerOpen("target"); setSearch(""); }} />
        </div>

        {/* Assets preview */}
        {source && (
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
            <div className="text-sm font-medium text-gray-900 font-bengali">
              Transfer হবে ({totalCount}টি)
            </div>
            {loadingAssets ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
            ) : totalCount === 0 ? (
              <div className="text-sm text-gray-500 font-bengali">এই account-এ কোনো subscription নেই</div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {merchants.map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-sm bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-gray-700 truncate flex-1">{m.website_url || "—"}</span>
                    <span className="text-xs text-gray-500">{m.current_plan || "—"} {m.is_active ? "✓" : ""}</span>
                  </div>
                ))}
                {courierSubs.map(c => (
                  <div key={c.id} className="flex items-center gap-2 text-sm bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-gray-700 truncate flex-1">{c.website_url || "—"}</span>
                    <span className="text-xs text-gray-500">Courier {c.is_active ? "✓" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-bengali">
          ⚠️ Target user-এর কাছে একই domain থাকলে সেই item skip হবে।
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={transferring} className="flex-1">বাতিল</Button>
          <Button
            onClick={handleBulkTransfer}
            disabled={!source || !target || totalCount === 0 || transferring}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {transferring ? <Loader2 className="w-4 h-4 animate-spin" /> : `সব Transfer করুন (${totalCount})`}
          </Button>
        </div>

        {/* User picker */}
        <Dialog open={!!pickerOpen} onOpenChange={(v) => !v && setPickerOpen(null)}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="font-bengali text-gray-900">
                {pickerOpen === "source" ? "Source user বাছাই করুন" : "Target user বাছাই করুন"}
              </DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Email / নাম / ফোন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
                autoFocus
              />
            </div>
            <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-xl divide-y">
              {loadingUsers ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500 font-bengali">কোনো user নেই</div>
              ) : (
                filteredUsers.map(u => (
                  <button
                    key={u.user_id}
                    onClick={() => {
                      if (pickerOpen === "source") setSource(u);
                      else setTarget(u);
                      setPickerOpen(null);
                    }}
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
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

function UserSlot({ label, user, onPick }: { label: string; user: AdminUser | null; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="w-full text-left border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-3 bg-white transition-colors"
    >
      <div className="text-xs text-gray-500 font-bengali mb-1">{label}</div>
      {user ? (
        <>
          <div className="text-sm font-medium text-gray-900 truncate">{user.full_name || user.email}</div>
          <div className="text-xs text-gray-500 truncate">{user.email}</div>
        </>
      ) : (
        <div className="text-sm text-gray-400 font-bengali">User বাছাই করতে ক্লিক করুন</div>
      )}
    </button>
  );
}
