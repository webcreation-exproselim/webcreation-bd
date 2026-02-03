import { motion } from "framer-motion";
import { Check, Star, Zap, Crown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export interface PricingPlanData {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  originalPrice?: string;
  originalPriceNum?: number;
  discount?: string;
  popular?: boolean;
  note?: string;
  features: string[];
  icon?: "star" | "zap" | "crown";
}

interface ServicePricingCardProps {
  plan: PricingPlanData;
  serviceName: string;
  gradient: string; // e.g., "from-blue-500 to-cyan-400"
  accentColor: string; // e.g., "blue", "purple", "green"
  index: number;
}

const iconMap = {
  star: Star,
  zap: Zap,
  crown: Crown,
};

export function ServicePricingCard({
  plan,
  serviceName,
  gradient,
  accentColor,
  index,
}: ServicePricingCardProps) {
  const { addItem, isInCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const IconComponent = plan.icon ? iconMap[plan.icon] : (index === 0 ? Star : index === 1 ? Zap : Crown);

  const handleAddToCart = () => {
    if (isInCart(plan.id)) {
      navigate("/checkout");
      return;
    }

    addItem({
      id: plan.id,
      serviceName: serviceName,
      packageName: plan.name,
      price: plan.priceNum,
      originalPrice: plan.originalPriceNum || plan.priceNum,
      features: plan.features,
    });

    toast({
      title: "✅ কার্টে যোগ হয়েছে",
      description: `${serviceName} - ${plan.name} প্যাকেজ`,
    });

    navigate("/checkout");
  };

  // Color variants based on accentColor
  const colorVariants: Record<string, { card: string; border: string; badge: string; button: string; text: string; note: string }> = {
    blue: {
      card: "from-blue-900/60 to-cyan-900/40",
      border: plan.popular ? "border-cyan-400/50" : "border-blue-400/20 hover:border-blue-400/40",
      badge: "from-blue-500 to-cyan-500",
      button: plan.popular 
        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/30"
        : "bg-blue-900/50 text-blue-200 hover:bg-blue-800/50 border border-blue-400/30",
      text: "text-cyan-400",
      note: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    },
    purple: {
      card: "from-purple-900/60 to-pink-900/40",
      border: plan.popular ? "border-pink-400/50" : "border-purple-400/20 hover:border-purple-400/40",
      badge: "from-purple-500 to-pink-500",
      button: plan.popular 
        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/30"
        : "bg-purple-900/50 text-purple-200 hover:bg-purple-800/50 border border-purple-400/30",
      text: "text-pink-400",
      note: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    },
    green: {
      card: "from-green-900/60 to-emerald-900/40",
      border: plan.popular ? "border-emerald-400/50" : "border-green-400/20 hover:border-green-400/40",
      badge: "from-green-500 to-emerald-500",
      button: plan.popular 
        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/30"
        : "bg-green-900/50 text-green-200 hover:bg-green-800/50 border border-green-400/30",
      text: "text-emerald-400",
      note: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
    red: {
      card: "from-red-900/60 to-orange-900/40",
      border: plan.popular ? "border-orange-400/50" : "border-red-400/20 hover:border-red-400/40",
      badge: "from-red-500 to-orange-500",
      button: plan.popular 
        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-lg shadow-red-500/30"
        : "bg-red-900/50 text-red-200 hover:bg-red-800/50 border border-red-400/30",
      text: "text-orange-400",
      note: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    },
    yellow: {
      card: "from-yellow-900/60 to-amber-900/40",
      border: plan.popular ? "border-amber-400/50" : "border-yellow-400/20 hover:border-yellow-400/40",
      badge: "from-yellow-500 to-amber-500",
      button: plan.popular 
        ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold shadow-lg shadow-yellow-500/30"
        : "bg-yellow-900/50 text-yellow-200 hover:bg-yellow-800/50 border border-yellow-400/30",
      text: "text-amber-400",
      note: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    teal: {
      card: "from-teal-900/60 to-cyan-900/40",
      border: plan.popular ? "border-cyan-400/50" : "border-teal-400/20 hover:border-teal-400/40",
      badge: "from-teal-500 to-cyan-500",
      button: plan.popular 
        ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold shadow-lg shadow-teal-500/30"
        : "bg-teal-900/50 text-teal-200 hover:bg-teal-800/50 border border-teal-400/30",
      text: "text-cyan-400",
      note: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    },
  };

  const colors = colorVariants[accentColor] || colorVariants.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={`relative group h-full ${plan.popular ? 'z-10' : ''}`}
    >
      {/* Discount Badge */}
      {plan.discount && (
        <div className="absolute -top-5 -right-3 z-20">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center shadow-lg shadow-red-500/40 border-2 border-red-400">
              <span className="text-white font-bold text-sm leading-none">{plan.discount}</span>
              <span className="text-white text-[10px] font-bold">OFF</span>
            </div>
          </div>
        </div>
      )}

      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${colors.badge} text-white text-xs font-bengali font-bold shadow-lg`}>
            জনপ্রিয়
          </div>
        </div>
      )}

      {/* Card Border Glow */}
      <div className={`pointer-events-none absolute -inset-[1px] rounded-2xl overflow-hidden ${plan.popular ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-500`}>
        <div 
          className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-50`}
          style={{ filter: 'blur(8px)' }}
        />
      </div>

      {/* Card */}
      <div className={`relative bg-gradient-to-br ${colors.card} backdrop-blur-sm rounded-2xl p-6 border ${colors.border} h-full flex flex-col transition-all duration-300`}>
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <IconComponent className="w-full h-full text-white" />
        </div>

        {/* Plan Name */}
        <h4 className="text-lg font-bengali font-bold text-white mb-2">
          {plan.name}
        </h4>
        
        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {plan.originalPrice && (
              <span className="text-lg text-white/40 line-through font-bengali">
                {plan.originalPrice}
              </span>
            )}
            <span className={`text-3xl sm:text-4xl font-bold ${colors.text}`}>
              {plan.price}
            </span>
          </div>
          <span className="text-white/60 font-bengali text-sm">টাকা</span>
        </div>

        {/* Features with scroll */}
        <div className="mb-4 flex-grow max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2">
          <ul className="space-y-2">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-white/80 font-bengali text-xs">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Note */}
        {plan.note && (
          <div className={`mb-4 px-3 py-2 rounded-lg text-center text-xs font-bengali ${
            plan.note.includes("No Advanced") 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : `${colors.note} border`
          }`}>
            {plan.note}
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={handleAddToCart}
          className={`w-full font-bengali ${colors.button}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isInCart(plan.id) ? 'চেকআউটে যান' : 'অর্ডার করুন'}
        </Button>
      </div>
    </motion.div>
  );
}
