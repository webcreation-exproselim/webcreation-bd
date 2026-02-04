import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionStatus } from "./SubscriptionStatus";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { SubscriptionPurchaseModal } from "./SubscriptionPurchaseModal";
import { FraudGuardAnalytics } from "./FraudGuardAnalytics";
import { useSubscriptionData } from "@/hooks/useSubscriptionData";
import { Button } from "@/components/ui/button";
import { Settings, Download, ExternalLink, Shield, Loader2 } from "lucide-react";

interface FraudGuardSectionProps {
  userId: string;
}

interface Merchant {
  id: string;
  is_active: boolean;
  current_plan: string | null;
  plan_expires_at: string | null;
  requests_used: number;
  max_requests: number;
}

export function FraudGuardSection({ userId }: FraudGuardSectionProps) {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [logs, setLogs] = useState<{ id: string; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();
  
  const { pendingOrder, refetch: refetchSubscription } = useSubscriptionData(merchant?.id ?? null);

  useEffect(() => {
    const fetchOrCreateMerchant = async () => {
      try {
        let { data: merchantData, error } = await supabase
          .from('merchants')
          .select('id, is_active, current_plan, plan_expires_at, requests_used, max_requests')
          .eq('user_id', userId)
          .maybeSingle();

        if (!merchantData && !error) {
          const { data: newMerchant, error: insertError } = await supabase
            .from('merchants')
            .insert({ user_id: userId })
            .select('id, is_active, current_plan, plan_expires_at, requests_used, max_requests')
            .single();

          if (!insertError && newMerchant) {
            merchantData = newMerchant;
          }
        }

        if (merchantData) {
          const fullMerchant = {
            ...merchantData,
            is_active: merchantData.is_active ?? false,
            current_plan: merchantData.current_plan ?? null,
            plan_expires_at: merchantData.plan_expires_at ?? null,
            requests_used: merchantData.requests_used ?? 0,
            max_requests: merchantData.max_requests ?? 0,
          };
          setMerchant(fullMerchant);

          if (fullMerchant.is_active) {
            const { data: logsData } = await supabase
              .from('fraud_logs')
              .select('id, status, created_at')
              .eq('merchant_id', fullMerchant.id)
              .order('created_at', { ascending: false })
              .limit(200);
            
            setLogs(logsData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching merchant:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateMerchant();
  }, [userId]);

  const handleSelectPlan = (planType: 'monthly' | 'yearly') => {
    setSelectedPlan(planType);
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = async () => {
    refetchSubscription();
    
    const { data } = await supabase
      .from('merchants')
      .select('id, is_active, current_plan, plan_expires_at, requests_used, max_requests')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      setMerchant({
        ...data,
        is_active: data.is_active ?? false,
        current_plan: data.current_plan ?? null,
        plan_expires_at: data.plan_expires_at ?? null,
        requests_used: data.requests_used ?? 0,
        max_requests: data.max_requests ?? 0,
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-500 font-bengali">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-bengali">WCBD Fraud Guard</h2>
            <p className="text-white/80 text-sm font-bengali">
              {merchant?.is_active 
                ? `${merchant.current_plan === 'yearly' ? 'Yearly' : 'Monthly'} Plan Active`
                : 'Anti-Fraud Protection System'
              }
            </p>
          </div>
        </div>
        
        {merchant?.is_active && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/60 text-xs font-bengali">API ব্যবহার</p>
              <p className="text-2xl font-bold">{merchant.requests_used} / {merchant.max_requests}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/60 text-xs font-bengali">মেয়াদ শেষ</p>
              <p className="text-lg font-semibold">
                {merchant.plan_expires_at 
                  ? new Date(merchant.plan_expires_at).toLocaleDateString('bn-BD')
                  : '—'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Status for inactive users */}
      {!merchant?.is_active && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <SubscriptionStatus
            merchant={merchant}
            pendingOrder={pendingOrder ? {
              plan_type: pendingOrder.plan_type,
              amount: pendingOrder.amount,
              created_at: pendingOrder.created_at,
            } : null}
            onPurchase={() => setShowPurchaseModal(true)}
          />
        </div>
      )}

      {/* Analytics for active merchants */}
      {merchant?.is_active && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <FraudGuardAnalytics logs={logs} />
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/fraud-protection')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white gap-2 rounded-xl"
            >
              <Settings className="w-4 h-4" />
              সেটিংস দেখুন
            </Button>
            <Button
              onClick={() => navigate('/fraud-protection')}
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 gap-2 rounded-xl"
            >
              <Download className="w-4 h-4" />
              Plugin ডাউনলোড
            </Button>
            <Button
              onClick={() => navigate('/fraud-guard')}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              বিস্তারিত দেখুন
            </Button>
          </div>
        </>
      )}

      {/* Plan Selection Modal */}
      {showPurchaseModal && !pendingOrder && !merchant?.is_active && merchant?.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 font-bengali">Plan নির্বাচন করুন</h2>
              <button 
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
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
          isOpen={showPurchaseModal && !!selectedPlan && !pendingOrder && !merchant?.is_active}
          onClose={() => setShowPurchaseModal(false)}
          planType={selectedPlan}
          merchantId={merchant.id}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}
