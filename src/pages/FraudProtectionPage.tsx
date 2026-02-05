import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useMerchantData } from "@/hooks/useMerchantData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FraudSettings } from "@/components/fraud-protection/FraudSettings";
import { BlacklistManager } from "@/components/fraud-protection/BlacklistManager";
import { FraudLogs } from "@/components/fraud-protection/FraudLogs";
import { IntegrationCode } from "@/components/fraud-protection/IntegrationCode";
import { PluginDownload } from "@/components/fraud-protection/PluginDownload";
import { PluginRemoteSettings } from "@/components/fraud-protection/PluginRemoteSettings";
import { AbandonedCarts } from "@/components/fraud-protection/AbandonedCarts";
import { CourierOrders } from "@/components/fraud-protection/CourierOrders";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Shield, FileText, Code, Loader2, Download, Globe, ShoppingCart, Truck } from "lucide-react";

export default function FraudProtectionPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
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
    refetchMerchant
  } = useMerchantData();

  const handleToggleAbandonedTracking = async (enabled: boolean) => {
    if (!merchant?.id) return;
    
    const { error } = await supabase
      .from('merchants')
      .update({ enable_abandoned_tracking: enabled })
      .eq('id', merchant.id);
    
    if (!error) {
      refetchMerchant();
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="h-6 w-6 text-cyan-400" />
                  Fraud Protection
                </h1>
                <p className="text-sm text-muted-foreground">
                  Order Limiter & Anti-Fraud System
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex-wrap h-auto gap-1">
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger 
              value="blacklist"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Blacklist
            </TabsTrigger>
            <TabsTrigger 
              value="logs"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
            <TabsTrigger 
              value="integration"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Code className="h-4 w-4 mr-2" />
              Integration
            </TabsTrigger>
            <TabsTrigger 
              value="plugin"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Plugin
            </TabsTrigger>
            <TabsTrigger 
              value="remote"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Globe className="h-4 w-4 mr-2" />
              Remote
            </TabsTrigger>
            <TabsTrigger 
              value="abandoned"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Abandoned
            </TabsTrigger>
            <TabsTrigger 
              value="courier"
              className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              <Truck className="h-4 w-4 mr-2" />
              Courier
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <FraudSettings
              merchant={merchant ? {
                api_key: merchant.api_key,
                website_url: merchant.website_url,
                cooldown_period_minutes: merchant.cooldown_period_minutes ?? 1440,
              } : null}
              onUpdateCooldownMinutes={updateCooldownMinutes}
              onUpdateWebsite={updateWebsiteUrl}
              onRegenerateApiKey={regenerateApiKey}
            />
          </TabsContent>

          <TabsContent value="blacklist">
            <BlacklistManager
              blacklist={blacklist}
              onAdd={addToBlacklist}
              onRemove={removeFromBlacklist}
            />
          </TabsContent>

          <TabsContent value="logs">
            <FraudLogs logs={logs} onRefresh={refetchLogs} />
          </TabsContent>

          <TabsContent value="integration">
            {merchant && <IntegrationCode apiKey={merchant.api_key} />}
          </TabsContent>

          <TabsContent value="plugin">
            {merchant && <PluginDownload apiKey={merchant.api_key} />}
          </TabsContent>

          <TabsContent value="remote">
            {merchant && (
              <PluginRemoteSettings 
                merchantId={merchant.id}
                initialSettings={{
                  popup_timer_seconds: merchant.popup_timer_seconds,
                  popup_language: merchant.popup_language,
                  msg_cooldown: merchant.msg_cooldown,
                  msg_blacklist: merchant.msg_blacklist,
                  whatsapp_number: merchant.whatsapp_number || '',
                  phone_number: merchant.phone_number || '',
                  show_contact_buttons: merchant.show_contact_buttons
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="abandoned">
            {merchant && (
              <AbandonedCarts 
                merchantId={merchant.id}
                trackingEnabled={merchant.enable_abandoned_tracking}
                onToggleTracking={handleToggleAbandonedTracking}
              />
            )}
          </TabsContent>

          <TabsContent value="courier">
            {merchant && (
              <CourierOrders 
                merchantId={merchant.id}
                apiKey={merchant.api_key}
                initialCredentials={{
                  steadfast_api_key: merchant.steadfast_api_key || '',
                  steadfast_secret_key: merchant.steadfast_secret_key || '',
                  pathao_client_id: merchant.pathao_client_id || '',
                  pathao_client_secret: merchant.pathao_client_secret || '',
                  pathao_username: merchant.pathao_username || '',
                  pathao_password: merchant.pathao_password || '',
                  redx_api_token: merchant.redx_api_token || ''
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
