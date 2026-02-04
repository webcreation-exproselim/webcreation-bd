import { Link } from "react-router-dom";
import { Shield, Clock, AlertCircle, CheckCircle, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionStatusProps {
  merchant: {
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
  onPurchase: () => void;
}

export function SubscriptionStatus({ merchant, pendingOrder, onPurchase }: SubscriptionStatusProps) {
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
            onClick={onPurchase}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bengali"
          >
            রিনিউ করুন
          </Button>
        </div>
      );
    }

    return (
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

        <Link to="/fraud-protection">
          <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-bengali">
            সেটিংস দেখুন
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  // Not subscribed - show plans
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-600" />
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

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button 
          onClick={onPurchase}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-100 font-bengali"
        >
          <Clock className="w-4 h-4 mr-1" />
          ৳১০০/মাস
        </Button>
        <Button 
          onClick={onPurchase}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bengali"
        >
          <Zap className="w-4 h-4 mr-1" />
          ৳৬৯৯/বছর
        </Button>
      </div>

      <Link to="/fraud-guard" className="text-blue-600 text-sm hover:underline font-bengali flex items-center gap-1">
        বিস্তারিত দেখুন
        <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  );
}
