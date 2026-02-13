import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Clock, AlertCircle, CheckCircle, ExternalLink, Zap, Sparkles, ArrowUpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { SubscriptionPurchaseModal } from "./SubscriptionPurchaseModal";

interface SubscriptionStatusProps {
  merchant: {
    id: string;
    is_active: boolean;
    current_plan: string | null;
    plan_expires_at: string | null;
    requests_used: number;
    max_requests: number;
  } | null;
  pendingOrder: {
    plan_type: string;
    amount: number;
    created_at: string;
  } | null;
  onPurchaseSuccess?: () => void;
}

export function SubscriptionStatus({ merchant, pendingOrder, onPurchaseSuccess }: SubscriptionStatusProps) {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (planType: 'monthly' | 'yearly') => {
    setSelectedPlan(planType);
    setShowPlanModal(false);
    setShowPaymentModal(true);
  };

  const handlePurchaseSuccess = () => {
    setShowPaymentModal(false);
    onPurchaseSuccess?.();
  };

  // If payment is pending
  if (pendingOrder) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 font-bengali">
              পেমেন্ট যাচাই করা হচ্ছে...
            </h3>
            <p className="text-gray-500 text-sm font-bengali">
              ২-৪ ঘন্টার মধ্যে যাচাই হবে
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-amber-100/50 rounded-xl p-3">
          <p>Plan: {pendingOrder.plan_type === 'monthly' ? 'Monthly' : 'Yearly'}</p>
          <p>Amount: ৳{pendingOrder.amount}</p>
        </div>
      </div>
    );
  }

  // If subscription is active
  if (merchant?.is_active && merchant?.plan_expires_at) {
    const expiresAt = new Date(merchant.plan_expires_at);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const usagePercent = merchant.max_requests > 0 
      ? (merchant.requests_used / merchant.max_requests) * 100 
      : 0;

    const isExpired = daysLeft <= 0;
    const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;

    if (isExpired) {
      return (
        <>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-bengali">
                  সাবস্ক্রিপশন মেয়াদ শেষ
                </h3>
                <p className="text-gray-500 text-sm font-bengali">
                  চালু রাখতে রিনিউ করুন
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowPlanModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bengali"
            >
              রিনিউ করুন
            </Button>
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
      <>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 font-bengali">
                WCBD Fraud Guard - Active
              </h3>
              <p className="text-gray-500 text-sm">
                Plan: {merchant.current_plan === 'yearly' ? 'Yearly' : 'Monthly'}
              </p>
            </div>
          </div>

          {/* Expiry Warning */}
          {isExpiringSoon && (
            <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-amber-700 text-sm font-bengali">
                ⚠️ মেয়াদ শেষ হতে {daysLeft} দিন বাকি
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">API Usage</span>
                <span className="text-gray-900 font-medium">{merchant.requests_used.toLocaleString()} / {merchant.max_requests.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Expires</span>
              <span className="text-gray-900 font-medium">{expiresAt.toLocaleDateString('bn-BD')}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link to="/fraud-protection" className="flex-1">
              <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-bengali">
                সেটিংস দেখুন
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button 
              onClick={() => setShowPlanModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bengali gap-2"
            >
              <ArrowUpCircle className="w-4 h-4" />
              {merchant.current_plan === 'monthly' ? 'Upgrade' : 'Renew'}
            </Button>
          </div>
        </div>

        {/* Upgrade Nudge - Always Visible */}
        {merchant.current_plan === 'monthly' && (
          <div 
            onClick={() => setShowPlanModal(true)}
            className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800 font-bengali">Yearly Plan এ Upgrade করুন!</p>
              <p className="text-xs text-amber-600">৳৯৯৯/বছর — <span className="font-bold">79% সেভ</span> করুন</p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 flex-shrink-0" />
          </div>
        )}

        {/* Plan Selection Modal */}
        {showPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 font-bengali">Plan পরিবর্তন / রিনিউ করুন</h2>
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

  // Not subscribed - show CTA to open plan modal
  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 font-bengali">
              WCBD Fraud Guard
            </h3>
            <p className="text-gray-500 text-sm font-bengali">
              আপনার স্টোর সুরক্ষিত করুন
            </p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 font-bengali">
          Fake order থেকে আপনার WooCommerce স্টোর রক্ষা করুন
        </p>

        {/* Single CTA Button to Open Plan Modal */}
        <Button 
          onClick={() => setShowPlanModal(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold font-bengali h-12 rounded-xl shadow-lg shadow-blue-500/20"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Plan নির্বাচন করুন
        </Button>

        <Link to="/fraud-guard" className="mt-3 text-blue-600 text-sm hover:underline font-bengali flex items-center justify-center gap-1">
          বিস্তারিত দেখুন
          <ExternalLink className="w-3 h-3" />
        </Link>
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
