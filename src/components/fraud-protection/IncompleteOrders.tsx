import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConvertToOrderModal } from "./ConvertToOrderModal";
import { 
  RefreshCw, Trash2, Phone, CheckCircle, 
  ShoppingCart, MessageCircle, ArrowRightCircle,
  TrendingUp, DollarSign, Calendar, AlertTriangle
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

export function IncompleteOrders({ merchantId }: IncompleteOrdersProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [orders, setOrders] = useState<IncompleteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
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

  const getStatusBadge = (order: IncompleteOrder) => {
    if (order.is_converted) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✅ Converted</Badge>;
    return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">🆕 New</Badge>;
  };

  const renderMobileCard = (order: IncompleteOrder) => (
    <Card key={order.id} className="bg-slate-700/30 border-slate-600 mb-3">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-white text-sm font-medium">{order.phone_number}</p>
            <p className="text-slate-400 text-xs">{order.customer_name || 'Unknown'}</p>
            {order.address && <p className="text-slate-500 text-xs truncate">{order.address}</p>}
          </div>
          {getStatusBadge(order)}
        </div>

        {order.cart_items && order.cart_items.length > 0 && (
          <div className="space-y-1">
            {order.cart_items.slice(0, 2).map((item, idx) => (
              <div key={idx} className="text-xs bg-slate-700 rounded px-2 py-1 flex justify-between">
                <span className="text-white truncate mr-2">{item.name.substring(0, 30)}</span>
                <span className="text-slate-400 shrink-0">×{item.quantity} ৳{item.price}</span>
              </div>
            ))}
            {order.cart_items.length > 2 && (
              <span className="text-xs text-slate-500">+{order.cart_items.length - 2} more</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {order.cart_total ? (
              <span className="text-cyan-400 font-medium text-sm">৳{Number(order.cart_total).toLocaleString()}</span>
            ) : null}
            <span className="text-slate-500 text-xs">
              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-600">
          {!order.is_converted && (
            <Button size="sm" variant="ghost" className="h-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 text-xs flex-1"
              onClick={() => setConvertOrder(order)}>
              <ArrowRightCircle className="h-3.5 w-3.5 mr-1" /> Convert
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-8 text-green-400 hover:text-green-300 hover:bg-green-400/10"
            onClick={() => window.open(`https://wa.me/${order.phone_number.replace(/\D/g, '')}`, '_blank')}>
            <MessageCircle className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
            onClick={() => window.open(`tel:${order.phone_number}`)}>
            <Phone className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-slate-400 hover:text-white hover:bg-slate-600/50"
            onClick={() => handleDelete(order.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
        <Card className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border-cyan-700/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <ShoppingCart className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-2xl sm:text-3xl font-bold text-cyan-400">{totalOrders}</p>
            <p className="text-xs text-cyan-300/70">Incomplete</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-700/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <CheckCircle className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <p className="text-2xl sm:text-3xl font-bold text-green-400">{convertedCount}</p>
            <p className="text-xs text-green-300/70">Converted</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-700/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <DollarSign className="h-5 w-5 text-amber-400 mx-auto mb-1" />
            <p className="text-2xl sm:text-3xl font-bold text-amber-400">৳{potentialRevenue.toLocaleString()}</p>
            <p className="text-xs text-amber-300/70">Potential Revenue</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <Calendar className="h-5 w-5 text-purple-400 mx-auto mb-1" />
            <p className="text-2xl sm:text-3xl font-bold text-purple-400">{todayCount}</p>
            <p className="text-xs text-purple-300/70">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-5 w-5" /> Incomplete Orders
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40 bg-slate-900 border-slate-600 text-white text-sm">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="new">New Only</SelectItem>
                  <SelectItem value="converted">Converted Only</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="border-slate-600 w-full sm:w-auto">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              {totalOrders > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCleanupAll} 
                  disabled={cleaning}
                  className="border-red-600/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full sm:w-auto"
                >
                  <AlertTriangle className={`h-4 w-4 mr-2 ${cleaning ? 'animate-spin' : ''}`} />
                  {cleaning ? 'Cleaning...' : `Clean All (${totalOrders})`}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No incomplete orders found</p>
              <p className="text-sm">Checkout attempts will appear here automatically</p>
            </div>
          ) : isMobile ? (
            <div>{orders.map(renderMobileCard)}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Phone</TableHead>
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Address</TableHead>
                    <TableHead className="text-slate-400">Products</TableHead>
                    <TableHead className="text-slate-400">Cart Total</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Time</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white text-sm">{order.phone_number}</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                              onClick={() => window.open(`https://wa.me/${order.phone_number.replace(/\D/g, '')}`, '_blank')}>
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300"
                              onClick={() => window.open(`tel:${order.phone_number}`)}>
                              <Phone className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">{order.customer_name || '-'}</TableCell>
                      <TableCell className="text-slate-400 text-xs max-w-[150px] truncate">{order.address || '-'}</TableCell>
                      <TableCell>
                        {order.cart_items && order.cart_items.length > 0 ? (
                          <div className="space-y-1 max-w-[200px]">
                            {order.cart_items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-xs bg-slate-700 rounded px-2 py-1 flex justify-between gap-2">
                                <span className="text-white truncate">{item.name.substring(0, 25)}</span>
                                <span className="text-slate-400 shrink-0">×{item.quantity}</span>
                              </div>
                            ))}
                            {order.cart_items.length > 2 && (
                              <span className="text-xs text-slate-500">+{order.cart_items.length - 2} more</span>
                            )}
                          </div>
                        ) : <span className="text-slate-500 text-sm">-</span>}
                      </TableCell>
                      <TableCell>
                        {order.cart_total ? (
                          <span className="text-cyan-400 font-medium">৳{Number(order.cart_total).toLocaleString()}</span>
                        ) : <span className="text-slate-500">-</span>}
                      </TableCell>
                      <TableCell>{getStatusBadge(order)}</TableCell>
                      <TableCell className="text-slate-400 text-xs">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!order.is_converted && (
                            <Button size="sm" variant="ghost" className="h-7 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 text-xs"
                              onClick={() => setConvertOrder(order)}>
                              <ArrowRightCircle className="h-3.5 w-3.5 mr-1" /> Convert
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-600/50"
                            onClick={() => handleDelete(order.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
