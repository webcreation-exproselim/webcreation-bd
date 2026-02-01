import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ShoppingCart, Trash2, Plus, Check, 
  Smartphone, Building2, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Payment methods
const paymentMethods = [
  {
    id: "bkash",
    name: "বিকাশ",
    icon: Smartphone,
    color: "from-pink-500 to-pink-600",
    number: "01332052874",
  },
  {
    id: "nagad",
    name: "নগদ",
    icon: Smartphone,
    color: "from-orange-500 to-orange-600",
    number: "01332052874",
  },
  {
    id: "rocket",
    name: "রকেট",
    icon: Smartphone,
    color: "from-purple-500 to-purple-600",
    number: "013320528741",
  },
  {
    id: "bank",
    name: "ব্যাংক",
    icon: Building2,
    color: "from-blue-500 to-blue-600",
    details: {
      bankName: "Dutch Bangla Bank",
      accountNumber: "1234567890123",
    },
  },
];

// All services for quick add
const quickServices = [
  { id: "fb-starter", name: "ফেসবুক অ্যাডস - স্টার্টার", price: 3500, originalPrice: 5000, features: ["১টি ক্যাম্পেইন", "৫টি ক্রিয়েটিভ"], serviceName: "ফেসবুক অ্যাডস", packageName: "স্টার্টার" },
  { id: "fb-premium", name: "ফেসবুক অ্যাডস - প্রিমিয়াম", price: 7000, originalPrice: 10000, features: ["৩টি ক্যাম্পেইন", "১৫টি ক্রিয়েটিভ"], serviceName: "ফেসবুক অ্যাডস", packageName: "প্রিমিয়াম" },
  { id: "web-starter", name: "ওয়েব ডেভেলপমেন্ট - স্টার্টার", price: 8000, originalPrice: 12000, features: ["৫ পেজ সাইট", "রেস্পন্সিভ"], serviceName: "ওয়েব ডেভেলপমেন্ট", packageName: "স্টার্টার" },
  { id: "gfx-startup", name: "গ্রাফিক্স - স্টার্টআপ", price: 2500, originalPrice: 4000, features: ["লোগো", "বিজনেস কার্ড"], serviceName: "গ্রাফিক্স ডিজাইন", packageName: "স্টার্টআপ" },
  { id: "vid-basic", name: "ভিডিও এডিটিং - বেসিক", price: 3000, originalPrice: 5000, features: ["৫ মিনিট ভিডিও"], serviceName: "ভিডিও এডিটিং", packageName: "বেসিক" },
  { id: "motion-starter", name: "মোশন গ্রাফিক্স - স্টার্টার", price: 5000, originalPrice: 8000, features: ["অ্যানিমেটেড লোগো"], serviceName: "মোশন গ্রাফিক্স", packageName: "স্টার্টার" },
];

const CheckoutPage = () => {
  const { items, removeItem, clearCart, totalPrice, totalSavings, addItem, isInCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showServices, setShowServices] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast({ title: "কপি হয়েছে!", description: num });
  };

  const handleAddQuickService = (service: typeof quickServices[0]) => {
    addItem({
      id: service.id,
      serviceName: service.serviceName,
      packageName: service.packageName,
      price: service.price,
      originalPrice: service.originalPrice,
      features: service.features,
    });
    toast({ title: "যোগ হয়েছে!", description: service.name });
    setShowServices(false);
  };

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast({ title: "তথ্য দিন", description: "নাম ও ফোন নম্বর আবশ্যক", variant: "destructive" });
      return;
    }
    if (!selectedPayment) {
      toast({ title: "পেমেন্ট সিলেক্ট করুন", variant: "destructive" });
      return;
    }
    if (items.length === 0) {
      toast({ title: "কার্ট খালি", description: "সার্ভিস যোগ করুন", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('orders').insert([{
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        services: JSON.parse(JSON.stringify(items)),
        total_price: totalPrice,
        total_savings: totalSavings,
        payment_method: selectedPayment,
        transaction_id: transactionId || null,
        status: 'pending'
      }]);

      if (error) throw error;

      setOrderPlaced(true);
      clearCart();
      toast({ title: "অর্ডার সফল!", description: "শীঘ্রই যোগাযোগ করা হবে" });
    } catch (error) {
      console.error('Order error:', error);
      toast({ title: "সমস্যা হয়েছে", description: "আবার চেষ্টা করুন", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <div className="pt-24 pb-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bengali font-bold text-gray-900 mb-3">অর্ডার সফল!</h1>
            <p className="text-gray-600 font-bengali mb-6">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
            <Link to="/">
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bengali">
                হোমে ফিরুন
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Back */}
          <Link to="/" className="inline-flex items-center gap-2 text-red-600 mb-4 text-sm font-bengali">
            <ArrowLeft className="w-4 h-4" />
            হোম
          </Link>

          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bengali font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-red-500" />
              চেকআউট
            </h1>
            <button
              onClick={() => setShowServices(!showServices)}
              className="text-red-600 text-sm font-bengali flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              যোগ করুন
            </button>
          </div>

          {/* Quick Add Services */}
          <AnimatePresence>
            {showServices && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 bg-white rounded-xl border border-gray-200 p-3 shadow-sm"
              >
                <div className="grid grid-cols-2 gap-2">
                  {quickServices.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleAddQuickService(s)}
                      disabled={isInCart(s.id)}
                      className={`p-3 rounded-lg text-left text-xs transition-all ${
                        isInCart(s.id)
                          ? "bg-green-50 border border-green-200"
                          : "bg-gray-50 border border-gray-200 hover:border-red-300"
                      }`}
                    >
                      <div className="font-bengali font-medium text-gray-900 mb-1 truncate">{s.name}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-red-600 font-bold">৳{s.price.toLocaleString()}</span>
                        {isInCart(s.id) && <Check className="w-3 h-3 text-green-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cart Items */}
          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center mb-4">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-bengali">কার্ট খালি</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bengali truncate">
                        {item.serviceName}
                      </span>
                      <span className="text-sm font-bengali text-gray-900">{item.packageName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-bold">৳{item.price.toLocaleString()}</span>
                      <span className="text-gray-400 line-through text-xs">৳{item.originalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Total */}
          {items.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 mb-4 border border-red-100">
              <div className="flex justify-between items-center">
                <span className="font-bengali text-gray-700">মোট</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-red-600">৳{totalPrice.toLocaleString()}</span>
                  {totalSavings > 0 && (
                    <div className="text-xs text-green-600 font-bengali">৳{totalSavings.toLocaleString()} সেভ!</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
            <h3 className="font-bengali font-semibold text-gray-900">আপনার তথ্য</h3>
            <Input
              placeholder="নাম *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="font-bengali"
            />
            <Input
              placeholder="ফোন নম্বর *"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="font-bengali"
            />
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <h3 className="font-bengali font-semibold text-gray-900 mb-3">পেমেন্ট মেথড</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedPayment === method.id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center mx-auto mb-2`}>
                    <method.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs font-bengali font-medium text-gray-900">{method.name}</div>
                </button>
              ))}
            </div>

            {/* Selected Payment Details */}
            {selectedPayment && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-3"
              >
                {selectedPayment !== "bank" ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bengali text-gray-600">নম্বর:</span>
                    <button
                      onClick={() => copyNumber(paymentMethods.find(p => p.id === selectedPayment)?.number || "")}
                      className="font-mono text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded border"
                    >
                      {paymentMethods.find(p => p.id === selectedPayment)?.number}
                    </button>
                  </div>
                ) : (
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ব্যাংক:</span>
                      <span className="font-medium">Dutch Bangla Bank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">একাউন্ট:</span>
                      <span className="font-mono">1234567890123</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Transaction ID */}
            {selectedPayment && (
              <Input
                placeholder="ট্রানজেকশন আইডি (ঐচ্ছিক)"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="mt-3 font-bengali"
              />
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handlePlaceOrder}
            disabled={isSubmitting || items.length === 0}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bengali font-bold py-6 text-lg rounded-xl shadow-lg"
          >
            {isSubmitting ? "প্রসেসিং..." : "অর্ডার কনফার্ম করুন"}
          </Button>

          <p className="text-center text-xs text-gray-500 mt-3 font-bengali">
            অর্ডার করলে আমরা শীঘ্রই কল করব
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
