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
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-700 p-6 md:p-8 text-white mb-6 shadow-2xl shadow-blue-500/20"
    >
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"
        />
        <motion.div
          animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-300/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl"
        />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-2"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </motion.div>
              <span className="text-sm text-white/80 font-bengali">স্বাগতম!</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-bold font-bengali mb-2"
            >
              হ্যালো, {fullName || "গ্রাহক"}! 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 text-sm md:text-base font-bengali"
            >
              আপনার ড্যাশবোর্ড থেকে সব কিছু ম্যানেজ করুন
            </motion.p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                <span className="text-xs text-white/70 font-bengali">সম্পন্নের হার</span>
              </div>
              <p className="text-2xl font-bold">{completionRate}%</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-300" />
                <span className="text-xs text-white/70 font-bengali">মোট অর্ডার</span>
              </div>
              <p className="text-2xl font-bold">{ordersCount}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
