import { useState } from "react";
import { Shield, Clock, AlertCircle, CheckCircle, Zap, Download, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadPluginFile } from "@/utils/pluginGenerator";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPlans } from "@/components/fraud-protection/SubscriptionPlans";
import { SubscriptionPurchaseModal } from "@/components/fraud-protection/SubscriptionPurchaseModal";

interface FraudGuardQuickStatusProps {
  merchant: {
    id: string;
    is_active: boolean;
    current_plan: string | null;
    plan_expires_at: string | null;
    requests_used: number;
    max_requests: number;
    api_key: string;
  } | null;
  pendingOrder: {
    plan_type: string;
    amount: number;
    created_at: string;
  } | null;
  onOpenFraudGuard: () => void;
  onPurchaseSuccess?: () => void;
}

export function FraudGuardQuickStatus({ 
  merchant, 
  pendingOrder, 
  onOpenFraudGuard,
  onPurchaseSuccess 
}: FraudGuardQuickStatusProps) {
  const { toast } = useToast();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const handleDownloadPlugin = async () => {
    const apiKey = merchant?.is_active && merchant?.api_key ? merchant.api_key : "YOUR_API_KEY_HERE";
    await downloadPluginFile(apiKey);
    toast({
      title: "✅ Plugin v3.3.0 ডাউনলোড হয়েছে",
      description: merchant?.is_active 
        ? "আপনার API Key সহ Plugin ready" 
        : "Fraud Guard tab থেকে Plan কিনে API Key সেট করুন",
    });
  };

  const handleSelectPlan = (planType: 'monthly' | 'yearly') => {
    setSelectedPlan(planType);
    setShowPlanModal(false);
    setShowPaymentModal(true);
  };

  const handlePurchaseSuccess = () => {
    setShowPaymentModal(false);
    onPurchaseSuccess?.();
  };

  // Payment pending
  if (pendingOrder) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900 font-bengali">
                  🕐 পেমেন্ট যাচাই করা হচ্ছে
                </h3>
                <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full border border-amber-300">
                  Pending
                </span>
              </div>
              <p className="text-gray-600 text-sm font-bengali mt-1">
                {pendingOrder.plan_type === 'yearly' ? 'Yearly' : 'Monthly'} Plan • ৳{pendingOrder.amount} • ২-৪ ঘন্টার মধ্যে verify হবে
              </p>
            </div>
          </div>
          <Button
            onClick={onOpenFraudGuard}
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-100 gap-2 rounded-xl font-bengali"
          >
            <Settings className="w-4 h-4" />
            বিস্তারিত
          </Button>
        </div>
      </div>
    );
  }

  // Active subscription
  if (merchant?.is_active && merchant?.plan_expires_at) {
    const expiresAt = new Date(merchant.plan_expires_at);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const usagePercent = merchant.max_requests > 0 
      ? Math.min(100, (merchant.requests_used / merchant.max_requests) * 100)
      : 0;
    const isExpired = daysLeft <= 0;
    const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;

    if (isExpired) {
      return (
        <>
          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-200 p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 font-bengali">
                    ⚠️ Fraud Guard মেয়াদ শেষ
                  </h3>
                  <p className="text-gray-600 text-sm font-bengali mt-1">
                    আপনার Plan এর মেয়াদ শেষ হয়ে গেছে। রিনিউ করুন।
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowPlanModal(true)}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white gap-2 rounded-xl font-bengali shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                রিনিউ করুন
              </Button>
            </div>
          </div>

          {/* Plan Selection Modal */}
          {showPlanModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 font-bengali">Plan নির্বাচন করুন</h2>
                  <button 
                    onClick={() => setShowPlanModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
                <SubscriptionPlans onSelectPlan={handleSelectPlan} />
              </div>
            </div>
          )}

          {/* Payment Modal */}
          {merchant?.id && (
            <SubscriptionPurchaseModal
              isOpen={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              planType={selectedPlan}
              merchantId={merchant.id}
              onSuccess={handlePurchaseSuccess}
            />
          )}
        </>
      );
    }

    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900 font-bengali">
                  🛡️ Fraud Guard সক্রিয়
                </h3>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full border border-emerald-300">
                  {merchant.current_plan === 'yearly' ? 'Yearly' : 'Monthly'}
                </span>
                {isExpiringSoon && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full border border-amber-300 animate-pulse">
                    {daysLeft} দিন বাকি
                  </span>
                )}
              </div>
              
              {/* Usage Bar */}
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">API Usage</span>
                    <span className="text-gray-700 font-medium">{merchant.requests_used.toLocaleString()} / {merchant.max_requests.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-500 hidden sm:block">
                  মেয়াদ: {expiresAt.toLocaleDateString('bn-BD')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleDownloadPlugin}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white gap-2 rounded-xl font-bengali shadow-lg"
            >
              <Download className="w-4 h-4" />
              Plugin v3.3
            </Button>
            <Button
              onClick={onOpenFraudGuard}
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 gap-2 rounded-xl font-bengali"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not subscribed - show promo
  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-blue-500/20">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg md:text-xl font-bold font-bengali">🛡️ WCBD Fraud Guard v3.3</h3>
                <span className="bg-emerald-500/30 text-emerald-100 text-xs font-medium px-2 py-1 rounded-full border border-emerald-400/30">
                  FREE Download
                </span>
              </div>
              <p className="text-white/80 text-sm font-bengali mt-1">
                আপনার WooCommerce স্টোরকে Fake Order থেকে সুরক্ষিত রাখুন
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleDownloadPlugin}
              className="bg-white text-blue-600 hover:bg-white/90 gap-2 rounded-xl font-bengali shadow-lg"
            >
              <Download className="w-4 h-4" />
              Plugin ডাউনলোড
            </Button>
            <Button
              onClick={() => setShowPlanModal(true)}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 gap-2 rounded-xl font-bengali"
            >
              <Sparkles className="w-4 h-4" />
              Plan কিনুন
            </Button>
          </div>
        </div>
      </div>

      {/* Plan Selection Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 font-bengali">Plan নির্বাচন করুন</h2>
              <button 
                onClick={() => setShowPlanModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <SubscriptionPlans onSelectPlan={handleSelectPlan} />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {merchant?.id && (
        <SubscriptionPurchaseModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          planType={selectedPlan}
          merchantId={merchant.id}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </>
  );
}
