import { motion } from "framer-motion";
import { Package, FileText, CheckCircle, Shield } from "lucide-react";

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

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
      {/* Total Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-3.5 md:p-5 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 md:w-5.5 md:h-5.5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[11px] md:text-xs font-bengali truncate">মোট অর্ডার</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Completed Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-gray-100 p-3.5 md:p-5 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 md:w-5.5 md:h-5.5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[11px] md:text-xs font-bengali truncate">সম্পন্ন</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{completedOrders}</p>
          </div>
        </div>
      </motion.div>

      {/* Total Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 p-3.5 md:p-5 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 md:w-5.5 md:h-5.5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-gray-500 text-[11px] md:text-xs font-bengali truncate">ইনভয়েস</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{invoicesCount}</p>
          </div>
        </div>
      </motion.div>

      {/* Fraud Guard Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={onFraudGuardClick}
        className={`rounded-2xl border p-3.5 md:p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer group active:scale-[0.98] ${
          merchant?.is_active 
            ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200" 
            : hasPendingOrder 
              ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
              : "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0 ${
            merchant?.is_active 
              ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/25" 
              : hasPendingOrder 
                ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25"
                : "bg-gradient-to-br from-purple-600 to-blue-600 shadow-purple-500/25"
          }`}>
            <Shield className="w-5 h-5 md:w-5.5 md:h-5.5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] md:text-xs font-bengali font-medium truncate ${
              merchant?.is_active ? "text-emerald-600" : hasPendingOrder ? "text-amber-600" : "text-purple-600"
            }`}>
              Fraud Guard
            </p>
            <p className="text-sm md:text-base font-semibold text-gray-900 font-bengali truncate">
              {merchant?.is_active ? "সক্রিয় ✓" : hasPendingOrder ? "Pending" : "Setup →"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
