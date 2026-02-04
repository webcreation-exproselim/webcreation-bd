import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionStatus } from "./SubscriptionStatus";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { SubscriptionPurchaseModal } from "./SubscriptionPurchaseModal";
import { useSubscriptionData } from "@/hooks/useSubscriptionData";

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
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  
  const { pendingOrder, refetch: refetchSubscription } = useSubscriptionData(merchant?.id ?? null);

  useEffect(() => {
    const fetchOrCreateMerchant = async () => {
      try {
        // Try to get existing merchant
        let { data: merchantData, error } = await supabase
          .from('merchants')
          .select('id, is_active, current_plan, plan_expires_at, requests_used, max_requests')
          .eq('user_id', userId)
          .maybeSingle();

        // If no merchant exists, create one
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
          setMerchant({
            ...merchantData,
            is_active: merchantData.is_active ?? false,
            current_plan: merchantData.current_plan ?? null,
            plan_expires_at: merchantData.plan_expires_at ?? null,
            requests_used: merchantData.requests_used ?? 0,
            max_requests: merchantData.max_requests ?? 0,
          });
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
    // Refetch merchant data and subscription status
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
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4" />
        <div className="h-4 bg-white/10 rounded w-2/3" />
      </div>
    );
  }

  // Show subscription status (active, pending, or plans)
  return (
    <>
      <SubscriptionStatus
        merchant={merchant}
        pendingOrder={pendingOrder ? {
          plan_type: pendingOrder.plan_type,
          amount: pendingOrder.amount,
          created_at: pendingOrder.created_at,
        } : null}
        onPurchase={() => setShowPurchaseModal(true)}
      />

      {/* Purchase Modal with Plan Selection */}
      {showPurchaseModal && !pendingOrder && !merchant?.is_active && merchant?.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white font-bengali">Plan নির্বাচন করুন</h2>
              <button 
                onClick={() => setShowPurchaseModal(false)}
                className="text-white/60 hover:text-white text-2xl"
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
    </>
  );
}