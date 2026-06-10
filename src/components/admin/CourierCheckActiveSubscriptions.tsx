import { useState, useEffect } from "react";
import { Loader2, RefreshCw, Calendar, Globe, User, Plus, AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubRow {
  id: string;
  user_id: string;
  api_key: string;
  is_active: boolean;
  plan_expires_at: string | null;
  website_url: string | null;
  store_name: string | null;
  requests_used: number;
  max_requests: number;
  full_name?: string | null;
  phone?: string | null;
}

const EXTEND_OPTIONS = [
  { label: "+1 মাস", days: 30 },
  { label: "+3 মাস", days: 90 },
  { label: "+6 মাস", days: 180 },
  { label: "+1 বছর", days: 365 },
];

export function CourierCheckActiveSubscriptions() {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const { toast } = useToast();

  const fetchSubs = async () => {
    setLoading(true);
    const { data: subsData, error } = await supabase
      .from("courier_check_subscriptions")
      .select("*")
      .order("plan_expires_at", { ascending: true, nullsFirst: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Fetch profiles for these user_ids
    const userIds = Array.from(new Set((subsData || []).map((s: any) => s.user_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, phone")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    const merged: SubRow[] = (subsData || []).map((s: any) => ({
      ...s,
      full_name: profileMap.get(s.user_id)?.full_name ?? null,
      phone: profileMap.get(s.user_id)?.phone ?? null,
    }));

    setSubs(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const extendSub = async (sub: SubRow, days: number) => {
    setProcessing(sub.id);
    try {
      const now = new Date();
      // If currently active and in future, extend from expiry. Otherwise extend from now.
      const baseDate =
        sub.plan_expires_at && new Date(sub.plan_expires_at) > now
          ? new Date(sub.plan_expires_at)
          : now;
      const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from("courier_check_subscriptions")
        .update({
          is_active: true,
          plan_expires_at: newExpiry.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", sub.id);

      if (error) throw error;

      toast({
        title: "✅ Extended",
        description: `নতুন মেয়াদ: ${newExpiry.toLocaleDateString("bn-BD")}`,
      });
      fetchSubs();
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Extend করা যায়নি", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const isExpired = (sub: SubRow) =>
    !sub.plan_expires_at || new Date(sub.plan_expires_at) <= new Date();

  const filtered = subs.filter((s) => {
    if (filter === "active" && isExpired(s)) return false;
    if (filter === "expired" && !isExpired(s)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.full_name || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q) ||
      (s.website_url || "").toLowerCase().includes(q) ||
      (s.store_name || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-bengali">
            Courier Check Subscriptions Manage
          </h3>
          <p className="text-sm text-gray-500 font-bengali">
            Active / Expired subscription গুলোর time বাড়ান
          </p>
        </div>
        <Button
          onClick={fetchSubs}
          variant="outline"
          size="sm"
          className="border-gray-200 text-gray-700 hover:bg-gray-100"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম / ডোমেইন / ফোন দিয়ে খুঁজুন..."
            className="pl-9 bg-white border-gray-200 text-gray-900"
          />
        </div>
        {(["all", "active", "expired"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className={
              filter === f
                ? "bg-cyan-600 hover:bg-cyan-700 text-white capitalize"
                : "border-gray-200 text-gray-700 hover:bg-gray-100 capitalize"
            }
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "সব" : f === "active" ? "Active" : "Expired"}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 font-bengali">
          কোনো subscription পাওয়া যায়নি
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const expired = isExpired(s);
            return (
              <div
                key={s.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900 truncate">
                        {s.full_name || "Unnamed User"}
                      </span>
                      {s.phone && (
                        <span className="text-xs text-gray-500 font-mono">{s.phone}</span>
                      )}
                      {expired ? (
                        <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Expired
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-0.5">
                      {s.website_url && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{s.website_url}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        মেয়াদ:{" "}
                        <span className={expired ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>
                          {s.plan_expires_at
                            ? new Date(s.plan_expires_at).toLocaleDateString("bn-BD")
                            : "—"}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({s.requests_used}/{s.max_requests})
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {EXTEND_OPTIONS.map((opt) => (
                      <Button
                        key={opt.days}
                        size="sm"
                        variant="outline"
                        disabled={processing === s.id}
                        onClick={() => extendSub(s, opt.days)}
                        className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 font-bengali"
                      >
                        {processing === s.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 mr-0.5" />
                            {opt.label}
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
