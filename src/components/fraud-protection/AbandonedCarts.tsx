import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Phone, RefreshCw, Trash2, MessageSquare, Clock, Check, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AbandonedCheckout {
  id: string;
  customer_phone: string;
  customer_name: string | null;
  customer_email: string | null;
  device_fingerprint: string | null;
  ip_address: string | null;
  cart_data: object | null;
  checkout_url: string | null;
  is_recovered: boolean;
  created_at: string;
  recovered_at: string | null;
}

interface AbandonedCartsProps {
  merchantId: string;
  trackingEnabled: boolean;
  onToggleTracking: (enabled: boolean) => void;
}

export function AbandonedCarts({ merchantId, trackingEnabled, onToggleTracking }: AbandonedCartsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [checkouts, setCheckouts] = useState<AbandonedCheckout[]>([]);
  const [stats, setStats] = useState({ total: 0, recovered: 0, pending: 0 });

  const fetchCheckouts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('abandoned_checkouts')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const checkoutData = (data || []) as AbandonedCheckout[];
      setCheckouts(checkoutData);
      
      const recovered = checkoutData.filter(c => c.is_recovered).length;
      setStats({
        total: checkoutData.length,
        recovered,
        pending: checkoutData.length - recovered
      });
    } catch (error) {
      console.error('Error fetching abandoned checkouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckouts();
  }, [merchantId]);

  const handleMarkRecovered = async (id: string) => {
    try {
      const { error } = await supabase
        .from('abandoned_checkouts')
        .update({ is_recovered: true, recovered_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({ title: "সফল!", description: "Checkout recovered হিসেবে mark করা হয়েছে" });
      fetchCheckouts();
    } catch (error) {
      console.error('Error marking as recovered:', error);
      toast({ title: "Error", description: "Update করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('abandoned_checkouts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "সফল!", description: "Entry delete করা হয়েছে" });
      fetchCheckouts();
    } catch (error) {
      console.error('Error deleting checkout:', error);
      toast({ title: "Error", description: "Delete করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  const handleWhatsAppSend = (phone: string, name?: string | null) => {
    const message = encodeURIComponent(
      `হ্যালো${name ? ` ${name}` : ''}! আপনি আমাদের সাইটে অর্ডার সম্পন্ন করেননি। কোন সমস্যা হলে জানান, আমরা সাহায্য করতে পারি।`
    );
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <ShoppingCart className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">Total Abandoned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-xs text-slate-400">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.recovered}</p>
                <p className="text-xs text-slate-400">Recovered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Tracking</p>
                <p className="text-xs text-slate-400">{trackingEnabled ? 'Active' : 'Disabled'}</p>
              </div>
              <Switch
                checked={trackingEnabled}
                onCheckedChange={onToggleTracking}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-cyan-400" />
            Abandoned Checkouts
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCheckouts}
            disabled={loading}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
          ) : checkouts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>কোন abandoned checkout নেই</p>
              <p className="text-sm mt-1">Tracking enable করলে এখানে দেখা যাবে</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Phone</TableHead>
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Time</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkouts.map((checkout) => (
                    <TableRow key={checkout.id} className="border-slate-700">
                      <TableCell className="text-white font-medium">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          {checkout.customer_phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {checkout.customer_name || '-'}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {formatDistanceToNow(new Date(checkout.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {checkout.is_recovered ? (
                          <Badge className="bg-green-500/20 text-green-400">Recovered</Badge>
                        ) : (
                          <Badge className="bg-amber-500/20 text-amber-400">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWhatsAppSend(checkout.customer_phone, checkout.customer_name)}
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          {!checkout.is_recovered && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkRecovered(checkout.id)}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(checkout.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
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
