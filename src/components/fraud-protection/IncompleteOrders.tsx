import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConvertToOrderModal } from "./ConvertToOrderModal";
import { 
  RefreshCw, Trash2, Phone, CheckCircle, 
  ShoppingCart, MessageCircle, ArrowRightCircle,
  TrendingUp, DollarSign, Calendar, AlertTriangle,
  Search, Flame, Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  product_id?: number;
}

interface IncompleteOrder {
  id: string;
  phone_number: string;
  customer_name: string | null;
  address: string | null;
  ip_address: string | null;
  device_fingerprint: string | null;
  cart_total: number | null;
  cart_items: CartItem[] | null;
  failure_reason: string;
  is_converted: boolean;
  created_at: string;
}

interface IncompleteOrdersProps {
  merchantId: string;
}

type OrderStatus = 'hot' | 'warm' | 'cold' | 'converted';

function getOrderStatus(order: IncompleteOrder): OrderStatus {
  if (order.is_converted) return 'converted';
  const diffHours = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60);
  if (diffHours > 24) return 'cold';
  if (diffHours > 1) return 'warm';
  return 'hot';
}

function getWhatsAppUrl(phone: string, name: string | null, cartTotal: number | null): string {
  let waNum = phone.replace(/\D/g, '');
  if (waNum.length === 11 && waNum.startsWith('0')) waNum = '88' + waNum;
  const message = `Hello ${name || 'Customer'}, apnar cart e kicu products royeche. Cart value: ৳${cartTotal || 0}. Order complete korte chaile amader janaben.`;
  return `https://wa.me/${waNum}?text=${encodeURIComponent(message)}`;
}

export function IncompleteOrders({ merchantId }: IncompleteOrdersProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [orders, setOrders] = useState<IncompleteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [convertOrder, setConvertOrder] = useState<IncompleteOrder | null>(null);
  const [cleaning, setCleaning] = useState(false);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('incomplete_orders')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(200);

      if (filterStatus === "new") query = query.eq('is_converted', false);
      else if (filterStatus === "converted") query = query.eq('is_converted', true);

      const { data, error } = await query;
      if (error) throw error;
      
      const mappedOrders: IncompleteOrder[] = (data || []).map((item: any) => ({
        id: item.id,
        phone_number: item.phone_number,
        customer_name: item.customer_name,
        address: item.address || null,
        ip_address: item.ip_address,
        device_fingerprint: item.device_fingerprint,
        cart_total: item.cart_total,
        cart_items: Array.isArray(item.cart_items) ? item.cart_items as CartItem[] : null,
        failure_reason: item.failure_reason,
        is_converted: item.is_converted,
        created_at: item.created_at,
      }));
      
      setOrders(mappedOrders);
    } catch (error: any) {
      console.error('Error fetching incomplete orders:', error);
      toast({ title: "Error", description: "Failed to fetch incomplete orders", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [merchantId, filterStatus]);

  useEffect(() => {
    if (!merchantId) return;
    const channel = supabase
      .channel(`incomplete-orders-${merchantId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incomplete_orders' },
        () => { fetchOrders(); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [merchantId]);

  const handleRefresh = () => { setRefreshing(true); fetchOrders(); };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('incomplete_orders').delete().eq('id', id);
      if (error) throw error;
      setOrders(orders.filter(o => o.id !== id));
      toast({ title: "Deleted", description: "Record deleted" });
    } catch { toast({ title: "Error", description: "Failed to delete", variant: "destructive" }); }
  };

  const handleConverted = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, is_converted: true } : o));
  };

  const handleCleanupAll = async () => {
    if (!confirm('সব incomplete (non-converted) records মুছে ফেলতে চান? এই action undo করা যাবে না।')) return;
    setCleaning(true);
    try {
      const { error } = await supabase
        .from('incomplete_orders')
        .delete()
        .eq('merchant_id', merchantId)
        .eq('is_converted', false);
      if (error) throw error;
      setOrders(orders.filter(o => o.is_converted));
      toast({ title: "✅ Cleanup Complete", description: "সব incomplete records মুছে ফেলা হয়েছে" });
    } catch (error: any) {
      console.error('Cleanup error:', error);
      toast({ title: "Error", description: "Cleanup failed: " + error.message, variant: "destructive" });
    } finally {
      setCleaning(false);
    }
  };

  // Filter orders by search
  const filteredOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.phone_number.toLowerCase().includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.address || '').toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (order: IncompleteOrder) => {
    const status = getOrderStatus(order);
    switch (status) {
      case 'converted':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">✅ Converted</Badge>;
      case 'hot':
        return <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">🔥 Hot</Badge>;
      case 'warm':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">🔶 Warm</Badge>;
      case 'cold':
        return <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs">❄️ Cold</Badge>;
    }
  };

  const renderMobileCard = (order: IncompleteOrder) => {
    const status = getOrderStatus(order);
    const isCold = status === 'cold';
    
    return (
      <Card key={order.id} className={`bg-white border border-gray-200 mb-3 shadow-sm ${isCold ? 'opacity-60' : ''}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-gray-900 text-sm font-medium">{order.phone_number}</p>
              <p className="text-gray-500 text-xs">{order.customer_name || 'Unknown'}</p>
              {order.address && <p className="text-gray-400 text-xs truncate">{order.address}</p>}
            </div>
            {getStatusBadge(order)}
          </div>

          {order.cart_items && order.cart_items.length > 0 && (
            <div className="space-y-1">
              {order.cart_items.slice(0, 2).map((item, idx) => (
                <div key={idx} className="text-xs bg-gray-50 border border-gray-100 rounded px-2 py-1 flex justify-between">
                  <span className="text-gray-700 truncate mr-2">{item.name.substring(0, 30)}</span>
                  <span className="text-gray-400 shrink-0">×{item.quantity} ৳{item.price}</span>
                </div>
              ))}
              {order.cart_items.length > 2 && (
                <span className="text-xs text-gray-400">+{order.cart_items.length - 2} more</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {order.cart_total ? (
                <span className="text-blue-600 font-semibold text-sm">৳{Number(order.cart_total).toLocaleString()}</span>
              ) : null}
              <span className="text-gray-400 text-xs">
                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            {!order.is_converted && (
              <Button size="sm" variant="ghost" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs flex-1"
                onClick={() => setConvertOrder(order)}>
                <ArrowRightCircle className="h-3.5 w-3.5 mr-1" /> Convert
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => window.open(getWhatsAppUrl(order.phone_number, order.customer_name, order.cart_total), '_blank')}>
              <MessageCircle className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => window.open(`tel:${order.phone_number}`)}>
              <Phone className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
              onClick={() => handleDelete(order.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Stats
  const totalOrders = orders.filter(o => !o.is_converted).length;
  const convertedCount = orders.filter(o => o.is_converted).length;
  const potentialRevenue = orders.filter(o => !o.is_converted).reduce((sum, o) => sum + (Number(o.cart_total) || 0), 0);
  const todayCount = orders.filter(o => {
    return new Date(o.created_at).toDateString() === new Date().toDateString() && !o.is_converted;
  }).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {convertOrder && (
        <ConvertToOrderModal
          open={!!convertOrder}
          onClose={() => setConvertOrder(null)}
          order={convertOrder}
          onConverted={handleConverted}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white border border-gray-200 border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-3 sm:p-4 text-center">
            <ShoppingCart className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{totalOrders}</p>
            <p className="text-xs text-gray-500">Incomplete</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-3 sm:p-4 text-center">
            <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{convertedCount}</p>
            <p className="text-xs text-gray-500">Converted</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-3 sm:p-4 text-center">
            <DollarSign className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">৳{potentialRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Potential Revenue</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-3 sm:p-4 text-center">
            <Calendar className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">{todayCount}</p>
            <p className="text-xs text-gray-500">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-gray-900 flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" /> Incomplete Orders
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search phone, name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white border-gray-200 text-gray-900 text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-36 bg-white border-gray-200 text-gray-700 text-sm">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="new">New Only</SelectItem>
                    <SelectItem value="converted">Converted Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto">
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                </Button>
                {totalOrders > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCleanupAll} 
                    disabled={cleaning}
                    className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 w-full sm:w-auto"
                  >
                    <AlertTriangle className={`h-4 w-4 mr-2 ${cleaning ? 'animate-spin' : ''}`} />
                    {cleaning ? 'Cleaning...' : `Clean All (${totalOrders})`}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-gray-600">No incomplete orders found</p>
              <p className="text-sm text-gray-400">Checkout attempts will appear here automatically</p>
            </div>
          ) : isMobile ? (
            <div>{filteredOrders.map(renderMobileCard)}</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 bg-gray-50">
                    <TableHead className="text-gray-600 font-semibold">Customer</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Contact</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Cart Value</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Last Seen</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-600 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => {
                    const status = getOrderStatus(order);
                    const isCold = status === 'cold';
                    
                    return (
                      <TableRow 
                        key={order.id} 
                        className={`border-gray-100 hover:bg-gray-50 ${isCold ? 'opacity-60 bg-gray-50/50' : ''} ${status === 'hot' ? 'bg-red-50/30' : ''}`}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{order.customer_name || 'Unknown'}</p>
                            {order.address && (
                              <p className="text-gray-400 text-xs truncate max-w-[150px]">{order.address}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-gray-900 text-sm font-medium">{order.phone_number}</span>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => window.open(getWhatsAppUrl(order.phone_number, order.customer_name, order.cart_total), '_blank')}
                                title="WhatsApp with cart recovery message">
                                <MessageCircle className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => window.open(`tel:${order.phone_number}`)}
                                title="Call customer">
                                <Phone className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.cart_total ? (
                            <span className="text-blue-600 font-semibold">৳{Number(order.cart_total).toLocaleString()}</span>
                          ) : <span className="text-gray-300">-</span>}
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!order.is_converted && (
                              <Button size="sm" variant="ghost" className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                                onClick={() => setConvertOrder(order)}>
                                <ArrowRightCircle className="h-3.5 w-3.5 mr-1" /> Convert
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                              onClick={() => handleDelete(order.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
