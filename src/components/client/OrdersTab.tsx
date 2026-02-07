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
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-600",
        borderColor: "border-emerald-200",
        iconColor: "text-emerald-500",
      };
    case "cancelled":
      return {
        icon: XCircle,
        text: "বাতিল",
        bgColor: "bg-red-50",
        textColor: "text-red-600",
        borderColor: "border-red-200",
        iconColor: "text-red-500",
      };
    case "processing":
      return {
        icon: Clock,
        text: "প্রসেসিং",
        bgColor: "bg-amber-50",
        textColor: "text-amber-600",
        borderColor: "border-amber-200",
        iconColor: "text-amber-500",
      };
    default:
      return {
        icon: AlertCircle,
        text: "পেন্ডিং",
        bgColor: "bg-blue-50",
        textColor: "text-blue-600",
        borderColor: "border-blue-200",
        iconColor: "text-blue-500",
      };
  }
};

export function OrdersTab({ orders }: OrdersTabProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 font-bengali mb-2">কোন অর্ডার নেই</h3>
        <p className="text-gray-500 font-bengali mb-4 text-sm">আপনার প্রথম অর্ডার করুন এবং আমাদের সার্ভিস উপভোগ করুন</p>
        <Link to="/#services">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 font-bengali gap-2">
            সার্ভিস দেখুন
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
          >
            {/* Status Bar */}
            <div className={`h-1 ${
              order.status === "completed" ? "bg-emerald-500" :
              order.status === "cancelled" ? "bg-red-500" :
              order.status === "processing" ? "bg-amber-500" :
              "bg-blue-500"
            }`} />

            <div className="p-4 md:p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${statusConfig.bgColor} flex items-center justify-center`}>
                    <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
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
                  <span className="text-gray-500 font-bengali">অগ্রগতি</span>
                  <span className="text-gray-700 font-semibold">{order.progress || 0}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${order.progress || 0}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {Array.isArray(order.services) &&
                  order.services.slice(0, 2).map((service, serviceIdx) => (
                    <span
                      key={serviceIdx}
                      className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 font-bengali"
                    >
                      {service.serviceName}
                    </span>
                  ))}
                {Array.isArray(order.services) && order.services.length > 2 && (
                  <span className="px-2.5 py-1 bg-blue-100 rounded-lg text-xs text-blue-600 font-bengali">
                    +{order.services.length - 2}
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-bengali">মোট মূল্য</p>
                  <p className="text-lg font-bold text-gray-900">
                    ৳{Number(order.total_price).toLocaleString()}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
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
