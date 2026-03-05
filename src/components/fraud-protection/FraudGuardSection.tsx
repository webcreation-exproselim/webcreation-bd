import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionData } from "@/hooks/useSubscriptionData";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Loader2, 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  TrendingUp,
  Calendar,
  Zap,
  Crown,
  AlertCircle,
  ExternalLink,
  Download,
  ArrowUpCircle
} from "lucide-react";
import { downloadPluginFile } from "@/utils/pluginGenerator";
import { PLUGIN_CONFIG, getVersionString } from "@/config/pluginConfig";

import { SetupGuide } from "./SetupGuide";
import { FraudGuardAnalytics } from "./FraudGuardAnalytics";
import { SubscriptionPlans } from "./SubscriptionPlans";
import { SubscriptionPurchaseModal } from "./SubscriptionPurchaseModal";

interface FraudGuardSectionProps {
  userId: string;
  merchantId?: string;
}

interface Merchant {
  id: string;
  api_key: string;
  is_active: boolean;
  current_plan: string | null;
  plan_expires_at: string | null;
  requests_used: number;
  max_requests: number;
  cooldown_period_minutes: number;
}

export function FraudGuardSection({ userId, merchantId: propMerchantId }: FraudGuardSectionProps) {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [logs, setLogs] = useState<{ id: string; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState("setup");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { pendingOrder, refetch: refetchSubscription } = useSubscriptionData(merchant?.id ?? null);

  useEffect(() => {
    const fetchOrCreateMerchant = async () => {
      try {
        let merchantData: any = null;

        if (propMerchantId) {
          // Fetch specific merchant by ID
          const { data, error } = await supabase
            .from('merchants')
            .select('id, api_key, is_active, current_plan, plan_expires_at, requests_used, max_requests, cooldown_period_minutes')
            .eq('id', propMerchantId)
            .single();
          if (!error) merchantData = data;
        } else {
          // Legacy: fetch first merchant for user
          const { data, error } = await supabase
            .from('merchants')
            .select('id, api_key, is_active, current_plan, plan_expires_at, requests_used, max_requests, cooldown_period_minutes')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();
          if (!data && !error) {
            // No merchant, create one (legacy single-merchant flow)
            const { data: newMerchant, error: insertError } = await supabase
              .from('merchants')
              .insert({ user_id: userId })
              .select('id, api_key, is_active, current_plan, plan_expires_at, requests_used, max_requests, cooldown_period_minutes')
              .single();

            if (!insertError && newMerchant) {
              merchantData = newMerchant;
            }
          } else {
            merchantData = data;
          }
        }

        if (merchantData) {
          const fullMerchant: Merchant = {
            id: merchantData.id,
            api_key: merchantData.api_key || '',
            is_active: merchantData.is_active ?? false,
            current_plan: merchantData.current_plan ?? null,
            plan_expires_at: merchantData.plan_expires_at ?? null,
            requests_used: merchantData.requests_used ?? 0,
            max_requests: merchantData.max_requests ?? 0,
            cooldown_period_minutes: merchantData.cooldown_period_minutes ?? 1440,
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
  }, [userId, propMerchantId]);

  const handleSelectPlan = (planType: 'monthly' | 'yearly') => {
    setSelectedPlan(planType);
    setShowPurchaseModal(false);
    setShowPaymentModal(true);
  };

  // handleRegenerateKey removed - key is hardcoded in plugin

  const handlePurchaseSuccess = async () => {
    refetchSubscription();
    
    const merchantIdToFetch = propMerchantId || merchant?.id;
    if (!merchantIdToFetch) return;

    const { data } = await supabase
      .from('merchants')
      .select('id, api_key, is_active, current_plan, plan_expires_at, requests_used, max_requests, cooldown_period_minutes')
      .eq('id', merchantIdToFetch)
      .single();
    
    if (data) {
      setMerchant({
        id: data.id,
        api_key: data.api_key || '',
        is_active: data.is_active ?? false,
        current_plan: data.current_plan ?? null,
        plan_expires_at: data.plan_expires_at ?? null,
        requests_used: data.requests_used ?? 0,
        max_requests: data.max_requests ?? 0,
        cooldown_period_minutes: data.cooldown_period_minutes ?? 1440,
      });
    }
    
    toast({
      title: "✅ অর্ডার সাবমিট হয়েছে",
      description: "Admin approval-এর জন্য অপেক্ষা করুন",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-500 font-bengali">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  const usagePercent = merchant ? Math.round((merchant.requests_used / Math.max(merchant.max_requests, 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Shield className="w-9 h-9 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold font-bengali mb-1">{PLUGIN_CONFIG.name} {getVersionString()}</h2>
              <p className="text-white/80 text-sm font-bengali">
                আপনার WooCommerce স্টোর সুরক্ষিত করুন
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={async () => await downloadPluginFile(merchant?.api_key || 'YOUR_API_KEY_HERE')}
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white gap-2 rounded-xl"
            >
              <Download className="w-4 h-4" />
              <span className="font-bengali">Plugin {getVersionString()} Download</span>
            </Button>
            {merchant?.is_active && (
              <>
                <Button
                  onClick={() => setShowPurchaseModal(true)}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 text-white gap-2 rounded-xl"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span className="font-bengali">{merchant.current_plan === 'monthly' ? 'Upgrade' : 'Renew'}</span>
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
        {merchant?.is_active ? (
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-amber-300" />
                <p className="text-white/60 text-xs font-bengali">Plan</p>
              </div>
              <p className="text-lg font-bold capitalize">
                {merchant.current_plan || 'Free'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-cyan-300" />
                <p className="text-white/60 text-xs font-bengali">API Usage</p>
              </div>
              <p className="text-lg font-bold">
                {merchant.requests_used.toLocaleString()} / {merchant.max_requests.toLocaleString()}
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
                {merchant.plan_expires_at 
                  ? new Date(merchant.plan_expires_at).toLocaleDateString('bn-BD')
                  : '—'
                }
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
                    : "Plugin ব্যবহার করতে একটি Plan কিনুন"
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Order Alert */}
      {pendingOrder && !merchant?.is_active && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800 font-bengali">অর্ডার পেন্ডিং</p>
              <p className="text-sm text-amber-600 font-bengali">
                {pendingOrder.plan_type === 'yearly' ? 'Yearly' : 'Monthly'} Plan - ৳{pendingOrder.amount} | 
                Admin approval-এর জন্য অপেক্ষা করুন
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white border border-gray-200 rounded-2xl p-1.5 h-auto flex-wrap">
          <TabsTrigger 
            value="overview" 
            className="flex-1 min-w-[100px] rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3 font-bengali gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="setup" 
            className="flex-1 min-w-[100px] rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3 font-bengali gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Setup Guide</span>
          </TabsTrigger>
          {merchant?.is_active && (
            <>
              <TabsTrigger 
                value="analytics" 
                className="flex-1 min-w-[100px] rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3 font-bengali gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex-1 min-w-[100px] rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3 font-bengali gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {!merchant?.is_active && !pendingOrder && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 font-bengali mb-4">
                🚀 Plan নির্বাচন করুন
              </h3>
              <SubscriptionPlans onSelectPlan={handleSelectPlan} />
            </div>
          )}

          {merchant?.is_active && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <FraudGuardAnalytics logs={logs} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 font-bengali mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button
                onClick={() => setActiveTab("setup")}
                variant="outline"
                className="justify-start gap-3 h-auto py-4 px-4 rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              >
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 font-bengali">Setup Guide</p>
                  <p className="text-xs text-gray-500 font-bengali">Plugin সেটআপ করুন</p>
                </div>
              </Button>
              
              {merchant?.is_active && (
                <>
                  <Button
                    onClick={() => setActiveTab("analytics")}
                    variant="outline"
                    className="justify-start gap-3 h-auto py-4 px-4 rounded-xl border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  >
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 font-bengali">Analytics</p>
                      <p className="text-xs text-gray-500 font-bengali">পরিসংখ্যান দেখুন</p>
                    </div>
                  </Button>
                  <Button
                    onClick={() => navigate('/fraud-protection')}
                    variant="outline"
                    className="justify-start gap-3 h-auto py-4 px-4 rounded-xl border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <Settings className="w-5 h-5 text-emerald-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 font-bengali">Full Dashboard</p>
                      <p className="text-xs text-gray-500 font-bengali">বিস্তারিত সেটিংস</p>
                    </div>
                  </Button>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Setup Guide Tab */}
        <TabsContent value="setup" className="mt-6">
          <SetupGuide 
            apiKey={merchant?.api_key || ''} 
            isActive={merchant?.is_active || false} 
            merchantId={merchant?.id}
            onPurchaseSuccess={handlePurchaseSuccess}
          />
        </TabsContent>

        {/* Analytics Tab (Active only) */}
        {merchant?.is_active && (
          <TabsContent value="analytics" className="mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <FraudGuardAnalytics logs={logs} />
            </div>
          </TabsContent>
        )}

        {/* Settings Tab (Active only) */}
        {merchant?.is_active && (
          <TabsContent value="settings" className="mt-6 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 font-bengali mb-4">⚙️ Settings</h3>
              <p className="text-gray-600 font-bengali mb-4">
                বিস্তারিত settings যেমন Cooldown Period, Blacklist management করতে Full Dashboard-এ যান।
              </p>
              <Button
                onClick={() => navigate('/fraud-protection')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2 rounded-xl"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-bengali">Full Dashboard-এ যান</span>
              </Button>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Plan Selection Modal - available for all states */}
      {showPurchaseModal && !pendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 font-bengali">
                {merchant?.is_active ? 'Plan পরিবর্তন / রিনিউ করুন' : 'Plan নির্বাচন করুন'}
              </h2>
              <button 
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <SubscriptionPlans onSelectPlan={handleSelectPlan} />
          </div>
        </div>
      )}

      {/* Payment Modal - available for all states */}
      {merchant?.id && (
        <SubscriptionPurchaseModal
          isOpen={showPaymentModal && !pendingOrder}
          onClose={() => setShowPaymentModal(false)}
          planType={selectedPlan}
          merchantId={merchant.id}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}
