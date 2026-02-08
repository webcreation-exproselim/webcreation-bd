import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, CheckCircle, Clock, Phone, Fingerprint, 
  FileText, ArrowRight, Zap, Lock, ShoppingCart,
  RefreshCw, Timer, Smartphone, AlertTriangle, Eye,
  Star, TrendingUp, ArrowUpCircle, Sparkles, Globe,
  Search, BarChart3, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const features = [
  {
    icon: Shield,
    title: "Fake Order Protection",
    titleBn: "ফেক অর্ডার প্রতিরোধ",
    description: "Automatically block repeat and fraudulent orders with smart detection",
    gradient: "from-cyan-500 to-blue-500",
    bgGlow: "bg-cyan-500/20",
  },
  {
    icon: Fingerprint,
    title: "Device Fingerprinting",
    titleBn: "ডিভাইস ফিঙ্গারপ্রিন্টিং",
    description: "Track unique devices to prevent multi-account abuse",
    gradient: "from-purple-500 to-pink-500",
    bgGlow: "bg-purple-500/20",
  },
  {
    icon: Timer,
    title: "Cooldown Control",
    titleBn: "কুলডাউন কন্ট্রোল",
    description: "WordPress থেকে 5 মিনিট থেকে 90 দিন পর্যন্ত কুলডাউন সেট করুন",
    gradient: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/20",
  },
  {
    icon: Phone,
    title: "Phone & IP Blocking",
    titleBn: "ফোন ও IP ব্লকিং",
    description: "Blacklist specific phone numbers and IP addresses",
    gradient: "from-red-500 to-rose-500",
    bgGlow: "bg-red-500/20",
  },
  {
    icon: FileText,
    title: "Real-time Logs",
    titleBn: "রিয়েল-টাইম লগ",
    description: "Monitor all order attempts with detailed logs",
    gradient: "from-emerald-500 to-green-500",
    bgGlow: "bg-emerald-500/20",
  },
  {
    icon: Smartphone,
    title: "Incomplete Order Tracking",
    titleBn: "ইনকমপ্লিট অর্ডার ট্র্যাকিং",
    description: "Phone blur, checkout error ও page exit detect করুন real-time এ",
    gradient: "from-blue-500 to-indigo-500",
    bgGlow: "bg-blue-500/20",
  },
  {
    icon: AlertTriangle,
    title: "Smart Risk Detection",
    titleBn: "স্মার্ট রিস্ক ডিটেকশন",
    description: "5+ attempts থেকে automatic HIGH risk flag হবে",
    gradient: "from-yellow-500 to-amber-500",
    bgGlow: "bg-yellow-500/20",
  },
  {
    icon: ShoppingCart,
    title: "Cart Products Tracking",
    titleBn: "কার্ট প্রোডাক্ট ট্র্যাকিং",
    description: "Customer কি কি product কিনছিল সেটা দেখুন details সহ",
    gradient: "from-teal-500 to-cyan-500",
    bgGlow: "bg-teal-500/20",
  },
  {
    icon: RefreshCw,
    title: "Order Conversion",
    titleBn: "অর্ডার কনভার্শন",
    description: "Incomplete order কে real order এ convert করুন WordPress/Dashboard থেকে",
    gradient: "from-indigo-500 to-purple-500",
    bgGlow: "bg-indigo-500/20",
  },
  {
    icon: Eye,
    title: "Beautiful Popups",
    titleBn: "সুন্দর পপআপ",
    description: "Professional Bengali/English popup messages with WhatsApp contact",
    gradient: "from-pink-500 to-rose-500",
    bgGlow: "bg-pink-500/20",
  },
];

const monthlyFeatures = [
  "1,000 API requests",
  "Unlimited blacklist entries",
  "Real-time fraud logs",
  "Incomplete Order Tracking",
  "Cart Products Tracking",
  "Order Conversion",
  "Cooldown Control (WordPress)",
  "Smart Risk Detection",
  "Plugin access",
  "Standard support",
];

const yearlyFeatures = [
  "15,000 API requests",
  "Unlimited blacklist entries",
  "Real-time fraud logs",
  "Incomplete Order Tracking",
  "Cart Products Tracking",
  "Order Conversion",
  "Cooldown Control (WordPress)",
  "Smart Risk Detection",
  "Plugin access",
  "Priority support",
  "42% savings",
];

const steps = [
  { 
    step: 1, 
    title: "Account তৈরি করুন", 
    description: "বিনামূল্যে রেজিস্ট্রেশন করুন",
    icon: Globe,
    gradient: "from-blue-500 to-cyan-500",
  },
  { 
    step: 2, 
    title: "Plan কিনুন", 
    description: "Monthly বা Yearly প্ল্যান বেছে নিন",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
  },
  { 
    step: 3, 
    title: "Plugin ডাউনলোড করুন", 
    description: "আপনার API Key সহ plugin ডাউনলোড করুন",
    icon: ArrowUpCircle,
    gradient: "from-amber-500 to-orange-500",
  },
  { 
    step: 4, 
    title: "WooCommerce-এ ইন্সটল করুন", 
    description: "WordPress-এ plugin আপলোড করে সক্রিয় করুন",
    icon: CheckCircle,
    gradient: "from-emerald-500 to-green-500",
  },
];

const stats = [
  { value: "500+", label: "Protected Stores", icon: Shield },
  { value: "50K+", label: "Blocked Fraud", icon: AlertTriangle },
  { value: "99.9%", label: "Uptime", icon: TrendingUp },
  { value: "4.9★", label: "Rating", icon: Star },
];

export default function FraudGuardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-24 px-4 overflow-hidden">
        {/* Rich Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full px-5 py-2.5 mb-8 backdrop-blur-sm"
            >
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">বাংলাদেশের #1 WooCommerce Anti-Fraud System</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 font-bengali leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">WCBD</span>{" "}
              <span className="text-white">Fraud Guard</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-white/70 mb-4 font-bengali">
              আপনার WooCommerce স্টোর রক্ষা করুন
            </p>
            
            <p className="text-lg text-white/40 max-w-2xl mx-auto mb-10">
              Fake order, incomplete order tracking, order conversion এবং smart risk detection সহ সম্পূর্ণ anti-fraud সলিউশন
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-10 py-7 text-lg font-bengali rounded-2xl shadow-2xl shadow-cyan-500/30 font-bold">
                  শুরু করুন — ৳১০০/মাস
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 px-10 py-7 text-lg rounded-2xl backdrop-blur-sm"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                প্ল্যান দেখুন
              </Button>
            </div>

            {/* Stats Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                  <stat.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/50">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-4">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 font-bengali">
              কেন <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">WCBD Fraud Guard</span>?
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              বাংলাদেশের WooCommerce স্টোরগুলোর জন্য সেরা anti-fraud সলিউশন
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 hover:border-white/20 transition-all duration-500 hover:bg-white/[0.06]"
              >
                {/* Glow on hover */}
                <div className={`absolute inset-0 ${feature.bgGlow} rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1 font-bengali">{feature.titleBn}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent" />
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-xs font-bold uppercase tracking-wider">Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 font-bengali">
              সাশ্রয়ী মূল্যে <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">শুরু করুন</span>
            </h2>
            <p className="text-white/50 text-lg">
              সব features সব plan এ — আপনার প্রয়োজন অনুযায়ী প্ল্যান বেছে নিন
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Monthly Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-cyan-500/30 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-lg">Monthly</span>
                    <p className="text-white/40 text-xs font-bengali">নতুনদের জন্য আদর্শ</p>
                  </div>
                </div>
                
                <div className="mb-8">
                <span className="text-5xl font-bold text-white">৳১০০</span>
                <span className="text-white/40 text-lg">/মাস</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {monthlyFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-white/60 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/auth">
                  <Button className="w-full h-12 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bengali font-bold text-base transition-all group-hover:border-cyan-400/50 group-hover:text-cyan-300">
                    শুরু করুন
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Yearly Plan - Popular */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-3xl"
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-3xl" />
              <div className="absolute inset-[2px] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[22px]" />
              
              {/* Popular Badge */}
              <div className="absolute top-4 right-4 z-20">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-500/30">
                  <Star className="w-3.5 h-3.5" />
                  <span className="font-bengali">সবচেয়ে জনপ্রিয়</span>
                </div>
              </div>
              
              <div className="relative z-10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-lg">Yearly</span>
                    <p className="text-white/40 text-xs font-bengali">সাশ্রয়ী এবং সেরা মূল্য</p>
                  </div>
                </div>
                
                <div className="mb-2">
                <span className="text-5xl font-bold text-white">৳৬৯৯</span>
                <span className="text-white/40 text-lg">/বছর</span>
                </div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-sm text-white/30 line-through">৳১,২০০/বছর</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    42% সেভ
                  </span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {yearlyFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-white/70 text-sm">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${idx === yearlyFeatures.length - 1 ? 'text-amber-400' : 'text-cyan-400'}`} />
                      <span className={idx === yearlyFeatures.length - 1 ? 'font-semibold text-amber-300' : ''}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/auth">
                  <Button className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bengali font-bold text-base shadow-lg shadow-cyan-500/30 transition-all">
                    <Sparkles className="w-4 h-4 mr-2" />
                    শুরু করুন — সেরা মূল্যে
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Upgrade Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <ArrowUpCircle className="w-5 h-5 text-amber-400" />
              <p className="text-amber-300 font-bold font-bengali">যেকোনো সময় Plan পরিবর্তন করুন!</p>
            </div>
            <p className="text-amber-200/60 text-sm font-bengali">
              Monthly থেকে Yearly তে Upgrade বা Renew — Dashboard থেকে সহজেই করুন
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">How it works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 font-bengali">
              কীভাবে <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">কাজ করে</span>?
            </h2>
            <p className="text-white/50 text-lg">
              মাত্র ৪টি সহজ ধাপে শুরু করুন
            </p>
          </motion.div>
          
          <div className="space-y-5">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex items-center gap-5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${item.gradient} text-white`}>
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white font-bengali">{item.title}</h3>
                  <p className="text-white/40 font-bengali text-sm">{item.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-white/20 hidden sm:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Courier Check Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent" />
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-4">
              <Search className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">NEW FEATURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 font-bengali">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">WCBD Courier Check</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg font-bengali">
              অর্ডার নেওয়ার আগেই কাস্টমারের Courier Delivery History চেক করুন — ফেক অর্ডার কমান
            </p>
          </motion.div>

          {/* Courier Check Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {[
              {
                icon: Search,
                title: "ফোন নম্বর দিয়ে চেক",
                description: "কাস্টমারের ফোন নম্বর দিয়ে Courier History তাৎক্ষণিক চেক করুন",
                gradient: "from-cyan-500 to-blue-500",
              },
              {
                icon: BarChart3,
                title: "Success Rate দেখুন",
                description: "কত % অর্ডার ডেলিভারি হয়েছে, কত % রিটার্ন হয়েছে — সব তথ্য",
                gradient: "from-emerald-500 to-green-500",
              },
              {
                icon: Truck,
                title: "Courier-wise Breakdown",
                description: "Pathao, Steadfast, RedX, CarryBee — প্রতিটি কুরিয়ারের ডেটা আলাদাভাবে",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Shield,
                title: "Trust Label",
                description: "Green (Trusted), Yellow (Moderate), Red (Risky) — তাৎক্ষণিক রিস্ক লেভেল",
                gradient: "from-amber-500 to-orange-500",
              },
              {
                icon: Globe,
                title: "WooCommerce Plugin",
                description: "Order List এ সরাসরি Check বাটন + Single Order View তে Analytics",
                gradient: "from-blue-500 to-indigo-500",
              },
              {
                icon: Lock,
                title: "Domain-Locked License",
                description: "আপনার ওয়েবসাইটের জন্য নিরাপদ API Key — অন্য কেউ ব্যবহার করতে পারবে না",
                gradient: "from-red-500 to-rose-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-500 hover:bg-white/[0.06]"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 font-bengali">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-bengali">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Courier Check Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Monthly */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-white/10 rounded-3xl p-7 hover:border-cyan-500/30 transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">Monthly</span>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">৳২৪৯</span>
                <span className="text-white/40">/মাস</span>
              </div>
              <ul className="space-y-2 mb-6">
                {["500 API requests", "WooCommerce Plugin", "All Courier Support", "Domain-locked License"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/60 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <Button className="w-full h-11 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bengali font-bold transition-all">
                  শুরু করুন
                </Button>
              </Link>
            </motion.div>

            {/* Yearly */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-3xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 rounded-3xl" />
              <div className="absolute inset-[2px] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[22px]" />
              
              <div className="absolute top-4 right-4 z-20">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-lg">
                  <Star className="w-3 h-3" />
                  <span>BEST VALUE</span>
                </div>
              </div>
              
              <div className="relative z-10 p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-bold text-lg">Yearly</span>
                </div>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-white">৳৪৯৯</span>
                  <span className="text-white/40">/বছর</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-white/30 line-through">৳২,৯৮৮</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">83% সেভ</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {["5,000 API requests", "WooCommerce Plugin", "All Courier Support", "Domain-locked License", "Priority support"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                      <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bengali font-bold shadow-lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    শুরু করুন — সেরা মূল্যে
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
          >
            {/* CTA Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-700 to-purple-700" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 p-8 sm:p-14 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 font-bengali">
                আজই আপনার স্টোর সুরক্ষিত করুন
              </h2>
              <p className="text-white/70 mb-8 max-w-lg mx-auto text-lg">
                মাত্র ৳১০০/মাস থেকে শুরু করুন — সব features পান
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="bg-white hover:bg-gray-50 text-blue-700 px-10 py-7 text-lg font-bengali font-bold rounded-2xl shadow-2xl shadow-black/20">
                    ফ্রি রেজিস্ট্রেশন করুন
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
              <p className="text-white/40 text-sm mt-6 font-bengali">
                ✨ যেকোনো সময় Monthly থেকে Yearly তে Upgrade করুন
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
