import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link to="/checkout">
      <Button
        variant="ghost"
        size="icon"
        className="relative text-red-600 hover:bg-red-50"
      >
        <ShoppingCart className="h-5 w-5" />
        <AnimatePresence>
          {itemCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold"
            >
              {itemCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </Link>
  );
}
