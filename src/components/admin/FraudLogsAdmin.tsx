import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, Edit2, Trash2, Loader2, RefreshCw,
  Phone, Monitor, Globe, Calendar
} from "lucide-react";

interface FraudLog {
  id: string;
  merchant_id: string;
  phone_number: string | null;
  ip_address: string | null;
  device_fingerprint: string | null;
  status: string;
  created_at: string;
}

interface Merchant {
  id: string;
  website_url: string | null;
}

export function FraudLogsAdmin() {
  const [logs, setLogs] = useState<FraudLog[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [merchantFilter, setMerchantFilter] = useState("all");
  const [editLog, setEditLog] = useState<FraudLog | null>(null);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch merchants first
      const { data: merchantsData } = await supabase
        .from('merchants')
        .select('id, website_url');
      
      setMerchants(merchantsData || []);

      // Fetch logs
      const { data: logsData, error } = await supabase
        .from('fraud_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      setLogs(logsData || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: "Error",
        description: "Failed to load logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateLog = async () => {
    if (!editLog) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('fraud_logs')
        .update({
          phone_number: editLog.phone_number,
          ip_address: editLog.ip_address,
          device_fingerprint: editLog.device_fingerprint,
          status: editLog.status,
        })
        .eq('id', editLog.id);

      if (error) throw error;

      toast({ title: "✅ Log updated" });
      setEditLog(null);
      fetchData();
    } catch (error) {
      console.error('Error updating log:', error);
      toast({
        title: "Error",
        description: "Failed to update log",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteLog = async () => {
    if (!deleteLogId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('fraud_logs')
        .delete()
        .eq('id', deleteLogId);

      if (error) throw error;

      toast({ title: "Log deleted" });
      setDeleteLogId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: "Error",
        description: "Failed to delete log",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getMerchantName = (merchantId: string) => {
    const merchant = merchants.find(m => m.id === merchantId);
    return merchant?.website_url || merchantId.slice(0, 8) + '...';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'allowed':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">✅ Allowed</Badge>;
      case 'blocked_cooldown':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">⏱️ Cooldown</Badge>;
      case 'blocked_blacklist':
        return <Badge className="bg-red-100 text-red-700 border-red-200">🚫 Blacklist</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.phone_number?.includes(search) ||
      log.ip_address?.includes(search) ||
      log.device_fingerprint?.includes(search);
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesMerchant = merchantFilter === 'all' || log.merchant_id === merchantFilter;

    return matchesSearch && matchesStatus && matchesMerchant;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Phone, IP, Device ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-white border-gray-100 rounded-xl h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="allowed">Allowed</SelectItem>
            <SelectItem value="blocked_cooldown">Cooldown</SelectItem>
            <SelectItem value="blocked_blacklist">Blacklist</SelectItem>
          </SelectContent>
        </Select>
        <Select value={merchantFilter} onValueChange={setMerchantFilter}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="Merchant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Merchants</SelectItem>
            {merchants.map(m => (
              <SelectItem key={m.id} value={m.id}>
                {m.website_url || m.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={fetchData}
          variant="outline"
          className="gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-bengali">
            কোনো Log পাওয়া যায়নি
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Merchant</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.slice(0, 100).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleDateString('bn-BD')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleTimeString('bn-BD')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {log.phone_number || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Globe className="w-3 h-3 text-gray-400" />
                        {log.ip_address || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getMerchantName(log.merchant_id)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditLog(log)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteLogId(log.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Showing {Math.min(filteredLogs.length, 100)} of {filteredLogs.length} logs
      </p>

      {/* Edit Modal */}
      <Dialog open={!!editLog} onOpenChange={() => setEditLog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bengali">Log Edit</DialogTitle>
          </DialogHeader>
          {editLog && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Phone Number</label>
                <Input
                  value={editLog.phone_number || ''}
                  onChange={(e) => setEditLog({ ...editLog, phone_number: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">IP Address</label>
                <Input
                  value={editLog.ip_address || ''}
                  onChange={(e) => setEditLog({ ...editLog, ip_address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Device Fingerprint</label>
                <Input
                  value={editLog.device_fingerprint || ''}
                  onChange={(e) => setEditLog({ ...editLog, device_fingerprint: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <Select 
                  value={editLog.status} 
                  onValueChange={(v) => setEditLog({ ...editLog, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allowed">Allowed</SelectItem>
                    <SelectItem value="blocked_cooldown">Blocked (Cooldown)</SelectItem>
                    <SelectItem value="blocked_blacklist">Blocked (Blacklist)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditLog(null)}
                >
                  বাতিল
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={updateLog}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "সেভ করুন"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteLogId} onOpenChange={() => setDeleteLogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali">Log ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription className="font-bengali">
              এই log entry স্থায়ীভাবে মুছে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteLog}
              className="bg-red-600 hover:bg-red-700 font-bengali"
            >
              ডিলিট করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
