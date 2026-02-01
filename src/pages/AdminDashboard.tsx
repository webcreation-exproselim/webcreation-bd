import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, Clock, CheckCircle, XCircle, Phone, User, 
  CreditCard, Calendar, TrendingUp, Eye, RefreshCw, Image, ExternalLink,
  Users, FileImage, FileText, Settings, BarChart3, Trash2, Ban,
  Plus, Upload, X, Edit2, Home, LogOut, Loader2, Search, MessageCircle, Send
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { User as SupabaseUser } from "@supabase/supabase-js";

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
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
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

const CHART_COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

const AdminDashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  
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
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    order_id: "",
    amount: 0,
    client_id: "",
  });
  
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
        .single();
      
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
    
    const { error: uploadError, data } = await supabase.storage
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

  // Invoice actions
  const createInvoice = async () => {
    if (!invoiceForm.order_id || !invoiceForm.amount) {
      toast({ title: "অর্ডার এবং পরিমাণ দিন", variant: "destructive" });
      return;
    }
    
    const order = orders.find(o => o.id === invoiceForm.order_id);
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
    
    const { error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        order_id: invoiceForm.order_id,
        client_id: order?.user_id || null,
        amount: invoiceForm.amount,
        status: "unpaid",
      });
    
    if (!error) {
      toast({ title: "ইনভয়েস তৈরি হয়েছে" });
      setIsInvoiceModalOpen(false);
      setInvoiceForm({ order_id: "", amount: 0, client_id: "" });
      fetchInvoices();
    }
  };

  const updateInvoiceStatus = async (id: string, status: string, paidAmount?: number) => {
    const updateData: any = { status };
    if (paidAmount !== undefined) updateData.paid_amount = paidAmount;
    
    const { error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id);
    
    if (!error) {
      toast({ title: "ইনভয়েস আপডেট হয়েছে" });
      fetchInvoices();
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
    // Just delete profile and roles - auth user deletion requires admin API
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

  // Chart data
  const getMonthlyRevenue = () => {
    const monthlyData: Record<string, number> = {};
    orders
      .filter(o => o.status === "completed")
      .forEach(order => {
        const month = new Date(order.created_at).toLocaleDateString("bn-BD", { month: "short", year: "numeric" });
        monthlyData[month] = (monthlyData[month] || 0) + Number(order.total_price);
      });
    
    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount,
    })).slice(-6);
  };

  const getServiceDistribution = () => {
    const serviceCount: Record<string, number> = {};
    orders.forEach(order => {
      order.services?.forEach((service: OrderService) => {
        const name = service.serviceName || "অন্যান্য";
        serviceCount[name] = (serviceCount[name] || 0) + 1;
      });
    });
    
    return Object.entries(serviceCount).map(([name, value]) => ({ name, value }));
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone?.includes(userSearch)
  );

  const filteredPortfolio = portfolioFilter === "all"
    ? portfolioItems
    : portfolioItems.filter(p => p.category === portfolioFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <div>
              <h1 className="font-bengali font-bold text-gray-900">অ্যাডমিন ড্যাশবোর্ড</h1>
              <p className="text-xs text-gray-500">Web Creation BD</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <Button onClick={fetchAllData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <Package className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 font-bengali">মোট অর্ডার</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <Clock className="w-5 h-5 text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-xs text-gray-500 font-bengali">অপেক্ষমান</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-xs text-gray-500 font-bengali">সম্পন্ন</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <TrendingUp className="w-5 h-5 text-red-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">৳{stats.revenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-bengali">মোট আয়</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <Users className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <p className="text-xs text-gray-500 font-bengali">মোট ইউজার</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <FileText className="w-5 h-5 text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">৳{stats.unpaidInvoices.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-bengali">বাকি আছে</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-xl flex-wrap">
            <TabsTrigger value="orders" className="font-bengali rounded-lg">
              <Package className="w-4 h-4 mr-2" />
              অর্ডার
            </TabsTrigger>
            <TabsTrigger value="users" className="font-bengali rounded-lg">
              <Users className="w-4 h-4 mr-2" />
              ইউজার
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="font-bengali rounded-lg">
              <FileImage className="w-4 h-4 mr-2" />
              পোর্টফোলিও
            </TabsTrigger>
            <TabsTrigger value="invoices" className="font-bengali rounded-lg">
              <FileText className="w-4 h-4 mr-2" />
              ইনভয়েস
            </TabsTrigger>
            <TabsTrigger value="messages" className="font-bengali rounded-lg">
              <MessageCircle className="w-4 h-4 mr-2" />
              মেসেজ
            </TabsTrigger>
            <TabsTrigger value="charts" className="font-bengali rounded-lg">
              <BarChart3 className="w-4 h-4 mr-2" />
              চার্ট
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["all", "pending", "processing", "completed", "cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-bengali whitespace-nowrap transition-all ${
                    orderFilter === f
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-red-300"
                  }`}
                >
                  {f === "all" ? "সব" : statusLabels[f]}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-bengali">কোনো অর্ডার নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setOrderProgress(order.progress || 0);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString("bn-BD")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-bengali font-medium text-gray-900">{order.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{order.customer_phone}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500 font-bengali">অগ্রগতি</span>
                            <span className="font-medium">{order.progress || 0}%</span>
                          </div>
                          <Progress value={order.progress || 0} className="h-2" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">৳{Number(order.total_price).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 font-bengali">{order.services?.length || 0} সার্ভিস</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="ইউজার খুঁজুন..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10 font-bengali"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bengali font-medium text-gray-500">নাম</th>
                    <th className="px-4 py-3 text-left text-xs font-bengali font-medium text-gray-500">ফোন</th>
                    <th className="px-4 py-3 text-left text-xs font-bengali font-medium text-gray-500">যোগদান</th>
                    <th className="px-4 py-3 text-right text-xs font-bengali font-medium text-gray-500">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((userProfile) => (
                    <tr key={userProfile.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-bengali font-medium text-gray-900">
                          {userProfile.full_name || "নাম নেই"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{userProfile.phone || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(userProfile.created_at).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(userProfile.user_id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500 font-bengali">
                  কোনো ইউজার পাওয়া যায়নি
                </div>
              )}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {["all", ...Object.keys(categoryLabels)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPortfolioFilter(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-bengali whitespace-nowrap transition-all ${
                      portfolioFilter === cat
                        ? "bg-red-600 text-white"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-red-300"
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
                className="bg-red-600 hover:bg-red-700 font-bengali"
              >
                <Plus className="w-4 h-4 mr-2" />
                নতুন যোগ করুন
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPortfolio.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
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
                        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => deletePortfolio(item.id)}
                        className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-bengali">
                      {categoryLabels[item.category] || item.category}
                    </span>
                    <h3 className="font-bengali font-semibold text-gray-900 mt-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredPortfolio.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <FileImage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-bengali">কোনো পোর্টফোলিও আইটেম নেই</p>
              </div>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setIsInvoiceModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 font-bengali"
              >
                <Plus className="w-4 h-4 mr-2" />
                নতুন ইনভয়েস
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bengali font-medium text-gray-500">ইনভয়েস নং</th>
                    <th className="px-4 py-3 text-left text-xs font-bengali font-medium text-gray-500">পরিমাণ</th>
                    <th className="px-4 py-3 text-left text-xs font-bengali font-medium text-gray-500">পেমেন্ট</th>
                    <th className="px-4 py-3 text-left text-xs font-bengali font-medium text-gray-500">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-left text-xs font-bengali font-medium text-gray-500">তারিখ</th>
                    <th className="px-4 py-3 text-right text-xs font-bengali font-medium text-gray-500">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">{invoice.invoice_number}</td>
                      <td className="px-4 py-3 font-bold text-red-600">৳{Number(invoice.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-green-600">৳{Number(invoice.paid_amount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          invoice.status === "paid" 
                            ? "bg-green-100 text-green-700" 
                            : invoice.status === "partial"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {invoice.status === "paid" ? "পরিশোধিত" : invoice.status === "partial" ? "আংশিক" : "বাকি"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(invoice.created_at).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateInvoiceStatus(invoice.id, "paid", invoice.amount)}
                          disabled={invoice.status === "paid"}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length === 0 && (
                <div className="p-8 text-center text-gray-500 font-bengali">
                  কোনো ইনভয়েস নেই
                </div>
              )}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Order List */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 max-h-[600px] overflow-y-auto">
                <h3 className="font-bengali font-bold mb-4">অর্ডার সিলেক্ট করুন</h3>
                <div className="space-y-2">
                  {orders.filter(o => o.user_id).map((order) => (
                    <button
                      key={order.id}
                      onClick={() => {
                        setSelectedOrderChat(order);
                        fetchMessages(order.id);
                      }}
                      className={`w-full p-3 rounded-xl text-left transition-colors ${
                        selectedOrderChat?.id === order.id
                          ? "bg-red-100 border border-red-300"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <p className="font-medium text-sm">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">#{order.id.slice(0, 8)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col h-[600px]">
                {selectedOrderChat ? (
                  <>
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-bengali font-bold">{selectedOrderChat.customer_name}</p>
                      <p className="text-xs text-gray-500">অর্ডার #{selectedOrderChat.id.slice(0, 8)}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.is_admin ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-2xl ${
                              msg.is_admin
                                ? "bg-red-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.is_admin ? "text-white/70" : "text-gray-500"}`}>
                              {new Date(msg.created_at).toLocaleTimeString("bn-BD")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="মেসেজ লিখুন..."
                          className="font-bengali"
                          onKeyPress={(e) => e.key === "Enter" && sendAdminMessage()}
                        />
                        <Button onClick={sendAdminMessage} className="bg-red-600 hover:bg-red-700">
                          <Send className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-bengali">চ্যাট করতে একটি অর্ডার সিলেক্ট করুন</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Monthly Revenue Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bengali font-bold text-gray-900 mb-4">মাসিক আয়</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMonthlyRevenue()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" className="font-bengali text-xs" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [`৳${value.toLocaleString()}`, "আয়"]}
                        labelClassName="font-bengali"
                      />
                      <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Service Distribution */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bengali font-bold text-gray-900 mb-4">সার্ভিস বিতরণ</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getServiceDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getServiceDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Status Overview */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
                <h3 className="font-bengali font-bold text-gray-900 mb-4">অর্ডার সারসংক্ষেপ</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="font-bengali text-sm text-yellow-700">অপেক্ষমান</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
                    <p className="font-bengali text-sm text-blue-700">প্রসেসিং</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                    <p className="font-bengali text-sm text-green-700">সম্পন্ন</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
                    <p className="font-bengali text-sm text-red-700">বাতিল</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bengali">অর্ডার বিবরণ</DialogTitle>
            <DialogDescription className="font-bengali text-sm">
              অর্ডার #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedOrder.created_at).toLocaleString("bn-BD")}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-bengali font-medium">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${selectedOrder.customer_phone}`} className="text-blue-600">
                    {selectedOrder.customer_phone}
                  </a>
                  <a
                    href={`https://wa.me/88${selectedOrder.customer_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-green-600 text-sm underline"
                  >
                    WhatsApp
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span>{paymentLabels[selectedOrder.payment_method] || selectedOrder.payment_method}</span>
                </div>
                {selectedOrder.sender_number && (
                  <div className="text-sm text-gray-600">
                    প্রেরক: {selectedOrder.sender_number}
                  </div>
                )}
                {selectedOrder.transaction_id && (
                  <div className="text-sm font-mono">
                    TrxID: {selectedOrder.transaction_id}
                  </div>
                )}
              </div>

              {/* Progress Slider */}
              <div className="space-y-3">
                <Label className="font-bengali">প্রজেক্ট অগ্রগতি: {orderProgress}%</Label>
                <Slider
                  value={[orderProgress]}
                  onValueChange={(val) => setOrderProgress(val[0])}
                  max={100}
                  step={5}
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
                  <Label className="font-bengali">পেমেন্ট প্রমাণ</Label>
                  <div className="relative mt-2">
                    <img 
                      src={selectedOrder.payment_screenshot_url} 
                      alt="Payment proof" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <a
                      href={selectedOrder.payment_screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {/* Services */}
              <div>
                <Label className="font-bengali">সার্ভিস সমূহ</Label>
                <div className="space-y-2 mt-2">
                  {selectedOrder.services?.map((service, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 flex justify-between">
                      <div>
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                          {service.serviceName}
                        </span>
                        <span className="ml-2 font-bengali">{service.packageName}</span>
                      </div>
                      <span className="font-bold text-red-600">৳{service.price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-bengali font-semibold">মোট</span>
                <span className="text-xl font-bold text-red-600">
                  ৳{Number(selectedOrder.total_price).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-3">
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
                  className="bg-green-600 hover:bg-green-700 font-bengali"
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bengali">
              {editingPortfolio ? "পোর্টফোলিও এডিট করুন" : "নতুন পোর্টফোলিও"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
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
              <div className="mt-1 space-y-2">
                {portfolioForm.image_url && (
                  <img
                    src={portfolioForm.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
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
                    <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2">
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
            </div>

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

      {/* Invoice Modal */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bengali">নতুন ইনভয়েস</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="font-bengali">অর্ডার সিলেক্ট করুন</Label>
              <Select
                value={invoiceForm.order_id}
                onValueChange={(val) => {
                  const order = orders.find(o => o.id === val);
                  setInvoiceForm(prev => ({
                    ...prev,
                    order_id: val,
                    amount: order ? Number(order.total_price) : 0,
                  }));
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="অর্ডার সিলেক্ট করুন" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.customer_name} - ৳{Number(order.total_price).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-bengali">পরিমাণ (৳)</Label>
              <Input
                type="number"
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>

            <Button
              onClick={createInvoice}
              className="w-full bg-red-600 hover:bg-red-700 font-bengali"
            >
              ইনভয়েস তৈরি করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
