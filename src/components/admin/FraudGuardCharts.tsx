import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { Shield, Users, Activity, TrendingUp, Loader2 } from "lucide-react";

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

const COLORS = {
  monthly: "#3B82F6",
  yearly: "#8B5CF6",
  allowed: "#10B981",
  blocked: "#EF4444",
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

    return { totalMerchants, activeMerchants, totalApiRequests, totalRevenue };
  }, [merchants, orders]);

  // Subscriber Distribution
  const subscriberData = useMemo(() => {
    const monthly = merchants.filter(m => m.is_active && m.current_plan === 'monthly').length;
    const yearly = merchants.filter(m => m.is_active && m.current_plan === 'yearly').length;
    return [
      { name: 'Monthly', value: monthly, color: COLORS.monthly },
      { name: 'Yearly', value: yearly, color: COLORS.yearly },
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
        if (log.status === "allowed") {
          days[key].allowed++;
        } else {
          days[key].blocked++;
        }
      }
    });
    
    return Object.values(days);
  }, [logs]);

  // Revenue by Month
  const revenueData = useMemo(() => {
    const months: { [key: string]: number } = {};
    
    orders.forEach(order => {
      const month = new Date(order.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      });
      months[month] = (months[month] || 0) + Number(order.amount);
    });

    return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bengali">মোট Merchants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMerchants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bengali">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeMerchants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bengali">API Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApiRequests.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bengali">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">৳{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily API Requests */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-bengali text-lg">দৈনিক API Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend}>
                  <defs>
                    <linearGradient id="colorAllowedAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBlockedAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="allowed" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#colorAllowedAdmin)" 
                    name="Allowed"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="blocked" 
                    stroke="#EF4444" 
                    fillOpacity={1} 
                    fill="url(#colorBlockedAdmin)" 
                    name="Blocked"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscriber Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-bengali text-lg">Subscriber Distribution</CardTitle>
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
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {subscriberData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-bengali">
                  কোনো Active Subscriber নেই
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-bengali text-lg">Subscription Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#8B5CF6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-bengali">
                  কোনো Revenue Data নেই
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
