import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Store, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { FraudGuardSection } from "@/components/fraud-protection/FraudGuardSection";
import { CourierCheckSection } from "@/components/courier-check/CourierCheckSection";
import { ProfileSection } from "@/components/client/ProfileSection";
import { FraudGuardQuickStatus } from "@/components/client/FraudGuardQuickStatus";
import { useMerchantData } from "@/hooks/useMerchantData";
import { useSubscriptionData } from "@/hooks/useSubscriptionData";
import { SubscriptionPurchaseModal } from "@/components/fraud-protection/SubscriptionPurchaseModal";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiStoreManager, getStoreLabel } from "@/components/client/MultiStoreManager";

// Refactored components
import { DashboardSidebar } from "@/components/client/DashboardSidebar";
import { DashboardTopBar } from "@/components/client/DashboardTopBar";
import { DashboardHeader } from "@/components/client/DashboardHeader";
import { MobileBottomNav } from "@/components/client/MobileBottomNav";
import { DashboardStatsCards } from "@/components/client/DashboardStatsCards";
import { DashboardWelcome } from "@/components/client/DashboardWelcome";
import { OrdersTab } from "@/components/client/OrdersTab";
import { InvoicesTab } from "@/components/client/InvoicesTab";
import { ChatTab } from "@/components/client/ChatTab";

interface OrderService {
  id: string;
  serviceName: string;
  packageName: string;
  price: number;
  originalPrice: number;
  features: string[];
}

interface Order {
  id: string;
  services: OrderService[];
  status: string;
  progress: number;
  total_price: number;
  created_at: string;
  customer_name: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  status: string;
  created_at: string;
  order_id?: string | null;
  due_date?: string | null;
}

interface Message {
  id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
}

type TabType = "orders" | "invoices" | "chat" | "fraudguard" | "couriercheck" | "profile";

export default function ClientDashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  
  // Admin impersonation: view another user's dashboard
  // If view_as param exists, treat as impersonation immediately (don't wait for isAdmin to load)
  const viewAsUserId = searchParams.get('view_as');
  const isImpersonating = !!viewAsUserId;
  const effectiveUserId = isImpersonating ? viewAsUserId : user?.id;
  
  // Fraud Guard merchant data - pass viewAsUserId directly to avoid race condition with isAdmin loading
  const { merchant, merchants, selectedMerchantId, setSelectedMerchantId, refetchMerchant, updateCooldownMinutes } = useMerchantData(viewAsUserId || undefined);
  const { pendingOrder, refetch: refetchSubscription } = useSubscriptionData(merchant?.id || null);
  
  // Notifications
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id || null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        // If impersonating, load target user's data; otherwise load own data
        const targetUserId = viewAsUserId || session.user.id;
        fetchUserData(targetUserId);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, viewAsUserId]);

  const fetchUserData = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        // Check if user is blocked (skip for admin impersonation)
        if (profileData.is_blocked && !viewAsUserId) {
          await supabase.auth.signOut();
          toast({
            title: "অ্যাক্সেস বন্ধ",
            description: "আপনার অ্যাকাউন্ট ব্লক করা হয়েছে। সাহায্যের জন্য যোগাযোগ করুন।",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
      }

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (ordersData) {
        const typedOrders: Order[] = ordersData.map(order => ({
          ...order,
          services: (order.services as unknown) as OrderService[],
          progress: order.progress || 0,
        }));
        setOrders(typedOrders);
      }

      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", userId)
        .order("created_at", { ascending: false });
      
      if (invoicesData) setInvoices(invoicesData as Invoice[]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Combined Real-time subscription for all dashboard data
  useEffect(() => {
    if (!effectiveUserId) return;

    // Unique channel name with timestamp to avoid conflicts
    const channelName = `dashboard-realtime-${effectiveUserId}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      // Orders - listen to all events, RLS will filter by user
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Order realtime event:", payload.eventType);
          
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as any;
            // Check if this order belongs to current user (RLS should handle this, but double-check)
            if (newOrder.user_id === effectiveUserId) {
              setOrders((prev) => [{
                ...newOrder,
                services: (newOrder.services as unknown) as OrderService[],
                progress: newOrder.progress || 0,
              }, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) => 
              prev.map(order => 
                order.id === payload.new.id 
                  ? { 
                      ...payload.new, 
                      services: ((payload.new as any).services as unknown) as OrderService[], 
                      progress: (payload.new as any).progress || 0 
                    } as Order 
                  : order
              )
            );
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter(order => order.id !== (payload.old as any).id));
          }
        }
      )
      // Invoices - listen to all events
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invoices",
        },
        (payload) => {
          console.log("Invoice realtime event:", payload.eventType);
          
          if (payload.eventType === "INSERT") {
            const newInvoice = payload.new as any;
            // Check if this invoice belongs to current user
            if (newInvoice.client_id === effectiveUserId) {
              setInvoices((prev) => [newInvoice as Invoice, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setInvoices((prev) => 
              prev.map(inv => inv.id === payload.new.id ? payload.new as Invoice : inv)
            );
          } else if (payload.eventType === "DELETE") {
            setInvoices((prev) => prev.filter(inv => inv.id !== (payload.old as any).id));
          }
        }
      )
      // Profile updates
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          const updatedProfile = payload.new as any;
          if (updatedProfile.user_id === effectiveUserId) {
            console.log("Profile realtime update received");
            setProfile(updatedProfile);
          }
        }
      )
      .subscribe((status) => {
        console.log("Dashboard realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveUserId]);

  const fetchMessages = async (orderId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    
    if (data) setMessages(data as Message[]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedOrder || !user) return;

    const { error } = await supabase.from("messages").insert({
      order_id: selectedOrder.id,
      sender_id: user.id,
      content: newMessage,
      is_admin: false,
    });

    if (!error) {
      setNewMessage("");
      toast({ title: "মেসেজ পাঠানো হয়েছে" });
    } else {
      toast({ title: "মেসেজ পাঠানো যায়নি", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!selectedOrder) return;

    fetchMessages(selectedOrder.id);

    const channel = supabase
      .channel(`client-messages-${selectedOrder.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${selectedOrder.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedOrder?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    fetchMessages(order.id);
  };

  const completedOrders = orders.filter((o) => o.status === "completed").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4 font-bengali">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 flex items-center justify-between z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            <span className="font-bengali text-sm font-medium">
              অ্যাডমিন ভিউ: <span className="font-bold">{profile?.full_name || viewAsUserId}</span> এর ড্যাশবোর্ড দেখছেন
            </span>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg font-bengali transition-colors"
          >
            অ্যাডমিনে ফিরুন
          </button>
        </div>
      )}
      <div className="flex flex-1">
      {/* Desktop Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        userEmail={user?.email}
        hasActiveSubscription={merchant?.is_active}
        hasPendingOrder={!!pendingOrder}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:max-h-screen lg:overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <DashboardHeader
            profile={profile}
            userEmail={user?.email}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            onLogout={handleLogout}
          />
        </div>

        {/* Desktop Top Bar */}
        <DashboardTopBar
          profile={profile}
          userEmail={user?.email}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
            {(() => {
              const getStoreLabel = (m: any, idx: number) => {
                if (m.store_name) return m.store_name;
                if (m.website_url) {
                  try {
                    return new URL(m.website_url.startsWith('http') ? m.website_url : `https://${m.website_url}`).hostname.replace(/^www\./, '');
                  } catch {
                    return m.website_url;
                  }
                }
                return `Store ${idx + 1} (Domain যোগ করুন)`;
              };
              const currentIdx = merchants.findIndex(m => m.id === (selectedMerchantId || merchant?.id));
              const currentLabel = merchant ? getStoreLabel(merchant, currentIdx >= 0 ? currentIdx : 0) : 'Default Store';

              return (
                <>
                  {activeTab === "fraudguard" && (
                    <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-4 shadow-sm">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Store className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-800 font-bengali flex-shrink-0">
                          {merchants.length > 1 ? 'আপনার Store:' : 'Store:'}
                        </span>
                        {merchants.length > 1 ? (
                          <Select value={selectedMerchantId || ''} onValueChange={(val) => setSelectedMerchantId(val)}>
                            <SelectTrigger className="flex-1 max-w-xs border-blue-200 bg-white text-gray-900">
                              <SelectValue placeholder="Store নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {merchants.map((m, idx) => (
                                <SelectItem key={m.id} value={m.id} className="text-gray-900">
                                  {getStoreLabel(m, idx)}{m.is_active ? ' ✅' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm text-gray-700 font-medium truncate">
                            {currentLabel}
                            {merchant?.is_active && <span className="text-emerald-600 ml-1">✅</span>}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 font-bengali mt-2.5 leading-relaxed">
                        💡 <strong>একাধিক Website?</strong> আপনি চাইলে প্রতিটি আলাদা ডোমেইনের জন্য আলাদা Subscription কিনে এখান থেকেই manage করতে পারবেন। প্রতি subscription = ১টি domain. নতুন domain যোগ করতে নিচে নতুন Plan কিনুন।
                      </p>
                      {merchant && !merchant.website_url && !merchant.store_name && (
                        <p className="text-xs text-amber-700 font-bengali mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          ⚠️ আপনার Store এর Domain/URL এখনো সেট করা নেই। নিচের <strong>Settings</strong> ট্যাব থেকে আপনার website URL যোগ করুন।
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab !== "fraudguard" && merchants.length > 1 && (
                    <div className="mb-4 flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                      <Store className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 font-bengali flex-shrink-0">Store:</span>
                      <Select value={selectedMerchantId || ''} onValueChange={(val) => setSelectedMerchantId(val)}>
                        <SelectTrigger className="flex-1 max-w-xs border-gray-200 text-gray-900">
                          <SelectValue placeholder="Store নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {merchants.map((m, idx) => (
                            <SelectItem key={m.id} value={m.id} className="text-gray-900">
                              {getStoreLabel(m, idx)}{m.is_active ? ' ✅' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Welcome Section - Only show on orders tab */}
            {activeTab === "orders" && (
              <DashboardWelcome
                fullName={profile?.full_name}
                ordersCount={orders.length}
                completedOrders={completedOrders}
              />
            )}

            {/* Fraud Guard Quick Status - Show on main tabs */}
            {(activeTab === "orders" || activeTab === "invoices") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6"
              >
                <FraudGuardQuickStatus
                  merchant={merchant}
                  pendingOrder={pendingOrder}
                  onOpenFraudGuard={() => setActiveTab("fraudguard")}
                  onPurchaseSuccess={() => {
                    refetchMerchant();
                    refetchSubscription();
                  }}
                  onUpdateCooldownMinutes={updateCooldownMinutes}
                />
              </motion.div>
            )}

            {/* Stats Cards - Show on orders tab */}
            {activeTab === "orders" && (
              <DashboardStatsCards
                orders={orders}
                invoicesCount={invoices.length}
                merchant={merchant}
                hasPendingOrder={!!pendingOrder}
                onFraudGuardClick={() => setActiveTab("fraudguard")}
                onCourierCheckClick={() => setActiveTab("couriercheck")}
              />
            )}

            {/* Tab Contents */}
            {activeTab === "orders" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 font-bengali">সাম্প্রতিক অর্ডার</h2>
                  <Link to="/#services" className="text-sm text-blue-600 hover:underline font-bengali">
                    নতুন অর্ডার →
                  </Link>
                </div>
                <OrdersTab orders={orders} />
              </motion.div>
            )}

            {activeTab === "invoices" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <InvoicesTab invoices={invoices} />
              </motion.div>
            )}

            {activeTab === "chat" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ChatTab
                  orders={orders}
                  selectedOrder={selectedOrder}
                  messages={messages}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  onSelectOrder={handleSelectOrder}
                  onSendMessage={sendMessage}
                />
              </motion.div>
            )}

            {activeTab === "fraudguard" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {effectiveUserId && <FraudGuardSection userId={effectiveUserId} merchantId={merchant?.id} isImpersonating={isImpersonating} />}
              </motion.div>
            )}

            {activeTab === "couriercheck" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {effectiveUserId && <CourierCheckSection userId={effectiveUserId} isImpersonating={isImpersonating} />}
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ProfileSection
                  user={user}
                  profile={profile}
                  onProfileUpdate={() => user && fetchUserData(user.id)}
                />
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActiveSubscription={merchant?.is_active}
        hasPendingOrder={!!pendingOrder}
      />
      
      {/* Subscription Purchase Modal */}
      {merchant && (
        <SubscriptionPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          planType={selectedPlanType}
          merchantId={merchant.id}
          onSuccess={() => {
            refetchMerchant();
            refetchSubscription();
            setShowPurchaseModal(false);
          }}
        />
      )}
      </div>
    </div>
  );
}
