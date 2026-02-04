import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import html2pdf from "html2pdf.js";
import {
  Package,
  FileText,
  MessageCircle,
  Download,
  LogOut,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Home,
  Loader2,
  CreditCard,
  Shield,
  Settings,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import companyLogo from "@/assets/company-logo.jpg";
import { FraudGuardSection } from "@/components/fraud-protection/FraudGuardSection";
import { ProfileSection } from "@/components/client/ProfileSection";

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
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  const downloadInvoice = async (invoice: Invoice) => {
    setDownloadingInvoiceId(invoice.id);
    
    try {
      const container = document.createElement('div');
      container.innerHTML = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; padding: 20px; max-width: 800px;">
          <div style="height: 6px; background: linear-gradient(to right, #3b82f6, #8b5cf6);"></div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 20px 0;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${companyLogo}" alt="Logo" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'">
              <div>
                <div style="font-weight: bold; font-size: 18px; color: #111827;">Web Creation BD</div>
                <div style="color: #6b7280; font-size: 12px;">Professional Digital Agency</div>
              </div>
            </div>
            <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 8px 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 10px; text-transform: uppercase; opacity: 0.8;">ইনভয়েস</div>
              <div style="font-family: monospace; font-weight: bold; font-size: 14px;">${invoice.invoice_number}</div>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 12px; border-radius: 12px; border: 1px solid #e5e7eb; margin: 16px 0;">
            <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; margin-bottom: 6px;">তারিখ</div>
            <div style="font-weight: 600; font-size: 14px;">${new Date(invoice.created_at).toLocaleDateString('bn-BD')}</div>
          </div>
          
          <div style="margin: 16px 0;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
              <span style="color: #374151;">মোট পরিমাণ</span>
              <span style="color: #111827; font-weight: 600;">৳${Number(invoice.amount).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
              <span style="color: #374151;">পরিশোধিত</span>
              <span style="color: #10b981; font-weight: 600;">- ৳${Number(invoice.paid_amount).toLocaleString()}</span>
            </div>
            <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; margin-top: 8px;">
              <span style="font-weight: bold;">মোট বাকি</span>
              <span style="font-weight: bold; font-size: 18px;">৳${(Number(invoice.amount) - Number(invoice.paid_amount)).toLocaleString()}</span>
            </div>
          </div>
          
          <div style="border-top: 1px dashed #e5e7eb; padding-top: 16px; margin-top: 16px; display: flex; justify-content: space-between;">
            <div style="font-size: 14px; color: #374151;">ধন্যবাদ! 🙏</div>
            <div style="font-size: 10px; color: #9ca3af;">Web Creation BD</div>
          </div>
          <div style="height: 6px; background: linear-gradient(to right, #3b82f6, #8b5cf6); margin-top: 20px;"></div>
        </div>
      `;
      
      const opt = {
        margin: 10,
        filename: `Invoice-${invoice.invoice_number}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(container).save();
      
      toast({ title: "✅ PDF ডাউনলোড হয়েছে" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({ title: "PDF তৈরি করতে সমস্যা হয়েছে", variant: "destructive" });
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "processing":
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "সম্পন্ন";
      case "cancelled": return "বাতিল";
      case "processing": return "প্রসেসিং";
      default: return "পেন্ডিং";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      case "processing": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const tabs = [
    { id: "orders" as TabType, label: "অর্ডার", icon: Package },
    { id: "invoices" as TabType, label: "ইনভয়েস", icon: FileText },
    { id: "chat" as TabType, label: "চ্যাট", icon: MessageCircle },
    { id: "fraudguard" as TabType, label: "Fraud Guard", icon: Shield },
    { id: "profile" as TabType, label: "প্রোফাইল", icon: User },
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span className="font-bengali text-lg font-bold text-gray-900 hidden sm:block">
                Web Creation BD
              </span>
            </Link>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900 gap-2">
                  <Home className="w-4 h-4" />
                  <span className="font-bengali">হোম</span>
                </Button>
              </Link>
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="font-bengali text-sm font-medium text-gray-700">
                  {profile?.full_name || user?.email?.split("@")[0]}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-gray-500 hover:text-red-500"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pb-4 space-y-2"
            >
              <Link to="/" className="block px-4 py-3 rounded-xl hover:bg-gray-50 font-bengali text-gray-700">
                <Home className="w-4 h-4 inline mr-2" /> হোম
              </Link>
              <div className="px-4 py-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bengali text-sm text-gray-700">
                    {profile?.full_name || user?.email?.split("@")[0]}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 font-bengali"
              >
                <LogOut className="w-4 h-4 inline mr-2" /> লগআউট
              </button>
            </motion.div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bengali font-bold text-gray-900 mb-2">
            স্বাগতম, {profile?.full_name || "গ্রাহক"}! 👋
          </h1>
          <p className="text-gray-500 font-bengali">
            আপনার অর্ডার, ইনভয়েস এবং Fraud Guard ট্র্যাক করুন
          </p>
        </motion.div>

        {/* Fraud Guard Plugin Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 md:mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-5 md:p-6 text-white shadow-xl shadow-blue-500/20"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg md:text-xl font-bold font-bengali">🛡️ WCBD Fraud Guard Plugin v3.0</h3>
                  <span className="bg-emerald-500/30 text-emerald-100 text-xs font-medium px-2 py-1 rounded-full border border-emerald-400/30">
                    FREE Download
                  </span>
                </div>
                <p className="text-white/80 text-sm font-bengali mt-1">
                  আপনার WooCommerce স্টোরকে Fake Order থেকে সুরক্ষিত রাখুন
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => setActiveTab("fraudguard")}
                className="bg-white text-blue-600 hover:bg-white/90 gap-2 rounded-xl font-bengali shadow-lg"
              >
                <Download className="w-4 h-4" />
                Plugin ডাউনলোড করুন
              </Button>
              <Button
                onClick={() => setActiveTab("fraudguard")}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 gap-2 rounded-xl font-bengali"
              >
                <Settings className="w-4 h-4" />
                Setup Guide
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs md:text-sm font-bengali">মোট অর্ডার</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs md:text-sm font-bengali">সম্পন্ন</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {orders.filter((o) => o.status === "completed").length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs md:text-sm font-bengali">মোট ইনভয়েস</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{invoices.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setActiveTab("fraudguard")}
            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-4 md:p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-purple-600 text-xs md:text-sm font-bengali font-medium">🛡️ Fraud Guard</p>
                <p className="text-xs md:text-sm font-semibold text-gray-900 font-bengali">Plugin Available!</p>
              </div>
              <div className="hidden md:block">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bengali group-hover:bg-purple-200 transition-colors">
                  Setup →
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bengali font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === "orders" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 text-center shadow-sm">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-bengali mb-4">আপনার কোন অর্ডার নেই</p>
                <Link to="/#services">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 font-bengali">
                    সার্ভিস দেখুন
                  </Button>
                </Link>
              </div>
            ) : (
              orders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="text-gray-900 font-medium">
                          অর্ডার #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-gray-500 text-sm font-bengali">
                          {new Date(order.created_at).toLocaleDateString("bn-BD")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-bengali border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-gray-900 font-bold">
                        ৳{Number(order.total_price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-bengali">প্রজেক্ট অগ্রগতি</span>
                      <span className="text-gray-900 font-bengali font-medium">{order.progress || 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${order.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(order.services) &&
                      order.services.map((service, serviceIdx) => (
                        <span
                          key={serviceIdx}
                          className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-gray-600 text-sm font-bengali"
                        >
                          {service.serviceName} - {service.packageName}
                        </span>
                      ))}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === "invoices" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {invoices.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 text-center shadow-sm">
                <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-bengali">কোন ইনভয়েস নেই</p>
              </div>
            ) : (
              invoices.map((invoice, idx) => {
                const dueAmount = Number(invoice.amount) - Number(invoice.paid_amount);
                const StatusIcon = invoice.status === "paid" 
                  ? CheckCircle 
                  : invoice.status === "partial" 
                  ? Clock 
                  : AlertCircle;
                const statusColor = invoice.status === "paid"
                  ? "bg-emerald-100 text-emerald-600"
                  : invoice.status === "partial"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-red-100 text-red-600";
                const statusText = invoice.status === "paid" 
                  ? "পরিশোধিত" 
                  : invoice.status === "partial"
                  ? "আংশিক"
                  : "বাকি";

                return (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                    
                    <div className="p-4 md:p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${statusColor} flex items-center justify-center`}>
                            <StatusIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <span className="font-mono text-base md:text-lg font-bold text-gray-900">
                                {invoice.invoice_number}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor}`}>
                                {statusText}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm font-bengali">
                              {new Date(invoice.created_at).toLocaleDateString("bn-BD")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Amount Grid */}
                      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 p-3 md:p-4 bg-gray-50 rounded-xl">
                        <div className="text-center">
                          <p className="text-gray-400 text-xs font-bengali mb-1">মোট</p>
                          <p className="text-gray-900 font-bold text-sm md:text-base">৳{Number(invoice.amount).toLocaleString()}</p>
                        </div>
                        <div className="text-center border-x border-gray-200">
                          <p className="text-gray-400 text-xs font-bengali mb-1">পরিশোধিত</p>
                          <p className="text-emerald-600 font-bold text-sm md:text-base">৳{Number(invoice.paid_amount).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 text-xs font-bengali mb-1">বাকি</p>
                          <p className={`font-bold text-sm md:text-base ${dueAmount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            ৳{dueAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadInvoice(invoice)}
                          disabled={downloadingInvoiceId === invoice.id}
                          className="flex-1 sm:flex-none text-blue-600 border-blue-200 hover:bg-blue-50 font-bengali"
                        >
                          {downloadingInvoiceId === invoice.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          {downloadingInvoiceId === invoice.id ? "ডাউনলোড হচ্ছে..." : "ডাউনলোড"}
                        </Button>
                        {invoice.status !== "paid" && (
                          <Link 
                            to={`/checkout?invoice=${invoice.id}&amount=${dueAmount}`}
                            className="flex-1 sm:flex-none"
                          >
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bengali"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              পেমেন্ট করুন
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {activeTab === "chat" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {/* Order List */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 max-h-[400px] md:max-h-[500px] overflow-y-auto shadow-sm">
              <h3 className="text-gray-900 font-bengali font-bold mb-4">
                অর্ডার সিলেক্ট করুন
              </h3>
              {orders.length === 0 ? (
                <p className="text-gray-400 text-sm font-bengali text-center py-8">
                  কোন অর্ডার নেই
                </p>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order);
                        fetchMessages(order.id);
                      }}
                      className={`w-full p-3 rounded-xl text-left transition-colors ${
                        selectedOrder?.id === order.id
                          ? "bg-blue-50 border-2 border-blue-500"
                          : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                      }`}
                    >
                      <p className="text-gray-900 text-sm font-medium">
                        অর্ডার #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-gray-500 text-xs font-bengali">
                        {getStatusText(order.status)} • {order.progress || 0}% সম্পন্ন
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 flex flex-col h-[400px] md:h-[500px] shadow-sm">
              {selectedOrder ? (
                <>
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-gray-900 font-bengali font-bold">
                      অর্ডার #{selectedOrder.id.slice(0, 8)}
                    </p>
                    <p className="text-gray-500 text-sm font-bengali">
                      {getStatusText(selectedOrder.status)}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm font-bengali">
                          কোন মেসেজ নেই। প্রথম মেসেজ পাঠান!
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl ${
                              msg.is_admin
                                ? "bg-white border border-gray-100 text-gray-800"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.is_admin ? "text-gray-400" : "text-white/70"}`}>
                              {new Date(msg.created_at).toLocaleTimeString("bn-BD")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="মেসেজ লিখুন..."
                        className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 font-bengali rounded-xl"
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <Button
                        onClick={sendMessage}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded-xl"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bengali">
                      চ্যাট করতে একটি অর্ডার সিলেক্ট করুন
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "fraudguard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {user && <FraudGuardSection userId={user.id} />}
          </motion.div>
        )}

        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ProfileSection
              user={user}
              profile={profile}
              onProfileUpdate={() => user && fetchUserData(user.id)}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}
