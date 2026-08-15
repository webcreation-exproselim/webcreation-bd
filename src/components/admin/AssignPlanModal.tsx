import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, User, Globe, Loader2, Check, Shield } from "lucide-react";
import { AlertCircle } from "lucide-react";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
}

interface AssignPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignPlanModal({ open, onOpenChange, onSuccess }: AssignPlanModalProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [storeName, setStoreName] = useState("");
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('monthly');
  const [giveFraudGuard, setGiveFraudGuard] = useState(true);
  const [giveCourierCheck, setGiveCourierCheck] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
      // Reset state when modal opens
      setSelectedUser(null);
      setWebsiteUrl("");
      setStoreName("");
      setPlanType('monthly');
      setGiveFraudGuard(true);
      setGiveCourierCheck(true);
      setSearch("");
      setError(null);
    }
  }, [open]);


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Normalize URL - accepts full URLs, subdomains, and paths
  const normalizeUrl = (url: string): string => {
    let normalized = url.trim();
    // Remove protocol
    normalized = normalized.replace(/^https?:\/\//, '');
    // Remove www
    normalized = normalized.replace(/^www\./, '');
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    return normalized;
  };

  const handleAssignPlan = async () => {
    setError(null);
    
    if (!selectedUser) {
      setError("অনুগ্রহ করে User নির্বাচন করুন");
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive"
      });
      return;
    }

    if (!websiteUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter website URL",
        variant: "destructive"
      });
      return;
    }

    if (!giveFraudGuard && !giveCourierCheck) {
      setError("অন্তত একটি সার্ভিস নির্বাচন করুন");
      return;
    }

    setSaving(true);
    try {
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (planType === 'yearly' ? 365 : 30));

      // Normalize the URL before saving
      const normalizedUrl = normalizeUrl(websiteUrl);

      const storeLabel = storeName.trim() || normalizedUrl;

      if (giveFraudGuard) {
        // Always INSERT a new merchant (each domain = new record)
        const { error: insertError } = await supabase
          .from('merchants')
          .insert({
            user_id: selectedUser.user_id,
            website_url: normalizedUrl,
            store_name: storeLabel,
            is_active: true,
            current_plan: planType,
            plan_expires_at: expiresAt.toISOString(),
            max_requests: planType === 'yearly' ? 15000 : 1000,
            requests_used: 0,
          });

        if (insertError) throw insertError;
      }

      if (giveCourierCheck) {
        // Always INSERT a new courier check subscription for this domain
        const courierMaxRequests = planType === 'yearly' ? 5000 : 500;
        const { error: ccError } = await supabase
          .from('courier_check_subscriptions')
          .insert({
            user_id: selectedUser.user_id,
            is_active: true,
            plan_expires_at: expiresAt.toISOString(),
            max_requests: courierMaxRequests,
            website_url: normalizedUrl,
            store_name: storeLabel,
          });

        if (ccError) throw ccError;
      }

      const services = [
        giveFraudGuard ? 'Fraud Guard' : null,
        giveCourierCheck ? 'Courier Check' : null,
      ].filter(Boolean).join(' + ');

      toast({
        title: "✅ Plan Assigned Successfully",
        description: `${services} — ${planType === 'yearly' ? 'Yearly' : 'Monthly'} plan assigned to ${selectedUser.full_name || 'User'} for ${normalizedUrl}`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      console.error('Error assigning plan:', err);

      const errorMessage = err?.message || 'Unknown error';
      setError(`Plan assign করতে সমস্যা: ${errorMessage}`);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.phone?.includes(search)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="font-bengali flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            নতুন Plan Assign করুন
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto flex flex-col pr-1">
          {/* Step 1: Select User */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-bengali">
              ১. User নির্বাচন করুন
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 font-bengali"
              />
            </div>
            
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm font-bengali">
                  কোনো User পাওয়া যায়নি
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.user_id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                        selectedUser?.user_id === user.user_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {user.full_name || "নাম নেই"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.phone || "ফোন নেই"}
                        </p>
                      </div>
                      {selectedUser?.user_id === user.user_id && (
                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Store Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-bengali">
              ২. Store Name দিন (ঐচ্ছিক)
            </label>
            <Input
              placeholder="যেমন: My Shop BD"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="font-bengali"
            />
          </div>

          {/* Step 3: Website URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-bengali">
              ৩. Website URL দিন
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Step 3: Select Plan */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-bengali">
              ৪. Plan নির্বাচন করুন
            </label>
            <Select value={planType} onValueChange={(v: 'monthly' | 'yearly') => setPlanType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">📅 Monthly - ৳399 (1,000 FG + 500 CC requests, 30 days)</SelectItem>
                <SelectItem value="yearly">📆 Yearly - ৳999 (15,000 FG + 5,000 CC requests, 365 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Step 5: Select services */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-bengali">
              ৫. কোন সার্ভিস দেবেন?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGiveFraudGuard(v => !v)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  giveFraudGuard ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    giveFraudGuard ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}>
                    {giveFraudGuard && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-900">Fraud Guard</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {planType === 'yearly' ? '15,000' : '1,000'} requests
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGiveCourierCheck(v => !v)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  giveCourierCheck ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    giveCourierCheck ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}>
                    {giveCourierCheck && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-900">Courier Check</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {planType === 'yearly' ? '5,000' : '500'} requests
                </p>
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-bengali">{error}</p>
            </div>
          )}

          {/* Selected User Summary */}
          {selectedUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-bengali">
                <strong>{selectedUser.full_name || 'User'}</strong> কে{' '}
                <strong>{planType === 'yearly' ? 'Yearly (৳999)' : 'Monthly (৳399)'}</strong>{' '}
                plan assign করা হবে।
                <span className="block mt-1 text-xs text-blue-600">
                  🧩 সার্ভিস:{' '}
                  {[giveFraudGuard && 'Fraud Guard', giveCourierCheck && 'Courier Check']
                    .filter(Boolean).join(' + ') || 'কিছু নির্বাচন করা হয়নি'}
                </span>
                {websiteUrl.trim() && (
                  <span className="block mt-1 text-xs text-blue-600">
                    📍 Domain: <code className="bg-blue-100 px-1 rounded">{normalizeUrl(websiteUrl)}</code>
                  </span>
                )}
              </p>
            </div>
          )}


          {/* URL Format Help */}
          <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-2 font-bengali">
            💡 Full URL, subdomain, বা path সহ দিতে পারেন। যেমন: example.com, shop.example.com/store
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 font-bengali"
              onClick={() => {
                setError(null);
                onOpenChange(false);
              }}
            >
              বাতিল
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 font-bengali"
              onClick={handleAssignPlan}
              disabled={saving || !selectedUser || !websiteUrl.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Assigning...
                </>
              ) : (
                "✅ Plan Assign করুন"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
