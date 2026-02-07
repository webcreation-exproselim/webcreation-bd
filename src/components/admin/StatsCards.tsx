import { Package, Clock, CheckCircle, TrendingUp, Users, FileText } from "lucide-react";
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
      gradient: "from-red-500 to-orange-500",
      shadowColor: "shadow-red-500/25",
      iconBg: "bg-red-400/20",
    },
    {
      icon: Clock,
      label: "অপেক্ষমান",
      value: stats.pending,
      gradient: "from-cyan-500 to-blue-500",
      shadowColor: "shadow-cyan-500/25",
      iconBg: "bg-cyan-400/20",
    },
    {
      icon: CheckCircle,
      label: "সম্পন্ন",
      value: stats.completed,
      gradient: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/25",
      iconBg: "bg-emerald-400/20",
    },
    {
      icon: TrendingUp,
      label: "মোট আয়",
      value: `৳${stats.revenue.toLocaleString()}`,
      gradient: "from-violet-500 to-purple-500",
      shadowColor: "shadow-violet-500/25",
      iconBg: "bg-violet-400/20",
    },
    {
      icon: Users,
      label: "মোট ক্লায়েন্ট",
      value: usersCount,
      gradient: "from-pink-500 to-rose-500",
      shadowColor: "shadow-pink-500/25",
      iconBg: "bg-pink-400/20",
    },
    {
      icon: FileText,
      label: "বাকি পেমেন্ট",
      value: `৳${stats.unpaidInvoices.toLocaleString()}`,
      gradient: "from-amber-500 to-yellow-500",
      shadowColor: "shadow-amber-500/25",
      iconBg: "bg-amber-400/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 20 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${card.gradient} ${card.shadowColor} shadow-lg cursor-default`}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -mr-6 -mt-6" />
          <div className="absolute bottom-0 left-0 w-14 h-14 rounded-full bg-white/5 -ml-4 -mb-4" />
          <div className="absolute top-1/2 right-2 w-8 h-8 rounded-full bg-white/5" />
          
          <div className={`w-9 h-9 ${card.iconBg} rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm`}>
            <card.icon className="w-4 h-4 text-white" />
          </div>
          <p className="text-xl font-bold text-white mb-0.5">{card.value}</p>
          <p className="text-[11px] text-white/70 font-bengali">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
