import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Eye, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface MerchantInfo {
  id: string;
  user_id: string;
  website_url: string | null;
}

export function FraudSubscriptionManagement() {
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscription_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data as SubscriptionOrder[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const approveOrder = async (order: SubscriptionOrder) => {
    setProcessing(order.id);

    try {
      // Calculate plan expiry
      const now = new Date();
      const daysToAdd = order.plan_type === 'yearly' ? 365 : 30;
      const expiresAt = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      
      // Max requests based on plan
      const maxRequests = order.plan_type === 'yearly' ? 15000 : 1000;

      // Update merchant
      const { error: merchantError } = await supabase
        .from('merchants')
        .update({
          is_active: true,
          current_plan: order.plan_type,
          plan_expires_at: expiresAt.toISOString(),
          max_requests: maxRequests,
          requests_used: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.merchant_id);

      if (merchantError) throw merchantError;

      // Update order status
      const { error: orderError } = await supabase
        .from('subscription_orders')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      toast({
        title: "✅ Approved",
        description: `${order.plan_type} plan activated for merchant`,
      });

      fetchOrders();
    } catch (error) {
      console.error('Error approving order:', error);
      toast({
        title: "Error",
        description: "Failed to approve order",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const rejectOrder = async (orderId: string) => {
    setProcessing(orderId);

    try {
      const { error } = await supabase
        .from('subscription_orders')
        .update({ status: 'rejected' })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Rejected",
        description: "Order has been rejected",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: "Error",
        description: "Failed to reject order",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Approved</span>;
      case 'rejected':
        return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">Rejected</span>;
      default:
        return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">Pending</span>;
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const processedOrders = orders.filter(o => o.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 font-bengali">
          Fraud Guard Subscriptions
        </h2>
        <Button onClick={fetchOrders} variant="outline" size="sm" className="border-gray-200 text-gray-700 hover:bg-gray-100">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Pending Orders */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          Pending Approvals ({pendingOrders.length})
        </h3>

        {pendingOrders.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
            No pending orders
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-800">
                        {order.plan_type === 'yearly' ? 'Yearly' : 'Monthly'} Plan
                      </span>
                      <span className="text-lg font-bold text-cyan-600">৳{order.amount}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Payment:</strong> {order.payment_method}</p>
                      <p><strong>TxnID:</strong> {order.transaction_id}</p>
                      <p><strong>Sender:</strong> {order.sender_number}</p>
                      <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString('bn-BD')}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {order.payment_screenshot_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedScreenshot(order.payment_screenshot_url)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Screenshot
                      </Button>
                    )}
                    <Button
                      onClick={() => approveOrder(order)}
                      disabled={processing === order.id}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      {processing === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => rejectOrder(order.id)}
                      disabled={processing === order.id}
                      variant="destructive"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Orders */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Order History ({processedOrders.length})
        </h3>

        {processedOrders.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
            No processed orders
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">Plan</th>
                  <th className="text-left p-3 font-medium text-gray-600">Amount</th>
                  <th className="text-left p-3 font-medium text-gray-600">Payment</th>
                  <th className="text-left p-3 font-medium text-gray-600">TxnID</th>
                  <th className="text-left p-3 font-medium text-gray-600">Status</th>
                  <th className="text-left p-3 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {processedOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="p-3 capitalize text-gray-900">{order.plan_type}</td>
                    <td className="p-3 text-gray-900 font-medium">৳{order.amount}</td>
                    <td className="p-3 capitalize text-gray-700">{order.payment_method}</td>
                    <td className="p-3 font-mono text-xs text-gray-600">{order.transaction_id}</td>
                    <td className="p-3">{getStatusBadge(order.status)}</td>
                    <td className="p-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screenshot Modal */}
      <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {selectedScreenshot && (
            <img
              src={selectedScreenshot}
              alt="Payment screenshot"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}