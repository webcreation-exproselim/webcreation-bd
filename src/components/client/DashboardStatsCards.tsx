import { motion } from "framer-motion";
import { Package, FileText, CheckCircle, Shield, TrendingUp, ArrowUpRight } from "lucide-react";

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

const statCards = [
  {
    key: "total",
    label: "মোট অর্ডার",
    icon: Package,
    gradient: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    key: "completed",
    label: "সম্পন্ন",
    icon: CheckCircle,
    gradient: "from-emerald-500 to-emerald-600",
    lightBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    key: "invoices",
    label: "ইনভয়েস",
    icon: FileText,
    gradient: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

export function DashboardStatsCards({
  orders,
  invoicesCount,
  merchant,
  hasPendingOrder,
  onFraudGuardClick,
}: DashboardStatsCardsProps) {
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing").length;

  const getStatValue = (key: string) => {
    switch (key) {
      case "total":
        return orders.length;
      case "completed":
        return completedOrders;
      case "invoices":
        return invoicesCount;
      default:
        return 0;
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon;
        const value = getStatValue(stat.key);

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden"
          >
            {/* Gradient accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.lightBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
              <p className="text-sm text-gray-500 font-bengali">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}

      {/* Fraud Guard Special Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={onFraudGuardClick}
        className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 overflow-hidden ${
          merchant?.is_active
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30"
            : hasPendingOrder
            ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30"
            : "bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30"
        }`}
      >
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="text-white">
            <p className="text-2xl font-bold mb-1">Fraud Guard</p>
            <p className="text-sm text-white/80 font-bengali">
              {merchant?.is_active
                ? "সক্রিয় ✓"
                : hasPendingOrder
                ? "অপেক্ষমাণ"
                : "সেটআপ করুন →"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
