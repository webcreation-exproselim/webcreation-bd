import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useMerchantData } from "@/hooks/useMerchantData";
import { FraudSettings } from "@/components/fraud-protection/FraudSettings";
import { BlacklistManager } from "@/components/fraud-protection/BlacklistManager";
import { FraudLogs } from "@/components/fraud-protection/FraudLogs";
import { IntegrationCode } from "@/components/fraud-protection/IntegrationCode";
import { PluginDownload } from "@/components/fraud-protection/PluginDownload";
import { PluginRemoteSettings } from "@/components/fraud-protection/PluginRemoteSettings";
import { AbandonedCarts } from "@/components/fraud-protection/AbandonedCarts";
import { IncompleteOrders } from "@/components/fraud-protection/IncompleteOrders";
import { CourierOrders } from "@/components/fraud-protection/CourierOrders";
import { CustomerTrustLookup } from "@/components/fraud-protection/CustomerTrustLookup";
import { FraudProtectionSidebar, type FraudTab } from "@/components/fraud-protection/FraudProtectionSidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FraudProtectionPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<FraudTab>("settings");
  const {
    merchant,
    blacklist,
    logs,
    loading,
    updateCooldownMinutes,
    updateWebsiteUrl,
    regenerateApiKey,
    addToBlacklist,
    removeFromBlacklist,
    refetchLogs,
    refetchMerchant,
  } = useMerchantData();

  const handleToggleAbandonedTracking = async (enabled: boolean) => {
    if (!merchant?.id) return;
    const { error } = await supabase
      .from("merchants")
      .update({ enable_abandoned_tracking: enabled })
      .eq("id", merchant.id);
    if (!error) {
      refetchMerchant();
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center animate-pulse">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 blur-xl opacity-40" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "settings":
        return (
          <FraudSettings
            merchant={
              merchant
                ? {
                    api_key: merchant.api_key,
                    website_url: merchant.website_url,
                    cooldown_period_minutes: merchant.cooldown_period_minutes ?? 1440,
                  }
                : null
            }
            onUpdateCooldownMinutes={updateCooldownMinutes}
            onUpdateWebsite={updateWebsiteUrl}
            onRegenerateApiKey={regenerateApiKey}
          />
        );
      case "blacklist":
        return (
          <BlacklistManager
            blacklist={blacklist}
            onAdd={addToBlacklist}
            onRemove={removeFromBlacklist}
          />
        );
      case "logs":
        return <FraudLogs logs={logs} onRefresh={refetchLogs} />;
      case "integration":
        return merchant ? <IntegrationCode apiKey={merchant.api_key} /> : null;
      case "plugin":
        return merchant ? <PluginDownload apiKey={merchant.api_key} /> : null;
      case "remote":
        return merchant ? (
          <PluginRemoteSettings
            merchantId={merchant.id}
            initialSettings={{
              popup_timer_seconds: merchant.popup_timer_seconds,
              popup_language: merchant.popup_language,
              msg_cooldown: merchant.msg_cooldown,
              msg_blacklist: merchant.msg_blacklist,
              whatsapp_number: merchant.whatsapp_number || "",
              phone_number: merchant.phone_number || "",
              show_contact_buttons: merchant.show_contact_buttons,
            }}
          />
        ) : null;
      case "abandoned":
        return merchant ? (
          <AbandonedCarts
            merchantId={merchant.id}
            trackingEnabled={merchant.enable_abandoned_tracking}
            onToggleTracking={handleToggleAbandonedTracking}
          />
        ) : null;
      case "incomplete":
        return merchant ? <IncompleteOrders merchantId={merchant.id} /> : null;
      case "courier":
        return merchant ? (
          <CourierOrders merchantId={merchant.id} apiKey={merchant.api_key} />
        ) : null;
      case "trust-score":
        return merchant ? <CustomerTrustLookup apiKey={merchant.api_key} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 hex-pattern">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  Fraud Protection
                </h1>
                <p className="text-xs text-slate-400">
                  Order Limiter & Anti-Fraud System
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Layout: Sidebar + Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <FraudProtectionSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
