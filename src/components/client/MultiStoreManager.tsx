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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ============ COMPACT HEADER ============ */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-bengali">আপনার Sites</h3>
              <div className="flex items-center gap-1 text-[11px] text-white/90">
                <span className="bg-white/15 px-1.5 py-0.5 rounded font-bold">{merchants.length}</span>
                <span className="text-emerald-200">●{activeCount}</span>
                {inactiveCount > 0 && <span className="text-amber-200">●{inactiveCount}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-white/80 hover:text-white hover:bg-white/15 rounded-lg p-1.5 transition"
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <Button
              onClick={handleAddNewSite}
              disabled={creating}
              size="sm"
              className="bg-white text-blue-700 hover:bg-white/95 gap-1 rounded-lg font-bengali font-bold h-8 px-3 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              নতুন Site
            </Button>
          </div>
        </div>

        {/* ============ HELP (collapsed by default) ============ */}
        {showHelp && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="bg-blue-50 border-b border-blue-100 px-4 py-3 text-xs text-blue-900 font-bengali space-y-1.5"
          >
            <p>• <strong>নতুন Site:</strong> উপরের বাটনে ক্লিক করে Plan কিনুন</p>
            <p>• <strong>নির্বাচন করুন:</strong> নিচের যেকোনো Site কার্ডে ক্লিক করুন</p>
            <p>• <strong>Setup:</strong> Settings ও Plugin install করুন</p>
            <p className="text-amber-800 pt-1 border-t border-blue-200">⚠️ ১টি Subscription = ১টি Domain</p>
          </motion.div>
        )}

        {/* ============ SITES LIST ============ */}
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50/40">
          {merchants.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-900 font-bengali mb-2">কোনো Site নেই</p>
              <Button onClick={handleAddNewSite} disabled={creating} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bengali rounded-lg gap-1 text-xs h-8">
                <Plus className="w-3.5 h-3.5" />
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
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <button
                    onClick={() => onSelectMerchant(m.id)}
                    className={`w-full text-left rounded-lg border transition-all duration-150 p-2.5 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-200"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Compact status icon */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            m.is_active
                              ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {m.is_active ? <Shield className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-700">
                          {idx + 1}
                        </div>
                      </div>

                      {/* Info column */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-sm font-bold text-gray-900 truncate">{label}</p>
                          {isSelected && (
                            <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase">
                              ✓
                            </span>
                          )}
                        </div>

                        {hasUrl ? (
                          <p className="text-[11px] text-gray-500 truncate">{cleanDomain}</p>
                        ) : (
                          <p className="text-[11px] text-amber-700 font-bengali truncate">⚠ Domain যোগ করুন</p>
                        )}

                        {/* Inline status row */}
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {m.is_active ? (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 font-bengali">
                              Plan কিনুন
                            </span>
                          )}
                          {m.current_plan && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-0.5 ${
                              m.current_plan === "yearly"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}>
                              {m.current_plan === "yearly" ? <Crown className="w-2.5 h-2.5" /> : <Zap className="w-2.5 h-2.5" />}
                              {m.current_plan === "yearly" ? "Yearly" : "Monthly"}
                            </span>
                          )}
                          {daysLeft !== null && daysLeft > 0 && (
                            <span className={`text-[10px] font-bold font-bengali px-1.5 py-0.5 rounded border ${
                              isExpiringSoon
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}>
                              {daysLeft} দিন
                            </span>
                          )}
                          {daysLeft !== null && daysLeft <= 0 && m.is_active && (
                            <span className="text-[10px] font-bold bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200 font-bengali">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })
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
