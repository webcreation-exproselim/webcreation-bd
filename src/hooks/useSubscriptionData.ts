import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionOrder {
  id: string;
  merchant_id: string;
  plan_type: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  sender_number: string;
  payment_screenshot_url: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
}

export function useSubscriptionData(merchantId: string | null) {
  const [pendingOrder, setPendingOrder] = useState<SubscriptionOrder | null>(null);
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!merchantId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscription_orders')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscription orders:', error);
      } else if (data) {
        setOrders(data as SubscriptionOrder[]);
        
        // Find pending order
        const pending = data.find(order => order.status === 'pending');
        setPendingOrder(pending as SubscriptionOrder || null);
      }
    } catch (error) {
      console.error('Error in fetchOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [merchantId]);

  return {
    pendingOrder,
    orders,
    loading,
    refetch: fetchOrders,
  };
}