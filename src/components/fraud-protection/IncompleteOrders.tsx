import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConvertToOrderModal } from "./ConvertToOrderModal";
import { 
  RefreshCw, Trash2, ShoppingCart, ArrowRightCircle,
  Search, User, Phone, Eye, X, ExternalLink, AlertTriangle
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [convertOrder, setConvertOrder] = useState<IncompleteOrder | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState<IncompleteOrder | null>(null);

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

  // Stats calculations
  const now = new Date();
  const last24h = orders.filter(o => {
    const diff = now.getTime() - new Date(o.created_at).getTime();
    return diff < 24 * 60 * 60 * 1000 && !o.is_converted;
  });
  const last24hCount = last24h.length;
  const last24hValue = last24h.reduce((sum, o) => sum + (Number(o.cart_total) || 0), 0);
  const totalIncomplete = orders.filter(o => !o.is_converted).length;

  const getCartItemCount = (order: IncompleteOrder) => {
    if (!order.cart_items || order.cart_items.length === 0) return 0;
    return order.cart_items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  const renderMobileCard = (order: IncompleteOrder) => (
    <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{order.customer_name || 'Unknown'}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="h-3 w-3" />
              <span>{order.phone_number}</span>
            </div>
          </div>
        </div>
        {order.is_converted && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">Converted</span>
        )}
      </div>

      <div className="flex items-center justify-between mb-3 text-sm">
        <span className="text-gray-900 font-semibold">
          {order.cart_total ? `৳${Number(order.cart_total).toLocaleString()}` : '—'}
          {order.cart_items && order.cart_items.length > 0 && (
            <span className="text-gray-400 font-normal text-xs ml-1">({getCartItemCount(order)} items)</span>
          )}
        </span>
        <span className="text-gray-400 text-xs">
          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <Button size="sm" variant="outline" className="h-8 text-xs flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
          onClick={() => setDetailsOrder(order)}>
          <Eye className="h-3.5 w-3.5 mr-1" /> Details
        </Button>
        {!order.is_converted && (
          <Button size="sm" variant="outline" className="h-8 text-xs flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            onClick={() => setConvertOrder(order)}>
            <ArrowRightCircle className="h-3.5 w-3.5 mr-1" /> Convert
          </Button>
        )}
        <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-red-200 text-red-500 hover:bg-red-50"
          onClick={() => handleDelete(order.id)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {convertOrder && (
        <ConvertToOrderModal
          open={!!convertOrder}
          onClose={() => setConvertOrder(null)}
          order={convertOrder}
          onConverted={handleConverted}
        />
      )}

      {/* Details Modal */}
      <Dialog open={!!detailsOrder} onOpenChange={(open) => !open && setDetailsOrder(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-lg">Checkout Details</DialogTitle>
          </DialogHeader>
          {detailsOrder && (
            <div className="space-y-5">
              {/* Customer Information */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-500">Name</span>
                    <span className="text-sm font-medium text-gray-900">{detailsOrder.customer_name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-t border-gray-50">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm text-gray-400">Not provided</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-t border-gray-50">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="text-sm font-medium text-gray-900">{detailsOrder.phone_number}</span>
                  </div>
                </div>
              </div>

              {/* Cart Details */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Cart Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-500">Cart Value</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {detailsOrder.cart_total ? `৳${Number(detailsOrder.cart_total).toLocaleString()}` : '—'}
                    </span>
                  </div>
                  {detailsOrder.cart_items && detailsOrder.cart_items.length > 0 && (
                    <div className="pt-1.5 border-t border-gray-50">
                      <span className="text-sm text-gray-500 block mb-2">Items</span>
                      <div className="space-y-1.5">
                        {detailsOrder.cart_items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-gray-700 truncate mr-2">{item.name}</span>
                            <span className="text-gray-500 shrink-0">×{item.quantity} — ৳{item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout Information */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Checkout Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-500">Address</span>
                    <span className="text-sm text-gray-900 text-right max-w-[200px]">{detailsOrder.address || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-t border-gray-50">
                    <span className="text-sm text-gray-500">Captured on</span>
                    <span className="text-sm text-gray-900">{format(new Date(detailsOrder.created_at), 'MMM dd, yyyy hh:mm a')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Incomplete Carts (Last 24h)</p>
            <p className="text-2xl font-bold text-gray-900">{last24hCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Value of Carts (Last 24h)</p>
            <p className="text-2xl font-bold text-gray-900">৳{last24hValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Total Incomplete Carts</p>
            <p className="text-2xl font-bold text-gray-900">{totalIncomplete}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Need More Features?</p>
            <Button size="sm" variant="outline" className="mt-1 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => window.open('https://webcreation-bd.lovable.app/dashboard', '_blank')}>
              <ExternalLink className="h-3 w-3 mr-1" /> Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-gray-500" /> Incomplete Checkouts
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search checkouts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white border-gray-200 text-gray-900 text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-36 bg-white border-gray-200 text-gray-700 text-sm">
                    <SelectValue placeholder="Filter" />
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
                {totalIncomplete > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCleanupAll} 
                    disabled={cleaning}
                    className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 w-full sm:w-auto"
                  >
                    <AlertTriangle className={`h-4 w-4 mr-2 ${cleaning ? 'animate-spin' : ''}`} />
                    {cleaning ? 'Cleaning...' : `Clean All (${totalIncomplete})`}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-4 sm:p-5 pt-0 sm:pt-0">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">No incomplete orders found</p>
              <p className="text-sm text-gray-400 mt-1">Checkout attempts will appear here automatically</p>
            </div>
          ) : isMobile ? (
            <div className="pt-4">{filteredOrders.map(renderMobileCard)}</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 bg-gray-50/80">
                    <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wide">Customer</TableHead>
                    <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wide">Contact</TableHead>
                    <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wide">Cart</TableHead>
                    <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wide">Last Active</TableHead>
                    <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-wide text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id} className="border-gray-100 hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{order.customer_name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm text-gray-700">{order.phone_number}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="text-sm font-semibold text-gray-900">
                            {order.cart_total ? `৳${Number(order.cart_total).toLocaleString()}` : '—'}
                          </span>
                          {order.cart_items && order.cart_items.length > 0 && (
                            <span className="text-xs text-gray-400 ml-1.5">({getCartItemCount(order)} items)</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => setDetailsOrder(order)}>
                            Details
                          </Button>
                          {!order.is_converted && (
                            <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => setConvertOrder(order)}>
                              Convert
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-500 hover:bg-red-50"
                            onClick={() => handleDelete(order.id)}>
                            Cancel
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
