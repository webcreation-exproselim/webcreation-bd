import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CourierCheckSubscription {
  id: string;
  user_id: string;
  api_key: string;
  is_active: boolean;
  plan_expires_at: string | null;
  website_url: string | null;
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

export function useCourierCheckData(userId: string | null) {
  const [subscription, setSubscription] = useState<CourierCheckSubscription | null>(null);
  const [pendingOrder, setPendingOrder] = useState<CourierCheckOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch or create subscription
      let { data: subData, error: subError } = await supabase
        .from('courier_check_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!subData && !subError) {
        // Create subscription record
        const { data: newSub, error: insertError } = await supabase
          .from('courier_check_subscriptions')
          .insert({ user_id: userId })
          .select('*')
          .single();

        if (!insertError && newSub) {
          subData = newSub;
        }
      }

      if (subData) {
        setSubscription(subData as CourierCheckSubscription);

        // Fetch pending order
        const { data: orderData } = await supabase
          .from('courier_check_orders')
          .select('*')
          .eq('subscription_id', subData.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setPendingOrder(orderData as CourierCheckOrder || null);
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

  return {
    subscription,
    pendingOrder,
    loading,
    refetch: fetchData,
  };
}
