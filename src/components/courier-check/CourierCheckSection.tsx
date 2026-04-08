import { useState } from "react";
import { Search, Loader2, Download, AlertCircle, Zap, Calendar, Crown, Copy, Check, Key, Package, Lock, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCourierCheckData } from "@/hooks/useCourierCheckData";
import { CourierCheckPlans } from "./CourierCheckPlans";
import { CourierCheckPurchaseModal } from "./CourierCheckPurchaseModal";
import { CourierCheckerDashboard } from "./CourierCheckerDashboard";
import { CourierCheckEmbedCode } from "./CourierCheckEmbedCode";
import { COURIER_CHECK_PLUGIN_CONFIG, getCourierCheckVersionString } from "@/config/courierCheckPluginConfig";
import { downloadCourierCheckPlugin } from "@/utils/courierCheckPluginGenerator";
import { useToast } from "@/hooks/use-toast";

interface CourierCheckSectionProps {
  userId: string;
  subscriptionId?: string;
}

export function CourierCheckSection({ userId, subscriptionId: propSubId }: CourierCheckSectionProps) {
  const { subscription, pendingOrder, loading, refetch } = useCourierCheckData(userId);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
          <span className="text-gray-500 font-bengali">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  const usagePercent = subscription ? Math.round((subscription.requests_used / Math.max(subscription.max_requests, 1)) * 100) : 0;
  const isActive = subscription?.is_active;

  const handleCopyApiKey = () => {
    if (!subscription?.api_key) return;
    navigator.clipboard.writeText(subscription.api_key);
    setCopied(true);
    toast({ title: "✅ Copied!", description: "API Key কপি হয়েছে" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Courier Check Dashboard - ALWAYS ON TOP */}
      {isActive ? (
        <CourierCheckerDashboard apiKey={subscription!.api_key} />
      ) : (
        <div className="relative">
          {/* Locked Overlay for Search */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center gap-4 py-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-bengali mb-1">
                  Courier Check Search লক করা আছে
                </h3>
                <p className="text-sm text-gray-500 font-bengali max-w-md">
                  ফোন নম্বর দিয়ে কাস্টমারের Courier Delivery History চেক করতে Plan সক্রিয় করুন
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-cyan-500/20">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Search className="w-9 h-9 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold font-bengali mb-1">
                {COURIER_CHECK_PLUGIN_CONFIG.name} {getCourierCheckVersionString()}
              </h2>
              <p className="text-white/80 text-sm font-bengali">
                কাস্টমারের Courier Delivery History চেক করুন — Pathao, Steadfast, CarryBee, RedX
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={() => downloadCourierCheckPlugin(subscription?.api_key || '')}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white gap-2 rounded-xl"
            >
              <Download className="w-4 h-4" />
              <span className="font-bengali">Plugin Download</span>
            </Button>
            {isActive ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-200">Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-400/30">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-sm font-medium text-red-200">Inactive</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Info */}
        {isActive ? (
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-amber-300" />
                <p className="text-white/60 text-xs font-bengali">Plan</p>
              </div>
              <p className="text-lg font-bold">Yearly</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-cyan-300" />
                <p className="text-white/60 text-xs font-bengali">API Usage</p>
              </div>
              <p className="text-lg font-bold">
                {subscription.requests_used.toLocaleString()} / {subscription.max_requests.toLocaleString()}
              </p>
              <div className="w-full h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-purple-300" />
                <p className="text-white/60 text-xs font-bengali">মেয়াদ শেষ</p>
              </div>
              <p className="text-lg font-bold">
                {subscription.plan_expires_at
                  ? new Date(subscription.plan_expires_at).toLocaleDateString('bn-BD')
                  : '—'}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white/90 font-medium font-bengali">Plan এখনো সক্রিয় হয়নি</p>
                <p className="text-white/60 text-sm font-bengali mt-1">
                  {pendingOrder
                    ? "আপনার অর্ডার Admin approval-এর জন্য অপেক্ষমান"
                    : "Courier Check ব্যবহার করতে Plan কিনুন"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plan Purchase Section - when inactive and no pending order */}
      {!isActive && !pendingOrder && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 font-bengali mb-4">
            🚀 Courier Check Plan নিন
          </h3>
          <SubscriptionPlans onSelectPlan={(planType) => {
            setSelectedPlan(planType);
            setShowPurchaseModal(true);
          }} />
        </div>
      )}

      {/* Purchase Modal */}
      {subscription && (
        <SubscriptionPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          planType={selectedPlan}
          merchantId={subscription.id}
          onSuccess={() => {
            refetch();
            setShowPurchaseModal(false);
          }}
        />
      )}
    </div>
  );
}
