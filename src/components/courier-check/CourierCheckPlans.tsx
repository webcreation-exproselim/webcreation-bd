import { Check, Zap, Globe, Shield, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CourierCheckPlansProps {
  onSelectPlan: () => void;
}

const features = [
  { icon: BarChart3, text: "আনলিমিটেড Courier Check (5,000/year)" },
  { icon: Download, text: "WooCommerce Plugin Access" },
  { icon: Zap, text: "Real-time Data from Couriers" },
  { icon: Globe, text: "Steadfast, Pathao, RedX সাপোর্ট" },
  { icon: Shield, text: "Domain-locked License" },
];

export function CourierCheckPlans({ onSelectPlan }: CourierCheckPlansProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="relative bg-white rounded-3xl border-2 border-blue-200 shadow-xl shadow-blue-100/50 overflow-hidden">
        {/* Badge */}
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl">
            BEST VALUE
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 font-bengali mb-1">
            Yearly Plan
          </h3>
          <p className="text-sm text-gray-500 font-bengali mb-4">
            ১ বছরের জন্য সম্পূর্ণ অ্যাক্সেস
          </p>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-extrabold text-gray-900">৳899</span>
            <span className="text-gray-500 font-bengali">/বছর</span>
          </div>

          <div className="space-y-3 mb-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-bengali">{feature.text}</span>
                </div>
              );
            })}
          </div>

          <Button
            onClick={onSelectPlan}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base font-bengali shadow-lg shadow-blue-500/30"
          >
            <Zap className="w-5 h-5 mr-2" />
            Plan কিনুন - ৳899
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
