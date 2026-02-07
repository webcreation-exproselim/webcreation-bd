import { motion } from "framer-motion";
import { Package, FileText, CheckCircle, Shield, ArrowUpRight } from "lucide-react";

interface Order {
  id: string;
  status: string;
}

interface Merchant {
  is_active: boolean;
}

interface DashboardStatsCardsProps {
  orders: Order[];
  invoicesCount: number;
  merchant: Merchant | null;
  hasPendingOrder: boolean;
  onFraudGuardClick: () => void;
}

export function DashboardStatsCards({
  orders,
  invoicesCount,
  merchant,
  hasPendingOrder,
  onFraudGuardClick,
}: DashboardStatsCardsProps) {
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  const statCards = [
    {
      key: "total",
      label: "মোট অর্ডার",
      value: orders.length,
      icon: Package,
      gradient: "from-cyan-500 to-blue-500",
      shadowColor: "shadow-cyan-500/25",
      iconBg: "bg-cyan-400/20",
    },
    {
      key: "completed",
      label: "সম্পন্ন",
      value: completedOrders,
      icon: CheckCircle,
      gradient: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/25",
      iconBg: "bg-emerald-400/20",
    },
    {
      key: "invoices",
      label: "ইনভয়েস",
      value: invoicesCount,
      icon: FileText,
      gradient: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/25",
      iconBg: "bg-amber-400/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: idx * 0.06, type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${stat.gradient} ${stat.shadowColor} shadow-lg cursor-default`}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -mr-6 -mt-6" />
            <div className="absolute bottom-0 left-0 w-14 h-14 rounded-full bg-white/5 -ml-4 -mb-4" />
            
            <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-0.5">{stat.value}</p>
            <p className="text-xs text-white/70 font-bengali">{stat.label}</p>
          </motion.div>
        );
      })}

      {/* Fraud Guard Special Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.18, type: "spring", stiffness: 200, damping: 20 }}
        whileHover={{ y: -4, scale: 1.02 }}
        onClick={onFraudGuardClick}
        className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 overflow-hidden shadow-lg ${
          merchant?.is_active
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25"
            : hasPendingOrder
            ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25"
            : "bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/25"
        }`}
      >
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-5 -mb-5" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <motion.div
              whileHover={{ rotate: 45 }}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
            >
              <ArrowUpRight className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          <p className="text-xl font-bold text-white mb-0.5">Fraud Guard</p>
          <p className="text-xs text-white/80 font-bengali">
            {merchant?.is_active
              ? "সক্রিয় ✓"
              : hasPendingOrder
              ? "অপেক্ষমাণ"
              : "সেটআপ করুন →"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
