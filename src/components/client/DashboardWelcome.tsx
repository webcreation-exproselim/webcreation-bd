import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Calendar } from "lucide-react";

interface DashboardWelcomeProps {
  fullName?: string | null;
  ordersCount: number;
  completedOrders: number;
}

export function DashboardWelcome({ fullName, ordersCount, completedOrders }: DashboardWelcomeProps) {
  const completionRate = ordersCount > 0 ? Math.round((completedOrders / ordersCount) * 100) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-6 md:p-8 text-white mb-6"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm text-white/80 font-bengali">স্বাগতম!</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-bengali mb-2">
              হ্যালো, {fullName || "গ্রাহক"}! 👋
            </h1>
            <p className="text-white/70 text-sm md:text-base font-bengali">
              আপনার ড্যাশবোর্ড থেকে সব কিছু ম্যানেজ করুন
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 md:gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                <span className="text-xs text-white/70 font-bengali">সম্পন্নের হার</span>
              </div>
              <p className="text-2xl font-bold">{completionRate}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-300" />
                <span className="text-xs text-white/70 font-bengali">মোট অর্ডার</span>
              </div>
              <p className="text-2xl font-bold">{ordersCount}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
