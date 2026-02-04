import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Merchant {
  id: string;
  user_id: string;
  website_url: string | null;
  api_key: string;
  cooldown_period_days: number;
  created_at: string;
  updated_at: string;
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

export function useMerchantData() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [logs, setLogs] = useState<FraudLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMerchant = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Try to get existing merchant
      let { data: merchantData, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If no merchant exists, create one
      if (error && error.code === 'PGRST116') {
        const { data: newMerchant, error: insertError } = await supabase
          .from('merchants')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating merchant:', insertError);
          toast({
            title: "Error",
            description: "Failed to create merchant profile",
            variant: "destructive"
          });
        } else {
          merchantData = newMerchant;
        }
      } else if (error) {
        console.error('Error fetching merchant:', error);
      }

      if (merchantData) {
        setMerchant(merchantData as Merchant);
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

  const updateCooldownPeriod = async (days: number) => {
    if (!merchant?.id) return;

    const { error } = await supabase
      .from('merchants')
      .update({ cooldown_period_days: days, updated_at: new Date().toISOString() })
      .eq('id', merchant.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update cooldown period",
        variant: "destructive"
      });
    } else {
      setMerchant({ ...merchant, cooldown_period_days: days });
      toast({
        title: "Success",
        description: `Cooldown period updated to ${days} days`,
      });
    }
  };

  const updateWebsiteUrl = async (url: string) => {
    if (!merchant?.id) return;

    const { error } = await supabase
      .from('merchants')
      .update({ website_url: url, updated_at: new Date().toISOString() })
      .eq('id', merchant.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update website URL",
        variant: "destructive"
      });
    } else {
      setMerchant({ ...merchant, website_url: url });
      toast({
        title: "Success",
        description: "Website URL updated",
      });
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
      toast({
        title: "Error",
        description: "Failed to regenerate API key",
        variant: "destructive"
      });
    } else {
      setMerchant({ ...merchant, api_key: newApiKey });
      toast({
        title: "Success",
        description: "API key regenerated. Update your WordPress integration!",
      });
    }
  };

  const addToBlacklist = async (value: string, type: string, reason?: string) => {
    if (!merchant?.id) return;

    const { data, error } = await supabase
      .from('blacklist')
      .insert({
        merchant_id: merchant.id,
        blocked_value: value,
        block_type: type,
        reason: reason || null
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add to blacklist",
        variant: "destructive"
      });
    } else {
      setBlacklist([data as BlacklistEntry, ...blacklist]);
      toast({
        title: "Success",
        description: `${type} added to blacklist`,
      });
    }
  };

  const removeFromBlacklist = async (id: string) => {
    const { error } = await supabase
      .from('blacklist')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove from blacklist",
        variant: "destructive"
      });
    } else {
      setBlacklist(blacklist.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Removed from blacklist",
      });
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
    blacklist,
    logs,
    loading,
    updateCooldownPeriod,
    updateWebsiteUrl,
    regenerateApiKey,
    addToBlacklist,
    removeFromBlacklist,
    refetchLogs: fetchLogs,
    refetchBlacklist: fetchBlacklist
  };
}
