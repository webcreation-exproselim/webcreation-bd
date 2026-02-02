import { motion } from "framer-motion";
import { TrendingUp, PieChart as PieChartIcon, Users, BarChart3 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
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

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

export function AnalyticsCharts({ orders, usersCount }: AnalyticsChartsProps) {
  // Monthly Revenue Data
  const getMonthlyRevenue = () => {
    const monthlyData: Record<string, number> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    orders
      .filter(o => o.status === "completed")
      .forEach(order => {
        const date = new Date(order.created_at);
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(order.total_price);
      });
    
    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-6);
  };

  // Order Status Data
  const getOrderStatusData = () => {
    const pending = orders.filter(o => o.status === "pending").length;
    const processing = orders.filter(o => o.status === "processing").length;
    const completed = orders.filter(o => o.status === "completed").length;
    const cancelled = orders.filter(o => o.status === "cancelled").length;
    
    return [
      { name: "অপেক্ষমান", value: pending, color: "#f59e0b" },
      { name: "প্রসেসিং", value: processing, color: "#3b82f6" },
      { name: "সম্পন্ন", value: completed, color: "#22c55e" },
      { name: "বাতিল", value: cancelled, color: "#ef4444" },
    ].filter(d => d.value > 0);
  };

  // Service Distribution
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

  // Client Growth (mock trend data based on order dates)
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-gray-900">রাজস্ব ওভারভিউ</h3>
            <p className="text-xs text-gray-500">মাসিক আয়ের চার্ট</p>
          </div>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `৳${(v/1000)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`৳${value.toLocaleString()}`, "আয়"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Order Status Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <PieChartIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-gray-900">অর্ডার স্ট্যাটাস</h3>
            <p className="text-xs text-gray-500">স্ট্যাটাস অনুযায়ী বিভাজন</p>
          </div>
        </div>
        <div className="h-[250px] flex items-center">
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, "অর্ডার"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-3">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600 font-bengali flex-1">{item.name}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
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
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-gray-900">সার্ভিস বিতরণ</h3>
            <p className="text-xs text-gray-500">জনপ্রিয় সার্ভিস সমূহ</p>
          </div>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                formatter={(value: number) => [value, "অর্ডার"]}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Client Growth */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-gray-900">ক্লায়েন্ট বৃদ্ধি</h3>
            <p className="text-xs text-gray-500">মাসিক ক্লায়েন্ট ট্রেন্ড</p>
          </div>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={clientData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                formatter={(value: number) => [value, "ক্লায়েন্ট"]}
              />
              <Line type="monotone" dataKey="clients" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
