import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, Phone, User, CreditCard, ExternalLink,
  Users, FileImage, FileText, Trash2,
  Plus, Upload, X, Edit2, Loader2, Search, MessageCircle, Send,
  LayoutDashboard
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
import { StatsCards } from "@/components/admin/StatsCards";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { InvoiceSystem } from "@/components/admin/InvoiceSystem";

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
  created_at: string;
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
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
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

type TabType = "overview" | "orders" | "users" | "portfolio" | "invoices" | "messages";

const AdminDashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  
  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState("all");
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
  });
  const [uploading, setUploading] = useState(false);
  
  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedOrderChat, setSelectedOrderChat] = useState<Order | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
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

  const fetchAllData = async () => {
    await Promise.all([
      fetchOrders(),
      fetchUsers(),
      fetchPortfolio(),
      fetchInvoices(),
    ]);
  };

  const fetchOrders = async () => {
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
    
    if (editingPortfolio) {
      const { error } = await supabase
        .from("portfolio_items")
        .update({
          title: portfolioForm.title,
          description: portfolioForm.description,
          category: portfolioForm.category,
          image_url: portfolioForm.image_url,
          live_url: portfolioForm.live_url || null,
        })
        .eq("id", editingPortfolio.id);
      
      if (!error) {
        toast({ title: "পোর্টফোলিও আপডেট হয়েছে" });
      }
    } else {
      const { error } = await supabase
        .from("portfolio_items")
        .insert({
          title: portfolioForm.title,
          description: portfolioForm.description,
          category: portfolioForm.category,
          image_url: portfolioForm.image_url,
          live_url: portfolioForm.live_url || null,
        });
      
      if (!error) {
        toast({ title: "পোর্টফোলিও যোগ হয়েছে" });
      }
    }
    
    setIsPortfolioModalOpen(false);
    setEditingPortfolio(null);
    setPortfolioForm({ title: "", description: "", category: "graphics-design", image_url: "", live_url: "" });
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
      fetchMessages(selectedOrderChat.id);
    }
  };

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
    : orders.filter(o => o.status === orderFilter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    completed: orders.filter(o => o.status === "completed").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    revenue: orders.filter(o => o.status === "completed").reduce((sum, o) => sum + Number(o.total_price), 0),
    unpaidInvoices: invoices.filter(i => i.status === "unpaid").reduce((sum, i) => sum + Number(i.amount), 0),
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
    { id: "portfolio" as TabType, label: "পোর্টফোলিও", icon: FileImage },
    { id: "invoices" as TabType, label: "ইনভয়েস", icon: FileText },
    { id: "messages" as TabType, label: "মেসেজ", icon: MessageCircle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-500 font-bengali">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onRefresh={fetchAllData} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bengali whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Stats Cards - Always visible */}
        <div className="mb-8">
          <StatsCards stats={stats} usersCount={users.length} />
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <AnalyticsCharts orders={orders} usersCount={users.length} />
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["all", "pending", "processing", "completed", "cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-bengali whitespace-nowrap transition-all ${
                    orderFilter === f
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 border border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {f === "all" ? "সব" : statusLabels[f]}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-bengali">কোনো অর্ডার নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 cursor-pointer"
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
                            <span className="text-gray-500 font-bengali">অগ্রগতি</span>
                            <span className="font-semibold text-gray-700">{order.progress || 0}%</span>
                          </div>
                          <Progress value={order.progress || 0} className="h-2" />
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
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="ইউজার খুঁজুন..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-11 font-bengali bg-white border-gray-100 rounded-xl h-11"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bengali font-semibold text-gray-500 uppercase tracking-wider">নাম</th>
                    <th className="px-6 py-4 text-left text-xs font-bengali font-semibold text-gray-500 uppercase tracking-wider">ফোন</th>
                    <th className="px-6 py-4 text-left text-xs font-bengali font-semibold text-gray-500 uppercase tracking-wider">যোগদান</th>
                    <th className="px-6 py-4 text-right text-xs font-bengali font-semibold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((userProfile) => (
                    <tr key={userProfile.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bengali font-medium text-gray-900">
                          {userProfile.full_name || "নাম নেই"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{userProfile.phone || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(userProfile.created_at).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(userProfile.user_id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="p-12 text-center text-gray-400 font-bengali">
                  কোনো ইউজার পাওয়া যায়নি
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {["all", ...Object.keys(categoryLabels)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPortfolioFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-bengali whitespace-nowrap transition-all ${
                      portfolioFilter === cat
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-600 border border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {cat === "all" ? "সব" : categoryLabels[cat]}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => {
                  setEditingPortfolio(null);
                  setPortfolioForm({ title: "", description: "", category: "graphics-design", image_url: "", live_url: "" });
                  setIsPortfolioModalOpen(true);
                }}
                className="bg-red-600 hover:bg-red-700 font-bengali shadow-lg shadow-red-600/20"
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
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300"
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
                          });
                          setIsPortfolioModalOpen(true);
                        }}
                        className="p-2 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => deletePortfolio(item.id)}
                        className="p-2 bg-white rounded-xl shadow-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-full font-bengali">
                      {categoryLabels[item.category] || item.category}
                    </span>
                    <h3 className="font-bengali font-semibold text-gray-900 mt-3">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredPortfolio.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <FileImage className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-bengali">কোনো পোর্টফোলিও আইটেম নেই</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "invoices" && (
          <InvoiceSystem invoices={invoices} orders={orders} onRefresh={fetchInvoices} />
        )}

        {activeTab === "messages" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Order List */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 max-h-[600px] overflow-y-auto">
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
                        ? "bg-red-50 border-2 border-red-200"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-500 mt-1">#{order.id.slice(0, 8)}</p>
                  </button>
                ))}
                {orders.filter(o => o.user_id).length === 0 && (
                  <p className="text-center text-gray-400 py-8 font-bengali">কোনো চ্যাট নেই</p>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 flex flex-col h-[600px]">
              {selectedOrderChat ? (
                <>
                  <div className="p-5 border-b border-gray-100">
                    <p className="font-bengali font-bold text-gray-900">{selectedOrderChat.customer_name}</p>
                    <p className="text-xs text-gray-500">অর্ডার #{selectedOrderChat.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.is_admin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-4 rounded-2xl ${
                            msg.is_admin
                              ? "bg-red-600 text-white"
                              : "bg-gray-100 text-gray-900"
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
                        className="font-bengali bg-gray-50 border-gray-100 rounded-xl"
                        onKeyPress={(e) => e.key === "Enter" && sendAdminMessage()}
                      />
                      <Button onClick={sendAdminMessage} className="bg-red-600 hover:bg-red-700 rounded-xl px-4">
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bengali">চ্যাট করতে একটি অর্ডার সিলেক্ট করুন</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg bg-white">
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
                    className="ml-auto px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span>{paymentLabels[selectedOrder.payment_method] || selectedOrder.payment_method}</span>
                </div>
                {selectedOrder.transaction_id && (
                  <div className="text-sm font-mono text-gray-500">
                    TrxID: {selectedOrder.transaction_id}
                  </div>
                )}
              </div>

              {/* Progress Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-bengali font-medium">প্রজেক্ট অগ্রগতি</Label>
                  <span className="text-lg font-bold text-red-600">{orderProgress}%</span>
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
                  className="font-bengali"
                >
                  অগ্রগতি সেভ করুন
                </Button>
              </div>

              {/* Payment Screenshot */}
              {selectedOrder.payment_screenshot_url && (
                <div>
                  <Label className="font-bengali font-medium mb-2 block">পেমেন্ট প্রমাণ</Label>
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
                <Label className="font-bengali font-medium mb-2 block">সার্ভিস সমূহ</Label>
                <div className="space-y-2">
                  {selectedOrder.services?.map((service, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
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
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-bengali font-semibold text-gray-900">মোট</span>
                <span className="text-2xl font-bold text-red-600">
                  ৳{Number(selectedOrder.total_price).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  onClick={() => updateOrderStatus(selectedOrder.id, "processing")}
                  variant="outline"
                  className="font-bengali"
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
                  className="text-red-600 border-red-200 hover:bg-red-50 font-bengali col-span-2"
                  disabled={selectedOrder.status === "cancelled"}
                >
                  বাতিল করুন
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Portfolio Modal */}
      <Dialog open={isPortfolioModalOpen} onOpenChange={setIsPortfolioModalOpen}>
        <DialogContent className="max-w-md bg-white">
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
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="font-bengali">
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
                className="mt-1 font-bengali"
                placeholder="প্রজেক্টের নাম"
              />
            </div>

            <div>
              <Label className="font-bengali">বিবরণ (ঐচ্ছিক)</Label>
              <Textarea
                value={portfolioForm.description}
                onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 font-bengali"
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
                    className="w-full h-32 object-cover rounded-xl"
                  />
                )}
                <div className="flex gap-2">
                  <Input
                    value={portfolioForm.image_url}
                    onChange={(e) => setPortfolioForm(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="ছবির URL দিন অথবা আপলোড করুন"
                    className="flex-1"
                  />
                  <Label className="cursor-pointer">
                    <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 transition-colors">
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
                  className="mt-1"
                  placeholder="https://example.com"
                />
                <p className="text-xs text-gray-500 mt-1 font-bengali">
                  "লাইভ প্রিভিউ" বাটনে ক্লিক করলে এই লিংকে যাবে
                </p>
              </div>
            )}

            <Button
              onClick={savePortfolio}
              className="w-full bg-red-600 hover:bg-red-700 font-bengali"
              disabled={uploading}
            >
              {editingPortfolio ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
