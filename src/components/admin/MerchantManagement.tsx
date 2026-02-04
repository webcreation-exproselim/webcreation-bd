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
  Search, Edit2, Power, PowerOff, Shield, 
  User, Globe, Key, Loader2, RefreshCw, UserPlus
} from "lucide-react";
import { AssignPlanModal } from "./AssignPlanModal";
interface Merchant {
  id: string;
  user_id: string;
  website_url: string | null;
  api_key: string;
  cooldown_period_minutes: number;
  is_active: boolean;
  current_plan: string | null;
  plan_expires_at: string | null;
  requests_used: number;
  max_requests: number;
  created_at: string;
  profile?: {
    full_name: string | null;
    phone: string | null;
  };
  email?: string;
}

export function MerchantManagement() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [assignPlanModalOpen, setAssignPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      // Fetch merchants with profile data
      const { data: merchantsData, error } = await supabase
        .from('merchants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for all merchants
      const userIds = merchantsData?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone')
        .in('user_id', userIds);

      // Combine data
      const combined = merchantsData?.map(merchant => ({
        ...merchant,
        profile: profiles?.find(p => p.user_id === merchant.user_id),
      })) || [];

      setMerchants(combined);
    } catch (error) {
      console.error('Error fetching merchants:', error);
      toast({
        title: "Error",
        description: "Failed to load merchants",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const activateMerchant = async (merchantId: string, planType: 'monthly' | 'yearly') => {
    setSaving(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (planType === 'yearly' ? 365 : 30));

      const { error } = await supabase
        .from('merchants')
        .update({
          is_active: true,
          current_plan: planType,
          plan_expires_at: expiresAt.toISOString(),
          max_requests: planType === 'yearly' ? 15000 : 1000,
          requests_used: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', merchantId);

      if (error) throw error;

      toast({ title: "✅ Merchant activated successfully" });
      setActivateModalOpen(false);
      fetchMerchants();
    } catch (error) {
      console.error('Error activating merchant:', error);
      toast({
        title: "Error",
        description: "Failed to activate merchant",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deactivateMerchant = async (merchantId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('merchants')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', merchantId);

      if (error) throw error;

      toast({ title: "Merchant deactivated" });
      fetchMerchants();
    } catch (error) {
      console.error('Error deactivating merchant:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate merchant",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateMerchant = async (merchantId: string, updates: Partial<Merchant>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('merchants')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', merchantId);

      if (error) throw error;

      toast({ title: "✅ Merchant updated" });
      setEditModalOpen(false);
      fetchMerchants();
    } catch (error) {
      console.error('Error updating merchant:', error);
      toast({
        title: "Error",
        description: "Failed to update merchant",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const regenerateApiKey = async (merchantId: string) => {
    const newApiKey = crypto.randomUUID();
    await updateMerchant(merchantId, { api_key: newApiKey });
  };

  const filteredMerchants = merchants.filter(m => 
    m.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.website_url?.toLowerCase().includes(search.toLowerCase()) ||
    m.profile?.phone?.includes(search)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Merchant খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 font-bengali bg-white border-gray-100 rounded-xl h-11"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchMerchants}
            variant="outline"
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            রিফ্রেশ
          </Button>
          <Button
            onClick={() => setAssignPlanModalOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4" />
            Plan Assign
          </Button>
        </div>
      </div>

      {/* Merchants Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-bengali">
            কোনো Merchant পাওয়া যায়নি
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bengali font-semibold text-gray-500 uppercase">Merchant</th>
                  <th className="px-6 py-4 text-left text-xs font-bengali font-semibold text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-bengali font-semibold text-gray-500 uppercase">Usage</th>
                  <th className="px-6 py-4 text-left text-xs font-bengali font-semibold text-gray-500 uppercase">Expires</th>
                  <th className="px-6 py-4 text-right text-xs font-bengali font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMerchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {merchant.profile?.full_name || "নাম নেই"}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {merchant.website_url || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {merchant.is_active ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          {merchant.current_plan === 'yearly' ? '📆 Yearly' : '📅 Monthly'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{merchant.requests_used}</span>
                        <span className="text-gray-400"> / {merchant.max_requests}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {merchant.plan_expires_at 
                        ? new Date(merchant.plan_expires_at).toLocaleDateString('bn-BD')
                        : "—"
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedMerchant(merchant);
                            setEditModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {merchant.is_active ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deactivateMerchant(merchant.id)}
                            disabled={saving}
                          >
                            <PowerOff className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() => {
                              setSelectedMerchant(merchant);
                              setActivateModalOpen(true);
                            }}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bengali">Merchant Edit</DialogTitle>
          </DialogHeader>
          {selectedMerchant && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-bengali">Website URL</label>
                <Input
                  value={selectedMerchant.website_url || ''}
                  onChange={(e) => setSelectedMerchant({
                    ...selectedMerchant,
                    website_url: e.target.value
                  })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-bengali">Cooldown (minutes)</label>
                <Input
                  type="number"
                  value={selectedMerchant.cooldown_period_minutes}
                  onChange={(e) => setSelectedMerchant({
                    ...selectedMerchant,
                    cooldown_period_minutes: parseInt(e.target.value) || 1440
                  })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-bengali">Max Requests</label>
                <Input
                  type="number"
                  value={selectedMerchant.max_requests}
                  onChange={(e) => setSelectedMerchant({
                    ...selectedMerchant,
                    max_requests: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => regenerateApiKey(selectedMerchant.id)}
                  disabled={saving}
                >
                  <Key className="w-4 h-4" />
                  New API Key
                </Button>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditModalOpen(false)}
                >
                  বাতিল
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => updateMerchant(selectedMerchant.id, {
                    website_url: selectedMerchant.website_url,
                    cooldown_period_minutes: selectedMerchant.cooldown_period_minutes,
                    max_requests: selectedMerchant.max_requests,
                  })}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "সেভ করুন"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Activate Modal */}
      <Dialog open={activateModalOpen} onOpenChange={setActivateModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-bengali flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              Merchant Activate করুন
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 font-bengali">
              Plan নির্বাচন করুন:
            </p>
            <Select value={selectedPlan} onValueChange={(v: 'monthly' | 'yearly') => setSelectedPlan(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">📅 Monthly - ৳100 (1,000 requests)</SelectItem>
                <SelectItem value="yearly">📆 Yearly - ৳699 (15,000 requests)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setActivateModalOpen(false)}
              >
                বাতিল
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => selectedMerchant && activateMerchant(selectedMerchant.id, selectedPlan)}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activate"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Plan Modal */}
      <AssignPlanModal
        open={assignPlanModalOpen}
        onOpenChange={setAssignPlanModalOpen}
        onSuccess={fetchMerchants}
      />
    </div>
  );
}
