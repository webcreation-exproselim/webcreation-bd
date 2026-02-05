import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { FraudGuardSection } from "@/components/fraud-protection/FraudGuardSection";
import { ProfileSection } from "@/components/client/ProfileSection";
import { FraudGuardQuickStatus } from "@/components/client/FraudGuardQuickStatus";
import { useMerchantData } from "@/hooks/useMerchantData";
import { useSubscriptionData } from "@/hooks/useSubscriptionData";
import { SubscriptionPurchaseModal } from "@/components/fraud-protection/SubscriptionPurchaseModal";

// New refactored components
import { DashboardHeader } from "@/components/client/DashboardHeader";
import { MobileBottomNav } from "@/components/client/MobileBottomNav";
import { DashboardStatsCards } from "@/components/client/DashboardStatsCards";
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
}

interface Message {
  id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
}

type TabType = "orders" | "invoices" | "chat" | "fraudguard" | "profile";

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
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fraud Guard merchant data
  const { merchant, refetchMerchant, updateCooldownMinutes } = useMerchantData();
  const { pendingOrder, refetch: refetchSubscription } = useSubscriptionData(merchant?.id || null);

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
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (profileData) setProfile(profileData);

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

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`client-invoices-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "invoices",
          filter: `client_id=eq.${user.id}`,
        },
        (payload) => {
          setInvoices((prev) => [payload.new as Invoice, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "invoices",
          filter: `client_id=eq.${user.id}`,
        },
        (payload) => {
          setInvoices((prev) => 
            prev.map(inv => inv.id === payload.new.id ? payload.new as Invoice : inv)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-500 mt-4 font-bengali">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-20 md:pb-0">
      {/* Header */}
      <DashboardHeader
        profile={profile}
        userEmail={user?.email}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 md:py-6">
        {/* Welcome Section - Compact on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-6"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bengali font-bold text-gray-900 mb-0.5 md:mb-1">
            স্বাগতম, {profile?.full_name || "গ্রাহক"}! 👋
          </h1>
          <p className="text-gray-500 font-bengali text-xs sm:text-sm md:text-base">
            আপনার অর্ডার ও সার্ভিস ট্র্যাক করুন
          </p>
        </motion.div>

        {/* Fraud Guard Quick Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4 md:mb-6"
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

        {/* Stats Cards */}
        <DashboardStatsCards
          orders={orders}
          invoicesCount={invoices.length}
          merchant={merchant}
          hasPendingOrder={!!pendingOrder}
          onFraudGuardClick={() => setActiveTab("fraudguard")}
        />

        {/* Desktop Tab Navigation - Hidden on mobile (using bottom nav instead) */}
        <div className="hidden md:flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "orders" as TabType, label: "অর্ডার", icon: "📦" },
            { id: "invoices" as TabType, label: "ইনভয়েস", icon: "📄" },
            { id: "chat" as TabType, label: "চ্যাট", icon: "💬" },
            { id: "fraudguard" as TabType, label: "Fraud Guard", icon: "🛡️" },
            { id: "profile" as TabType, label: "প্রোফাইল", icon: "👤" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bengali font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Tab Title */}
        <div className="md:hidden mb-3">
          <h2 className="text-base font-bengali font-semibold text-gray-900">
            {activeTab === "orders" && "📦 অর্ডার সমূহ"}
            {activeTab === "invoices" && "📄 ইনভয়েস"}
            {activeTab === "chat" && "💬 চ্যাট"}
            {activeTab === "fraudguard" && "🛡️ Fraud Guard"}
            {activeTab === "profile" && "👤 প্রোফাইল"}
          </h2>
        </div>

        {/* Tab Contents */}
        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
            {user && <FraudGuardSection userId={user.id} />}
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
      </main>

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
  );
}
