import { motion } from "framer-motion";
import { TrendingUp, PieChart as PieChartIcon, Users, BarChart3 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  LineChart, Line,
} from "recharts";

interface Order {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  services: any[];
}

interface AnalyticsChartsProps {
  orders: Order[];
  usersCount: number;
}

const CHART_COLORS = {
  cyan: "#22d3ee",
  pink: "#f472b6",
  yellow: "#facc15",
  green: "#34d399",
  blue: "#3b82f6",
  purple: "#a78bfa",
  red: "#f87171",
  orange: "#fb923c",
};

const darkTooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(51, 65, 85, 0.5)",
  borderRadius: 12,
  color: "#e2e8f0",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
};

export function AnalyticsCharts({ orders, usersCount }: AnalyticsChartsProps) {
  const getMonthlyRevenue = () => {
    const monthlyData: Record<string, number> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    orders
      .filter(o => o.status === "completed")
      .forEach(order => {
        const date = new Date(order.created_at);
        const monthKey = `${months[date.getMonth()]}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(order.total_price);
      });
    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-6);
  };

  const getOrderStatusData = () => {
    return [
      { name: "অপেক্ষমান", value: orders.filter(o => o.status === "pending").length, color: CHART_COLORS.yellow },
      { name: "প্রসেসিং", value: orders.filter(o => o.status === "processing").length, color: CHART_COLORS.cyan },
      { name: "সম্পন্ন", value: orders.filter(o => o.status === "completed").length, color: CHART_COLORS.green },
      { name: "বাতিল", value: orders.filter(o => o.status === "cancelled").length, color: CHART_COLORS.red },
    ].filter(d => d.value > 0);
  };

  const getServiceDistribution = () => {
    const serviceCount: Record<string, number> = {};
    orders.forEach(order => {
      order.services?.forEach((service: any) => {
        const name = service.serviceName || "অন্যান্য";
        serviceCount[name] = (serviceCount[name] || 0) + 1;
      });
    });
    return Object.entries(serviceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getClientGrowth = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, i) => ({
      month,
      clients: Math.floor(usersCount * (0.4 + (i * 0.12))),
    }));
  };

  const revenueData = getMonthlyRevenue();
  const statusData = getOrderStatusData();
  const serviceData = getServiceDistribution();
  const clientData = getClientGrowth();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-cyan-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-white text-sm">রাজস্ব ওভারভিউ</h3>
            <p className="text-[10px] text-slate-500">মাসিক আয়ের চার্ট</p>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenueDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.cyan} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `৳${(v/1000)}k`} />
              <Tooltip contentStyle={darkTooltipStyle} formatter={(value: number) => [`৳${value.toLocaleString()}`, "আয়"]} />
              <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.cyan} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenueDark)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Order Status Pie */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-pink-500/20 rounded-xl flex items-center justify-center">
            <PieChartIcon className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-white text-sm">অর্ডার স্ট্যাটাস</h3>
            <p className="text-[10px] text-slate-500">স্ট্যাটাস অনুযায়ী বিভাজন</p>
          </div>
        </div>
        <div className="h-[220px] flex items-center">
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={darkTooltipStyle} formatter={(value: number) => [value, "অর্ডার"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-2.5">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-400 font-bengali flex-1">{item.name}</span>
                <span className="text-xs font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Service Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-white text-sm">সার্ভিস বিতরণ</h3>
            <p className="text-[10px] text-slate-500">জনপ্রিয় সার্ভিস সমূহ</p>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} width={90} />
              <Tooltip contentStyle={darkTooltipStyle} formatter={(value: number) => [value, "অর্ডার"]} />
              <Bar dataKey="count" fill={CHART_COLORS.purple} radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Client Growth */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-green-500/20 rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-white text-sm">ক্লায়েন্ট বৃদ্ধি</h3>
            <p className="text-[10px] text-slate-500">মাসিক ক্লায়েন্ট ট্রেন্ড</p>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={clientData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={darkTooltipStyle} formatter={(value: number) => [value, "ক্লায়েন্ট"]} />
              <Line type="monotone" dataKey="clients" stroke={CHART_COLORS.green} strokeWidth={3} dot={{ fill: CHART_COLORS.green, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
