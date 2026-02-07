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
import { Search, User, Globe, Loader2, Check, Truck, AlertCircle } from "lucide-react";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
}

interface AssignCourierCheckPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignCourierCheckPlanModal({ open, onOpenChange, onSuccess }: AssignCourierCheckPlanModalProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
      setSelectedUser(null);
      setWebsiteUrl("");
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

  const normalizeUrl = (url: string): string => {
    let normalized = url.trim();
    normalized = normalized.replace(/^https?:\/\//, '');
    normalized = normalized.replace(/^www\./, '');
    normalized = normalized.replace(/\/$/, '');
    return normalized;
  };

  const handleAssignPlan = async () => {
    setError(null);

    if (!selectedUser) {
      setError("অনুগ্রহ করে User নির্বাচন করুন");
      return;
    }

    if (!websiteUrl.trim()) {
      setError("অনুগ্রহ করে Website URL দিন");
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      const normalizedUrl = normalizeUrl(websiteUrl);

      // Check if subscription exists for this user
      const { data: existingSub, error: checkError } = await supabase
        .from('courier_check_subscriptions')
        .select('id')
        .eq('user_id', selectedUser.user_id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingSub && existingSub.id) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('courier_check_subscriptions')
          .update({
            is_active: true,
            plan_expires_at: expiresAt.toISOString(),
            max_requests: 5000,
            requests_used: 0,
            website_url: normalizedUrl,
            updated_at: now.toISOString(),
          })
          .eq('id', existingSub.id);

        if (updateError) throw updateError;
      } else {
        // Create new subscription
        const { error: insertError } = await supabase
          .from('courier_check_subscriptions')
          .insert({
            user_id: selectedUser.user_id,
            website_url: normalizedUrl,
            is_active: true,
            plan_expires_at: expiresAt.toISOString(),
            max_requests: 5000,
            requests_used: 0,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "✅ Plan Assigned Successfully",
        description: `Yearly plan (৳899) assigned to ${selectedUser.full_name || 'User'} for ${normalizedUrl}`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      console.error('Error assigning courier check plan:', err);
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-bengali flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-500" />
            Courier Check Plan Assign করুন
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
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

            <div className="max-h-40 overflow-y-auto border rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm font-bengali">
                  কোনো User পাওয়া যায়নি
                </div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.user_id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                        selectedUser?.user_id === user.user_id ? 'bg-cyan-50 border-l-4 border-cyan-500' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.full_name || "নাম নেই"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.phone || "ফোন নেই"}
                        </p>
                      </div>
                      {selectedUser?.user_id === user.user_id && (
                        <Check className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Website URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-bengali">
              ২. Website URL দিন
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

          {/* Plan Info (Fixed - no dropdown needed) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-bengali">
              ৩. Plan
            </label>
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-medium text-cyan-800 font-bengali">
                📆 Yearly - ৳899 (5,000 requests, 365 days)
              </span>
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
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
              <p className="text-sm text-cyan-800 font-bengali">
                <strong>{selectedUser.full_name || 'User'}</strong> কে{' '}
                <strong>Yearly (৳899)</strong> Courier Check plan assign করা হবে।
                {websiteUrl.trim() && (
                  <span className="block mt-1 text-xs text-cyan-600">
                    📍 Domain: <code className="bg-cyan-100 px-1 rounded">{normalizeUrl(websiteUrl)}</code>
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
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 font-bengali"
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
