import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CourierCheckSubscription {
  id: string;
  user_id: string;
  api_key: string;
  is_active: boolean;
  plan_expires_at: string | null;
  website_url: string | null;
  store_name: string | null;
  requests_used: number;
  max_requests: number;
  created_at: string;
  updated_at: string;
}

interface CourierCheckOrder {
  id: string;
  subscription_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  sender_number: string;
  payment_screenshot_url: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
}

export function useCourierCheckData(userId: string | null, skipAutoCreate: boolean = false) {
  const [subscriptions, setSubscriptions] = useState<CourierCheckSubscription[]>([]);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<CourierCheckOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Derived
  const subscription = subscriptions.find(s => s.id === selectedSubscriptionId) || subscriptions[0] || null;

  const fetchData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch ALL subscriptions for this user
      const { data: subsData, error: subError } = await supabase
        .from('courier_check_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (subError) {
        console.error('Error fetching courier check subscriptions:', subError);
        setLoading(false);
        return;
      }

      if (subsData && subsData.length > 0) {
        const typed = subsData.map(s => ({
          ...s,
          store_name: (s as any).store_name ?? null,
        })) as CourierCheckSubscription[];
        setSubscriptions(typed);
        if (!selectedSubscriptionId || !typed.find(s => s.id === selectedSubscriptionId)) {
          const firstActive = typed.find(s => s.is_active) || typed[0];
          setSelectedSubscriptionId(firstActive.id);
        }

        // Fetch pending order for first/selected subscription
        const activeSubId = selectedSubscriptionId || typed[0].id;
        const { data: orderData } = await supabase
          .from('courier_check_orders')
          .select('*')
          .eq('subscription_id', activeSubId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setPendingOrder(orderData as CourierCheckOrder || null);
      } else {
        // Create a default subscription
        const { data: newSub, error: insertError } = await supabase
          .from('courier_check_subscriptions')
          .insert({ user_id: userId })
          .select('*')
          .single();

        if (!insertError && newSub) {
          const typed = { ...newSub, store_name: null } as CourierCheckSubscription;
          setSubscriptions([typed]);
          setSelectedSubscriptionId(typed.id);
        }
      }
    } catch (error) {
      console.error('Error fetching courier check data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Refetch pending order when selection changes
  useEffect(() => {
    if (!subscription?.id) return;
    const fetchPending = async () => {
      const { data: orderData } = await supabase
        .from('courier_check_orders')
        .select('*')
        .eq('subscription_id', subscription.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setPendingOrder(orderData as CourierCheckOrder || null);
    };
    fetchPending();
  }, [selectedSubscriptionId]);

  return {
    subscription,
    subscriptions,
    selectedSubscriptionId,
    setSelectedSubscriptionId,
    pendingOrder,
    loading,
    refetch: fetchData,
  };
}
