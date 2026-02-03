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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import companyLogo from "@/assets/company-logo.jpg";

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

export default function ClientDashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"orders" | "invoices" | "chat">("orders");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        // Defer data fetching to avoid race conditions
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (profileData) setProfile(profileData);

      // Fetch orders for this user
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (ordersError) {
        console.error("Orders fetch error:", ordersError);
      }
      
      if (ordersData) {
        const typedOrders: Order[] = ordersData.map(order => ({
          ...order,
          services: (order.services as unknown) as OrderService[],
          progress: order.progress || 0,
        }));
        setOrders(typedOrders);
      }

      // Fetch invoices for this user
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", userId)
        .order("created_at", { ascending: false });
      
      if (invoicesError) {
        console.error("Invoices fetch error:", invoicesError);
      }
      
      if (invoicesData) setInvoices(invoicesData as Invoice[]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Subscribe to realtime invoice updates
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
          // Add new invoice to the list
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
          // Update existing invoice
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
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Messages fetch error:", error);
    }
    
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
      // Messages will be updated by realtime subscription
      toast({ title: "মেসেজ পাঠানো হয়েছে" });
    } else {
      console.error("Message send error:", error);
      toast({
        title: "মেসেজ পাঠানো যায়নি",
        variant: "destructive",
      });
    }
  };

  // Subscribe to realtime messages
  useEffect(() => {
    if (!selectedOrder) return;

    // Initial fetch
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
          // Add new message to the list
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
      // Create a container element for PDF generation
      const container = document.createElement('div');
      container.innerHTML = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; padding: 20px; max-width: 800px;">
          <div style="height: 6px; background: linear-gradient(to right, #dc2626, #eab308);"></div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 20px 0;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${companyLogo}" alt="Logo" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #fee2e2;" onerror="this.style.display='none'">
              <div>
                <div style="font-weight: bold; font-size: 18px;">Web Creation BD</div>
                <div style="color: #9ca3af; font-size: 12px;">Professional Digital Agency</div>
              </div>
            </div>
            <div style="background: linear-gradient(to right, #dc2626, #ef4444); color: white; padding: 8px 16px; border-radius: 8px; text-align: center;">
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
              <span>মোট পরিমাণ</span>
              <span>৳${Number(invoice.amount).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
              <span>পরিশোধিত</span>
              <span style="color: #10b981;">- ৳${Number(invoice.paid_amount).toLocaleString()}</span>
            </div>
            <div style="background: linear-gradient(to right, #dc2626, #ef4444); color: white; padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; margin-top: 8px;">
              <span style="font-weight: bold;">মোট বাকি</span>
              <span style="font-weight: bold; font-size: 18px;">৳${(Number(invoice.amount) - Number(invoice.paid_amount)).toLocaleString()}</span>
            </div>
          </div>
          
          <div style="border-top: 1px dashed #e5e7eb; padding-top: 16px; margin-top: 16px; display: flex; justify-content: space-between;">
            <div style="font-size: 14px; color: #374151;">ধন্যবাদ! 🙏</div>
            <div style="font-size: 10px; color: #9ca3af;">Web Creation BD</div>
          </div>
          <div style="height: 6px; background: linear-gradient(to right, #dc2626, #eab308); margin-top: 20px;"></div>
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
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "সম্পন্ন";
      case "cancelled":
        return "বাতিল";
      case "processing":
        return "প্রসেসিং";
      default:
        return "পেন্ডিং";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                  <span className="text-white font-bold text-xl font-bengali">W</span>
                </div>
                <span className="font-bengali text-lg font-bold text-white hidden sm:block">
                  Web Creation BD
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" className="text-white/70 hover:text-white">
                  <Home className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline font-bengali">হোম</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-white/70">
                <User className="w-5 h-5" />
                <span className="font-bengali text-sm hidden sm:inline">
                  {profile?.full_name || user?.email?.split("@")[0]}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-white/70 hover:text-red-400"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bengali font-bold text-white mb-2">
            স্বাগতম, {profile?.full_name || "গ্রাহক"}! 👋
          </h1>
          <p className="text-white/60 font-bengali">
            আপনার অর্ডার এবং ইনভয়েস ট্র্যাক করুন
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-bengali">মোট অর্ডার</p>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-bengali">সম্পন্ন</p>
                <p className="text-2xl font-bold text-white">
                  {orders.filter((o) => o.status === "completed").length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-bengali">মোট ইনভয়েস</p>
                <p className="text-2xl font-bold text-white">{invoices.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            onClick={() => setActiveTab("orders")}
            className={`font-bengali ${
              activeTab === "orders"
                ? "bg-red-500 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Package className="w-4 h-4 mr-2" />
            অর্ডার
          </Button>
          <Button
            onClick={() => setActiveTab("invoices")}
            className={`font-bengali ${
              activeTab === "invoices"
                ? "bg-red-500 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            ইনভয়েস
          </Button>
          <Button
            onClick={() => setActiveTab("chat")}
            className={`font-bengali ${
              activeTab === "chat"
                ? "bg-red-500 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            চ্যাট
          </Button>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {orders.length === 0 ? (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 font-bengali mb-4">আপনার কোন অর্ডার নেই</p>
                <Link to="/#services">
                  <Button className="bg-red-500 hover:bg-red-600 font-bengali">
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
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="text-white font-medium">
                          অর্ডার #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-white/60 text-sm font-bengali">
                          {new Date(order.created_at).toLocaleDateString("bn-BD")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bengali border ${getStatusColor(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-white font-bold">
                        ৳{Number(order.total_price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60 font-bengali">প্রজেক্ট অগ্রগতি</span>
                      <span className="text-white font-bengali font-medium">{order.progress || 0}%</span>
                    </div>
                    <Progress value={order.progress || 0} className="h-3" />
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(order.services) &&
                      order.services.map((service, serviceIdx) => (
                        <span
                          key={serviceIdx}
                          className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm font-bengali"
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

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {invoices.length === 0 ? (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 font-bengali">কোন ইনভয়েস নেই</p>
              </div>
            ) : (
              invoices.map((invoice, idx) => {
                const dueAmount = Number(invoice.amount) - Number(invoice.paid_amount);
                const StatusIcon = invoice.status === "paid" 
                  ? CheckCircle 
                  : invoice.status === "partial" 
                  ? Clock 
                  : XCircle;
                const statusColor = invoice.status === "paid"
                  ? "bg-green-500/20 text-green-400"
                  : invoice.status === "partial"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400";
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
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
                  >
                    {/* Header Accent Bar */}
                    <div className="h-1.5 bg-gradient-to-r from-red-500 to-yellow-500" />
                    
                    <div className="p-6">
                      {/* Top Row */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl ${statusColor} flex items-center justify-center`}>
                            <StatusIcon className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-mono text-lg font-bold text-white">
                                {invoice.invoice_number}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                {statusText}
                              </span>
                            </div>
                            <p className="text-white/50 text-sm font-bengali">
                              তারিখ: {new Date(invoice.created_at).toLocaleDateString("bn-BD")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Amount Details */}
                      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-black/20 rounded-xl">
                        <div className="text-center">
                          <p className="text-white/50 text-xs font-bengali mb-1">মোট</p>
                          <p className="text-white font-bold text-lg">৳{Number(invoice.amount).toLocaleString()}</p>
                        </div>
                        <div className="text-center border-x border-white/10">
                          <p className="text-white/50 text-xs font-bengali mb-1">পরিশোধিত</p>
                          <p className="text-green-400 font-bold text-lg">৳{Number(invoice.paid_amount).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/50 text-xs font-bengali mb-1">বাকি</p>
                          <p className={`font-bold text-lg ${dueAmount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            ৳{dueAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadInvoice(invoice)}
                          disabled={downloadingInvoiceId === invoice.id}
                          className="flex-1 sm:flex-none text-blue-400 border-blue-400/30 hover:bg-blue-400/10 font-bengali"
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
                              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bengali"
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

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Order List */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 max-h-[500px] overflow-y-auto">
              <h3 className="text-white font-bengali font-bold mb-4">
                অর্ডার সিলেক্ট করুন
              </h3>
              {orders.length === 0 ? (
                <p className="text-white/40 text-sm font-bengali text-center py-8">
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
                          ? "bg-red-500/20 border border-red-500/50"
                          : "bg-white/5 hover:bg-white/10 border border-transparent"
                      }`}
                    >
                      <p className="text-white text-sm font-medium">
                        অর্ডার #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-white/60 text-xs font-bengali">
                        {getStatusText(order.status)} • {order.progress || 0}% সম্পন্ন
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col h-[500px]">
              {selectedOrder ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10">
                    <p className="text-white font-bengali font-bold">
                      অর্ডার #{selectedOrder.id.slice(0, 8)}
                    </p>
                    <p className="text-white/60 text-sm font-bengali">
                      {getStatusText(selectedOrder.status)}
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-2" />
                        <p className="text-white/40 text-sm font-bengali">
                          কোন মেসেজ নেই। প্রথম মেসেজ পাঠান!
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.is_admin ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-2xl ${
                              msg.is_admin
                                ? "bg-white/10 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs text-white/60 mt-1">
                              {new Date(msg.created_at).toLocaleTimeString("bn-BD")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="মেসেজ লিখুন..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 font-bengali"
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <Button
                        onClick={sendMessage}
                        className="bg-red-500 hover:bg-red-600"
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
                    <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 font-bengali">
                      চ্যাট করতে একটি অর্ডার সিলেক্ট করুন
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
