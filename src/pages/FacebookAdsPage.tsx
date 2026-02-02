import { motion, AnimatePresence } from "framer-motion";
import { 
  Megaphone, ArrowLeft, CheckCircle, ArrowRight, Star, TrendingUp, 
  Target, BarChart3, Users, Zap, Award, Clock, Shield, Play,
  ExternalLink, X, ShoppingCart, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useDynamicPortfolio } from "@/hooks/useDynamicPortfolio";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EditableText } from "@/components/EditableText";

// Fallback Portfolio Items
const fallbackPortfolioItems = [
  {
    id: "fb1",
    title: "ই-কমার্স ক্যাম্পেইন",
    image_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
    description: "৩০০% ROI",
    category: "facebook-ads"
  },
  {
    id: "fb2",
    title: "রেস্টুরেন্ট প্রমোশন",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    description: "৫০০+ লিড",
    category: "facebook-ads"
  },
  {
    id: "fb3",
    title: "ফ্যাশন ব্র্যান্ড",
    image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop",
    description: "২x সেলস",
    category: "facebook-ads"
  },
  {
    id: "fb4",
    title: "লিড জেনারেশন",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    description: "৮০০+ লিড",
    category: "facebook-ads"
  },
  {
    id: "fb5",
    title: "অ্যাপ ইনস্টল",
    image_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
    description: "১০K+ ইনস্টল",
    category: "facebook-ads"
  },
  {
    id: "fb6",
    title: "ব্র্যান্ড অ্যাওয়ারনেস",
    image_url: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop",
    description: "৫০০K+ রিচ",
    category: "facebook-ads"
  },
];

// Reviews for sliding
const reviewsRow1 = [
  {
    id: 1,
    name: "রাহাত হোসেন",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ফেসবুক অ্যাডস সার্ভিস নেওয়ার পর আমার সেলস ৩ গুণ বেড়ে গেছে। অসাধারণ টার্গেটিং এবং ক্রিয়েটিভ!",
    business: "ই-কমার্স উদ্যোক্তা"
  },
  {
    id: 2,
    name: "সাবরিনা আক্তার",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "প্রতি মাসে কনসিস্টেন্ট রেজাল্ট পাচ্ছি। ROI অনেক ভালো এবং কাস্টমার সাপোর্টও চমৎকার।",
    business: "বিউটি ব্র্যান্ড মালিক"
  },
  {
    id: 3,
    name: "তানভীর আহমেদ",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "লোকাল টার্গেটিং করে অনেক কাস্টমার পেয়েছি। এক মাসেই ইনভেস্টমেন্ট উঠে গেছে।",
    business: "রেস্টুরেন্ট মালিক"
  },
  {
    id: 4,
    name: "নাফিসা বেগম",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "অনলাইন শপের জন্য পারফেক্ট অ্যাড ক্যাম্পেইন। প্রতিদিন অর্ডার আসছে!",
    business: "অনলাইন শপ মালিক"
  },
  {
    id: 5,
    name: "মোঃ সাইফুল",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "রিটার্গেটিং ক্যাম্পেইনে অনেক ভালো রেজাল্ট পেয়েছি। কস্ট পার লিড অনেক কম!",
    business: "সার্ভিস প্রোভাইডার"
  },
];

const reviewsRow2 = [
  {
    id: 6,
    name: "জাহিদ হাসান",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "A/B টেস্টিং করে বেস্ট পারফর্মিং অ্যাড খুঁজে বের করেছে। সেলস ৫ গুণ বেড়েছে!",
    business: "ড্রপশিপার"
  },
  {
    id: 7,
    name: "ফারহানা ইসলাম",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ভিডিও অ্যাড থেকে অনেক ভালো এনগেজমেন্ট পাচ্ছি। প্রফেশনাল সার্ভিস!",
    business: "কন্টেন্ট ক্রিয়েটর"
  },
  {
    id: 8,
    name: "আরিফ রহমান",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "লুকঅ্যালাইক অডিয়েন্স দিয়ে নতুন কাস্টমার পেয়েছি। গ্রেট স্ট্র্যাটেজি!",
    business: "স্টার্টআপ ফাউন্ডার"
  },
  {
    id: 9,
    name: "রুবিনা খাতুন",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ক্যারোসেল অ্যাড অনেক সুন্দর হয়েছে। প্রোডাক্ট শোকেস পারফেক্ট!",
    business: "বুটিক মালিক"
  },
  {
    id: 10,
    name: "সোহেল রানা",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "মেসেঞ্জার ক্যাম্পেইনে ডাইরেক্ট কাস্টমার পাচ্ছি। কনভার্সন রেট অসাধারণ!",
    business: "সেলস ম্যানেজার"
  },
];

// Pricing Plans
const pricingPlans = [
  {
    id: "fb-starter",
    name: "স্টার্টার",
    originalPrice: "৳৫,০০০",
    price: "৳৩,৫০০",
    priceNum: 3500,
    originalPriceNum: 5000,
    discount: "৩০% ছাড়",
    features: [
      "১টি ক্যাম্পেইন সেটআপ",
      "৫টি অ্যাড ক্রিয়েটিভ",
      "টার্গেট অডিয়েন্স রিসার্চ",
      "সাপ্তাহিক রিপোর্ট",
      "১ মাস সাপোর্ট",
    ],
  },
  {
    id: "fb-premium",
    name: "প্রিমিয়াম",
    originalPrice: "৳১০,০০০",
    price: "৳৭,০০০",
    priceNum: 7000,
    originalPriceNum: 10000,
    discount: "৩০% ছাড়",
    popular: true,
    features: [
      "৩টি ক্যাম্পেইন সেটআপ",
      "১৫টি অ্যাড ক্রিয়েটিভ",
      "অ্যাডভান্সড টার্গেটিং",
      "A/B টেস্টিং",
      "দৈনিক রিপোর্ট",
      "২ মাস সাপোর্ট",
    ],
  },
  {
    id: "fb-business",
    name: "বিজনেস",
    originalPrice: "৳২০,০০০",
    price: "৳১৫,০০০",
    priceNum: 15000,
    originalPriceNum: 20000,
    discount: "২৫% ছাড়",
    features: [
      "আনলিমিটেড ক্যাম্পেইন",
      "৩০+ অ্যাড ক্রিয়েটিভ",
      "ফুল ফানেল স্ট্র্যাটেজি",
      "রিটার্গেটিং সেটআপ",
      "২৪/৭ মনিটরিং",
      "৩ মাস সাপোর্ট",
    ],
  },
];

// Stats
const stats = [
  { value: "৫০০+", label: "সফল ক্যাম্পেইন", icon: TrendingUp },
  { value: "৩০০%", label: "এভারেজ ROI", icon: BarChart3 },
  { value: "১৫০+", label: "সন্তুষ্ট ক্লায়েন্ট", icon: Users },
  { value: "২৪/৭", label: "সাপোর্ট", icon: Clock },
];

// Features
const features = [
  {
    icon: Target,
    title: "প্রিসাইজ টার্গেটিং",
    description: "আপনার আইডিয়াল কাস্টমারদের সঠিকভাবে টার্গেট করি ডেমোগ্রাফিক্স, ইন্টারেস্ট এবং বিহেভিয়র এনালাইসিস করে।",
    gradient: "from-blue-500 to-cyan-400"
  },
  {
    icon: BarChart3,
    title: "ডেটা-ড্রিভেন স্ট্র্যাটেজি",
    description: "রিয়েল-টাইম ডেটা এনালাইসিস করে ক্যাম্পেইন অপটিমাইজ করি সর্বোচ্চ পারফরম্যান্সের জন্য।",
    gradient: "from-green-500 to-emerald-400"
  },
  {
    icon: Zap,
    title: "ক্রিয়েটিভ এক্সিলেন্স",
    description: "আই-ক্যাচিং গ্রাফিক্স এবং কপিরাইটিং যা আপনার অডিয়েন্সের মনোযোগ আকর্ষণ করে।",
    gradient: "from-yellow-500 to-orange-400"
  },
  {
    icon: Award,
    title: "প্রুভেন রেজাল্টস",
    description: "৫০০+ সফল ক্যাম্পেইন এবং ৩০০% এভারেজ ROI দিয়ে আমরা প্রমাণিত।",
    gradient: "from-purple-500 to-pink-400"
  },
  {
    icon: Shield,
    title: "ট্রান্সপারেন্ট রিপোর্টিং",
    description: "প্রতিদিন বা সাপ্তাহিক ডিটেইলড রিপোর্ট পাবেন যাতে সব মেট্রিক্স থাকবে।",
    gradient: "from-red-500 to-rose-400"
  },
  {
    icon: Users,
    title: "ডেডিকেটেড সাপোর্ট",
    description: "আপনার ক্যাম্পেইনের জন্য ডেডিকেটেড একাউন্ট ম্যানেজার থাকবে সব সময়।",
    gradient: "from-teal-500 to-cyan-400"
  },
];

// Review Card Component
const ReviewCard = ({ review }: { review: typeof reviewsRow1[0] }) => (
  <div className="min-w-[300px] sm:min-w-[350px] p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm border border-blue-400/20 hover:border-blue-400/50 transition-all duration-300 group">
    <div className="flex items-start gap-4 mb-4">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-sm opacity-60" />
        <Avatar className="w-14 h-14 relative border-2 border-blue-400/50 shadow-lg shadow-blue-400/20">
          <AvatarImage src={review.photo} alt={review.name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white font-bold">
            {review.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-white text-lg font-bengali">{review.name}</h4>
        <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium mt-1">
          {review.business}
        </span>
      </div>
    </div>
    
    <div className="flex gap-1 mb-3">
      {[...Array(review.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    
    <p className="text-gray-300 text-sm leading-relaxed font-bengali">
      "{review.review}"
    </p>
  </div>
);

// Infinite Slider Component
const InfiniteSlider = ({ 
  reviews, 
  direction 
}: { 
  reviews: typeof reviewsRow1; 
  direction: "left" | "right";
}) => {
  const duplicatedReviews = [...reviews, ...reviews];
  
  return (
    <div className="overflow-hidden py-4">
      <motion.div
        className="flex gap-4 sm:gap-6"
        animate={{
          x: direction === "right" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration: direction === "right" ? 20 : 18,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {duplicatedReviews.map((review, index) => (
          <ReviewCard key={`${review.id}-${index}`} review={review} />
        ))}
      </motion.div>
    </div>
  );
};

const FacebookAdsPage = () => {
  const { portfolioItems, loading: portfolioLoading } = useDynamicPortfolio("facebook-ads", fallbackPortfolioItems);
  const [selectedItem, setSelectedItem] = useState<typeof fallbackPortfolioItems[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem, isInCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const fallbackContent = useMemo(() => ({
    badge_text: "#1 ফেসবুক অ্যাডস এজেন্সি",
    hero_title_start: "ফেসবুক অ্যাডস দিয়ে",
    hero_title_highlight: "ব্যবসা বাড়ান",
    hero_subtitle: "প্রফেশনাল ফেসবুক অ্যাডস ম্যানেজমেন্ট সার্ভিস যা আপনার ব্যবসায়ের জন্য সর্বোচ্চ ROI নিশ্চিত করে। টার্গেটেড মার্কেটিং, ক্রিয়েটিভ ডিজাইন এবং ডেটা-ড্রিভেন অপটিমাইজেশন।",
    cta_order: "এখনই অর্ডার করুন",
    cta_consultation: "ফ্রি কনসালটেশন",
  }), []);
  
  const { content } = useSiteContent("facebook-ads", "hero", fallbackContent);

  const handleAddToCart = (plan: typeof pricingPlans[0]) => {
    if (isInCart(plan.id)) {
      navigate('/checkout');
      return;
    }
    addItem({
      id: plan.id,
      serviceName: "ফেসবুক অ্যাডস",
      packageName: plan.name,
      price: plan.priceNum,
      originalPrice: plan.originalPriceNum,
      features: plan.features,
    });
    toast({ title: "কার্টে যোগ হয়েছে!", description: `ফেসবুক অ্যাডস - ${plan.name}` });
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section with Blue Gradient */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900/50 to-black" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-8 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bengali">হোমে ফিরে যান</span>
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 mb-6">
                <Megaphone className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 font-bengali font-medium">
                  <EditableText page="facebook-ads" section="hero" contentKey="badge_text" value={content.badge_text} />
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bengali font-bold text-white mb-6 leading-tight">
                <EditableText page="facebook-ads" section="hero" contentKey="hero_title_start" value={content.hero_title_start} />{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  <EditableText page="facebook-ads" section="hero" contentKey="hero_title_highlight" value={content.hero_title_highlight} />
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-blue-100/80 font-bengali mb-8 leading-relaxed">
                <EditableText page="facebook-ads" section="hero" contentKey="hero_subtitle" value={content.hero_subtitle} multiline />
              </p>
              
              {/* Quick Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  "টার্গেট অডিয়েন্স রিসার্চ",
                  "ক্রিয়েটিভ অ্যাড ডিজাইন",
                  "A/B টেস্টিং",
                  "পারফরম্যান্স রিপোর্টিং",
                  "রিটার্গেটিং ক্যাম্পেইন",
                  "লুকঅ্যালাইক অডিয়েন্স",
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-white/80 font-bengali text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bengali font-bold text-lg px-8 py-6 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-blue-500/30">
                    এখনই অর্ডার করুন
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
                <Button variant="outline" className="border-blue-400/50 text-blue-300 hover:bg-blue-500/20 font-bengali px-8 py-6 rounded-xl">
                  ফ্রি কনসালটেশন নিন
                </Button>
              </div>
            </motion.div>
            
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/60 to-cyan-900/40 backdrop-blur-sm border border-blue-400/20 hover:border-blue-400/50 transition-all duration-300 group"
                >
                  <stat.icon className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent font-bengali">
                    {stat.value}
                  </h3>
                  <p className="text-blue-200/70 font-bengali text-sm mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-black via-blue-950/30 to-black relative overflow-hidden">
        <div className="absolute inset-0 tech-grid-pattern opacity-10" />
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-300 text-sm font-bengali mb-4">
              কেন আমাদের বেছে নেবেন?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bengali font-bold text-white mb-4">
              আমাদের <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">বিশেষত্ব</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 to-black border border-blue-400/20 hover:border-blue-400/50 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3.5 mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-bengali font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-blue-200/70 font-bengali text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-black to-blue-950/20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-300 text-sm font-bengali mb-4">
              🎯 সফল ক্যাম্পেইন
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bengali font-bold text-white mb-4">
              আমাদের <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">পোর্টফোলিও</span>
            </h2>
            <p className="text-blue-200/60 font-bengali max-w-2xl mx-auto">
              আমাদের সাম্প্রতিক সফল ফেসবুক অ্যাডস ক্যাম্পেইন গুলো দেখুন
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => {
                  setSelectedItem(item);
                  setIsModalOpen(true);
                }}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-900/60 to-transparent" />
                  
                  {/* Result Badge */}
                  {item.description && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold">
                      {item.description}
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-cyan-400 text-sm font-medium">{item.category}</span>
                    <h3 className="text-white font-bengali font-bold text-lg mt-1">{item.title}</h3>
                  </div>
                  
                  {/* Hover Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-400/40">
                      <ExternalLink className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section - Sliding */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-950/20 via-black to-black relative overflow-hidden">
        <div className="absolute inset-0 hex-pattern opacity-20" />
        
        <div className="relative z-10">
          <div className="text-center mb-12 px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-300 text-sm font-bengali mb-4">
                ⭐ ১৫০+ সন্তুষ্ট ক্লায়েন্ট
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-bengali">
                ক্লায়েন্টদের{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  মতামত
                </span>
              </h2>
              <p className="text-blue-200/60 max-w-2xl mx-auto font-bengali">
                আমাদের ফেসবুক অ্যাডস সার্ভিস গ্রহণকারী ক্লায়েন্টদের অভিজ্ঞতা
              </p>
            </motion.div>
          </div>

          {/* Sliding Reviews */}
          <div className="mb-4">
            <InfiniteSlider reviews={reviewsRow1} direction="right" />
          </div>
          <div>
            <InfiniteSlider reviews={reviewsRow2} direction="left" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-black to-blue-950/30 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-300 text-sm font-bengali mb-4">
              💰 সাশ্রয়ী প্যাকেজ
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bengali font-bold text-white mb-4">
              প্যাকেজ <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">প্রাইসিং</span>
            </h2>
            <p className="text-blue-200/60 font-bengali">আপনার বাজেট অনুযায়ী প্যাকেজ বেছে নিন</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`relative rounded-2xl p-6 sm:p-8 border transition-all duration-300 ${
                  plan.popular 
                    ? 'border-blue-400/50 bg-gradient-to-b from-blue-900/60 to-cyan-900/30 shadow-xl shadow-blue-500/20' 
                    : 'border-blue-400/20 bg-gradient-to-b from-blue-950/40 to-black hover:border-blue-400/40'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full font-bengali">
                    সবচেয়ে জনপ্রিয়
                  </div>
                )}
                
                <h3 className="text-xl font-bengali font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-blue-300/40 line-through text-sm font-bengali">{plan.originalPrice}</span>
                  <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent font-bengali">{plan.price}</span>
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-bengali">{plan.discount}</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-blue-100/70 text-sm font-bengali">
                      <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleAddToCart(plan)}
                  className={`w-full font-bengali ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/30' 
                      : 'bg-blue-900/50 text-blue-200 hover:bg-blue-800/50 border border-blue-400/30'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isInCart(plan.id) ? 'চেকআউটে যান' : 'অর্ডার করুন'}
                </Button>
              </motion.div>
            ))}
          </div>
          
          {/* Custom Package CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-400/20"
          >
            <h3 className="text-2xl font-bengali font-bold text-white mb-2">কাস্টম প্যাকেজ দরকার?</h3>
            <p className="text-blue-200/60 font-bengali mb-4">আপনার প্রয়োজন অনুযায়ী কাস্টম প্যাকেজ তৈরি করতে আমাদের সাথে যোগাযোগ করুন</p>
            <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bengali font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform">
                যোগাযোগ করুন 01332052874
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-950/30 to-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Megaphone className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bengali font-bold text-white mb-4">
              আজই শুরু করুন আপনার{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ফেসবুক অ্যাডস জার্নি
              </span>
            </h2>
            <p className="text-blue-200/60 font-bengali mb-8 text-lg">
              আমাদের এক্সপার্ট টিমের সাথে কথা বলুন এবং আপনার ব্যবসার জন্য সেরা অ্যাড স্ট্র্যাটেজি তৈরি করুন
            </p>
            <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bengali font-bold text-lg px-12 py-6 rounded-xl hover:scale-105 transition-transform shadow-xl shadow-blue-500/30">
                হোয়াটসঅ্যাপে যোগাযোগ করুন
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
      <Chatbot />

      {/* Portfolio Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black/95 border border-blue-400/20 backdrop-blur-xl overflow-hidden">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white font-bengali text-lg sm:text-xl">
                {selectedItem?.title}
              </DialogTitle>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </DialogHeader>
          
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full pt-16 p-4"
            >
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title}
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 p-4 bg-blue-900/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bengali">{selectedItem.category}</span>
                  {selectedItem.description && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold">
                      {selectedItem.description}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacebookAdsPage;
