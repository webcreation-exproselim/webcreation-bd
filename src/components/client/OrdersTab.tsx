import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />;
    case "cancelled":
      return <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />;
    case "processing":
      return <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />;
    default:
      return <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed": return "সম্পন্ন";
    case "cancelled": return "বাতিল";
    case "processing": return "প্রসেসিং";
    default: return "পেন্ডিং";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "cancelled": return "bg-red-100 text-red-700 border-red-200";
    case "processing": return "bg-amber-100 text-amber-700 border-amber-200";
    default: return "bg-blue-100 text-blue-700 border-blue-200";
  }
};

export function OrdersTab({ orders }: OrdersTabProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-12 text-center shadow-sm">
        <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-200 mx-auto mb-3 md:mb-4" />
        <p className="text-gray-500 font-bengali mb-3 md:mb-4 text-sm md:text-base">আপনার কোন অর্ডার নেই</p>
        <Link to="/#services">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 font-bengali text-sm">
            সার্ভিস দেখুন
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {orders.map((order, idx) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-white rounded-2xl border border-gray-100 p-3.5 md:p-5 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {getStatusIcon(order.status)}
              <div className="min-w-0 flex-1">
                <p className="text-gray-900 font-medium text-sm md:text-base truncate">
                  অর্ডার #{order.id.slice(0, 8)}
                </p>
                <p className="text-gray-400 text-[11px] md:text-xs font-bengali">
                  {new Date(order.created_at).toLocaleDateString("bn-BD")}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bengali border ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              <span className="text-gray-900 font-bold text-sm md:text-base">
                ৳{Number(order.total_price).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[11px] md:text-xs mb-1.5">
              <span className="text-gray-400 font-bengali">অগ্রগতি</span>
              <span className="text-gray-600 font-bengali font-medium">{order.progress || 0}%</span>
            </div>
            <div className="h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${order.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {Array.isArray(order.services) &&
              order.services.slice(0, 2).map((service, serviceIdx) => (
                <span
                  key={serviceIdx}
                  className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-gray-600 text-[11px] md:text-xs font-bengali truncate max-w-[140px] md:max-w-none"
                >
                  {service.serviceName}
                </span>
              ))}
            {Array.isArray(order.services) && order.services.length > 2 && (
              <span className="px-2 py-1 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 text-[11px] md:text-xs font-bengali">
                +{order.services.length - 2} আরও
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
