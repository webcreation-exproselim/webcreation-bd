import { Package, Clock, CheckCircle, TrendingUp, Users, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardsProps {
  stats: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    revenue: number;
    unpaidInvoices: number;
  };
  usersCount: number;
}

export function StatsCards({ stats, usersCount }: StatsCardsProps) {
  const cards = [
    {
      icon: Package,
      label: "মোট অর্ডার",
      value: stats.total,
      color: "blue",
      trend: "+12%",
      trendUp: true,
    },
    {
      icon: Clock,
      label: "অপেক্ষমান",
      value: stats.pending,
      color: "amber",
      trend: stats.pending > 0 ? "Active" : "—",
      trendUp: false,
    },
    {
      icon: CheckCircle,
      label: "সম্পন্ন",
      value: stats.completed,
      color: "emerald",
      trend: "+8%",
      trendUp: true,
    },
    {
      icon: TrendingUp,
      label: "মোট আয়",
      value: `৳${stats.revenue.toLocaleString()}`,
      color: "red",
      trend: "+15%",
      trendUp: true,
    },
    {
      icon: Users,
      label: "মোট ক্লায়েন্ট",
      value: usersCount,
      color: "violet",
      trend: "+5%",
      trendUp: true,
    },
    {
      icon: FileText,
      label: "বাকি আছে",
      value: `৳${stats.unpaidInvoices.toLocaleString()}`,
      color: "orange",
      trend: stats.unpaidInvoices > 0 ? "Pending" : "Clear",
      trendUp: false,
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
    red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100" },
    violet: { bg: "bg-violet-50", icon: "text-violet-600", border: "border-violet-100" },
    orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-100" },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const colors = colorClasses[card.color];
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-2xl p-5 border ${colors.border} hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300`}
          >
            <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${colors.icon}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 font-bengali">{card.label}</p>
              <span className={`text-xs flex items-center gap-0.5 ${card.trendUp ? 'text-emerald-600' : 'text-gray-400'}`}>
                {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : null}
                {card.trend}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
