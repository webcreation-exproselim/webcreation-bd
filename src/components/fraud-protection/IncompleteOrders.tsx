import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConvertToOrderModal } from "./ConvertToOrderModal";
import { 
  RefreshCw, Trash2, Phone, AlertTriangle, CheckCircle, 
  Clock, ShoppingCart, Ban, MessageCircle, Filter, ArrowRightCircle
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
  ip_address: string | null;
  device_fingerprint: string | null;
  cart_total: number | null;
  cart_items: CartItem[] | null;
  failure_reason: string;
  is_suspicious: boolean;
  is_converted: boolean;
  created_at: string;
}

interface IncompleteOrdersProps {
  merchantId: string;
  trackingEnabled: boolean;
  autoBlockThreshold: number;
  timeWindowMinutes: number;
  onToggleTracking: (enabled: boolean) => void;
  onUpdateSettings: (threshold: number, timeWindow: number) => void;
}

export function IncompleteOrders({
  merchantId, trackingEnabled, autoBlockThreshold, timeWindowMinutes,
  onToggleTracking, onUpdateSettings
}: IncompleteOrdersProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [orders, setOrders] = useState<IncompleteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterReason, setFilterReason] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [threshold, setThreshold] = useState(autoBlockThreshold);
  const [timeWindow, setTimeWindow] = useState(timeWindowMinutes);
  const [convertOrder, setConvertOrder] = useState<IncompleteOrder | null>(null);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('incomplete_orders')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterReason !== "all") query = query.eq('failure_reason', filterReason);
      if (filterRisk === "suspicious") query = query.eq('is_suspicious', true);
      else if (filterRisk === "converted") query = query.eq('is_converted', true);

      const { data, error } = await query;
      if (error) throw error;
      
      const mappedOrders: IncompleteOrder[] = (data || []).map((item: any) => ({
        id: item.id,
        phone_number: item.phone_number,
        customer_name: item.customer_name,
        ip_address: item.ip_address,
        device_fingerprint: item.device_fingerprint,
        cart_total: item.cart_total,
        cart_items: Array.isArray(item.cart_items) ? item.cart_items as CartItem[] : null,
        failure_reason: item.failure_reason,
        is_suspicious: item.is_suspicious,
        is_converted: item.is_converted,
        created_at: item.created_at,
      }));
      
      setOrders(mappedOrders);
    } catch (error: any) {
      console.error('Error fetching incomplete orders:', error);
      toast({
        title: "Error",
        description: error?.message ? `Failed to fetch: ${error.message}` : "Failed to fetch incomplete orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId, filterReason, filterRisk]);

  useEffect(() => {
    if (!merchantId) return;
    const channel = supabase
      .channel(`incomplete-orders-${merchantId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incomplete_orders' },
        () => { fetchOrders(); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId, filterReason, filterRisk]);

  const handleRefresh = () => { setRefreshing(true); fetchOrders(); };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('incomplete_orders').delete().eq('id', id);
      if (error) throw error;
      setOrders(orders.filter(o => o.id !== id));
      toast({ title: "Deleted", description: "Record deleted" });
    } catch { toast({ title: "Error", description: "Failed to delete", variant: "destructive" }); }
  };

  const handleBlock = async (phone: string) => {
    try {
      const { error } = await supabase.from('blacklist').insert({
        merchant_id: merchantId, blocked_value: phone, block_type: 'phone',
        reason: 'Suspicious incomplete order activity'
      });
      if (error) throw error;
      toast({ title: "Blocked", description: `${phone} added to blacklist`, variant: "destructive" });
    } catch { toast({ title: "Error", description: "Failed to block", variant: "destructive" }); }
  };

  const handleSaveSettings = () => {
    onUpdateSettings(threshold, timeWindow);
    toast({ title: "Saved", description: "Settings updated" });
  };

  const handleConverted = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, is_converted: true } : o));
  };

  // Stats
  const totalAttempts = orders.length;
  const suspiciousCount = orders.filter(o => o.is_suspicious).length;
  const convertedCount = orders.filter(o => o.is_converted).length;
  const todayCount = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length;

  const getReasonBadge = (reason: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      phone_blur: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Phone className="h-3 w-3" />, label: "Phone Blur" },
      validation_error: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <AlertTriangle className="h-3 w-3" />, label: "Validation" },
      page_exit: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock className="h-3 w-3" />, label: "Page Exit" },
      payment_failed: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: <Ban className="h-3 w-3" />, label: "Payment Failed" }
    };
    const c = config[reason] || config.phone_blur;
    return <Badge variant="outline" className={`${c.color} flex items-center gap-1 text-xs`}>{c.icon} {c.label}</Badge>;
  };

  const getRiskBadge = (order: IncompleteOrder) => {
    if (order.is_converted) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Converted</Badge>;
    if (order.is_suspicious) return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">High Risk</Badge>;
    return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-xs">Low Risk</Badge>;
  };

  // Mobile card view for each order
  const renderMobileCard = (order: IncompleteOrder) => (
    <Card key={order.id} className="bg-slate-700/30 border-slate-600 mb-3">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-white text-sm font-medium">{order.phone_number}</p>
            <p className="text-slate-400 text-xs">{order.customer_name || 'Unknown'}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {getReasonBadge(order.failure_reason)}
            {getRiskBadge(order)}
          </div>
        </div>

        {/* Products */}
        {order.cart_items && order.cart_items.length > 0 && (
          <div className="space-y-1">
            {order.cart_items.slice(0, 2).map((item, idx) => (
              <div key={idx} className="text-xs bg-slate-700 rounded px-2 py-1 flex justify-between">
                <span className="text-white truncate mr-2">{item.name.substring(0, 30)}</span>
                <span className="text-slate-400 shrink-0">×{item.quantity}</span>
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
              <span className="text-cyan-400 font-medium text-sm">৳{order.cart_total.toLocaleString()}</span>
            ) : null}
            <span className="text-slate-500 text-xs">
              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Actions */}
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
          <Button size="sm" variant="ghost" className="h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={() => handleBlock(order.phone_number)}>
            <Ban className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-slate-400 hover:text-white hover:bg-slate-600/50"
            onClick={() => handleDelete(order.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Convert Modal */}
      {convertOrder && (
        <ConvertToOrderModal
          open={!!convertOrder}
          onClose={() => setConvertOrder(null)}
          order={convertOrder}
          onConverted={handleConverted}
        />
      )}

      {/* Settings Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                <ShoppingCart className="h-5 w-5 text-cyan-400" />
                Incomplete Order Tracking
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Track failed checkout attempts to identify fraud patterns
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-slate-400 text-sm">Enable</Label>
              <Switch checked={trackingEnabled} onCheckedChange={onToggleTracking} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <Label className="text-slate-400 text-xs sm:text-sm">Auto-block Threshold</Label>
              <Input type="number" value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value) || 5)}
                className="bg-slate-900 border-slate-600 text-white mt-1" min={1} max={50} />
              <p className="text-xs text-slate-500 mt-1">Attempts before suspicious</p>
            </div>
            <div>
              <Label className="text-slate-400 text-xs sm:text-sm">Time Window (min)</Label>
              <Input type="number" value={timeWindow} onChange={(e) => setTimeWindow(parseInt(e.target.value) || 60)}
                className="bg-slate-900 border-slate-600 text-white mt-1" min={5} max={1440} />
              <p className="text-xs text-slate-500 mt-1">Check within this window</p>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSaveSettings} className="bg-cyan-600 hover:bg-cyan-700 w-full">Save Settings</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">{totalAttempts}</p>
            <p className="text-xs sm:text-sm text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-red-900/20 border-red-800/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-red-400">{suspiciousCount}</p>
            <p className="text-xs sm:text-sm text-red-300">Suspicious</p>
          </CardContent>
        </Card>
        <Card className="bg-green-900/20 border-green-800/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-400">{convertedCount}</p>
            <p className="text-xs sm:text-sm text-green-300">Converted</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-900/20 border-cyan-800/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-cyan-400">{todayCount}</p>
            <p className="text-xs sm:text-sm text-cyan-300">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Orders */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
              <Filter className="h-5 w-5" /> Incomplete Orders
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger className="w-full sm:w-40 bg-slate-900 border-slate-600 text-white text-sm">
                  <SelectValue placeholder="Filter reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="phone_blur">Phone Blur</SelectItem>
                  <SelectItem value="validation_error">Validation Error</SelectItem>
                  <SelectItem value="page_exit">Page Exit</SelectItem>
                  <SelectItem value="payment_failed">Payment Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="w-full sm:w-40 bg-slate-900 border-slate-600 text-white text-sm">
                  <SelectValue placeholder="Filter risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="suspicious">Suspicious Only</SelectItem>
                  <SelectItem value="converted">Converted Only</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="border-slate-600 w-full sm:w-auto">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </Button>
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
              <p className="text-sm">Failed checkout attempts will appear here</p>
            </div>
          ) : isMobile ? (
            // Mobile: Card-based layout
            <div>{orders.map(renderMobileCard)}</div>
          ) : (
            // Desktop: Table layout
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Phone</TableHead>
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Products</TableHead>
                    <TableHead className="text-slate-400">Cart Total</TableHead>
                    <TableHead className="text-slate-400">Reason</TableHead>
                    <TableHead className="text-slate-400">Risk</TableHead>
                    <TableHead className="text-slate-400">Time</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell className="font-mono text-white">{order.phone_number}</TableCell>
                      <TableCell className="text-slate-300">{order.customer_name || '-'}</TableCell>
                      <TableCell>
                        {order.cart_items && order.cart_items.length > 0 ? (
                          <div className="max-w-[200px]">
                            {order.cart_items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-xs bg-slate-700 rounded px-2 py-1 mb-1 truncate">
                                <span className="text-white">{item.name.substring(0, 25)}{item.name.length > 25 ? '...' : ''}</span>
                                <span className="text-slate-400 ml-1">×{item.quantity}</span>
                              </div>
                            ))}
                            {order.cart_items.length > 2 && (
                              <span className="text-xs text-slate-500">+{order.cart_items.length - 2} more</span>
                            )}
                          </div>
                        ) : <span className="text-slate-500">-</span>}
                      </TableCell>
                      <TableCell className="text-cyan-400 font-medium">
                        {order.cart_total ? `৳${order.cart_total.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>{getReasonBadge(order.failure_reason)}</TableCell>
                      <TableCell>{getRiskBadge(order)}</TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!order.is_converted && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                              onClick={() => setConvertOrder(order)} title="Convert to Order">
                              <ArrowRightCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                            onClick={() => window.open(`https://wa.me/${order.phone_number.replace(/\D/g, '')}`, '_blank')} title="WhatsApp">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            onClick={() => handleBlock(order.phone_number)} title="Block Phone">
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-600/50"
                            onClick={() => handleDelete(order.id)} title="Delete">
                            <Trash2 className="h-4 w-4" />
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
