import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [customerName, setCustomerName] = useState(order.customer_name || "");
  const [customerPhone, setCustomerPhone] = useState(order.phone_number || "");
  const [customerAddress, setCustomerAddress] = useState((order as any).address || "");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [totalPrice, setTotalPrice] = useState(order.cart_total || 0);

  const handleConvert = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast({ title: "Error", description: "Name and phone are required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const services = (order.cart_items || []).map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim() || null,
          payment_method: 'manual',
          services: services.length > 0 ? services : [{ name: 'Converted from incomplete order', price: totalPrice, quantity: 1 }],
          total_price: totalPrice,
          total_savings: 0,
          status: 'pending',
          notes: notes.trim() || `Converted from incomplete order | Address: ${customerAddress || 'N/A'}`,
        });

      if (orderError) throw orderError;

      const { error: updateError } = await supabase
        .from('incomplete_orders')
        .update({ is_converted: true })
        .eq('id', order.id);

      if (updateError) throw updateError;

      onConverted(order.id);
      toast({ title: "✅ Order Created", description: "Incomplete order converted successfully" });
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
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ShoppingCart className="h-5 w-5 text-cyan-400" />
            Convert to Order
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Incomplete order কে main order এ convert করুন
          </DialogDescription>
        </DialogHeader>

        {order.cart_items && order.cart_items.length > 0 && (
          <div className="space-y-2">
            <Label className="text-slate-400 text-sm">Products</Label>
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
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400 text-sm">Customer Name *</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white mt-1" placeholder="Customer name" />
            </div>
            <div>
              <Label className="text-slate-400 text-sm">Phone *</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white mt-1" placeholder="01XXXXXXXXX" />
            </div>
          </div>

          <div>
            <Label className="text-slate-400 text-sm">Address</Label>
            <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)}
              className="bg-slate-900 border-slate-600 text-white mt-1" placeholder="Customer address" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400 text-sm">Email (optional)</Label>
              <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white mt-1" placeholder="email@example.com" type="email" />
            </div>
            <div>
              <Label className="text-slate-400 text-sm">Total Price (৳)</Label>
              <Input value={totalPrice} onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                className="bg-slate-900 border-slate-600 text-white mt-1" type="number" min={0} />
            </div>
          </div>

          <div>
            <Label className="text-slate-400 text-sm">Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              className="bg-slate-900 border-slate-600 text-white mt-1 min-h-[60px]" placeholder="Additional notes..." />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="border-slate-600 flex-1" disabled={loading}>Cancel</Button>
          <Button onClick={handleConvert} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 flex-1">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Converting...</>
            ) : (
              <><CheckCircle className="h-4 w-4 mr-2" /> Create Order</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
