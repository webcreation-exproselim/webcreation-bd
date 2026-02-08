import { motion } from "framer-motion";
import { Package, FileText, CheckCircle, Shield, Search, ArrowUpRight } from "lucide-react";

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
  onCourierCheckClick?: () => void;
  courierCheckActive?: boolean;
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
  onCourierCheckClick,
  courierCheckActive,
}: DashboardStatsCardsProps) {
  const completedOrders = orders.filter((o) => o.status === "completed").length;

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
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>

      {/* Products Banner Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fraud Guard Card */}
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
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1 text-white">
              <p className="text-xl font-bold mb-0.5">🛡️ Fraud Guard</p>
              <p className="text-sm text-white/80 font-bengali">
                {merchant?.is_active
                  ? "সক্রিয় ✓ — ফেক অর্ডার থেকে সুরক্ষিত"
                  : hasPendingOrder
                  ? "অপেক্ষমাণ — Admin approval চলছে"
                  : "ফেক অর্ডার ব্লক করুন — ৳১০০/মাস"}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors flex-shrink-0">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Courier Check Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onCourierCheckClick}
          className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 overflow-hidden ${
            courierCheckActive
              ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30"
              : "bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30"
          }`}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <Search className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1 text-white">
              <p className="text-xl font-bold mb-0.5">📊 Courier Check</p>
              <p className="text-sm text-white/80 font-bengali">
                {courierCheckActive
                  ? "সক্রিয় ✓ — Pathao, Steadfast, CarryBee, RedX হিস্ট্রি চেক"
                  : "Pathao, Steadfast, CarryBee, RedX ডেলিভারি চেক — ৳২৪৯/মাস"}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Pathao</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Steadfast</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">CarryBee</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">RedX</span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors flex-shrink-0">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
