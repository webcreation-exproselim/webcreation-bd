import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { Shield, Users, Activity, TrendingUp, Loader2, DollarSign, Zap, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface Merchant {
  id: string;
  is_active: boolean;
  current_plan: string | null;
  requests_used: number;
}

interface FraudLog {
  status: string;
  created_at: string;
}

interface SubscriptionOrder {
  status: string;
  amount: number;
  plan_type: string;
  created_at: string;
}

const CHART_COLORS = {
  cyan: "#06B6D4",
  pink: "#EC4899",
  green: "#10B981",
  red: "#EF4444",
  purple: "#A855F7",
  amber: "#F59E0B",
  blue: "#3B82F6",
};

export function FraudGuardCharts() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [logs, setLogs] = useState<FraudLog[]>([]);
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [merchantsRes, logsRes, ordersRes] = await Promise.all([
          supabase.from('merchants').select('id, is_active, current_plan, requests_used'),
          supabase.from('fraud_logs').select('status, created_at').order('created_at', { ascending: false }).limit(1000),
          supabase.from('subscription_orders').select('status, amount, plan_type, created_at').eq('status', 'approved'),
        ]);

        setMerchants(merchantsRes.data || []);
        setLogs(logsRes.data || []);
        setOrders(ordersRes.data || []);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Stats
  const stats = useMemo(() => {
    const totalMerchants = merchants.length;
    const activeMerchants = merchants.filter(m => m.is_active).length;
    const totalApiRequests = merchants.reduce((sum, m) => sum + m.requests_used, 0);
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount), 0);
    const monthlyRevenue = orders
      .filter(o => {
        const d = new Date(o.created_at);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, o) => sum + Number(o.amount), 0);
    const blockedRequests = logs.filter(l => l.status === 'blocked').length;
    const allowedRequests = logs.filter(l => l.status === 'allowed').length;
    const blockRate = logs.length > 0 ? ((blockedRequests / logs.length) * 100).toFixed(1) : '0';

    return { totalMerchants, activeMerchants, totalApiRequests, totalRevenue, monthlyRevenue, blockedRequests, allowedRequests, blockRate };
  }, [merchants, orders, logs]);

  // Subscriber Distribution
  const subscriberData = useMemo(() => {
    const monthly = merchants.filter(m => m.is_active && m.current_plan === 'monthly').length;
    const yearly = merchants.filter(m => m.is_active && m.current_plan === 'yearly').length;
    const inactive = merchants.filter(m => !m.is_active).length;
    return [
      { name: 'Monthly', value: monthly, color: CHART_COLORS.cyan },
      { name: 'Yearly', value: yearly, color: CHART_COLORS.purple },
      { name: 'Inactive', value: inactive, color: '#475569' },
    ].filter(d => d.value > 0);
  }, [merchants]);

  // Daily API Requests Trend
  const dailyTrend = useMemo(() => {
    const days: { [key: string]: { allowed: number; blocked: number; date: string } } = {};
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[key] = { allowed: 0, blocked: 0, date: dayName };
    }
    
    logs.forEach(log => {
      const key = new Date(log.created_at).toISOString().split('T')[0];
      if (days[key]) {
        if (log.status === "allowed") days[key].allowed++;
        else days[key].blocked++;
      }
    });
    
    return Object.values(days);
  }, [logs]);

  // Revenue by Month
  const revenueData = useMemo(() => {
    const months: { [key: string]: { monthly: number; yearly: number } } = {};
    
    orders.forEach(order => {
      const month = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!months[month]) months[month] = { monthly: 0, yearly: 0 };
      if (order.plan_type === 'yearly') {
        months[month].yearly += Number(order.amount);
      } else {
        months[month].monthly += Number(order.amount);
      }
    });

    return Object.entries(months).map(([month, data]) => ({ month, ...data, total: data.monthly + data.yearly }));
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "মোট Merchants", value: stats.totalMerchants, sub: `${stats.activeMerchants} Active`, gradient: "from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/25" },
    { icon: DollarSign, label: "মোট আয়", value: `৳${stats.totalRevenue.toLocaleString()}`, sub: `এই মাসে ৳${stats.monthlyRevenue.toLocaleString()}`, gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/25" },
    { icon: Activity, label: "মোট API Calls", value: stats.totalApiRequests.toLocaleString(), sub: `${stats.blockRate}% ব্লক হয়েছে`, gradient: "from-purple-500 to-violet-600", shadow: "shadow-purple-500/25" },
    { icon: Shield, label: "ব্লক করা হয়েছে", value: stats.blockedRequests.toLocaleString(), sub: `${stats.allowedRequests.toLocaleString()} অনুমোদিত`, gradient: "from-red-500 to-pink-600", shadow: "shadow-red-500/25" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.name?.includes('Revenue') ? `৳${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className={`relative overflow-hidden border-0 bg-gradient-to-br ${card.gradient} ${card.shadow} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-4 -mb-4" />
              <CardContent className="p-5 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/70 text-xs font-bengali mb-1">{card.label}</p>
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                    <p className="text-white/60 text-[11px] mt-1 font-bengali">{card.sub}</p>
                  </div>
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Income Summary Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="border-slate-700/50 bg-slate-800/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold font-bengali">আয়ের সারাংশ</h3>
                <p className="text-slate-500 text-xs">Fraud Guard থেকে মোট উপার্জন</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-500 text-xs font-bengali mb-1">সর্বমোট আয়</p>
                <p className="text-xl font-bold text-emerald-400">৳{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-500 text-xs font-bengali mb-1">এই মাসের আয়</p>
                <p className="text-xl font-bold text-cyan-400">৳{stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-500 text-xs font-bengali mb-1">Monthly Plan</p>
                <p className="text-xl font-bold text-blue-400">
                  ৳{orders.filter(o => o.plan_type === 'monthly').reduce((s, o) => s + Number(o.amount), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-500 text-xs font-bengali mb-1">Yearly Plan</p>
                <p className="text-xl font-bold text-purple-400">
                  ৳{orders.filter(o => o.plan_type === 'yearly').reduce((s, o) => s + Number(o.amount), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily API Requests */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-slate-700/50 bg-slate-800/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white font-bengali text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                দৈনিক API Requests (14 দিন)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrend}>
                    <defs>
                      <linearGradient id="colorAllowedFG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.cyan} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBlockedFG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.pink} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={CHART_COLORS.pink} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="allowed" stroke={CHART_COLORS.cyan} fillOpacity={1} fill="url(#colorAllowedFG)" name="Allowed" strokeWidth={2} />
                    <Area type="monotone" dataKey="blocked" stroke={CHART_COLORS.pink} fillOpacity={1} fill="url(#colorBlockedFG)" name="Blocked" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subscriber Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="border-slate-700/50 bg-slate-800/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white font-bengali text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                সাবস্ক্রাইবার বিতরণ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {subscriberData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriberData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {subscriberData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                      <p className="text-slate-500 font-bengali text-sm">কোনো Active Subscriber নেই</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
          <Card className="border-slate-700/50 bg-slate-800/60 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white font-bengali text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                মাসিক Subscription আয় (Monthly vs Yearly)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `৳${v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '12px' }} />
                      <Bar dataKey="monthly" fill={CHART_COLORS.cyan} radius={[4, 4, 0, 0]} name="Monthly Revenue" />
                      <Bar dataKey="yearly" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} name="Yearly Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                      <p className="text-slate-500 font-bengali text-sm">কোনো Revenue Data নেই</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
