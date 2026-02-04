import { useMemo } from "react";
import { Shield, CheckCircle, Clock, Ban, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

interface FraudLog {
  id: string;
  status: string;
  created_at: string;
}

interface FraudGuardAnalyticsProps {
  logs: FraudLog[];
  loading?: boolean;
}

const COLORS = {
  allowed: "#10B981",
  blocked_cooldown: "#F59E0B", 
  blocked_blacklist: "#EF4444",
};

export function FraudGuardAnalytics({ logs, loading }: FraudGuardAnalyticsProps) {
  const stats = useMemo(() => {
    const total = logs.length;
    const allowed = logs.filter(l => l.status === "allowed").length;
    const cooldown = logs.filter(l => l.status === "blocked_cooldown").length;
    const blacklist = logs.filter(l => l.status === "blocked_blacklist").length;
    
    return { total, allowed, cooldown, blacklist };
  }, [logs]);

  // Prepare 7-day trend data
  const trendData = useMemo(() => {
    const days: { [key: string]: { allowed: number; blocked: number; date: string } } = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('bn-BD', { weekday: 'short' });
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

  // Pie chart data
  const pieData = useMemo(() => {
    const data = [];
    if (stats.allowed > 0) data.push({ name: "অনুমোদিত", value: stats.allowed, color: COLORS.allowed });
    if (stats.cooldown > 0) data.push({ name: "কুলডাউন", value: stats.cooldown, color: COLORS.blocked_cooldown });
    if (stats.blacklist > 0) data.push({ name: "ব্ল্যাকলিস্ট", value: stats.blacklist, color: COLORS.blocked_blacklist });
    return data;
  }, [stats]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl h-24" />
          ))}
        </div>
        <div className="bg-gray-100 rounded-xl h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bengali">মোট চেক</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bengali">অনুমোদিত</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.allowed.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bengali">কুলডাউন</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.cooldown.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bengali">ব্ল্যাকলিস্ট</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.blacklist.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Area Chart - Weekly Trend */}
        <Card className="bg-white border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 font-bengali text-base md:text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              সাপ্তাহিক ট্রেন্ড
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorAllowedLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBlockedLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} />
                  <YAxis stroke="#9CA3AF" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="allowed" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorAllowedLight)" 
                    name="অনুমোদিত"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="blocked" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorBlockedLight)" 
                    name="ব্লকড"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Block Reasons */}
        <Card className="bg-white border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 font-bengali text-base md:text-lg">
              ব্লক কারণ বিতরণ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 md:h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend 
                      formatter={(value) => <span className="text-gray-600 text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-bengali">
                  কোনো ডাটা নেই
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
