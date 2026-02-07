import { motion } from "framer-motion";
import { TrendingUp, PieChart as PieChartIcon, Users, BarChart3, Target, CreditCard, CalendarDays, Activity } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  LineChart, Line, RadialBarChart, RadialBar, Legend,
  ComposedChart,
} from "recharts";

interface Order {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  services: any[];
  payment_method?: string;
}

interface Invoice {
  id: string;
  amount: number;
  paid_amount: number;
  status: string;
  created_at: string;
}

interface AnalyticsChartsProps {
  orders: Order[];
  usersCount: number;
  invoices?: Invoice[];
}

const CHART_COLORS = {
  cyan: "#06b6d4",
  pink: "#ec4899",
  yellow: "#f59e0b",
  green: "#10b981",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  red: "#ef4444",
  orange: "#f97316",
  indigo: "#6366f1",
  teal: "#14b8a6",
};

const lightTooltipStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.97)",
  border: "1px solid rgba(229, 231, 235, 1)",
  borderRadius: 12,
  color: "#1f2937",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
};

export function AnalyticsCharts({ orders, usersCount, invoices = [] }: AnalyticsChartsProps) {
  // 1. Monthly Revenue
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

  // 2. Order Status
  const getOrderStatusData = () => {
    return [
      { name: "অপেক্ষমান", value: orders.filter(o => o.status === "pending").length, color: CHART_COLORS.yellow },
      { name: "প্রসেসিং", value: orders.filter(o => o.status === "processing").length, color: CHART_COLORS.blue },
      { name: "সম্পন্ন", value: orders.filter(o => o.status === "completed").length, color: CHART_COLORS.green },
      { name: "বাতিল", value: orders.filter(o => o.status === "cancelled").length, color: CHART_COLORS.red },
    ].filter(d => d.value > 0);
  };

  // 3. Service Distribution
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

  // 4. Client Growth
  const getClientGrowth = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, i) => ({
      month,
      clients: Math.floor(usersCount * (0.4 + (i * 0.12))),
    }));
  };

  // 5. Daily Orders (last 10 days)
  const getDailyOrders = () => {
    const days: Record<string, { completed: number; pending: number; total: number }> = {};
    const now = new Date();
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      days[key] = { completed: 0, pending: 0, total: 0 };
    }
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const key = `${date.getDate()}/${date.getMonth() + 1}`;
      if (days[key]) {
        days[key].total += 1;
        if (order.status === "completed") days[key].completed += 1;
        else if (order.status === "pending") days[key].pending += 1;
      }
    });
    return Object.entries(days).map(([day, data]) => ({ day, ...data }));
  };

  // 6. Payment Methods
  const getPaymentMethods = () => {
    const methods: Record<string, number> = {};
    orders.forEach(order => {
      const method = (order as any).payment_method || "অন্যান্য";
      const label = method === "bkash" ? "বিকাশ" : method === "nagad" ? "নগদ" : method === "rocket" ? "রকেট" : method === "bank" ? "ব্যাংক" : method;
      methods[label] = (methods[label] || 0) + 1;
    });
    const colors = [CHART_COLORS.pink, CHART_COLORS.cyan, CHART_COLORS.orange, CHART_COLORS.purple, CHART_COLORS.green];
    return Object.entries(methods).map(([name, value], i) => ({
      name, value, color: colors[i % colors.length],
    }));
  };

  // 7. Revenue Target (radial gauge)
  const getRevenueTarget = () => {
    const totalRevenue = orders.filter(o => o.status === "completed").reduce((s, o) => s + Number(o.total_price), 0);
    const target = 100000; // ৳1 lakh target
    const percentage = Math.min(Math.round((totalRevenue / target) * 100), 100);
    return [
      { name: "অর্জিত", value: percentage, fill: CHART_COLORS.blue },
      { name: "বাকি", value: 100 - percentage, fill: "#f3f4f6" },
    ];
  };

  // 8. Invoice Collection Rate
  const getInvoiceData = () => {
    const totalAmount = invoices.reduce((s, i) => s + Number(i.amount), 0);
    const paidAmount = invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
    const unpaid = totalAmount - paidAmount;
    const paidPct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
    const unpaidPct = 100 - paidPct;
    return {
      data: [
        { name: "পরিশোধিত", value: paidPct, fill: CHART_COLORS.green },
        { name: "বাকি", value: unpaidPct, fill: CHART_COLORS.red },
      ],
      total: totalAmount,
      paid: paidAmount,
      unpaid,
    };
  };

  const revenueData = getMonthlyRevenue();
  const statusData = getOrderStatusData();
  const serviceData = getServiceDistribution();
  const clientData = getClientGrowth();
  const dailyData = getDailyOrders();
  const paymentData = getPaymentMethods();
  const revenueTarget = getRevenueTarget();
  const invoiceData = getInvoiceData();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring" as const, stiffness: 200, damping: 25 },
    },
  };

  const completedOrders = orders.filter(o => o.status === "completed").length;
  const totalRevenue = orders.filter(o => o.status === "completed").reduce((s, o) => s + Number(o.total_price), 0);

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 1. Revenue Chart - Full width on lg */}
      <motion.div
        variants={itemVariants}
        className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-gray-900 text-sm">রাজস্ব ওভারভিউ</h3>
            <p className="text-[10px] text-gray-400">মাসিক আয়ের চার্ট</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-lg font-bold text-gray-900">৳{totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-green-500 font-medium">মোট আয়</p>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenueLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,231,235,0.8)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `৳${(v/1000)}k`} />
              <Tooltip contentStyle={lightTooltipStyle} formatter={(value: number) => [`৳${value.toLocaleString()}`, "আয়"]} />
              <Area 
                type="monotone" dataKey="revenue" stroke={CHART_COLORS.blue} strokeWidth={2.5} 
                fillOpacity={1} fill="url(#colorRevenueLight)"
                isAnimationActive={true} animationBegin={200} animationDuration={1500} animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 2. Revenue Target Gauge */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-gray-900 text-sm">রাজস্ব লক্ষ্য</h3>
            <p className="text-[10px] text-gray-400">৳১,০০,০০০ টার্গেট</p>
          </div>
        </div>
        <div className="h-[200px] flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={90} endAngle={-270} data={[revenueTarget[0]]}>
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                isAnimationActive={true}
                animationBegin={400}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-gray-900">{revenueTarget[0].value}%</p>
            <p className="text-xs text-gray-400 font-bengali">অর্জিত</p>
          </div>
        </div>
      </motion.div>

      {/* 3. Order Status Pie */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center">
            <PieChartIcon className="w-4 h-4 text-pink-600" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-gray-900 text-sm">অর্ডার স্ট্যাটাস</h3>
            <p className="text-[10px] text-gray-400">স্ট্যাটাস অনুযায়ী বিভাজন</p>
          </div>
        </div>
        <div className="h-[220px] flex items-center">
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie 
                  data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} 
                  paddingAngle={4} dataKey="value"
                  isAnimationActive={true} animationBegin={400} animationDuration={1200} animationEasing="ease-in-out"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={lightTooltipStyle} formatter={(value: number) => [value, "অর্ডার"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-2.5">
            {statusData.map((item, index) => (
              <motion.div key={index} className="flex items-center gap-2.5"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-500 font-bengali flex-1">{item.name}</span>
                <span className="text-xs font-bold text-gray-900">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 4. Payment Methods Donut */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-cyan-50 rounded-xl flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-cyan-600" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-gray-900 text-sm">পেমেন্ট মেথড</h3>
            <p className="text-[10px] text-gray-400">পেমেন্ট পদ্ধতি বিতরণ</p>
          </div>
        </div>
        <div className="h-[220px] flex items-center">
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie 
                  data={paymentData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} 
                  paddingAngle={3} dataKey="value"
                  isAnimationActive={true} animationBegin={500} animationDuration={1200} animationEasing="ease-in-out"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`pay-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={lightTooltipStyle} formatter={(value: number) => [value, "অর্ডার"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-2.5">
            {paymentData.map((item, index) => (
              <motion.div key={index} className="flex items-center gap-2.5"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-500 font-bengali flex-1">{item.name}</span>
                <span className="text-xs font-bold text-gray-900">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 5. Daily Orders (Stacked Bar) */}
      <motion.div
        variants={itemVariants}
        className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-gray-900 text-sm">দৈনিক অর্ডার</h3>
            <p className="text-[10px] text-gray-400">গত ১০ দিনের অর্ডার ট্রেন্ড</p>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,231,235,0.8)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={lightTooltipStyle} />
              <Bar dataKey="completed" name="সম্পন্ন" fill={CHART_COLORS.green} stackId="a" radius={[0,0,0,0]} barSize={18}
                isAnimationActive={true} animationBegin={600} animationDuration={1200} />
              <Bar dataKey="pending" name="অপেক্ষমান" fill={CHART_COLORS.yellow} stackId="a" radius={[4,4,0,0]} barSize={18}
                isAnimationActive={true} animationBegin={700} animationDuration={1200} />
              <Line type="monotone" dataKey="total" name="মোট" stroke={CHART_COLORS.pink} strokeWidth={2} dot={{ r: 3, fill: CHART_COLORS.pink }}
                isAnimationActive={true} animationBegin={800} animationDuration={1200} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 6. Invoice Collection */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-gray-900 text-sm">ইনভয়েস সংগ্রহ</h3>
            <p className="text-[10px] text-gray-400">পেমেন্ট কালেকশন রেট</p>
          </div>
        </div>
        <div className="h-[200px] flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={invoiceData.data} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                startAngle={90} endAngle={-270}
                paddingAngle={2} dataKey="value"
                isAnimationActive={true} animationBegin={500} animationDuration={1500} animationEasing="ease-in-out"
              >
                {invoiceData.data.map((entry, index) => (
                  <Cell key={`inv-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={lightTooltipStyle} formatter={(value: number) => [`${value}%`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-gray-900">{invoiceData.data[0].value}%</p>
            <p className="text-[10px] text-gray-400 font-bengali">কালেক্টেড</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="text-center p-2 bg-green-50 rounded-xl">
            <p className="text-xs font-bold text-green-600">৳{invoiceData.paid.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 font-bengali">পরিশোধিত</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-xl">
            <p className="text-xs font-bold text-red-500">৳{invoiceData.unpaid.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 font-bengali">বকেয়া</p>
          </div>
        </div>
      </motion.div>

      {/* 7. Service Distribution (Bar) */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-gray-900 text-sm">সার্ভিস বিতরণ</h3>
            <p className="text-[10px] text-gray-400">জনপ্রিয় সার্ভিস সমূহ</p>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,231,235,0.8)" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} width={90} />
              <Tooltip contentStyle={lightTooltipStyle} formatter={(value: number) => [value, "অর্ডার"]} />
              <Bar dataKey="count" fill={CHART_COLORS.purple} radius={[0, 6, 6, 0]} barSize={20}
                isAnimationActive={true} animationBegin={600} animationDuration={1200} animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 8. Client Growth */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-bengali font-bold text-gray-900 text-sm">ক্লায়েন্ট বৃদ্ধি</h3>
            <p className="text-[10px] text-gray-400">মাসিক ক্লায়েন্ট ট্রেন্ড</p>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={clientData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,231,235,0.8)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={lightTooltipStyle} formatter={(value: number) => [value, "ক্লায়েন্ট"]} />
              <Line type="monotone" dataKey="clients" stroke={CHART_COLORS.green} strokeWidth={3} 
                dot={{ fill: CHART_COLORS.green, strokeWidth: 2, r: 4, stroke: "#fff" }} 
                activeDot={{ r: 6, stroke: CHART_COLORS.green, strokeWidth: 2 }}
                isAnimationActive={true} animationBegin={800} animationDuration={1500} animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}
