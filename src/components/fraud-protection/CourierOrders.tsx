import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Truck, Search, RefreshCw, Settings, Loader2, Package, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CourierCredentials {
  steadfast_api_key: string;
  steadfast_secret_key: string;
  pathao_client_id: string;
  pathao_client_secret: string;
  pathao_username: string;
  pathao_password: string;
  redx_api_token: string;
}

interface CourierOrder {
  id: string;
  courier_type: string;
  invoice_number: string | null;
  consignment_id: string | null;
  tracking_code: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  recipient_address: string | null;
  cod_amount: number;
  status: string;
  delivery_fee: number;
  last_synced_at: string | null;
  created_at: string;
}

interface CourierOrdersProps {
  merchantId: string;
  apiKey: string;
  initialCredentials?: Partial<CourierCredentials>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  in_review: 'bg-blue-500/20 text-blue-400',
  picked: 'bg-indigo-500/20 text-indigo-400',
  in_transit: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  returned: 'bg-red-500/20 text-red-400',
  hold: 'bg-gray-500/20 text-gray-400',
  partial_delivered: 'bg-yellow-500/20 text-yellow-400'
};

export function CourierOrders({ merchantId, apiKey, initialCredentials }: CourierOrdersProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);
  const [orders, setOrders] = useState<CourierOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [selectedCourier, setSelectedCourier] = useState<'steadfast' | 'pathao' | 'redx'>('steadfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [credentials, setCredentials] = useState<CourierCredentials>({
    steadfast_api_key: initialCredentials?.steadfast_api_key || '',
    steadfast_secret_key: initialCredentials?.steadfast_secret_key || '',
    pathao_client_id: initialCredentials?.pathao_client_id || '',
    pathao_client_secret: initialCredentials?.pathao_client_secret || '',
    pathao_username: initialCredentials?.pathao_username || '',
    pathao_password: initialCredentials?.pathao_password || '',
    redx_api_token: initialCredentials?.redx_api_token || ''
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courier_orders')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setOrders((data || []) as CourierOrder[]);
    } catch (error) {
      console.error('Error fetching courier orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [merchantId]);

  const handleSaveCredentials = async () => {
    setSavingCreds(true);
    try {
      const { data, error } = await supabase.functions.invoke('courier-status', {
        body: {
          api_key: apiKey,
          action: 'save_credentials',
          credentials
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "সফল!", description: "Courier credentials সেভ হয়েছে" });
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({ title: "Error", description: "Credentials সেভ করতে সমস্যা হয়েছে", variant: "destructive" });
    } finally {
      setSavingCreds(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('courier-status', {
        body: {
          api_key: apiKey,
          action: 'check_status',
          courier: selectedCourier,
          invoice: selectedCourier === 'steadfast' ? searchQuery : undefined,
          consignment_id: selectedCourier === 'pathao' ? searchQuery : undefined,
          tracking_code: selectedCourier === 'redx' ? searchQuery : undefined
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({ title: "সফল!", description: "Order status পাওয়া গেছে এবং save হয়েছে" });
        fetchOrders();
      } else {
        toast({ title: "Error", description: data.error || "Status check failed", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error checking status:', error);
      toast({ title: "Error", description: "Courier API তে সমস্যা হয়েছে", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'returned':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['pending', 'in_review', 'picked', 'in_transit'].includes(o.status.toLowerCase())).length,
    delivered: orders.filter(o => o.status.toLowerCase() === 'delivered').length,
    returned: orders.filter(o => ['cancelled', 'returned'].includes(o.status.toLowerCase())).length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Package className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Truck className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-xs text-slate-400">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.delivered}</p>
                <p className="text-xs text-slate-400">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.returned}</p>
                <p className="text-xs text-slate-400">Returned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-cyan-400" />
              Courier Orders
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'orders' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('orders')}
                className={activeTab === 'orders' ? 'bg-cyan-600' : 'border-slate-600 text-slate-300'}
              >
                Orders
              </Button>
              <Button
                variant={activeTab === 'settings' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('settings')}
                className={activeTab === 'settings' ? 'bg-cyan-600' : 'border-slate-600 text-slate-300'}
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'settings' ? (
            <div className="space-y-6">
              {/* Steadfast Settings */}
              <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-400" />
                  Steadfast Courier
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">API Key</Label>
                    <Input
                      type="password"
                      value={credentials.steadfast_api_key}
                      onChange={(e) => setCredentials({ ...credentials, steadfast_api_key: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Enter Steadfast API Key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Secret Key</Label>
                    <Input
                      type="password"
                      value={credentials.steadfast_secret_key}
                      onChange={(e) => setCredentials({ ...credentials, steadfast_secret_key: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Enter Steadfast Secret Key"
                    />
                  </div>
                </div>
              </div>

              {/* Pathao Settings */}
              <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-red-400" />
                  Pathao Courier
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Client ID</Label>
                    <Input
                      value={credentials.pathao_client_id}
                      onChange={(e) => setCredentials({ ...credentials, pathao_client_id: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Enter Pathao Client ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Client Secret</Label>
                    <Input
                      type="password"
                      value={credentials.pathao_client_secret}
                      onChange={(e) => setCredentials({ ...credentials, pathao_client_secret: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Enter Pathao Client Secret"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Username (Email)</Label>
                    <Input
                      value={credentials.pathao_username}
                      onChange={(e) => setCredentials({ ...credentials, pathao_username: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Enter Pathao Username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Password</Label>
                    <Input
                      type="password"
                      value={credentials.pathao_password}
                      onChange={(e) => setCredentials({ ...credentials, pathao_password: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Enter Pathao Password"
                    />
                  </div>
                </div>
              </div>

              {/* RedX Settings */}
              <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-rose-400" />
                  RedX Courier
                </h3>
                <div className="space-y-2">
                  <Label className="text-slate-300">API Token</Label>
                  <Input
                    type="password"
                    value={credentials.redx_api_token}
                    onChange={(e) => setCredentials({ ...credentials, redx_api_token: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="Enter RedX API Token (from openapi.redx.com.bd)"
                  />
                  <p className="text-xs text-slate-500">RedX Developer API থেকে token নিন</p>
                </div>
              </div>

              <Button
                onClick={handleSaveCredentials}
                disabled={savingCreds}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
              >
                {savingCreds ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
                Save Courier Settings
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search */}
              <div className="flex gap-3">
                <Select value={selectedCourier} onValueChange={(v) => setSelectedCourier(v as 'steadfast' | 'pathao' | 'redx')}>
                  <SelectTrigger className="w-40 bg-slate-900 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="steadfast">Steadfast</SelectItem>
                    <SelectItem value="pathao">Pathao</SelectItem>
                    <SelectItem value="redx">RedX</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={selectedCourier === 'steadfast' ? 'Invoice Number' : selectedCourier === 'pathao' ? 'Consignment ID' : 'Tracking ID'}
                  className="flex-1 bg-slate-900 border-slate-600 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={fetchOrders}
                  disabled={loading}
                  className="border-slate-600 text-slate-300"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>কোন courier order নেই</p>
                  <p className="text-sm mt-1">Invoice/Consignment ID দিয়ে search করুন</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Courier</TableHead>
                        <TableHead className="text-slate-300">Invoice/ID</TableHead>
                        <TableHead className="text-slate-300">Recipient</TableHead>
                        <TableHead className="text-slate-300">COD</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Last Sync</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="border-slate-700">
                          <TableCell>
                            <Badge variant="outline" className={order.courier_type === 'steadfast' ? 'border-orange-500 text-orange-400' : 'border-red-500 text-red-400'}>
                              {order.courier_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white font-mono text-sm">
                            {order.invoice_number || order.consignment_id || order.tracking_code || '-'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-white text-sm">{order.recipient_name || '-'}</p>
                              <p className="text-slate-400 text-xs">{order.recipient_phone || '-'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            ৳{order.cod_amount}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[order.status.toLowerCase()] || 'bg-gray-500/20 text-gray-400'}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400 text-xs">
                            {order.last_synced_at ? formatDistanceToNow(new Date(order.last_synced_at), { addSuffix: true }) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
