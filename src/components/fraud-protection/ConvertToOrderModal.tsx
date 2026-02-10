import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, ShoppingCart, Loader2 } from "lucide-react";

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

interface ConvertToOrderModalProps {
  open: boolean;
  onClose: () => void;
  order: {
    id: string;
    phone_number: string;
    customer_name: string | null;
    address: string | null;
    cart_total: number | null;
    cart_items: CartItem[] | null;
  };
  onConverted: (id: string) => void;
}

export function ConvertToOrderModal({ open, onClose, order, onConverted }: ConvertToOrderModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('incomplete_orders')
        .update({ is_converted: true })
        .eq('id', order.id);

      if (updateError) throw updateError;

      onConverted(order.id);
      toast({ title: "✅ Converted", description: "Incomplete order marked as converted" });
      onClose();
    } catch (error: any) {
      console.error('Convert error:', error);
      toast({ title: "Error", description: error?.message || "Failed to convert order", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ShoppingCart className="h-5 w-5 text-cyan-400" />
            Mark as Converted
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            এই incomplete order কে converted হিসেবে mark করুন
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="bg-slate-900 rounded-lg p-4 space-y-2">
            {order.customer_name && (
              <p className="text-sm text-slate-300">
                <span className="text-slate-500">Customer:</span> {order.customer_name}
              </p>
            )}
            <p className="text-sm text-slate-300">
              <span className="text-slate-500">Phone:</span> {order.phone_number}
            </p>
            {order.cart_total != null && order.cart_total > 0 && (
              <p className="text-sm text-slate-300">
                <span className="text-slate-500">Cart Total:</span> ৳{order.cart_total}
              </p>
            )}
          </div>

          {order.cart_items && order.cart_items.length > 0 && (
            <div className="bg-slate-900 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
              {order.cart_items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="text-xs bg-slate-700 border-slate-600 shrink-0">
                      ×{item.quantity}
                    </Badge>
                    <span className="text-white truncate">{item.name}</span>
                  </div>
                  <span className="text-cyan-400 font-medium shrink-0 ml-2">৳{item.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="border-slate-600 flex-1" disabled={loading}>Cancel</Button>
          <Button onClick={handleConvert} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 flex-1">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Converting...</>
            ) : (
              <><CheckCircle className="h-4 w-4 mr-2" /> Mark Converted</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}