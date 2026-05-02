import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  CheckCircle2,
  Plus,
  Sparkles,
  Layers,
  Shield,
  Clock,
  AlertTriangle,
  Settings as SettingsIcon,
  Crown,
  Zap,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionPlans } from "@/components/fraud-protection/SubscriptionPlans";
import { SubscriptionPurchaseModal } from "@/components/fraud-protection/SubscriptionPurchaseModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MerchantLite {
  id: string;
  store_name: string | null;
  website_url: string | null;
  is_active: boolean;
  current_plan: string | null;
  plan_expires_at: string | null;
}

interface MultiStoreManagerProps {
  merchants: MerchantLite[];
  selectedMerchantId: string | null;
  onSelectMerchant: (id: string) => void;
  onMerchantsChanged: () => void;
  userId: string;
}

export function getStoreLabel(m: MerchantLite, idx: number): string {
  if (m.store_name) return m.store_name;
  if (m.website_url) {
    try {
      return new URL(
        m.website_url.startsWith("http") ? m.website_url : `https://${m.website_url}`
      ).hostname.replace(/^www\./, "");
    } catch {
      return m.website_url;
    }
  }
  return `Site ${idx + 1}`;
}

function getCleanDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function MultiStoreManager({
  merchants,
  selectedMerchantId,
  onSelectMerchant,
  onMerchantsChanged,
  userId,
}: MultiStoreManagerProps) {
  const { toast } = useToast();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");
  const [newMerchantId, setNewMerchantId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const activeCount = merchants.filter((m) => m.is_active).length;
  const inactiveCount = merchants.length - activeCount;

  const handleAddNewSite = async () => {
    setCreating(true);
    try {
      const { data: newMerchant, error } = await supabase
        .from("merchants")
        .insert({ user_id: userId })
        .select("id")
        .single();

      if (error || !newMerchant) {
        toast({
          title: "Error",
          description: "নতুন Site তৈরি করা যায়নি",
          variant: "destructive",
        });
        return;
      }

      setNewMerchantId(newMerchant.id);
      onMerchantsChanged();
      setShowPlanModal(true);
    } finally {
      setCreating(false);
    }
  };

  const handleSelectPlan = (planType: "monthly" | "yearly") => {
    setSelectedPlan(planType);
    setShowPlanModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setNewMerchantId(null);
    onMerchantsChanged();
    toast({
      title: "✅ Subscription Order সাবমিট হয়েছে",
      description: "Admin approval এর পর নতুন Site activate হবে",
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ============ HEADER ============ */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-5 py-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white rounded-full translate-y-1/2" />
          </div>

          <div className="relative flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-bengali">আপনার Sites</h3>
                <p className="text-xs text-white/80 font-bengali">
                  সবগুলো Site একসাথে manage করুন
                </p>
              </div>
            </div>
            <Button
              onClick={handleAddNewSite}
              disabled={creating}
              size="sm"
              className="bg-white text-blue-700 hover:bg-white/95 gap-2 rounded-xl font-bengali font-bold shadow-lg px-4"
            >
              <Plus className="w-4 h-4" />
              নতুন Site যোগ করুন
            </Button>
          </div>

          {/* Stats Row */}
          <div className="relative grid grid-cols-3 gap-2 mt-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] text-white/80 font-bengali uppercase tracking-wide">মোট Site</span>
              </div>
              <p className="text-xl font-bold text-white mt-0.5">{merchants.length}</p>
            </div>
            <div className="bg-emerald-500/30 backdrop-blur-sm rounded-xl px-3 py-2 border border-emerald-300/40">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-100" />
                <span className="text-[10px] text-white/90 font-bengali uppercase tracking-wide">Active</span>
              </div>
              <p className="text-xl font-bold text-white mt-0.5">{activeCount}</p>
            </div>
            <div className="bg-amber-500/30 backdrop-blur-sm rounded-xl px-3 py-2 border border-amber-300/40">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-100" />
                <span className="text-[10px] text-white/90 font-bengali uppercase tracking-wide">অপেক্ষায়</span>
              </div>
              <p className="text-xl font-bold text-white mt-0.5">{inactiveCount}</p>
            </div>
          </div>
        </div>

        {/* ============ HELP ACCORDION ============ */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between gap-2 px-5 py-3 bg-blue-50 border-b border-blue-100 hover:bg-blue-100/70 transition"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900 font-bengali">
              কিভাবে কাজ করে? (পড়ুন)
            </span>
          </div>
          <span className={`text-blue-600 transition-transform ${showHelp ? "rotate-180" : ""}`}>▼</span>
        </button>

        {showHelp && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="bg-blue-50/50 border-b border-blue-100 px-5 py-4 space-y-3"
          >
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <p className="text-sm font-semibold text-gray-900 font-bengali">নতুন Site যোগ করুন</p>
                <p className="text-xs text-gray-600 font-bengali">উপরের নীল বাটনে ক্লিক করে Plan কিনুন</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <p className="text-sm font-semibold text-gray-900 font-bengali">Site নির্বাচন করুন</p>
                <p className="text-xs text-gray-600 font-bengali">নিচের list থেকে যেকোনো Site এ ক্লিক করুন - সেটা Active হবে</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <p className="text-sm font-semibold text-gray-900 font-bengali">Settings ও Plugin Setup</p>
                <p className="text-xs text-gray-600 font-bengali">নির্বাচিত Site এর Domain, API Key ও Plugin install করুন</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">!</div>
              <div>
                <p className="text-sm font-semibold text-amber-900 font-bengali">গুরুত্বপূর্ণ নিয়ম</p>
                <p className="text-xs text-amber-800 font-bengali">
                  ১টি Subscription = ১টি Domain. একই Plan দিয়ে একাধিক Site protect করা যাবে না।
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============ SITES LIST ============ */}
        <div className="p-4 space-y-3 bg-gray-50/50">
          {merchants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-3">
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-base font-bold text-gray-900 font-bengali mb-1">কোনো Site যোগ করা নেই</p>
              <p className="text-xs text-gray-500 font-bengali mb-4">প্রথম Site যোগ করে শুরু করুন</p>
              <Button onClick={handleAddNewSite} disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white font-bengali rounded-xl gap-2">
                <Plus className="w-4 h-4" />
                প্রথম Site যোগ করুন
              </Button>
            </div>
          ) : (
            merchants.map((m, idx) => {
              const isSelected = m.id === selectedMerchantId;
              const label = getStoreLabel(m, idx);
              const cleanDomain = getCleanDomain(m.website_url);
              const hasUrl = !!m.website_url;
              const hasName = !!m.store_name;
              const isFullyConfigured = hasUrl && hasName;
              const expiresAt = m.plan_expires_at ? new Date(m.plan_expires_at) : null;
              const daysLeft = expiresAt
                ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              // Days left progress (out of 30 for monthly, 365 for yearly visual)
              const totalDays = m.current_plan === "yearly" ? 365 : 30;
              const progressPct = daysLeft && daysLeft > 0 ? Math.min(100, (daysLeft / totalDays) * 100) : 0;
              const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <button
                    onClick={() => onSelectMerchant(m.id)}
                    className={`w-full text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                      isSelected
                        ? "border-blue-500 bg-white shadow-lg ring-4 ring-blue-100"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    {/* Top section */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Site number badge + status */}
                        <div className="flex-shrink-0 relative">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base ${
                              m.is_active
                                ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md"
                                : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500"
                            }`}
                          >
                            {m.is_active ? <Shield className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-700">
                            {idx + 1}
                          </div>
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-base font-bold text-gray-900 truncate">{label}</p>
                            {isSelected && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-md">
                                ✓ নির্বাচিত
                              </span>
                            )}
                          </div>

                          {/* Domain row */}
                          {hasUrl ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                              <Globe className="w-3 h-3 text-blue-500 flex-shrink-0" />
                              <span className="truncate font-medium">{cleanDomain}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-amber-700 mb-2 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                              <span className="font-bengali font-medium">Domain যোগ করা হয়নি - Settings এ যান</span>
                            </div>
                          )}

                          {/* Status badges row */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {m.is_active ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200 font-bengali">
                                <Clock className="w-3 h-3" />
                                Inactive
                              </span>
                            )}

                            {m.current_plan && (
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md border ${
                                  m.current_plan === "yearly"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {m.current_plan === "yearly" ? (
                                  <Crown className="w-3 h-3" />
                                ) : (
                                  <Zap className="w-3 h-3" />
                                )}
                                {m.current_plan === "yearly" ? "Yearly" : "Monthly"}
                              </span>
                            )}

                            {!m.is_active && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-md border border-amber-300 font-bengali">
                                Plan কিনুন
                              </span>
                            )}

                            {!isFullyConfigured && m.is_active && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded-md border border-orange-300 font-bengali">
                                <SettingsIcon className="w-3 h-3" />
                                Setup বাকি
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: expiry progress bar */}
                    {m.is_active && daysLeft !== null && daysLeft > 0 && (
                      <div className={`px-4 py-2.5 border-t ${isExpiringSoon ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100"}`}>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className={`font-bengali font-semibold ${isExpiringSoon ? "text-amber-800" : "text-gray-600"}`}>
                            {isExpiringSoon ? "⚠️ শীঘ্রই Expire হবে" : "Subscription বাকি"}
                          </span>
                          <span className={`font-bold font-bengali ${isExpiringSoon ? "text-amber-700" : "text-gray-700"}`}>
                            {daysLeft} দিন
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isExpiringSoon
                                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                : "bg-gradient-to-r from-emerald-400 to-green-500"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {m.is_active && daysLeft !== null && daysLeft <= 0 && (
                      <div className="px-4 py-2.5 bg-red-50 border-t border-red-200">
                        <p className="text-[11px] font-bold text-red-700 font-bengali flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Subscription Expired - Renew করুন
                        </p>
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })
          )}

          {/* Pro tip footer */}
          {merchants.length > 0 && (
            <div className="mt-3 flex items-start gap-2 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-3">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 font-bengali leading-relaxed">
                <strong>Tip:</strong> উপরের list থেকে যেকোনো Site এ ক্লিক করে সেটা নির্বাচন করুন। এরপর Settings, Orders, Setup সব নির্বাচিত Site এর জন্য কাজ করবে।
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Plan Selection Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-900 font-bengali">নতুন Site এর জন্য Plan নির্বাচন</h2>
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setNewMerchantId(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-500 font-bengali mb-4">
              এই Subscription আপনার নতুন Site এর জন্য activate হবে
            </p>
            <SubscriptionPlans onSelectPlan={handleSelectPlan} />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {newMerchantId && (
        <SubscriptionPurchaseModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setNewMerchantId(null);
          }}
          planType={selectedPlan}
          merchantId={newMerchantId}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
