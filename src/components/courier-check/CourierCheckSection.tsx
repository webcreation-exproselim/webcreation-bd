import { useState } from "react";
import { Search, Loader2, Download, AlertCircle, Zap, Calendar, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCourierCheckData } from "@/hooks/useCourierCheckData";
import { CourierCheckPlans } from "./CourierCheckPlans";
import { CourierCheckPurchaseModal } from "./CourierCheckPurchaseModal";
import { CourierCheckerDashboard } from "./CourierCheckerDashboard";
import { COURIER_CHECK_PLUGIN_CONFIG, getCourierCheckVersionString } from "@/config/courierCheckPluginConfig";
import { downloadCourierCheckPlugin } from "@/utils/courierCheckPluginGenerator";
import { motion } from "framer-motion";

interface CourierCheckSectionProps {
  userId: string;
}

export function CourierCheckSection({ userId }: CourierCheckSectionProps) {
  const { subscription, pendingOrder, loading, refetch } = useCourierCheckData(userId);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

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

  return (
    <div className="space-y-6">
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
                কাস্টমারের Courier Delivery History চেক করুন
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {subscription?.is_active && (
              <>
                <Button
                  onClick={() => downloadCourierCheckPlugin(subscription.api_key)}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 text-white gap-2 rounded-xl"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-bengali">Plugin Download</span>
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-200">Active</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status Info */}
        {subscription?.is_active ? (
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

      {/* Pending Order Alert */}
      {pendingOrder && !subscription?.is_active && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800 font-bengali">অর্ডার পেন্ডিং</p>
              <p className="text-sm text-amber-600 font-bengali">
                Yearly Plan - ৳899 | Admin approval-এর জন্য অপেক্ষা করুন
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content based on subscription status */}
      {subscription?.is_active ? (
        <CourierCheckerDashboard apiKey={subscription.api_key} />
      ) : (
        !pendingOrder && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 font-bengali mb-4">
              🚀 Courier Check Plan নিন
            </h3>
            <CourierCheckPlans onSelectPlan={() => setShowPurchaseModal(true)} />
          </div>
        )
      )}

      {/* Purchase Modal */}
      {subscription && (
        <CourierCheckPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          subscriptionId={subscription.id}
          userId={userId}
          onSuccess={() => {
            refetch();
            setShowPurchaseModal(false);
          }}
        />
      )}
    </div>
  );
}
