import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, ShoppingCart, Trash2, Plus, Check, 
  Smartphone, Building2, CreditCard, Copy, ExternalLink,
  CheckCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// All available services for adding
const allServices = [
  {
    category: "ফেসবুক অ্যাডস",
    packages: [
      { id: "fb-starter", name: "স্টার্টার", price: 5000, originalPrice: 8000, features: ["৩টি অ্যাড ক্রিয়েটিভ", "অ্যাড কপি রাইটিং", "বেসিক টার্গেটিং"] },
      { id: "fb-premium", name: "প্রিমিয়াম", price: 12000, originalPrice: 18000, features: ["৭টি অ্যাড ক্রিয়েটিভ", "A/B টেস্টিং", "অ্যাডভান্সড টার্গেটিং", "মাসিক রিপোর্ট"] },
      { id: "fb-business", name: "বিজনেস", price: 25000, originalPrice: 35000, features: ["১৫+ অ্যাড ক্রিয়েটিভ", "ফুল ফানেল সেটআপ", "রিটার্গেটিং", "২৪/৭ সাপোর্ট"] },
    ]
  },
  {
    category: "ওয়েব ডেভেলপমেন্ট",
    packages: [
      { id: "web-starter", name: "স্টার্টার", price: 5000, originalPrice: 8000, features: ["৫ পেজ ওয়েবসাইট", "মোবাইল রেস্পন্সিভ", "বেসিক SEO"] },
      { id: "web-premium", name: "প্রিমিয়াম", price: 15000, originalPrice: 22000, features: ["১০ পেজ ওয়েবসাইট", "অ্যাডমিন প্যানেল", "অ্যাডভান্সড SEO"] },
      { id: "web-business", name: "বিজনেস", price: 8000, originalPrice: 12000, features: ["আনলিমিটেড পেজ", "ই-কমার্স", "কাস্টম ফিচার্স"] },
    ]
  },
  {
    category: "গ্রাফিক্স ডিজাইন",
    packages: [
      { id: "gfx-startup", name: "স্টার্টআপ", price: 1700, originalPrice: 2500, features: ["লোগো ডিজাইন", "বিজনেস কার্ড", "২টি রিভিশন"] },
      { id: "gfx-business", name: "বিজনেস", price: 3000, originalPrice: 4500, features: ["ফুল ব্র্যান্ডিং কিট", "সোশ্যাল মিডিয়া কিট", "৫টি রিভিশন"] },
      { id: "gfx-corporate", name: "কর্পোরেট", price: 5000, originalPrice: 7500, features: ["প্রিমিয়াম ব্র্যান্ডিং", "স্টেশনারি ডিজাইন", "আনলিমিটেড রিভিশন"] },
    ]
  },
  {
    category: "ভিডিও এডিটিং",
    packages: [
      { id: "vid-basic", name: "বেসিক", price: 2000, originalPrice: 3000, features: ["৫ মিনিট ভিডিও", "বেসিক এডিটিং", "২টি রিভিশন"] },
      { id: "vid-pro", name: "প্রফেশনাল", price: 5000, originalPrice: 7000, features: ["১৫ মিনিট ভিডিও", "কালার গ্রেডিং", "মোশন গ্রাফিক্স"] },
      { id: "vid-premium", name: "প্রিমিয়াম", price: 10000, originalPrice: 15000, features: ["৩০ মিনিট ভিডিও", "VFX ইফেক্টস", "এক্সপ্রেস ডেলিভারি"] },
    ]
  },
  {
    category: "মোশন গ্রাফিক্স",
    packages: [
      { id: "motion-starter", name: "স্টার্টার", price: 3500, originalPrice: 5000, features: ["অ্যানিমেটেড লোগো", "৫ সেকেন্ড ইন্ট্রো", "HD কোয়ালিটি"] },
      { id: "motion-pro", name: "প্রফেশনাল", price: 8000, originalPrice: 12000, features: ["৬০ সেকেন্ড এক্সপ্লেইনার", "ভয়েস ওভার", "4K কোয়ালিটি"] },
      { id: "motion-enterprise", name: "এন্টারপ্রাইজ", price: 18000, originalPrice: 25000, features: ["৩ মিনিট+ অ্যানিমেশন", "3D এলিমেন্টস", "স্ক্রিপ্ট রাইটিং"] },
    ]
  },
  {
    category: "ল্যান্ডিং পেজ",
    packages: [
      { id: "lp-starter", name: "স্টার্টার", price: 1500, originalPrice: 2500, features: ["১ পেজ ডিজাইন", "মোবাইল রেস্পন্সিভ", "বেসিক অ্যানিমেশন"] },
      { id: "lp-premium", name: "প্রিমিয়াম", price: 2000, originalPrice: 3500, features: ["মাল্টি সেকশন", "A/B টেস্ট রেডি", "লিড ক্যাপচার ফর্ম"] },
      { id: "lp-business", name: "বিজনেস", price: 3000, originalPrice: 5000, features: ["ফানেল সেটআপ", "পেমেন্ট ইন্টিগ্রেশন", "CRM কানেক্ট"] },
    ]
  },
];

// Payment methods
const paymentMethods = [
  {
    id: "bkash",
    name: "বিকাশ",
    icon: Smartphone,
    color: "from-pink-500 to-pink-600",
    number: "01332052874",
    type: "পার্সোনাল",
    instructions: "Send Money করুন এই নম্বরে"
  },
  {
    id: "nagad",
    name: "নগদ",
    icon: Smartphone,
    color: "from-orange-500 to-orange-600",
    number: "01332052874",
    type: "পার্সোনাল",
    instructions: "Send Money করুন এই নম্বরে"
  },
  {
    id: "rocket",
    name: "রকেট",
    icon: Smartphone,
    color: "from-purple-500 to-purple-600",
    number: "013320528741",
    type: "পার্সোনাল",
    instructions: "Send Money করুন এই নম্বরে"
  },
  {
    id: "bank",
    name: "ব্যাংক ট্রান্সফার",
    icon: Building2,
    color: "from-blue-500 to-blue-600",
    details: {
      bankName: "Dutch Bangla Bank",
      accountName: "Web Creation BD",
      accountNumber: "1234567890123",
      branch: "সাভার শাখা",
      routingNumber: "090274590"
    },
    instructions: "ব্যাংক ট্রান্সফার করে স্লিপ পাঠান"
  },
];

const CheckoutPage = () => {
  const { items, removeItem, clearCart, totalPrice, totalSavings, addItem, isInCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "কপি করা হয়েছে!",
      description: `${text} ক্লিপবোর্ডে কপি হয়েছে`,
    });
  };

  const handleAddService = (pkg: typeof allServices[0]["packages"][0], category: string) => {
    addItem({
      id: pkg.id,
      serviceName: category,
      packageName: pkg.name,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      features: pkg.features,
    });
    toast({
      title: "সার্ভিস যোগ করা হয়েছে!",
      description: `${category} - ${pkg.name} কার্টে যোগ হয়েছে`,
    });
  };

  const handlePlaceOrder = () => {
    if (!customerName || !customerPhone) {
      toast({
        title: "তথ্য দিন",
        description: "নাম এবং ফোন নম্বর দেওয়া আবশ্যক",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPayment) {
      toast({
        title: "পেমেন্ট মেথড সিলেক্ট করুন",
        description: "অর্ডার কনফার্ম করতে পেমেন্ট মেথড বাছাই করুন",
        variant: "destructive",
      });
      return;
    }

    if (!transactionId && selectedPayment !== "bank") {
      toast({
        title: "ট্রানজেকশন আইডি দিন",
        description: "পেমেন্ট করে ট্রানজেকশন আইডি দিন",
        variant: "destructive",
      });
      return;
    }

    // Create WhatsApp message
    const servicesText = items.map(item => `• ${item.serviceName} - ${item.packageName}: ৳${item.price.toLocaleString()}`).join('\n');
    const message = `🛒 *নতুন অর্ডার*\n\n📋 *সার্ভিস:*\n${servicesText}\n\n💰 *মোট:* ৳${totalPrice.toLocaleString()}\n💵 *সেভিংস:* ৳${totalSavings.toLocaleString()}\n\n👤 *নাম:* ${customerName}\n📱 *ফোন:* ${customerPhone}\n${customerEmail ? `📧 *ইমেইল:* ${customerEmail}\n` : ''}💳 *পেমেন্ট:* ${paymentMethods.find(p => p.id === selectedPayment)?.name}\n🔢 *ট্রানজেকশন ID:* ${transactionId || 'ব্যাংক ট্রান্সফার'}\n${notes ? `\n📝 *নোট:* ${notes}` : ''}`;

    const whatsappUrl = `https://wa.me/8801332052874?text=${encodeURIComponent(message)}`;
    
    setOrderPlaced(true);
    clearCart();
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-24 pb-20">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bengali font-bold text-white mb-4">
              অর্ডার সফল হয়েছে!
            </h1>
            <p className="text-gray-400 font-bengali mb-8">
              আপনার অর্ডারের তথ্য WhatsApp এ পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।
            </p>
            <Link to="/">
              <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bengali">
                হোমে ফিরে যান
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
          {/* Back Link */}
          <Link to="/" className="inline-flex items-center gap-2 text-red-400 hover:text-white mb-8 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bengali">হোমে ফিরে যান</span>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bengali font-bold text-white flex items-center gap-3">
                  <ShoppingCart className="w-8 h-8 text-red-500" />
                  আপনার কার্ট
                </h1>
                <Button
                  variant="outline"
                  onClick={() => setShowServicePicker(!showServicePicker)}
                  className="border-red-500 text-red-500 hover:bg-red-500/10 font-bengali"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  সার্ভিস যোগ করুন
                </Button>
              </div>

              {/* Service Picker */}
              {showServicePicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-6"
                >
                  <h3 className="text-lg font-bengali font-bold text-white">সার্ভিস বাছাই করুন</h3>
                  {allServices.map((service) => (
                    <div key={service.category}>
                      <h4 className="text-red-400 font-bengali font-semibold mb-3">{service.category}</h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {service.packages.map((pkg) => (
                          <button
                            key={pkg.id}
                            onClick={() => handleAddService(pkg, service.category)}
                            disabled={isInCart(pkg.id)}
                            className={`p-4 rounded-xl text-left transition-all ${
                              isInCart(pkg.id)
                                ? "bg-green-900/30 border border-green-500/30 cursor-not-allowed"
                                : "bg-gray-800/50 border border-gray-700 hover:border-red-500/50 hover:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bengali font-medium text-white">{pkg.name}</span>
                              {isInCart(pkg.id) && <Check className="w-4 h-4 text-green-500" />}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-red-400 font-bold">৳{pkg.price.toLocaleString()}</span>
                              <span className="text-gray-500 line-through text-sm">৳{pkg.originalPrice.toLocaleString()}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Cart Items List */}
              {items.length === 0 ? (
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bengali font-bold text-white mb-2">কার্ট খালি</h3>
                  <p className="text-gray-400 font-bengali mb-4">সার্ভিস যোগ করতে উপরের বাটনে ক্লিক করুন</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bengali">
                              {item.serviceName}
                            </span>
                            <span className="text-white font-bengali font-semibold">{item.packageName}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.features.map((feature, index) => (
                              <span key={index} className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded font-bengali">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 line-through text-sm">৳{item.originalPrice.toLocaleString()}</span>
                            <span className="text-xl font-bold text-red-400">৳{item.price.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="mt-2 text-red-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Payment Methods */}
              {items.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bengali font-bold text-white mb-6">পেমেন্ট মেথড</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`p-4 rounded-xl border transition-all text-left ${
                          selectedPayment === method.id
                            ? "border-red-500 bg-red-500/10"
                            : "border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center`}>
                            <method.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white font-bengali font-semibold">{method.name}</span>
                          {selectedPayment === method.id && (
                            <Check className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                        </div>
                        <p className="text-gray-400 text-sm font-bengali">{method.instructions}</p>
                      </button>
                    ))}
                  </div>

                  {/* Payment Details */}
                  {selectedPayment && selectedPayment !== "bank" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 p-4 bg-gray-800/50 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 font-bengali">নম্বর:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-lg">
                            {paymentMethods.find(m => m.id === selectedPayment)?.number}
                          </span>
                          <button
                            onClick={() => copyToClipboard(paymentMethods.find(m => m.id === selectedPayment)?.number || "")}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400 font-bengali">টাইপ:</span>
                        <span className="text-white font-bengali">
                          {paymentMethods.find(m => m.id === selectedPayment)?.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-bengali">পেমেন্ট করে ট্রানজেকশন আইডি নিচে দিন</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Bank Details */}
                  {selectedPayment === "bank" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 p-4 bg-gray-800/50 rounded-xl space-y-3"
                    >
                      {Object.entries(paymentMethods.find(m => m.id === "bank")?.details || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-gray-400 font-bengali capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white">{value}</span>
                            <button
                              onClick={() => copyToClipboard(value as string)}
                              className="p-1 hover:bg-gray-700 rounded transition-colors"
                            >
                              <Copy className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Transaction ID Input */}
                  {selectedPayment && (
                    <div className="mt-6">
                      <label className="block text-gray-400 font-bengali mb-2">
                        {selectedPayment === "bank" ? "ট্রান্সফার রেফারেন্স / স্লিপ নম্বর" : "ট্রানজেকশন আইডি *"}
                      </label>
                      <Input
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder={selectedPayment === "bank" ? "ব্যাংক স্লিপ নম্বর (ঐচ্ছিক)" : "TxID লিখুন..."}
                        className="bg-gray-800 border-gray-700 text-white font-mono"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-bengali font-bold text-white">অর্ডার সামারি</h3>
                
                {/* Customer Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 font-bengali text-sm mb-2">আপনার নাম *</label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="নাম লিখুন..."
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bengali text-sm mb-2">ফোন নম্বর *</label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bengali text-sm mb-2">ইমেইল (ঐচ্ছিক)</label>
                    <Input
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bengali text-sm mb-2">অতিরিক্ত নোট (ঐচ্ছিক)</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="বিশেষ কোন নির্দেশনা থাকলে লিখুন..."
                      className="bg-gray-800 border-gray-700 text-white resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Price Summary */}
                <div className="border-t border-gray-800 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-400">
                    <span className="font-bengali">সার্ভিস ({items.length}টি)</span>
                    <span>৳{(totalPrice + totalSavings).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span className="font-bengali">ডিসকাউন্ট</span>
                    <span>- ৳{totalSavings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white text-xl font-bold pt-2 border-t border-gray-800">
                    <span className="font-bengali">মোট</span>
                    <span className="text-red-400">৳{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={items.length === 0}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bengali font-bold py-6 text-lg rounded-xl disabled:opacity-50"
                >
                  অর্ডার কনফার্ম করুন
                  <ExternalLink className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-center text-gray-500 text-xs font-bengali">
                  অর্ডার কনফার্ম করলে WhatsApp এ চলে যাবে
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
