import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, CheckCircle, XCircle, Clock, AlertCircle, ArrowRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderService {
  id: string;
  serviceName: string;
  packageName: string;
  price: number;
  originalPrice: number;
  features: string[];
}

interface Order {
  id: string;
  services: OrderService[];
  status: string;
  progress: number;
  total_price: number;
  created_at: string;
  customer_name: string;
}

interface OrdersTabProps {
  orders: Order[];
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return {
        icon: CheckCircle,
        text: "সম্পন্ন",
        gradient: "from-emerald-500 to-teal-500",
        bgColor: "bg-emerald-500/10",
        textColor: "text-emerald-400",
        borderColor: "border-emerald-500/30",
        barColor: "bg-emerald-500",
      };
    case "cancelled":
      return {
        icon: XCircle,
        text: "বাতিল",
        gradient: "from-red-500 to-rose-500",
        bgColor: "bg-red-500/10",
        textColor: "text-red-400",
        borderColor: "border-red-500/30",
        barColor: "bg-red-500",
      };
    case "processing":
      return {
        icon: Clock,
        text: "প্রসেসিং",
        gradient: "from-amber-500 to-orange-500",
        bgColor: "bg-amber-500/10",
        textColor: "text-amber-400",
        borderColor: "border-amber-500/30",
        barColor: "bg-amber-500",
      };
    default:
      return {
        icon: AlertCircle,
        text: "পেন্ডিং",
        gradient: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-500/10",
        textColor: "text-blue-400",
        borderColor: "border-blue-500/30",
        barColor: "bg-blue-500",
      };
  }
};

export function OrdersTab({ orders }: OrdersTabProps) {
  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 md:p-12 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white font-bengali mb-2">কোন অর্ডার নেই</h3>
        <p className="text-slate-400 font-bengali mb-4 text-sm">আপনার প্রথম অর্ডার করুন এবং আমাদের সার্ভিস উপভোগ করুন</p>
        <Link to="/#services">
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 font-bengali gap-2 shadow-lg shadow-cyan-500/25">
            সার্ভিস দেখুন
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {orders.map((order, idx) => {
        const statusConfig = getStatusConfig(order.status);
        const StatusIcon = statusConfig.icon;

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: idx * 0.05, type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300 group shadow-lg hover:shadow-xl"
          >
            {/* Status Bar */}
            <div className={`h-1 ${statusConfig.barColor}`} />

            <div className="p-4 md:p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${statusConfig.bgColor} flex items-center justify-center border ${statusConfig.borderColor}`}>
                    <StatusIcon className={`w-5 h-5 ${statusConfig.textColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white font-mono">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                  {statusConfig.text}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-bengali">অগ্রগতি</span>
                  <span className="text-white font-semibold">{order.progress || 0}%</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${order.progress || 0}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.05, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${statusConfig.gradient} rounded-full`}
                  />
                </div>
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {Array.isArray(order.services) &&
                  order.services.slice(0, 2).map((service, serviceIdx) => (
                    <span
                      key={serviceIdx}
                      className="px-2.5 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-300 font-bengali border border-slate-600/30"
                    >
                      {service.serviceName}
                    </span>
                  ))}
                {Array.isArray(order.services) && order.services.length > 2 && (
                  <span className="px-2.5 py-1 bg-cyan-500/10 rounded-lg text-xs text-cyan-400 font-bengali border border-cyan-500/20">
                    +{order.services.length - 2}
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                <div>
                  <p className="text-xs text-slate-500 font-bengali">মোট মূল্য</p>
                  <p className="text-lg font-bold text-white">
                    ৳{Number(order.total_price).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-white hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
