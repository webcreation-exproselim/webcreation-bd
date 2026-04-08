import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Merchant {
  id: string;
  user_id: string;
  website_url: string | null;
  store_name: string | null;
  api_key: string;
  cooldown_period_days: number;
  cooldown_period_minutes: number;
  is_active: boolean;
  current_plan: string | null;
  plan_expires_at: string | null;
  requests_used: number;
  max_requests: number;
  created_at: string;
  updated_at: string;
  // Plugin remote settings
  popup_timer_seconds: number;
  popup_language: string;
  msg_cooldown: string;
  msg_blacklist: string;
  whatsapp_number: string | null;
  phone_number: string | null;
  show_contact_buttons: boolean;
  // Abandoned cart tracking
  enable_abandoned_tracking: boolean;
  abandoned_timeout_minutes: number;
  // Courier credentials
  steadfast_api_key: string | null;
  steadfast_secret_key: string | null;
  pathao_client_id: string | null;
  pathao_client_secret: string | null;
  pathao_username: string | null;
  pathao_password: string | null;
  redx_api_token: string | null;
}

interface BlacklistEntry {
  id: string;
  merchant_id: string;
  blocked_value: string;
  block_type: string;
  reason: string | null;
  created_at: string;
}

interface FraudLog {
  id: string;
  merchant_id: string;
  phone_number: string | null;
  ip_address: string | null;
  device_fingerprint: string | null;
  status: string;
  created_at: string;
}

const applyMerchantDefaults = (data: any): Merchant => ({
  ...data,
  store_name: data.store_name ?? null,
  cooldown_period_minutes: data.cooldown_period_minutes ?? 1440,
  is_active: data.is_active ?? false,
  current_plan: data.current_plan ?? null,
  plan_expires_at: data.plan_expires_at ?? null,
  requests_used: data.requests_used ?? 0,
  max_requests: data.max_requests ?? 0,
  popup_timer_seconds: data.popup_timer_seconds ?? 30,
  popup_language: data.popup_language ?? 'bn',
  msg_cooldown: data.msg_cooldown ?? 'আপনি সম্প্রতি অর্ডার করেছেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।',
  msg_blacklist: data.msg_blacklist ?? 'আপনার অর্ডার ব্লক করা হয়েছে। সমস্যা হলে যোগাযোগ করুন।',
  whatsapp_number: data.whatsapp_number ?? null,
  phone_number: data.phone_number ?? null,
  show_contact_buttons: data.show_contact_buttons ?? true,
  enable_abandoned_tracking: data.enable_abandoned_tracking ?? false,
  abandoned_timeout_minutes: data.abandoned_timeout_minutes ?? 5,
  steadfast_api_key: data.steadfast_api_key ?? null,
  steadfast_secret_key: data.steadfast_secret_key ?? null,
  pathao_client_id: data.pathao_client_id ?? null,
  pathao_client_secret: data.pathao_client_secret ?? null,
  pathao_username: data.pathao_username ?? null,
  pathao_password: data.pathao_password ?? null,
  redx_api_token: data.redx_api_token ?? null,
});

export function useMerchantData(overrideUserId?: string | null) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [logs, setLogs] = useState<FraudLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Derived: selected merchant (or first one)
  const merchant = merchants.find(m => m.id === selectedMerchantId) || merchants[0] || null;

  const fetchMerchant = async () => {
    try {
      let targetUserId = overrideUserId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        targetUserId = user.id;
      }

      // Fetch ALL merchants for this user
      const { data: merchantsData, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching merchants:', error);
        setLoading(false);
        return;
      }

      if (merchantsData && merchantsData.length > 0) {
        const fullMerchants = merchantsData.map(applyMerchantDefaults);
        setMerchants(fullMerchants);
        // Keep selection if still valid, otherwise select first active one
        if (!selectedMerchantId || !fullMerchants.find(m => m.id === selectedMerchantId)) {
          const firstActive = fullMerchants.find(m => m.is_active) || fullMerchants[0];
          setSelectedMerchantId(firstActive.id);
        }
      } else {
        // No merchant exists — create one
        const { data: newMerchant, error: insertError } = await supabase
          .from('merchants')
          .insert({ user_id: targetUserId })
          .select()
          .single();

        if (!insertError && newMerchant) {
          const full = applyMerchantDefaults(newMerchant);
          setMerchants([full]);
          setSelectedMerchantId(full.id);
        } else {
          console.error('Error creating merchant:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in fetchMerchant:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlacklist = async () => {
    if (!merchant?.id) return;

    const { data, error } = await supabase
      .from('blacklist')
      .select('*')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blacklist:', error);
    } else {
      setBlacklist(data as BlacklistEntry[]);
    }
  };

  const fetchLogs = async () => {
    if (!merchant?.id) return;

    const { data, error } = await supabase
      .from('fraud_logs')
      .select('*')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data as FraudLog[]);
    }
  };

  const updateCooldownMinutes = async (minutes: number) => {
    if (!merchant?.id) return;

    const { error } = await supabase
      .from('merchants')
      .update({ cooldown_period_minutes: minutes, updated_at: new Date().toISOString() })
      .eq('id', merchant.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update cooldown period", variant: "destructive" });
    } else {
      setMerchants(prev => prev.map(m => m.id === merchant.id ? { ...m, cooldown_period_minutes: minutes } : m));
      toast({ title: "Success", description: "Cooldown period updated" });
    }
  };

  const updateCooldownPeriod = async (days: number) => {
    await updateCooldownMinutes(days * 1440);
  };

  const updateWebsiteUrl = async (url: string) => {
    if (!merchant?.id) return;

    const { error } = await supabase
      .from('merchants')
      .update({ website_url: url, updated_at: new Date().toISOString() })
      .eq('id', merchant.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update website URL", variant: "destructive" });
    } else {
      setMerchants(prev => prev.map(m => m.id === merchant.id ? { ...m, website_url: url } : m));
      toast({ title: "Success", description: "Website URL updated" });
    }
  };

  const regenerateApiKey = async () => {
    if (!merchant?.id) return;

    const newApiKey = crypto.randomUUID();
    const { error } = await supabase
      .from('merchants')
      .update({ api_key: newApiKey, updated_at: new Date().toISOString() })
      .eq('id', merchant.id);

    if (error) {
      toast({ title: "Error", description: "Failed to regenerate API key", variant: "destructive" });
    } else {
      setMerchants(prev => prev.map(m => m.id === merchant.id ? { ...m, api_key: newApiKey } : m));
      toast({ title: "Success", description: "API key regenerated. Update your WordPress integration!" });
    }
  };

  const addToBlacklist = async (value: string, type: string, reason?: string) => {
    if (!merchant?.id) return;

    const { data, error } = await supabase
      .from('blacklist')
      .insert({ merchant_id: merchant.id, blocked_value: value, block_type: type, reason: reason || null })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to add to blacklist", variant: "destructive" });
    } else {
      setBlacklist([data as BlacklistEntry, ...blacklist]);
      toast({ title: "Success", description: `${type} added to blacklist` });
    }
  };

  const removeFromBlacklist = async (id: string) => {
    const { error } = await supabase.from('blacklist').delete().eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to remove from blacklist", variant: "destructive" });
    } else {
      setBlacklist(blacklist.filter(item => item.id !== id));
      toast({ title: "Success", description: "Removed from blacklist" });
    }
  };

  useEffect(() => {
    fetchMerchant();
  }, []);

  useEffect(() => {
    if (merchant?.id) {
      fetchBlacklist();
      fetchLogs();
    }
  }, [merchant?.id]);

  return {
    merchant,
    merchants,
    selectedMerchantId,
    setSelectedMerchantId,
    blacklist,
    logs,
    loading,
    updateCooldownPeriod,
    updateCooldownMinutes,
    updateWebsiteUrl,
    regenerateApiKey,
    addToBlacklist,
    removeFromBlacklist,
    refetchLogs: fetchLogs,
    refetchBlacklist: fetchBlacklist,
    refetchMerchant: fetchMerchant
  };
}
