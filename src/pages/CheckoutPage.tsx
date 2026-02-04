import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ShoppingCart, Trash2, Plus, Check, 
  Smartphone, Building2, CheckCircle, Upload, Image, X, Copy, CreditCard, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Payment method icon and color mapping
const paymentMethodConfig: Record<string, {
  icon: typeof Smartphone;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  bkash: {
    icon: Smartphone,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  nagad: {
    icon: Smartphone,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  rocket: {
    icon: Smartphone,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  bank: {
    icon: Building2,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
};

interface PaymentMethod {
  id: string;
  method: string;
  account_number: string;
  account_name: string | null;
  is_active: boolean;
}

// Quick services
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check if this is an invoice payment
  const invoiceId = searchParams.get("invoice");
  const invoiceAmount = searchParams.get("amount");
  
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showServices, setShowServices] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch active payment methods from database
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .eq("is_active", true)
        .order("method");

      if (!error && data) {
        setPaymentMethods(data);
      }
      setLoadingPayments(false);
    };

    fetchPaymentMethods();
  }, []);

  // Fetch invoice data if invoice payment
  useEffect(() => {
    const fetchInvoiceAndUser = async () => {
      if (invoiceId) {
        const { data: invoice } = await supabase
          .from("invoices")
          .select("*, orders(*)")
          .eq("id", invoiceId)
          .single();
        
        if (invoice) {
          setInvoiceData(invoice);
          // Pre-fill customer info from order
          if (invoice.orders) {
            setCustomerName(invoice.orders.customer_name || "");
            setCustomerPhone(invoice.orders.customer_phone || "");
          }
        }
      }
      
      // Also fetch current user info
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !invoiceId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (profile) {
          setCustomerName(profile.full_name || "");
          setCustomerPhone(profile.phone || "");
        }
      }
    };
    
    fetchInvoiceAndUser();
  }, [invoiceId]);

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast({ title: "কপি হয়েছে! ✓", description: num });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "ফাইল অনেক বড়", description: "৫MB এর কম ফাইল দিন", variant: "destructive" });
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    toast({ title: "যোগ হয়েছে! ✓", description: service.name });
    setShowServices(false);
  };

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile) return null;
    
    setUploadingScreenshot(true);
    try {
      const fileExt = screenshotFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, screenshotFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Screenshot upload error:', error);
      toast({ title: "স্ক্রিনশট আপলোড ব্যর্থ", variant: "destructive" });
      return null;
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast({ title: "তথ্য দিন", description: "নাম ও ফোন নম্বর আবশ্যক", variant: "destructive" });
      return;
    }
    if (!selectedPayment) {
      toast({ title: "পেমেন্ট মেথড সিলেক্ট করুন", variant: "destructive" });
      return;
    }
    
    // For regular orders, check if cart has items
    if (!invoiceId && items.length === 0) {
      toast({ title: "কার্ট খালি", description: "সার্ভিস যোগ করুন", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      let screenshotUrl = null;
      if (screenshotFile) {
        screenshotUrl = await uploadScreenshot();
      }

      // If this is an invoice payment
      if (invoiceId && invoiceData) {
        const paymentAmount = Number(invoiceAmount) || 0;
        const newPaidAmount = Number(invoiceData.paid_amount) + paymentAmount;
        const newStatus = newPaidAmount >= Number(invoiceData.amount) ? "paid" : "partial";

        const { error } = await supabase
          .from("invoices")
          .update({ 
            paid_amount: newPaidAmount,
            status: newStatus 
          })
          .eq("id", invoiceId);

        if (error) throw error;

        setOrderPlaced(true);
        toast({ title: "পেমেন্ট সফল! 🎉", description: "ধন্যবাদ আপনার পেমেন্টের জন্য" });
      } else {
        // Regular order
        const { error } = await supabase.from('orders').insert([{
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          services: JSON.parse(JSON.stringify(items)),
          total_price: totalPrice,
          total_savings: totalSavings,
          payment_method: selectedPayment,
          transaction_id: transactionId || null,
          sender_number: senderNumber || null,
          payment_screenshot_url: screenshotUrl,
          status: 'pending',
          user_id: user?.id || null,
        }]);

        if (error) throw error;

        setOrderPlaced(true);
        clearCart();
        toast({ title: "অর্ডার সফল! 🎉", description: "শীঘ্রই যোগাযোগ করা হবে" });
      }
    } catch (error) {
      console.error('Order/Payment error:', error);
      toast({ title: "সমস্যা হয়েছে", description: "আবার চেষ্টা করুন", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate the amount to display
  const displayAmount = invoiceId ? Number(invoiceAmount) : totalPrice;

  // Success Screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Header />
        <div className="pt-28 pb-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-200"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bengali font-bold text-gray-900 mb-4">
              {invoiceId ? "পেমেন্ট সম্পন্ন! 🎉" : "অর্ডার সম্পন্ন! 🎉"}
            </h1>
            <p className="text-gray-600 font-bengali mb-8 text-lg">
              {invoiceId 
                ? "ধন্যবাদ আপনার পেমেন্টের জন্য! আপনার ইনভয়েস আপডেট হয়েছে।"
                : "ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।"
              }
            </p>
            <Link to={invoiceId ? "/dashboard" : "/"}>
              <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bengali px-8 py-6 text-lg rounded-xl shadow-lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {invoiceId ? "ড্যাশবোর্ডে ফিরুন" : "হোমে ফিরুন"}
              </Button>
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link 
              to={invoiceId ? "/dashboard" : "/"} 
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 text-sm font-bengali transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {invoiceId ? "ড্যাশবোর্ডে ফিরুন" : "হোম পেজে ফিরুন"}
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  invoiceId 
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 shadow-yellow-200" 
                    : "bg-gradient-to-r from-red-500 to-red-600 shadow-red-200"
                }`}>
                  {invoiceId ? <FileText className="w-6 h-6 text-white" /> : <ShoppingCart className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h1 className="text-2xl font-bengali font-bold text-gray-900">
                    {invoiceId ? "ইনভয়েস পেমেন্ট" : "চেকআউট"}
                  </h1>
                  <p className="text-sm text-gray-500 font-bengali">
                    {invoiceId 
                      ? `ইনভয়েস: ${invoiceData?.invoice_number || "লোড হচ্ছে..."}`
                      : `${items.length}টি সার্ভিস`
                    }
                  </p>
                </div>
              </div>
              {!invoiceId && (
                <button
                  onClick={() => setShowServices(!showServices)}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bengali transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  সার্ভিস যোগ করুন
                </button>
              )}
            </div>
          </motion.div>

          {/* Invoice Payment Summary */}
          {invoiceId && invoiceData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-5 mb-6 text-white shadow-lg shadow-yellow-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bengali text-yellow-100 text-sm">বাকি পরিমাণ</span>
                  <div className="text-3xl font-bold">৳{Number(invoiceAmount).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <span className="font-bengali text-yellow-100 text-sm">মোট ইনভয়েস</span>
                  <div className="text-xl font-bold">৳{Number(invoiceData.amount).toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Add Services - Only show for regular checkout */}
          {!invoiceId && (
            <AnimatePresence>
              {showServices && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <h3 className="font-bengali font-semibold text-gray-900 mb-3">দ্রুত যোগ করুন</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {quickServices.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleAddQuickService(s)}
                          disabled={isInCart(s.id)}
                          className={`p-4 rounded-xl text-left transition-all ${
                            isInCart(s.id)
                              ? "bg-green-50 border-2 border-green-200"
                              : "bg-gray-50 border-2 border-transparent hover:border-red-200 hover:bg-red-50"
                          }`}
                        >
                          <div className="font-bengali font-medium text-gray-900 text-sm mb-2 line-clamp-2">{s.name}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-red-600 font-bold">৳{s.price.toLocaleString()}</span>
                            {isInCart(s.id) && <Check className="w-4 h-4 text-green-500" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Cart Items - Only show for regular checkout */}
          {!invoiceId && (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-bengali text-lg">কার্ট খালি আছে</p>
                <p className="text-gray-400 font-bengali text-sm mt-1">উপরে থেকে সার্ভিস যোগ করুন</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 rounded-full text-xs font-bengali font-medium">
                            {item.serviceName}
                          </span>
                        </div>
                        <h3 className="font-bengali font-semibold text-gray-900 mb-1">{item.packageName}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-red-600">৳{item.price.toLocaleString()}</span>
                          <span className="text-gray-400 line-through text-sm">৳{item.originalPrice.toLocaleString()}</span>
                          <span className="text-xs text-green-600 font-medium">
                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% ছাড়
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
          )}

          {/* Total Summary - Only show for regular checkout with items */}
          {!invoiceId && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 mb-6 text-white shadow-lg shadow-red-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bengali text-red-100 text-sm">মোট পরিমাণ</span>
                  <div className="text-3xl font-bold">৳{totalPrice.toLocaleString()}</div>
                </div>
                {totalSavings > 0 && (
                  <div className="text-right">
                    <span className="font-bengali text-red-100 text-sm">সাশ্রয়</span>
                    <div className="text-xl font-bold text-green-300">৳{totalSavings.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm"
          >
            <h3 className="font-bengali font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-sm font-bold">১</span>
              আপনার তথ্য
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bengali text-gray-600 mb-2">আপনার নাম *</label>
                <Input
                  placeholder="যেমন: মোহাম্মদ করিম"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="font-bengali rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200 h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-bengali text-gray-600 mb-2">ফোন নম্বর *</label>
                <Input
                  placeholder="01XXXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="font-bengali rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200 h-12"
                />
              </div>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm"
          >
            <h3 className="font-bengali font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-sm font-bold">২</span>
              পেমেন্ট মেথড
            </h3>
            
            {loadingPayments ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-bengali">
                কোনো পেমেন্ট মেথড সক্রিয় নেই। অ্যাডমিনের সাথে যোগাযোগ করুন।
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {paymentMethods.map((method) => {
                    const config = paymentMethodConfig[method.method] || paymentMethodConfig.bkash;
                    const methodName = method.method === "bkash" ? "বিকাশ" 
                      : method.method === "nagad" ? "নগদ" 
                      : method.method === "rocket" ? "রকেট" 
                      : method.method === "bank" ? "ব্যাংক ট্রান্সফার" 
                      : method.method;
                    const Icon = config.icon;
                    
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.method)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedPayment === method.method
                            ? `${config.borderColor} ${config.bgColor} shadow-md`
                            : "border-gray-100 hover:border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${config.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm font-bengali font-semibold text-gray-900 text-center">{methodName}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Payment Details */}
                <AnimatePresence>
                  {selectedPayment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
                        {(() => {
                          const selectedMethod = paymentMethods.find(p => p.method === selectedPayment);
                          if (!selectedMethod) return null;
                          
                          if (selectedPayment !== "bank") {
                            return (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bengali text-gray-600">এই নম্বরে টাকা পাঠান:</span>
                                </div>
                                <button
                                  onClick={() => copyNumber(selectedMethod.account_number)}
                                  className="w-full flex items-center justify-between bg-white px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-red-300 transition-colors"
                                >
                                  <span className="font-mono text-lg font-bold text-gray-900">
                                    {selectedMethod.account_number}
                                  </span>
                                  <div className="flex items-center gap-2 text-red-600">
                                    <Copy className="w-4 h-4" />
                                    <span className="text-sm font-bengali">কপি</span>
                                  </div>
                                </button>
                              </div>
                            );
                          } else {
                            return (
                              <div className="space-y-2">
                                {selectedMethod.account_name && (
                                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-500 font-bengali">ব্যাংক:</span>
                                    <span className="font-semibold text-gray-900">{selectedMethod.account_name}</span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center py-2">
                                  <span className="text-sm text-gray-500 font-bengali">একাউন্ট নম্বর:</span>
                                  <button
                                    onClick={() => copyNumber(selectedMethod.account_number)}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="font-mono font-semibold text-gray-900">{selectedMethod.account_number}</span>
                                    <Copy className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </div>

                      {/* Payment Details Input */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bengali text-gray-600 mb-2">
                            যে নম্বর থেকে পাঠিয়েছেন
                          </label>
                          <Input
                            placeholder="01XXXXXXXXX"
                            value={senderNumber}
                            onChange={(e) => setSenderNumber(e.target.value)}
                            className="font-bengali rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200 h-12"
                          />
                        </div>

                        {/* Screenshot Upload */}
                        <div>
                          <label className="block text-sm font-bengali text-gray-600 mb-2">
                            পেমেন্ট স্ক্রিনশট (প্রমাণ)
                          </label>
                          
                          {screenshotPreview ? (
                            <div className="relative">
                              <img 
                                src={screenshotPreview} 
                                alt="Payment proof" 
                                className="w-full h-48 object-cover rounded-xl border-2 border-green-200"
                              />
                              <button
                                onClick={removeScreenshot}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bengali flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                আপলোড রেডি
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors flex flex-col items-center justify-center gap-2"
                            >
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <Upload className="w-6 h-6 text-gray-400" />
                              </div>
                              <span className="text-sm font-bengali text-gray-500">স্ক্রিনশট আপলোড করুন</span>
                              <span className="text-xs text-gray-400">PNG, JPG (সর্বোচ্চ ৫MB)</span>
                            </button>
                          )}
                          
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || (!invoiceId && items.length === 0) || uploadingScreenshot}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bengali font-bold py-7 text-lg rounded-2xl shadow-xl shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || uploadingScreenshot ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  প্রসেসিং...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {invoiceId ? "পেমেন্ট কনফার্ম করুন" : "অর্ডার কনফার্ম করুন"}
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4 font-bengali">
              🔒 আপনার তথ্য সম্পূর্ণ নিরাপদ। {invoiceId ? "পেমেন্ট করলে ইনভয়েস আপডেট হবে।" : "অর্ডার করলে আমরা শীঘ্রই কল করব।"}
            </p>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
