import { motion } from "framer-motion";
import { Code, Palette, Video, Activity, Layout, Check, Star, Zap, Crown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EditableText } from "./EditableText";

type ServicePricing = {
  id: string;
  label: string;
  icon: typeof Code;
  gradient: string;
  planCount: number;
};

type PricingPlan = {
  name: string;
  price: string;
  priceNum: number;
  originalPrice?: string;
  originalPriceNum?: number;
  discount?: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: typeof Star;
  note?: string;
};

const servicePricingMeta: ServicePricing[] = [
  { id: "web-development", label: "ওয়েব ডেভেলপমেন্ট", icon: Code, gradient: "from-green-500 to-emerald-400", planCount: 3 },
  { id: "graphics-design", label: "গ্রাফিক্স ডিজাইন", icon: Palette, gradient: "from-purple-500 to-pink-400", planCount: 3 },
  { id: "video-editing", label: "ভিডিও এডিটিং", icon: Video, gradient: "from-red-500 to-orange-400", planCount: 3 },
  { id: "motion-graphics", label: "মোশন গ্রাফিক্স", icon: Activity, gradient: "from-yellow-500 to-amber-400", planCount: 3 },
  { id: "landing-page", label: "ল্যান্ডিং পেজ", icon: Layout, gradient: "from-teal-500 to-cyan-400", planCount: 3 },
];

// Default plan data for fallback
const defaultPlansData: Record<string, PricingPlan[]> = {
  "web-development": [
    {
      name: "Starter Package",
      price: "৫,০০০",
      priceNum: 5000,
      originalPrice: "৮,০০০",
      originalPriceNum: 8000,
      discount: "37%",
      period: "টাকা",
      description: "ছোট ব্যবসার জন্য পারফেক্ট",
      icon: Star,
      note: "No Advanced Payment",
      features: [".SHOP Domain - 01 Year", "10 GB Bdix NVME Hosting SSD", "Hosting 01 Year", "cPanel & Full Access", "Fraud Customer Checker", "Courier Integration", "Order Invoice Print", "Live Chat Setup", "Pixel & Conversation API Setup", "Sales Converting Unique Design", "Fast Loading Speed", "Easy Order Management", "Easy Checkout", "Limited Categories", "Limited Product", "24/7 Priority Support", "Video Tutorial"],
    },
    {
      name: "Premium Package",
      price: "১৫,০০০",
      priceNum: 15000,
      originalPrice: "২০,০০০",
      originalPriceNum: 20000,
      discount: "25%",
      period: "টাকা",
      description: "সেরা ভ্যালু প্যাকেজ",
      icon: Zap,
      popular: true,
      note: "Domain Hosting Fee in Advance",
      features: [".COM Domain - 01 Year", "20 GB Bdix NVME Hosting SSD", "Hosting 01 Year", "cPanel & Full Access", "Fraud Customer Checker", "Courier Integration", "Order Invoice Print", "Live Chat Setup", "Pixel & Conversation API Setup", "Mobile Friendly & Unique Design", "Super Fast Loading Speed", "In Stock Management", "Easy Order Management", "Easy Checkout", "Unlimited Categories", "Unlimited Product", "Advanced Security System", "Facebook Page Full Setup", "Facebook Page Logo Cover Setup", "Website Banner & Logo Setup", "Premium Theme & Pro Plugin", "24/7 Priority Support", "Video Tutorial"],
    },
    {
      name: "Business Package",
      price: "৮,০০০",
      priceNum: 8000,
      originalPrice: "১৫,০০০",
      originalPriceNum: 15000,
      discount: "47%",
      period: "টাকা",
      description: "বিজনেস গ্রোথের জন্য",
      icon: Crown,
      note: "Domain Hosting Fee in Advance",
      features: [".COM Domain - 01 Year", "20 GB Bdix NVME Hosting SSD", "Hosting 01 Year", "cPanel & Full Access", "Fraud Customer Checker", "Courier Integration", "Order Invoice Print", "Live Chat Setup", "Pixel & Conversation API Setup", "Mobile Friendly & Unique Design", "Super Fast Loading Speed", "In Stock Management", "Easy Order Management", "Easy Checkout", "Unlimited Categories", "Unlimited Product", "Facebook Page Logo Cover Setup", "Website Banner & Logo Setup", "Video Tutorial", "Premium Theme & Pro Plugin", "24/7 Priority Support"],
    },
  ],
  "graphics-design": [
    {
      name: "Startup Package",
      price: "১,৭০০",
      priceNum: 1700,
      originalPrice: "২,০০০",
      originalPriceNum: 2000,
      discount: "15%",
      period: "টাকা",
      description: "স্টার্টআপ বিজনেসের জন্য",
      icon: Star,
      note: "7 Days money back guarantee",
      features: ["Logo Design Concept 2", "Business Card Concept 1", "Facebook Cover Photo", "Facebook Post Image 1", "Facebook boost Photo 1", "PNG/JPG/PDF File Formats", "1 Correction Revisions", "All Source File", "3 Days Delivery", "100% Satisfaction Guarantee"],
    },
    {
      name: "Business Package",
      price: "৩,০০০",
      priceNum: 3000,
      originalPrice: "৪,০০০",
      originalPriceNum: 4000,
      discount: "25%",
      period: "টাকা",
      description: "গ্রোয়িং বিজনেসের জন্য",
      icon: Zap,
      popular: true,
      note: "7 Days money back guarantee",
      features: ["Logo Design Concept 3", "Business Card Concept 2", "Facebook Cover Photo 3", "Facebook Post Image 3", "Facebook boost Photo 3", "Promotion Animation Video 10s", "PNG/JPG/PDF File Formats", "1 Correction Revisions", "All Source File", "2 Days Delivery", "100% Satisfaction Guarantee"],
    },
    {
      name: "Corporate Package",
      price: "৫,০০০",
      priceNum: 5000,
      originalPrice: "৭,০০০",
      originalPriceNum: 7000,
      discount: "29%",
      period: "টাকা",
      description: "বড় প্রতিষ্ঠানের জন্য",
      icon: Crown,
      note: "7 Days money back guarantee",
      features: ["Logo Design Concept 5", "Business Card Concept 3", "Facebook Cover Photo 4", "Facebook boost Photo 5", "Promotion Animation Video 20s", "Social Media Banner 7", "PNG/JPG/PDF File Formats", "All Source File", "3 Days Delivery", "100% Satisfaction Guarantee"],
    },
  ],
  "video-editing": [
    {
      name: "বেসিক",
      price: "৩,০০০",
      priceNum: 3000,
      period: "টাকা",
      description: "সিম্পল ভিডিও এডিট",
      icon: Star,
      features: ["৩ মিনিট পর্যন্ত", "বেসিক কাট ও ট্রানজিশন", "ব্যাকগ্রাউন্ড মিউজিক", "টেক্সট অ্যানিমেশন", "২টি রিভিশন"],
    },
    {
      name: "স্ট্যান্ডার্ড",
      price: "৭,০০০",
      priceNum: 7000,
      period: "টাকা",
      description: "প্রফেশনাল এডিটিং",
      icon: Zap,
      popular: true,
      features: ["৫ মিনিট পর্যন্ত", "অ্যাডভান্সড ট্রানজিশন", "কালার গ্রেডিং", "সাউন্ড ডিজাইন", "মোশন টেক্সট", "৫টি রিভিশন"],
    },
    {
      name: "প্রিমিয়াম",
      price: "১৫,০০০+",
      priceNum: 15000,
      period: "টাকা",
      description: "সিনেমাটিক কোয়ালিটি",
      icon: Crown,
      features: ["১০+ মিনিট ভিডিও", "VFX ও স্পেশাল ইফেক্ট", "প্রফেশনাল কালার গ্রেড", "কাস্টম মিউজিক", "3D এলিমেন্ট", "আনলিমিটেড রিভিশন"],
    },
  ],
  "motion-graphics": [
    {
      name: "বেসিক",
      price: "৫,০০০",
      priceNum: 5000,
      period: "টাকা",
      description: "সিম্পল অ্যানিমেশন",
      icon: Star,
      features: ["লোগো অ্যানিমেশন", "১৫ সেকেন্ড পর্যন্ত", "HD কোয়ালিটি", "২টি রিভিশন"],
    },
    {
      name: "স্ট্যান্ডার্ড",
      price: "১২,০০০",
      priceNum: 12000,
      period: "টাকা",
      description: "এক্সপ্লেইনার ভিডিও",
      icon: Zap,
      popular: true,
      features: ["৬০ সেকেন্ড পর্যন্ত", "2D অ্যানিমেশন", "ভয়েসওভার সাপোর্ট", "কাস্টম ক্যারেক্টার", "৪K কোয়ালিটি", "৫টি রিভিশন"],
    },
    {
      name: "প্রিমিয়াম",
      price: "২৫,০০০+",
      priceNum: 25000,
      period: "টাকা",
      description: "ফুল প্রোডাকশন",
      icon: Crown,
      features: ["২+ মিনিট ভিডিও", "3D অ্যানিমেশন", "কাস্টম ক্যারেক্টার ডিজাইন", "প্রফেশনাল ভয়েসওভার", "সাউন্ড ইফেক্ট ও মিউজিক", "আনলিমিটেড রিভিশন"],
    },
  ],
  "landing-page": [
    {
      name: "Premium Package",
      price: "২,০০০",
      priceNum: 2000,
      originalPrice: "৩,২০০",
      originalPriceNum: 3200,
      discount: "40%",
      period: "টাকা",
      description: "ফুল ফিচার ল্যান্ডিং পেজ",
      icon: Crown,
      note: "No Advanced Payment",
      features: [".SHOP Domain - 01 Year", "10 GB Bdix NVME Hosting SSD", "Hosting 01 Year", "cPanel & Full Access", "Fraud Customer Checker", "Courier Integration", "Order Invoice Print", "Live Chat Setup", "Pixel & Conversation API Setup", "Sales Converting Unique Design", "Fast Loading Speed", "Easy Order Management", "Easy Checkout", "Thank You Page", "Pro Plugin", "24/7 Priority Support", "Video Tutorial"],
    },
    {
      name: "Business Package",
      price: "৩,০০০",
      priceNum: 3000,
      originalPrice: "৪,২০০",
      originalPriceNum: 4200,
      discount: "30%",
      period: "টাকা",
      description: "বিজনেস গ্রোথের জন্য আদর্শ",
      icon: Zap,
      popular: true,
      note: "Domain Hosting Fee in Advance",
      features: [".COM Domain - 01 Year", "10 GB Bdix NVME Hosting SSD", "Hosting 01 Year", "cPanel & Full Access", "Fraud Customer Checker", "Courier Integration", "Order Invoice Print", "Live Chat Setup", "Pixel & Conversation API Setup", "Sales Converting Unique Design", "Super Fast Loading Speed", "Easy Order Management", "Easy Checkout", "Thank You Page", "Pro Plugin", "24/7 Priority Support", "2 Time Revision", "Video Tutorial"],
    },
    {
      name: "Starter Package",
      price: "১,৫০০",
      priceNum: 1500,
      originalPrice: "২,০০০",
      originalPriceNum: 2000,
      discount: "40%",
      period: "টাকা",
      description: "বেসিক ল্যান্ডিং পেজ",
      icon: Star,
      note: "No Advanced Payment",
      features: ["Domain ❌", "Hosting ❌", "Fraud Customer Checker ❌", "Courier Integration", "Order Invoice Print", "Live Chat Setup", "Pixel & Conversation API Setup", "Sales Converting Unique Design", "Easy Order Management", "Easy Checkout", "Thank You Page", "Pro Plugin", "24/7 Support", "3 Time Revision", "Video Tutorial"],
    },
  ],
};

const planIcons = [Star, Zap, Crown];

const PricingCard = ({ 
  plan, 
  gradient, 
  index, 
  serviceId,
  serviceLabel,
  onOrder,
  content,
}: { 
  plan: PricingPlan; 
  gradient: string; 
  index: number;
  serviceId: string;
  serviceLabel: string;
  onOrder: (plan: PricingPlan, serviceId: string, serviceLabel: string) => void;
  content: Record<string, string>;
}) => {
  const planKey = `${serviceId}_plan_${index}`;
  
  // Get editable values from content
  const planName = content[`${planKey}_name`] || plan.name;
  const planPrice = content[`${planKey}_price`] || plan.price;
  const planOriginalPrice = content[`${planKey}_original_price`] || plan.originalPrice || "";
  const planDiscount = content[`${planKey}_discount`] || plan.discount || "";
  const planDescription = content[`${planKey}_description`] || plan.description;
  const planNote = content[`${planKey}_note`] || plan.note || "";

  const getFeatureValue = (featureIndex: number, fallback: string) => {
    const key = `${planKey}_feature_${featureIndex}`;
    return content[key] ?? fallback;
  };

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
      {planDiscount && (
        <div className="absolute -top-5 -right-3 z-20">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center shadow-lg shadow-red-500/40 border-2 border-red-400">
              <span className="text-white font-bold text-lg leading-none">
                <EditableText page="home" section="pricing" contentKey={`${planKey}_discount`} value={planDiscount} />
              </span>
              <span className="text-white text-xs font-bold">OFF</span>
            </div>
          </div>
        </div>
      )}

      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 text-black text-xs font-bengali font-bold shadow-lg shadow-yellow-400/30">
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
      <div className={`relative bg-black/80 backdrop-blur-sm rounded-2xl p-6 border h-full flex flex-col ${
        plan.popular 
          ? 'border-yellow-400/50' 
          : 'border-white/10 group-hover:border-white/20'
      } transition-all duration-300`}>
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <plan.icon className="w-full h-full text-white" />
        </div>

        {/* Plan Name */}
        <h4 className="text-lg font-bengali font-bold text-white mb-2">
          <EditableText page="home" section="pricing" contentKey={`${planKey}_name`} value={planName} />
        </h4>
        
        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {planOriginalPrice && (
              <span className="text-lg text-white/40 line-through font-bengali">
                ৳<EditableText page="home" section="pricing" contentKey={`${planKey}_original_price`} value={planOriginalPrice} />
              </span>
            )}
            <span className="text-3xl sm:text-4xl font-bold text-gradient-gold">
              ৳<EditableText page="home" section="pricing" contentKey={`${planKey}_price`} value={planPrice} />
            </span>
          </div>
          <span className="text-white/60 font-bengali text-sm">{plan.period}</span>
        </div>

        {/* Description */}
        <p className="text-white/70 font-bengali text-sm mb-4">
          <EditableText page="home" section="pricing" contentKey={`${planKey}_description`} value={planDescription} />
        </p>

        {/* Features with scroll */}
        <div className="mb-4 flex-grow max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2">
          <ul className="space-y-2">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-white/80 font-bengali text-xs">
                  <EditableText
                    page="home"
                    section="pricing"
                    contentKey={`${planKey}_feature_${idx}`}
                    value={getFeatureValue(idx, feature)}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Note */}
        {planNote && (
          <div className={`mb-4 px-3 py-2 rounded-lg text-center text-xs font-bengali ${
            planNote.includes("No Advanced") 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            <EditableText page="home" section="pricing" contentKey={`${planKey}_note`} value={planNote} />
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={() => onOrder(plan, serviceId, serviceLabel)}
          className={`w-full font-bengali ${
            plan.popular
              ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-black hover:shadow-lg hover:shadow-yellow-400/30'
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
          } transition-all duration-300`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          অর্ডার করুন
        </Button>
      </div>
    </motion.div>
  );
};

export const PricingSection = () => {
  const [activeService, setActiveService] = useState("web-development");
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
  const { toast } = useToast();
  
  // Build fallback content dynamically for all services and plans
  const fallbackContent = useMemo(() => {
    const content: Record<string, string> = {
      badge_text: "সাশ্রয়ী মূল্যে সেরা সার্ভিস",
      section_title_start: "আমাদের",
      section_title_highlight: "প্রাইসিং",
      section_title_end: "প্ল্যান",
      section_subtitle: "আপনার বাজেট অনুযায়ী সেরা প্ল্যান বেছে নিন",
      custom_title: "কাস্টম প্যাকেজ দরকার?",
      custom_description: "আপনার প্রয়োজন অনুযায়ী কাস্টম প্যাকেজ তৈরি করতে আমাদের সাথে যোগাযোগ করুন",
      custom_button: "যোগাযোগ করুন 01332052874",
    };
    
    // Add fallback for each service's plans
    Object.entries(defaultPlansData).forEach(([serviceId, plans]) => {
      plans.forEach((plan, idx) => {
        const planKey = `${serviceId}_plan_${idx}`;
        content[`${planKey}_name`] = plan.name;
        content[`${planKey}_price`] = plan.price;
        content[`${planKey}_original_price`] = plan.originalPrice || "";
        content[`${planKey}_discount`] = plan.discount || "";
        content[`${planKey}_description`] = plan.description;
        content[`${planKey}_note`] = plan.note || "";

        plan.features.forEach((feature, featureIdx) => {
          content[`${planKey}_feature_${featureIdx}`] = feature;
        });
      });
    });
    
    return content;
  }, []);
  
  const { content } = useSiteContent("home", "pricing", fallbackContent);

  // Get current service and its plans
  const currentServiceMeta = servicePricingMeta.find(s => s.id === activeService);
  const currentPlans = defaultPlansData[activeService] || [];

  const handleOrder = (plan: PricingPlan, serviceId: string, serviceLabel: string) => {
    const itemId = `${serviceId}-${plan.name}`;
    
    if (!isInCart(itemId)) {
      addItem({
        id: itemId,
        serviceName: serviceLabel,
        packageName: plan.name,
        price: plan.priceNum,
        originalPrice: plan.originalPriceNum || plan.priceNum,
        features: plan.features,
      });
      toast({ title: "কার্টে যোগ হয়েছে!", description: `${serviceLabel} - ${plan.name}` });
    }
    
    navigate('/checkout');
  };

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gradient-to-b from-black via-black/95 to-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hex-pattern opacity-20" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-red-500/20 border border-yellow-400/30 mb-6"
          >
            <span className="text-yellow-400">💰</span>
            <span className="text-sm sm:text-base text-white font-bengali font-medium">
              <EditableText page="home" section="pricing" contentKey="badge_text" value={content.badge_text} />
            </span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bengali font-bold text-white mb-4">
            <EditableText page="home" section="pricing" contentKey="section_title_start" value={content.section_title_start} />{" "}
            <span className="text-gradient-gold">
              <EditableText page="home" section="pricing" contentKey="section_title_highlight" value={content.section_title_highlight} />
            </span>{" "}
            <EditableText page="home" section="pricing" contentKey="section_title_end" value={content.section_title_end} />
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-bengali">
            <EditableText page="home" section="pricing" contentKey="section_subtitle" value={content.section_subtitle} multiline />
          </p>
        </motion.div>

        {/* Service Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 md:mb-12"
        >
          {servicePricingMeta.map((service) => (
            <button
              key={service.id}
              onClick={() => setActiveService(service.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full font-bengali text-sm sm:text-base font-medium
                transition-all duration-300
                ${activeService === service.id 
                  ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-black shadow-lg shadow-yellow-400/25' 
                  : 'bg-black/60 text-white/80 border border-white/10 hover:border-yellow-400/50 hover:text-white'
                }
              `}
            >
              <service.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{service.label}</span>
              <span className="sm:hidden">{service.label.split(' ')[0]}</span>
            </button>
          ))}
        </motion.div>

        {/* Pricing Cards */}
        {currentServiceMeta && (
          <motion.div
            key={activeService}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {currentPlans.map((plan, index) => (
              <PricingCard
                key={`${activeService}-${index}`}
                plan={plan}
                gradient={currentServiceMeta.gradient}
                index={index}
                serviceId={currentServiceMeta.id}
                serviceLabel={currentServiceMeta.label}
                onOrder={handleOrder}
                content={content}
              />
            ))}
          </motion.div>
        )}

        {/* Custom Package CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 md:mt-16"
        >
          <div className="inline-block p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-yellow-400/10 to-red-500/10 border border-yellow-400/30">
            <h3 className="text-xl sm:text-2xl font-bengali font-bold text-white mb-3">
              <EditableText page="home" section="pricing" contentKey="custom_title" value={content.custom_title} />
            </h3>
            <p className="text-white/70 font-bengali text-sm sm:text-base mb-4 max-w-md">
              <EditableText page="home" section="pricing" contentKey="custom_description" value={content.custom_description} multiline />
            </p>
            <Button 
              asChild
              className="bg-gradient-to-r from-yellow-400 to-red-500 text-black font-bengali hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300"
            >
              <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
                <EditableText page="home" section="pricing" contentKey="custom_button" value={content.custom_button} />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
