import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, CheckCircle2, AlertCircle, Plus, ArrowRight, Sparkles, Layers } from "lucide-react";
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
      return new URL(m.website_url.startsWith("http") ? m.website_url : `https://${m.website_url}`).hostname.replace(/^www\./, "");
    } catch {
      return m.website_url;
    }
  }
  return `Site ${idx + 1}`;
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

  const handleAddNewSite = async () => {
    setCreating(true);
    try {
      // Create a fresh empty merchant row for this user
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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-bengali">আপনার Sites</h3>
                <p className="text-xs text-white/80 font-bengali">
                  মোট {merchants.length}টি Site • প্রতিটি আলাদা Subscription
                </p>
              </div>
            </div>
            <Button
              onClick={handleAddNewSite}
              disabled={creating}
              size="sm"
              className="bg-white text-blue-700 hover:bg-white/90 gap-2 rounded-xl font-bengali font-bold shadow-lg"
            >
              <Plus className="w-4 h-4" />
              নতুন Site যোগ করুন
            </Button>
          </div>
        </div>

        {/* Sites Grid */}
        <div className="p-4 space-y-3">
          {merchants.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-bengali">কোনো Site যোগ করা নেই</p>
            </div>
          ) : (
            merchants.map((m, idx) => {
              const isSelected = m.id === selectedMerchantId;
              const label = getStoreLabel(m, idx);
              const hasUrl = !!m.website_url;
              const expiresAt = m.plan_expires_at ? new Date(m.plan_expires_at) : null;
              const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

              return (
                <motion.button
                  key={m.id}
                  onClick={() => onSelectMerchant(m.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${
                    isSelected
                      ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        m.is_active
                          ? "bg-emerald-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {m.is_active ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Globe className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900 truncate">{label}</p>
                        {isSelected && (
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                        {m.is_active ? (
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Active {m.current_plan ? `• ${m.current_plan}` : ""}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-bengali">
                            Plan কিনুন
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {hasUrl ? (
                          <span className="truncate">🌐 {m.website_url}</span>
                        ) : (
                          <span className="text-amber-600 font-bengali">⚠️ Domain যোগ করা হয়নি</span>
                        )}
                        {daysLeft !== null && daysLeft > 0 && (
                          <span className="text-gray-400">• {daysLeft} দিন বাকি</span>
                        )}
                      </div>
                    </div>

                    {!isSelected && (
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </motion.button>
              );
            })
          )}

          {/* Info Banner */}
          <div className="mt-2 flex items-start gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-bengali leading-relaxed">
              <strong>নিয়ম:</strong> প্রতি Subscription = ১টি Domain. একটি Subscription দিয়ে শুধু একটি Site protect করা যাবে। একাধিক Site এর জন্য আলাদা Subscription কিনুন।
            </p>
          </div>
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
