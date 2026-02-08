import { Check, Zap, Globe, Shield, BarChart3, Download, Clock, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface CourierCheckPlansProps {
  onSelectPlan: (planType: 'monthly' | 'yearly') => void;
}

const monthlyFeatures = [
  { text: "500 API requests", highlight: false },
  { text: "WooCommerce Plugin Access", highlight: false },
  { text: "Real-time Courier Data", highlight: false },
  { text: "Steadfast, Pathao, RedX সাপোর্ট", highlight: false },
  { text: "Domain-locked License", highlight: false },
  { text: "Standard support", highlight: false },
];

const yearlyFeatures = [
  { text: "5,000 API requests", highlight: true },
  { text: "WooCommerce Plugin Access", highlight: false },
  { text: "Real-time Courier Data", highlight: false },
  { text: "Steadfast, Pathao, RedX সাপোর্ট", highlight: false },
  { text: "Domain-locked License", highlight: false },
  { text: "Priority support", highlight: true },
  { text: "33% savings", highlight: true },
];

export function CourierCheckPlans({ onSelectPlan }: CourierCheckPlansProps) {
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}
    >
      {/* Monthly Plan */}
      <div className="group relative bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-200 rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-100/50">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center mb-4 shadow-lg shadow-gray-300/50">
          <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Monthly Plan</h3>
        <p className="text-gray-500 text-sm font-bengali mb-4">নতুনদের জন্য আদর্শ</p>
        
        <div className="mb-5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900">৳২৪৯</span>
            <span className="text-gray-500 text-sm">/মাস</span>
          </div>
        </div>
        
        <ul className="space-y-2 mb-6">
          {monthlyFeatures.map((feature, index) => (
            <li key={index} className="flex items-center gap-2.5 text-gray-600 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={() => onSelectPlan('monthly')}
          variant="outline"
          className="w-full h-12 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold font-bengali transition-all group-hover:border-cyan-400 group-hover:text-cyan-600"
        >
          Monthly শুরু করুন
        </Button>
      </div>

      {/* Yearly Plan - Popular */}
      <div className="group relative bg-gradient-to-br from-cyan-600 via-blue-700 to-blue-800 border-2 border-cyan-500 rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.02]">
        {/* Popular Badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-300/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>সবচেয়ে জনপ্রিয়</span>
          </div>
        </div>
        
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 mt-2 shadow-lg">
          <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Yearly Plan</h3>
        <p className="text-white/70 text-sm font-bengali mb-4">সাশ্রয়ী এবং সেরা মূল্য</p>
        
        <div className="mb-5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-white">৳৪৯৯</span>
            <span className="text-white/70 text-sm">/বছর</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-white/50 line-through">৳২,৯৮৮</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-semibold">
              83% সেভ
            </span>
          </div>
        </div>
        
        <ul className="space-y-2 mb-6">
          {yearlyFeatures.map((feature, index) => (
            <li key={index} className="flex items-center gap-2.5 text-white/90 text-sm">
              <CheckCircle className={`w-4 h-4 flex-shrink-0 ${feature.highlight ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span className={feature.highlight ? 'font-medium text-white' : ''}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={() => onSelectPlan('yearly')}
          className="w-full h-12 rounded-xl bg-white hover:bg-gray-50 text-cyan-600 font-bold font-bengali transition-all shadow-lg shadow-white/20"
        >
          <Shield className="w-4 h-4 mr-2" />
          Yearly শুরু করুন
        </Button>
      </div>
    </motion.div>
  );
}
