import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, Phone, User, CreditCard, ExternalLink,
  Users, FileImage, FileText, Trash2,
  Plus, Upload, X, Edit2, Loader2, Search, MessageCircle, Send,
  LayoutDashboard, UserPlus, Star, PenTool, Shield, Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Components
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar, type TabType } from "@/components/admin/AdminSidebar";
import { StatsCards } from "@/components/admin/StatsCards";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { InvoiceSystem } from "@/components/admin/InvoiceSystem";
import { PaymentSettings } from "@/components/admin/PaymentSettings";
import { ReviewsManagement } from "@/components/admin/ReviewsManagement";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { FraudGuardManagement } from "@/components/admin/FraudGuardManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { ProjectTimerManagement } from "@/components/admin/ProjectTimerManagement";
import { CourierCheckSubscriptionManagement } from "@/components/admin/CourierCheckSubscriptionManagement";
import { ClientLinksManagement } from "@/components/admin/ClientLinksManagement";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

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
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  services: OrderService[];
  total_price: number;
  total_savings: number;
  payment_method: string;
  transaction_id: string | null;
  sender_number: string | null;
  payment_screenshot_url: string | null;
  status: string;
  progress: number;
  notes: string | null;
  created_at: string;
  user_id: string | null;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  live_url?: string | null;
  sub_category?: string | null;
  created_at: string;
}

interface LandingCategory {
  id: string;
  name: string;
  display_order: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  status: string;
  order_id: string | null;
  client_id: string | null;
  created_at: string;
}

interface Message {
  id: string;
  content: string;
  is_admin: boolean;
  order_id: string;
  sender_id: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  processing: "bg-blue-50 text-blue-600 border-blue-200",
  completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "অপেক্ষমান",
  processing: "প্রসেসিং",
  completed: "সম্পন্ন",
  cancelled: "বাতিল",
};

const paymentLabels: Record<string, string> = {
  bkash: "বিকাশ",
  nagad: "নগদ",
  rocket: "রকেট",
  bank: "ব্যাংক",
};

const categoryLabels: Record<string, string> = {
  "facebook-ads": "ফেসবুক অ্যাডস",
  "web-development": "ওয়েব ডেভেলপমেন্ট",
  "graphics-design": "গ্রাফিক্স ডিজাইন",
  "video-editing": "ভিডিও এডিটিং",
  "motion-graphics": "মোশন গ্রাফিক্স",
  "landing-page": "ল্যান্ডিং পেজ",
};
const AdminDashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem("admin-active-tab");
    return (saved as TabType) || "overview";
  });

  useEffect(() => {
    localStorage.setItem("admin-active-tab", activeTab);
  }, [activeTab]);
  // Note: TabType is now imported from AdminSidebar
  
  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState("active");
  const [orderProgress, setOrderProgress] = useState<number>(0);
  
  // Users
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState("");
  
  // Portfolio
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioFilter, setPortfolioFilter] = useState("all");
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    category: "graphics-design",
    image_url: "",
    live_url: "",
    sub_category: "",
  });
  const [landingCategories, setLandingCategories] = useState<LandingCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<LandingCategory | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedOrderChat, setSelectedOrderChat] = useState<Order | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  // Delete confirmations
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState<string | null>(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check auth and admin status
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      
      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      if (!roleData) {
        toast({
          title: "অনুমতি নেই",
          description: "শুধুমাত্র অ্যাডমিনরা এই পেজ দেখতে পারবেন",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }
      
      setIsAdmin(true);
      setLoading(false);
      fetchAllData();
    };
    
    checkAdmin();
  }, [navigate]);

  // Real-time subscriptions for all data
  useEffect(() => {
    if (!isAdmin) return;

    // Orders realtime
    const ordersChannel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = {
              ...payload.new,
              services: (payload.new.services as unknown) as OrderService[],
              progress: payload.new.progress || 0,
            } as Order;
            setOrders(prev => [newOrder, ...prev]);
            setAllOrders(prev => [newOrder, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updateOrder = (o: Order) => 
              o.id === payload.new.id 
                ? { ...payload.new, services: (payload.new.services as unknown) as OrderService[], progress: payload.new.progress || 0 } as Order
                : o;
            setOrders(prev => prev.map(updateOrder));
            setAllOrders(prev => prev.map(updateOrder));
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
            setAllOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Invoices realtime
    const invoicesChannel = supabase
      .channel('admin-invoices-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setInvoices(prev => [payload.new as Invoice, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setInvoices(prev => prev.map(inv => 
              inv.id === payload.new.id ? payload.new as Invoice : inv
            ));
          } else if (payload.eventType === 'DELETE') {
            setInvoices(prev => prev.filter(inv => inv.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Users/profiles realtime
    const profilesChannel = supabase
      .channel('admin-profiles-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    // Portfolio realtime
    const portfolioChannel = supabase
      .channel('admin-portfolio-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_items' },
        () => { fetchPortfolio(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'landing_page_categories' },
        () => { fetchLandingCategories(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(invoicesChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(portfolioChannel);
    };
  }, [isAdmin]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchOrders(),
      fetchAllOrdersForInvoices(),
      fetchUsers(),
      fetchPortfolio(),
      fetchInvoices(),
      fetchLandingCategories(),
    ]);
  };

  const fetchAllOrdersForInvoices = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      const typedOrders: Order[] = data.map(order => ({
        ...order,
        services: (order.services as unknown) as OrderService[],
        progress: order.progress || 0,
      }));
      setAllOrders(typedOrders);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .not("user_id", "is", null)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      const typedOrders: Order[] = data.map(order => ({
        ...order,
        services: (order.services as unknown) as OrderService[],
        progress: order.progress || 0,
      }));
      setOrders(typedOrders);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setUsers(data);
    }
  };

  const fetchPortfolio = async () => {
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setPortfolioItems(data);
    }
  };

  const fetchLandingCategories = async () => {
    const { data } = await supabase
      .from("landing_page_categories")
      .select("*")
      .order("display_order", { ascending: true });
    if (data) setLandingCategories(data);
  };

  const saveLandingCategory = async () => {
    if (!newCategoryName.trim()) return;
    if (editingCategory) {
      await supabase
        .from("landing_page_categories")
        .update({ name: newCategoryName.trim() })
        .eq("id", editingCategory.id);
      setEditingCategory(null);
    } else {
      const maxOrder = landingCategories.length > 0
        ? Math.max(...landingCategories.map(c => c.display_order)) + 1
        : 0;
      await supabase
        .from("landing_page_categories")
        .insert({ name: newCategoryName.trim(), display_order: maxOrder });
    }
    setNewCategoryName("");
    fetchLandingCategories();
  };

  const deleteLandingCategory = async (id: string) => {
    await supabase.from("landing_page_categories").delete().eq("id", id);
    fetchLandingCategories();
  };

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setInvoices(data);
    }
  };

  const fetchMessages = async (orderId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    
    if (data) setMessages(data as Message[]);
  };

  // Order actions
  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (!error) {
      toast({ title: "স্ট্যাটাস আপডেট হয়েছে" });
      setSelectedOrder(null);
      fetchOrders();
    } else {
      toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  const updateOrderProgress = async (orderId: string, progress: number) => {
    const { error } = await supabase
      .from("orders")
      .update({ progress })
      .eq("id", orderId);

    if (!error) {
      toast({ title: "প্রগ্রেস আপডেট হয়েছে" });
      fetchOrders();
    }
  };

  const deleteOrder = async (orderId: string) => {
    // First delete related invoices
    await supabase.from("invoices").delete().eq("order_id", orderId);
    // Then delete related messages
    await supabase.from("messages").delete().eq("order_id", orderId);
    // Finally delete the order
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (!error) {
      toast({ title: "অর্ডার ডিলিট হয়েছে" });
      setDeleteOrderConfirm(null);
      setSelectedOrder(null);
      fetchOrders();
      fetchInvoices();
    } else {
      toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  // Portfolio actions
  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `portfolio/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from("payment-screenshots")
      .upload(filePath, file);
    
    if (uploadError) {
      toast({ title: "আপলোড ব্যর্থ", variant: "destructive" });
      setUploading(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from("payment-screenshots")
      .getPublicUrl(filePath);
    
    setPortfolioForm(prev => ({ ...prev, image_url: publicUrl }));
    setUploading(false);
    toast({ title: "ছবি আপলোড হয়েছে" });
  };

  const savePortfolio = async () => {
    if (!portfolioForm.title || !portfolioForm.image_url || !portfolioForm.category) {
      toast({ title: "সব তথ্য দিন", variant: "destructive" });
      return;
    }
    
    const portfolioData: any = {
      title: portfolioForm.title,
      description: portfolioForm.description,
      category: portfolioForm.category,
      image_url: portfolioForm.image_url,
      live_url: portfolioForm.live_url || null,
      sub_category: portfolioForm.category === "landing-page" ? (portfolioForm.sub_category || null) : null,
    };

    if (editingPortfolio) {
      const { error } = await supabase
        .from("portfolio_items")
        .update(portfolioData)
        .eq("id", editingPortfolio.id);
      
      if (!error) {
        toast({ title: "পোর্টফোলিও আপডেট হয়েছে" });
      }
    } else {
      const { error } = await supabase
        .from("portfolio_items")
        .insert(portfolioData);
      
      if (!error) {
        toast({ title: "পোর্টফোলিও যোগ হয়েছে" });
      }
    }
    
    setIsPortfolioModalOpen(false);
    setEditingPortfolio(null);
    setPortfolioForm({ title: "", description: "", category: "graphics-design", image_url: "", live_url: "", sub_category: "" });
    fetchPortfolio();
  };

  const deletePortfolio = async (id: string) => {
    const { error } = await supabase
      .from("portfolio_items")
      .delete()
      .eq("id", id);
    
    if (!error) {
      toast({ title: "ডিলিট হয়েছে" });
      fetchPortfolio();
    }
  };

  // Message actions
  const sendAdminMessage = async () => {
    if (!newMessage.trim() || !selectedOrderChat || !user) return;

    const { error } = await supabase.from("messages").insert({
      order_id: selectedOrderChat.id,
      sender_id: user.id,
      content: newMessage,
      is_admin: true,
    });

    if (!error) {
      setNewMessage("");
      // Messages will be updated by realtime subscription
    }
  };

  // Subscribe to realtime messages for admin
  useEffect(() => {
    if (!selectedOrderChat) return;

    // Initial fetch
    fetchMessages(selectedOrderChat.id);

    const channel = supabase
      .channel(`admin-messages-${selectedOrderChat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${selectedOrderChat.id}`,
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
  }, [selectedOrderChat?.id]);

  // User actions
  const deleteUser = async (userId: string) => {
    await supabase.from("profiles").delete().eq("user_id", userId);
    await supabase.from("user_roles").delete().eq("user_id", userId);
    toast({ title: "ইউজার ডিলিট হয়েছে" });
    fetchUsers();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Stats calculations
  const filteredOrders = orderFilter === "all" 
    ? orders 
    : orderFilter === "active"
      ? orders.filter(o => o.status === "pending" || o.status === "processing")
      : orders.filter(o => o.status === orderFilter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    completed: orders.filter(o => o.status === "completed").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    revenue: invoices.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0),
    unpaidInvoices: invoices.reduce((sum, i) => sum + (Number(i.amount) - Number(i.paid_amount || 0)), 0),
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone?.includes(userSearch)
  );

  const filteredPortfolio = portfolioFilter === "all"
    ? portfolioItems
    : portfolioItems.filter(p => p.category === portfolioFilter);

  const tabs = [
    { id: "overview" as TabType, label: "ওভারভিউ", icon: LayoutDashboard },
    { id: "orders" as TabType, label: "অর্ডার", icon: Package },
    { id: "users" as TabType, label: "ইউজার", icon: Users },
    { id: "fraudguard" as TabType, label: "Fraud Guard", icon: Shield },
    { id: "couriercheck" as TabType, label: "Courier Check", icon: Search },
    { id: "portfolio" as TabType, label: "পোর্টফোলিও", icon: FileImage },
    { id: "invoices" as TabType, label: "ইনভয়েস", icon: FileText },
    { id: "messages" as TabType, label: "মেসেজ", icon: MessageCircle },
    { id: "payments" as TabType, label: "পেমেন্ট", icon: CreditCard },
    { id: "reviews" as TabType, label: "রিভিউ", icon: Star },
    { id: "content" as TabType, label: "কন্টেন্ট CMS", icon: PenTool },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-400 font-bengali">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader onRefresh={fetchAllData} onLogout={handleLogout} activeTabLabel={tabs.find(t => t.id === activeTab)?.label || activeTab} />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:block">
          <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <AdminMobileNav activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6 pb-24 lg:pb-6">
          {/* Stats Cards + Project Timer - Always on overview */}
          {activeTab === "overview" && (
            <>
              <StatsCards stats={stats} usersCount={users.length} />
              <ProjectTimerManagement orders={orders} invoices={invoices} />
              <AnalyticsCharts orders={orders} usersCount={users.length} invoices={invoices} />
            </>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <ProjectTimerManagement orders={orders} invoices={invoices} />
          )}

          {activeTab === "fraudguard" && (
            <FraudGuardManagement />
          )}

          {activeTab === "couriercheck" && (
            <CourierCheckSubscriptionManagement />
          )}

          {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["active", "all", "pending", "processing", "completed", "cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-bengali whitespace-nowrap transition-all ${
                    orderFilter === f
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {f === "active" ? "চলমান" : f === "all" ? "সব" : statusLabels[f]}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-bengali">কোনো অর্ডার নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setOrderProgress(order.progress || 0);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleDateString("bn-BD")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-bengali font-semibold text-gray-900">{order.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{order.customer_phone}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-400 font-bengali">অগ্রগতি</span>
                            <span className="font-semibold text-gray-700">{order.progress || 0}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${order.progress || 0}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xl font-bold text-gray-900">৳{Number(order.total_price).toLocaleString()}</p>
                        <p className="text-xs text-gray-400 font-bengali">{order.services?.length || 0} সার্ভিস</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <UserManagement />
        )}

        {activeTab === "portfolio" && (
          <div className="space-y-6">
            {/* Landing Page Category Management - Only visible when landing-page filter is active */}
            {portfolioFilter === "landing-page" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bengali font-bold text-gray-900 mb-4">ল্যান্ডিং পেজ সাব-ক্যাটাগরি</h3>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={editingCategory ? "ক্যাটাগরি এডিট করুন" : "নতুন ক্যাটাগরি নাম"}
                  className="flex-1 font-bengali bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                  onKeyPress={(e) => e.key === "Enter" && saveLandingCategory()}
                />
                <Button onClick={saveLandingCategory} className="bg-blue-600 hover:bg-blue-700 font-bengali">
                  {editingCategory ? "আপডেট" : <><Plus className="w-4 h-4 mr-1" /> যোগ করুন</>}
                </Button>
                {editingCategory && (
                  <Button variant="outline" onClick={() => { setEditingCategory(null); setNewCategoryName(""); }} className="border-gray-200">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {landingCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-sm font-bengali">
                    <span>{cat.name}</span>
                    <button
                      onClick={() => { setEditingCategory(cat); setNewCategoryName(cat.name); }}
                      className="ml-1 hover:text-blue-900"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteLandingCategory(cat.id)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {landingCategories.length === 0 && (
                  <p className="text-sm text-gray-400 font-bengali">কোনো ক্যাটাগরি নেই। উপরে থেকে যোগ করুন।</p>
                )}
              </div>
            </div>
            )}

            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {["all", ...Object.keys(categoryLabels)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPortfolioFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-bengali whitespace-nowrap transition-all ${
                      portfolioFilter === cat
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {cat === "all" ? "সব" : categoryLabels[cat]}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => {
                  setEditingPortfolio(null);
                  setPortfolioForm({ title: "", description: "", category: "graphics-design", image_url: "", live_url: "", sub_category: "" });
                  setIsPortfolioModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bengali shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                নতুন যোগ করুন
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPortfolio.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md hover:border-gray-200 transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingPortfolio(item);
                          setPortfolioForm({
                            title: item.title,
                            description: item.description || "",
                            category: item.category,
                            image_url: item.image_url,
                            live_url: item.live_url || "",
                            sub_category: (item as any).sub_category || "",
                          });
                          setIsPortfolioModalOpen(true);
                        }}
                        className="p-2 bg-white/90 rounded-xl shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => deletePortfolio(item.id)}
                        className="p-2 bg-white/90 rounded-xl shadow-lg hover:bg-red-50 transition-colors border border-gray-200"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full font-bengali border border-blue-100">
                        {categoryLabels[item.category] || item.category}
                      </span>
                      {item.sub_category && (
                        <span className="text-xs px-2.5 py-1 bg-teal-50 text-teal-600 rounded-full font-bengali border border-teal-100">
                          {item.sub_category}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bengali font-semibold text-gray-900 mt-3">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredPortfolio.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <FileImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-bengali">কোনো পোর্টফোলিও আইটেম নেই</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "invoices" && (
          <InvoiceSystem
            invoices={invoices}
            orders={allOrders}
            onRefresh={async () => {
              await Promise.all([fetchInvoices(), fetchOrders(), fetchAllOrdersForInvoices()]);
            }}
          />
        )}

        {activeTab === "messages" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Order List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-h-[600px] overflow-y-auto">
              <h3 className="font-bengali font-bold mb-4 text-gray-900">অর্ডার সিলেক্ট করুন</h3>
              <div className="space-y-2">
                {orders.filter(o => o.user_id).map((order) => (
                  <button
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderChat(order);
                      fetchMessages(order.id);
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      selectedOrderChat?.id === order.id
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-400 mt-1">#{order.id.slice(0, 8)}</p>
                  </button>
                ))}
                {orders.filter(o => o.user_id).length === 0 && (
                  <p className="text-center text-gray-400 py-8 font-bengali">কোনো চ্যাট নেই</p>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
              {selectedOrderChat ? (
                <>
                  <div className="p-5 border-b border-gray-100">
                    <p className="font-bengali font-bold text-gray-900">{selectedOrderChat.customer_name}</p>
                    <p className="text-xs text-gray-400">অর্ডার #{selectedOrderChat.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.is_admin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-4 rounded-2xl ${
                            msg.is_admin
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-900 border border-gray-100 shadow-sm"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-2 ${msg.is_admin ? "text-white/60" : "text-gray-400"}`}>
                            {new Date(msg.created_at).toLocaleTimeString("bn-BD")}
                          </p>
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="flex-1 flex items-center justify-center h-full">
                        <p className="text-gray-400 font-bengali">কোনো মেসেজ নেই</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="মেসেজ লিখুন..."
                        className="font-bengali bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400"
                        onKeyPress={(e) => e.key === "Enter" && sendAdminMessage()}
                      />
                      <Button onClick={sendAdminMessage} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-4">
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-bengali">চ্যাট করতে একটি অর্ডার সিলেক্ট করুন</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <PaymentSettings />
        )}

        {activeTab === "reviews" && (
          <ReviewsManagement />
        )}

        {activeTab === "content" && (
          <ContentManagement />
        )}

        {activeTab === "clientlinks" && (
          <ClientLinksManagement />
        )}
        </main>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">অর্ডার বিস্তারিত</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-5 mt-2">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedOrder.created_at).toLocaleString("bn-BD")}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <span className="font-bengali font-semibold text-gray-900 block">{selectedOrder.customer_name}</span>
                    <a href={`tel:${selectedOrder.customer_phone}`} className="text-sm text-blue-600">
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                  <a
                    href={`https://wa.me/88${selectedOrder.customer_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    WhatsApp
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CreditCard className="w-4 h-4" />
                  <span>{paymentLabels[selectedOrder.payment_method] || selectedOrder.payment_method}</span>
                </div>
                {selectedOrder.transaction_id && (
                  <div className="text-sm font-mono text-gray-400">
                    TrxID: {selectedOrder.transaction_id}
                  </div>
                )}
              </div>

              {/* Progress Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-bengali font-medium">প্রজেক্ট অগ্রগতি</Label>
                  <span className="text-lg font-bold text-blue-600">{orderProgress}%</span>
                </div>
                <Slider
                  value={[orderProgress]}
                  onValueChange={(val) => setOrderProgress(val[0])}
                  max={100}
                  step={5}
                  className="my-4"
                />
                <Button
                  onClick={() => updateOrderProgress(selectedOrder.id, orderProgress)}
                  variant="outline"
                  size="sm"
                  className="font-bengali border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  অগ্রগতি সেভ করুন
                </Button>
              </div>

              {/* Payment Screenshot */}
              {selectedOrder.payment_screenshot_url && (
                <div>
                  <Label className="font-bengali font-medium text-gray-600 mb-2 block">পেমেন্ট প্রমাণ</Label>
                  <div className="relative">
                    <img 
                      src={selectedOrder.payment_screenshot_url} 
                      alt="Payment proof" 
                      className="w-full h-40 object-cover rounded-xl border"
                    />
                    <a
                      href={selectedOrder.payment_screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {/* Services */}
              <div>
                <Label className="font-bengali font-medium text-gray-600 mb-2 block">সার্ভিস সমূহ</Label>
                <div className="space-y-2">
                  {selectedOrder.services?.map((service, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-100">
                      <div>
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                          {service.serviceName}
                        </span>
                        <span className="ml-2 font-bengali text-gray-700">{service.packageName}</span>
                      </div>
                      <span className="font-bold text-gray-900">৳{service.price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="font-bengali font-semibold text-gray-900">মোট</span>
                <span className="text-2xl font-bold text-blue-600">
                  ৳{Number(selectedOrder.total_price).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, "processing")}
                  variant="outline"
                  className="font-bengali border-gray-200 text-gray-600 hover:bg-gray-50"
                  disabled={selectedOrder.status === "processing"}
                >
                  প্রসেসিং
                </Button>
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, "completed")}
                  className="bg-emerald-600 hover:bg-emerald-700 font-bengali"
                  disabled={selectedOrder.status === "completed"}
                >
                  সম্পন্ন
                </Button>
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, "cancelled")}
                  variant="outline"
                  className="text-amber-600 border-amber-200 hover:bg-amber-50 font-bengali"
                  disabled={selectedOrder.status === "cancelled"}
                >
                  বাতিল করুন
                </Button>
                <Button
                  onClick={() => setDeleteOrderConfirm(selectedOrder.id)}
                  variant="outline"
                  className="text-red-500 border-red-200 hover:bg-red-50 font-bengali"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  ডিলিট
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Portfolio Modal */}
      <Dialog open={isPortfolioModalOpen} onOpenChange={setIsPortfolioModalOpen}>
        <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">
              {editingPortfolio ? "পোর্টফোলিও এডিট করুন" : "নতুন পোর্টফোলিও"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label className="font-bengali">ক্যাটাগরি</Label>
              <Select
                value={portfolioForm.category}
                onValueChange={(val) => setPortfolioForm(prev => ({ ...prev, category: val }))}
              >
                <SelectTrigger className="mt-1 bg-gray-50 border-gray-200 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-900">
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="font-bengali text-gray-900">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-bengali">শিরোনাম</Label>
              <Input
                value={portfolioForm.title}
                onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 font-bengali bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                placeholder="প্রজেক্টের নাম"
              />
            </div>

            <div>
              <Label className="font-bengali">বিবরণ (ঐচ্ছিক)</Label>
              <Textarea
                value={portfolioForm.description}
                onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 font-bengali bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                placeholder="প্রজেক্ট সম্পর্কে সংক্ষেপে লিখুন"
                rows={3}
              />
            </div>

            <div>
              <Label className="font-bengali">ছবি</Label>
              <div className="mt-2 space-y-2">
                {portfolioForm.image_url && (
                  <img
                    src={portfolioForm.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-xl border border-gray-200"
                  />
                )}
                <div className="flex gap-2">
                  <Input
                    value={portfolioForm.image_url}
                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="ছবির URL দিন অথবা আপলোড করুন"
                    className="flex-1 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                  />
                  <Label className="cursor-pointer">
                    <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 transition-colors text-gray-600">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePortfolioImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </Label>
                </div>
              </div>
            </div>

            {/* Live URL - Only for web-development and landing-page */}
            {(portfolioForm.category === "web-development" || portfolioForm.category === "landing-page") && (
              <div>
                <Label className="font-bengali">লাইভ প্রিভিউ URL</Label>
                <Input
                  value={portfolioForm.live_url}
                  onChange={(e) => setPortfolioForm(prev => ({ ...prev, live_url: e.target.value }))}
                  className="mt-1 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                  placeholder="https://example.com"
                />
                <p className="text-xs text-gray-400 mt-1 font-bengali">
                  "লাইভ প্রিভিউ" বাটনে ক্লিক করলে এই লিংকে যাবে
                </p>
              </div>
            )}

            {/* Sub-category dropdown - Only for landing-page */}
            {portfolioForm.category === "landing-page" && landingCategories.length > 0 && (
              <div>
                <Label className="font-bengali">সাব-ক্যাটাগরি</Label>
                <Select
                  value={portfolioForm.sub_category || "none"}
                  onValueChange={(val) => setPortfolioForm(prev => ({ ...prev, sub_category: val === "none" ? "" : val }))}
                >
                  <SelectTrigger className="mt-1 bg-gray-50 border-gray-200 text-gray-900">
                    <SelectValue placeholder="সাব-ক্যাটাগরি সিলেক্ট করুন" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-gray-900">
                    <SelectItem value="none" className="font-bengali text-gray-900">কোনো সাব-ক্যাটাগরি নেই</SelectItem>
                    {landingCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name} className="font-bengali text-gray-900">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={savePortfolio}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bengali"
              disabled={uploading}
            >
              {editingPortfolio ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Order Confirmation */}
      <AlertDialog open={!!deleteOrderConfirm} onOpenChange={() => setDeleteOrderConfirm(null)}>
        <AlertDialogContent className="bg-white border-gray-200 text-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali">অর্ডার ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription className="font-bengali">
              এই অর্ডার এবং সম্পর্কিত সমস্ত ইনভয়েস ও মেসেজ স্থায়ীভাবে ডিলিট হয়ে যাবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bengali border-gray-200 text-gray-600 hover:bg-gray-50">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOrderConfirm && deleteOrder(deleteOrderConfirm)}
              className="bg-red-600 hover:bg-red-700 font-bengali"
            >
              ডিলিট করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteUserConfirm} onOpenChange={() => setDeleteUserConfirm(null)}>
        <AlertDialogContent className="bg-white border-gray-200 text-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali">ইউজার ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription className="font-bengali">
              এই ইউজারের প্রোফাইল এবং রোল স্থায়ীভাবে ডিলিট হয়ে যাবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bengali border-gray-200 text-gray-600 hover:bg-gray-50">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteUserConfirm) {
                  deleteUser(deleteUserConfirm);
                  setDeleteUserConfirm(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700 font-bengali"
            >
              ডিলিট করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
