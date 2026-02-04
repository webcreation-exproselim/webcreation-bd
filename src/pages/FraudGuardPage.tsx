import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, CheckCircle, Clock, Phone, Fingerprint, 
  FileText, Palette, ArrowRight, Zap, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const features = [
  {
    icon: Shield,
    title: "Fake Order Protection",
    titleBn: "ফেক অর্ডার প্রতিরোধ",
    description: "Automatically block repeat and fraudulent orders",
  },
  {
    icon: Fingerprint,
    title: "Device Fingerprinting",
    titleBn: "ডিভাইস ফিঙ্গারপ্রিন্টিং",
    description: "Track unique devices to prevent multi-account abuse",
  },
  {
    icon: Clock,
    title: "Minute-Level Control",
    titleBn: "মিনিট লেভেল কন্ট্রোল",
    description: "Set cooldown from 5 minutes to 90 days",
  },
  {
    icon: Phone,
    title: "Phone & IP Blocking",
    titleBn: "ফোন ও IP ব্লকিং",
    description: "Blacklist specific phone numbers and IP addresses",
  },
  {
    icon: FileText,
    title: "Real-time Logs",
    titleBn: "রিয়েল-টাইম লগ",
    description: "Monitor all order attempts with detailed logs",
  },
  {
    icon: Palette,
    title: "Beautiful Popups",
    titleBn: "সুন্দর পপআপ",
    description: "Professional Bengali/English popup messages",
  },
];

const steps = [
  { 
    step: 1, 
    title: "Account তৈরি করুন", 
    description: "বিনামূল্যে রেজিস্ট্রেশন করুন" 
  },
  { 
    step: 2, 
    title: "Plan কিনুন", 
    description: "Monthly বা Yearly প্ল্যান বেছে নিন" 
  },
  { 
    step: 3, 
    title: "Plugin ডাউনলোড করুন", 
    description: "আপনার API Key সহ plugin ডাউনলোড করুন" 
  },
  { 
    step: 4, 
    title: "WooCommerce-এ ইন্সটল করুন", 
    description: "WordPress-এ plugin আপলোড করে সক্রিয় করুন" 
  },
];

export default function FraudGuardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-slate-950">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">WooCommerce Anti-Fraud System</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 font-bengali">
              <span className="text-cyan-400">WCBD</span> Fraud Guard
            </h1>
            
            <p className="text-xl sm:text-2xl text-white/70 mb-4 font-bengali">
              আপনার WooCommerce স্টোর রক্ষা করুন
            </p>
            
            <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10">
              Fake order, repeat order এবং fraudulent customers থেকে আপনার ব্যবসা সুরক্ষিত রাখুন
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg font-bengali">
                  শুরু করুন
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                প্ল্যান দেখুন
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-bengali">
              কেন <span className="text-cyan-400">WCBD Fraud Guard</span>?
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              বাংলাদেশের WooCommerce স্টোরগুলোর জন্য সেরা anti-fraud সলিউশন
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 font-bengali">{feature.titleBn}</h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-bengali">
              সাশ্রয়ী মূল্যে শুরু করুন
            </h2>
            <p className="text-white/60">
              আপনার প্রয়োজন অনুযায়ী প্ল্যান বেছে নিন
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Monthly Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-400 font-medium">Monthly</span>
                </div>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">৳১০০</span>
                  <span className="text-white/50">/মাস</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    <span>1,000 API requests</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    <span>Unlimited blacklist entries</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    <span>Real-time fraud logs</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    <span>Plugin access</span>
                  </li>
                </ul>
                
                <Link to="/auth">
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
                    শুরু করুন
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Yearly Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-2 border-cyan-500/50 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />
              <div className="absolute -top-1 right-6">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-b-lg">
                  42% সেভ!
                </span>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-400 font-medium">Yearly</span>
                </div>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">৳৬৯৯</span>
                  <span className="text-white/50">/বছর</span>
                  <div className="text-sm text-white/40 line-through mt-1">৳১,২০০/বছর</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    <span>15,000 API requests</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    <span>Unlimited blacklist entries</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    <span>Real-time fraud logs</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    <span>Plugin access</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
                
                <Link to="/auth">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                    শুরু করুন
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-bengali">
              কীভাবে কাজ করে?
            </h2>
            <p className="text-white/60">
              মাত্র ৪টি সহজ ধাপে শুরু করুন
            </p>
          </motion.div>
          
          <div className="space-y-6">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white font-bengali">{item.title}</h3>
                  <p className="text-white/50 font-bengali">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 text-center"
          >
            <Lock className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-bengali">
              আজই আপনার স্টোর সুরক্ষিত করুন
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              মাত্র ৳১০০/মাস থেকে শুরু করুন এবং fake order থেকে মুক্তি পান
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-10 py-6 text-lg font-bengali">
                ফ্রি রেজিস্ট্রেশন করুন
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}