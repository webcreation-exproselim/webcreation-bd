import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Package, Clock, CheckCircle, XCircle, Phone, User, 
  CreditCard, Calendar, TrendingUp, Eye, RefreshCw, Image, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderService {
  id: string;
  serviceName: string;
  packageName: string;
  price: number;
  originalPrice: number;
  features: string[];
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  services: OrderService[];
  total_price: number;
  total_savings: number;
  payment_method: string;
  transaction_id: string | null;
  sender_number: string | null;
  payment_screenshot_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "অপেক্ষমান",
  processing: "প্রসেসিং",
  completed: "সম্পন্ন",
  cancelled: "বাতিল",
};

const paymentLabels: Record<string, string> = {
  bkash: "বিকাশ",
  nagad: "নগদ",
  rocket: "রকেট",
  bank: "ব্যাংক",
};

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion for the services JSON field
      const typedOrders: Order[] = (data || []).map(order => ({
        ...order,
        services: (order.services as unknown) as OrderService[]
      }));
      
      setOrders(typedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({ title: "স্ট্যাটাস আপডেট হয়েছে" });
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(o => o.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.total_price), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <div>
              <h1 className="font-bengali font-bold text-gray-900">অ্যাডমিন ড্যাশবোর্ড</h1>
              <p className="text-xs text-gray-500 font-bengali">Web Creation BD</p>
            </div>
          </div>
          <Button onClick={fetchOrders} variant="outline" size="sm" className="font-bengali">
            <RefreshCw className="w-4 h-4 mr-2" />
            রিফ্রেশ
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500 font-bengali">মোট অর্ডার</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500 font-bengali">অপেক্ষমান</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-xs text-gray-500 font-bengali">সম্পন্ন</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">৳{stats.revenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 font-bengali">আয়</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { key: "all", label: "সব" },
            { key: "pending", label: "অপেক্ষমান" },
            { key: "processing", label: "প্রসেসিং" },
            { key: "completed", label: "সম্পন্ন" },
            { key: "cancelled", label: "বাতিল" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bengali whitespace-nowrap transition-all ${
                filter === f.key
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-red-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
            <p className="text-gray-500 mt-2 font-bengali">লোড হচ্ছে...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-bengali">কোনো অর্ডার নেই</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-bengali font-medium text-gray-900">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{order.customer_phone}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">৳{Number(order.total_price).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 font-bengali">{order.services?.length || 0} সার্ভিস</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bengali">অর্ডার বিবরণ</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedOrder.created_at).toLocaleString('bn-BD')}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-bengali font-medium">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${selectedOrder.customer_phone}`} className="text-blue-600">
                    {selectedOrder.customer_phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span>{paymentLabels[selectedOrder.payment_method] || selectedOrder.payment_method}</span>
                </div>
                {selectedOrder.sender_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">প্রেরক নম্বর:</span>
                    <span className="font-medium">{selectedOrder.sender_number}</span>
                  </div>
                )}
                {selectedOrder.transaction_id && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">TrxID:</span>
                    <span className="font-mono font-medium">{selectedOrder.transaction_id}</span>
                  </div>
                )}
              </div>

              {/* Payment Screenshot */}
              {selectedOrder.payment_screenshot_url && (
                <div>
                  <h4 className="font-bengali font-semibold mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    পেমেন্ট প্রমাণ
                  </h4>
                  <div className="relative">
                    <img 
                      src={selectedOrder.payment_screenshot_url} 
                      alt="Payment proof" 
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <a
                      href={selectedOrder.payment_screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </a>
                  </div>
                </div>
              )}

              {/* Services */}
              <div>
                <h4 className="font-bengali font-semibold mb-2">সার্ভিস সমূহ</h4>
                <div className="space-y-2">
                  {selectedOrder.services?.map((service, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bengali">
                            {service.serviceName}
                          </span>
                          <span className="ml-2 font-bengali">{service.packageName}</span>
                        </div>
                        <span className="font-bold text-red-600">৳{service.price?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-bengali font-semibold">মোট</span>
                <span className="text-xl font-bold text-red-600">
                  ৳{Number(selectedOrder.total_price).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                  variant="outline"
                  className="font-bengali"
                  disabled={selectedOrder.status === 'processing'}
                >
                  প্রসেসিং
                </Button>
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                  className="bg-green-600 hover:bg-green-700 font-bengali"
                  disabled={selectedOrder.status === 'completed'}
                >
                  সম্পন্ন
                </Button>
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 font-bengali col-span-2"
                  disabled={selectedOrder.status === 'cancelled'}
                >
                  বাতিল করুন
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
