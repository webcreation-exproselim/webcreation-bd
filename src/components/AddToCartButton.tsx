import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PricingPlan {
  id: string;
  name: string;
  priceNum: number;
  originalPriceNum: number;
  features: string[];
  popular?: boolean;
}

interface AddToCartButtonProps {
  plan: PricingPlan;
  serviceName: string;
  colorScheme?: "blue" | "purple" | "green" | "red" | "yellow" | "teal";
}

export function AddToCartButton({ plan, serviceName, colorScheme = "blue" }: AddToCartButtonProps) {
  const { addItem, isInCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const colorStyles = {
    blue: {
      popular: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/30",
      normal: "bg-blue-900/50 text-blue-200 hover:bg-blue-800/50 border border-blue-400/30"
    },
    purple: {
      popular: "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/30",
      normal: "bg-purple-900/50 text-purple-200 hover:bg-purple-800/50 border border-purple-400/30"
    },
    green: {
      popular: "bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/30",
      normal: "bg-green-900/50 text-green-200 hover:bg-green-800/50 border border-green-400/30"
    },
    red: {
      popular: "bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-lg shadow-red-500/30",
      normal: "bg-red-900/50 text-red-200 hover:bg-red-800/50 border border-red-400/30"
    },
    yellow: {
      popular: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold shadow-lg shadow-yellow-500/30",
      normal: "bg-yellow-900/50 text-yellow-200 hover:bg-yellow-800/50 border border-yellow-400/30"
    },
    teal: {
      popular: "bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold shadow-lg shadow-teal-500/30",
      normal: "bg-teal-900/50 text-teal-200 hover:bg-teal-800/50 border border-teal-400/30"
    }
  };

  const handleClick = () => {
    if (isInCart(plan.id)) {
      navigate('/checkout');
      return;
    }
    addItem({
      id: plan.id,
      serviceName,
      packageName: plan.name,
      price: plan.priceNum,
      originalPrice: plan.originalPriceNum,
      features: plan.features,
    });
    toast({ title: "কার্টে যোগ হয়েছে!", description: `${serviceName} - ${plan.name}` });
    navigate('/checkout');
  };

  const styles = colorStyles[colorScheme];
  const inCart = isInCart(plan.id);

  return (
    <Button 
      onClick={handleClick}
      className={`w-full font-bengali ${plan.popular ? styles.popular : styles.normal}`}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {inCart ? 'চেকআউটে যান' : 'অর্ডার করুন'}
    </Button>
  );
}
