import { motion } from "framer-motion";
import { 
  Code, ArrowLeft, CheckCircle, Star, TrendingUp, 
  Globe, Users, Zap, Award, Clock, Shield, Smartphone,
  ExternalLink, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddToCartButton } from "@/components/AddToCartButton";
import { useDynamicPortfolio } from "@/hooks/useDynamicPortfolio";
import { useMemo } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EditableText } from "@/components/EditableText";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobilePortfolioCarousel } from "@/components/MobilePortfolioCarousel";

// Fallback Portfolio Items
const fallbackPortfolioItems = [
  {
    id: "web1",
    title: "ই-কমার্স ওয়েবসাইট",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    description: "৫০০+ অর্ডার/মাস",
    category: "web-development",
    live_url: null
  },
  {
    id: "web2",
    title: "কর্পোরেট ওয়েবসাইট",
    image_url: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop",
    description: "প্রফেশনাল লুক",
    category: "web-development",
    live_url: null
  },
  {
    id: "web3",
    title: "ড্যাশবোর্ড অ্যাপ",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    description: "রিয়েল-টাইম ডেটা",
    category: "web-development",
    live_url: null
  },
  {
    id: "web4",
    title: "পোর্টফোলিও সাইট",
    image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
    description: "মডার্ন ডিজাইন",
    category: "web-development",
    live_url: null
  },
  {
    id: "web5",
    title: "SaaS প্ল্যাটফর্ম",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
    description: "স্কেলেবল সিস্টেম",
    category: "web-development",
    live_url: null
  },
  {
    id: "web6",
    title: "ব্লগ ওয়েবসাইট",
    image_url: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=800&h=600&fit=crop",
    description: "SEO অপটিমাইজড",
    category: "web-development",
    live_url: null
  },
];

// Reviews for sliding
const reviewsRow1 = [
  {
    id: 1,
    name: "ফারহান রশিদ",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "অসাধারণ ওয়েবসাইট তৈরি করেছে! ডিজাইন এবং ফাংশনালিটি দুটোই পারফেক্ট। সময়মতো ডেলিভারি।",
    business: "স্টার্টআপ ফাউন্ডার"
  },
  {
    id: 2,
    name: "নাফিসা বেগম",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ই-কমার্স সাইট বানিয়েছে যেটা খুব স্মুথলি চলছে। কাস্টমাররা সহজেই অর্ডার করতে পারছে।",
    business: "অনলাইন শপ মালিক"
  },
  {
    id: 3,
    name: "সাইফুল ইসলাম",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "প্রফেশনাল কর্পোরেট ওয়েবসাইট যা আমার ব্যবসার ক্রেডিবিলিটি বাড়িয়েছে। সাপোর্টও চমৎকার।",
    business: "বিজনেস কনসালট্যান্ট"
  },
  {
    id: 4,
    name: "তাসনিম আক্তার",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "পোর্টফোলিও সাইট বানিয়েছে যেটা দেখে অনেক ক্লায়েন্ট আসছে। মডার্ন এবং ক্লিন ডিজাইন!",
    business: "ফ্রিল্যান্সার"
  },
  {
    id: 5,
    name: "রাকিব হোসেন",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "অ্যাডমিন প্যানেল দিয়ে সবকিছু ম্যানেজ করতে পারছি। খুবই ইউজার ফ্রেন্ডলি!",
    business: "বিজনেস ওনার"
  },
];

const reviewsRow2 = [
  {
    id: 6,
    name: "শাহরিয়ার কবির",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "SEO অপটিমাইজড সাইট বানিয়েছে। গুগলে র‍্যাংক করছে এবং অর্গানিক ট্রাফিক বাড়ছে!",
    business: "ডিজিটাল মার্কেটার"
  },
  {
    id: 7,
    name: "মারিয়া সুলতানা",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "মোবাইল রেস্পন্সিভ সাইট পেয়েছি। সব ডিভাইসে পারফেক্ট দেখায়!",
    business: "কন্টেন্ট ক্রিয়েটর"
  },
  {
    id: 8,
    name: "জাহিদ হাসান",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "পেমেন্ট ইন্টিগ্রেশন করে দিয়েছে। এখন অনলাইনে পেমেন্ট নিতে পারছি!",
    business: "সার্ভিস প্রোভাইডার"
  },
  {
    id: 9,
    name: "ফাতেমা খান",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ওয়েবসাইটের স্পিড অনেক ফাস্ট। ইউজার এক্সপেরিয়েন্স অসাধারণ!",
    business: "ব্লগার"
  },
  {
    id: 10,
    name: "আরিফুল ইসলাম",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "কাস্টম ফিচার্স দিয়েছে যা আমার বিজনেসের জন্য পারফেক্ট। হাইলি রিকমেন্ডেড!",
    business: "টেক এন্ট্রেপ্রেনার"
  },
];

// Pricing Plans
const pricingPlans = [
  {
    id: "web-starter",
    name: "স্টার্টার",
    originalPrice: "৳১০,০০০",
    price: "৳৫,০০০",
    priceNum: 5000,
    originalPriceNum: 10000,
    discount: "৫০% ছাড়",
    features: [
      "৫ পেজ ওয়েবসাইট",
      "মোবাইল রেস্পন্সিভ",
      "বেসিক SEO",
      "কন্টাক্ট ফর্ম",
      "১ মাস ফ্রি সাপোর্ট",
    ],
  },
  {
    id: "web-premium",
    name: "প্রিমিয়াম",
    originalPrice: "৳২৫,০০০",
    price: "৳১৫,০০০",
    priceNum: 15000,
    originalPriceNum: 25000,
    discount: "৪০% ছাড়",
    popular: true,
    features: [
      "১৫ পেজ ওয়েবসাইট",
      "অ্যাডমিন প্যানেল",
      "অ্যাডভান্সড SEO",
      "পেমেন্ট ইন্টিগ্রেশন",
      "স্পিড অপটিমাইজেশন",
      "৩ মাস ফ্রি সাপোর্ট",
    ],
  },
  {
    id: "web-business",
    name: "বিজনেস",
    originalPrice: "৳১৫,০০০",
    price: "৳৮,০০০",
    priceNum: 8000,
    originalPriceNum: 15000,
    discount: "৪৭% ছাড়",
    features: [
      "আনলিমিটেড পেজ",
      "কাস্টম ফিচার্স",
      "API ইন্টিগ্রেশন",
      "ই-কমার্স রেডি",
      "সিকিউরিটি অডিট",
      "৬ মাস ফ্রি সাপোর্ট",
    ],
  },
];

// Stats icons
const statsIcons = [TrendingUp, Award, Users, Clock];

// Features icons and gradients
const featuresIcons = [Globe, Smartphone, Zap, Shield, Award, Users];
const featuresGradients = [
  "from-green-500 to-emerald-400",
  "from-emerald-500 to-teal-400",
  "from-teal-500 to-cyan-400",
  "from-lime-500 to-green-400",
  "from-green-600 to-emerald-500",
  "from-emerald-600 to-teal-500",
];

// Review Card Component
const ReviewCard = ({ review }: { review: typeof reviewsRow1[0] }) => (
  <div className="min-w-[300px] sm:min-w-[350px] p-6 rounded-2xl bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm border border-green-400/20 hover:border-green-400/50 transition-all duration-300 group">
    <div className="flex items-start gap-4 mb-4">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-sm opacity-60" />
        <Avatar className="w-14 h-14 relative border-2 border-green-400/50 shadow-lg shadow-green-400/20">
          <AvatarImage src={review.photo} alt={review.name} />
          <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-400 text-white font-bold">
            {review.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-white text-lg font-bengali">{review.name}</h4>
        <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-green-500 to-emerald-400 text-white font-medium mt-1">
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

const WebDevelopmentPage = () => {
  const { portfolioItems, loading: portfolioLoading } = useDynamicPortfolio("web-development", fallbackPortfolioItems);
  const isMobile = useIsMobile();
  
  const fallbackContent = useMemo(() => ({
    badge_text: "মডার্ন ওয়েব ডেভেলপমেন্ট",
    hero_title_start: "প্রফেশনাল",
    hero_title_highlight: "ওয়েবসাইট ডেভেলপমেন্ট",
    hero_subtitle: "আপনার ব্যবসার জন্য কাস্টম ওয়েবসাইট তৈরি করি যা মোবাইল ফ্রেন্ডলি, ফাস্ট এবং SEO অপটিমাইজড। React, Next.js সহ আধুনিক টেকনোলজি ব্যবহার করে স্কেলেবল সল্যুশন ডেভেলপ করি।",
    // Stats
    stat_0_value: "২০০+",
    stat_0_label: "ওয়েবসাইট ডেলিভারড",
    stat_1_value: "৯৯%",
    stat_1_label: "ক্লায়েন্ট সন্তুষ্টি",
    stat_2_value: "১৫০+",
    stat_2_label: "হ্যাপি ক্লায়েন্ট",
    stat_3_value: "২৪/৭",
    stat_3_label: "সাপোর্ট",
    // Features
    feature_0_title: "মডার্ন টেকনোলজি",
    feature_0_description: "React, Next.js, Node.js সহ লেটেস্ট টেকনোলজি ব্যবহার করে স্কেলেবল এবং ফাস্ট ওয়েবসাইট তৈরি করি।",
    feature_1_title: "মোবাইল ফার্স্ট",
    feature_1_description: "সব ডিভাইসে পারফেক্ট দেখায় এমন রেস্পন্সিভ ডিজাইন যা ইউজার এক্সপেরিয়েন্স বাড়ায়।",
    feature_2_title: "লাইটনিং ফাস্ট",
    feature_2_description: "স্পিড অপটিমাইজেশন করে লোডিং টাইম কমিয়ে ইউজার এনগেজমেন্ট এবং SEO র‍্যাংকিং বাড়াই।",
    feature_3_title: "সিকিউর কোডিং",
    feature_3_description: "ইন্ডাস্ট্রি স্ট্যান্ডার্ড সিকিউরিটি প্র্যাকটিস ফলো করে হ্যাক-প্রুফ ওয়েবসাইট তৈরি করি।",
    feature_4_title: "SEO অপটিমাইজড",
    feature_4_description: "সার্চ ইঞ্জিনে র‍্যাংক করার জন্য SEO বেস্ট প্র্যাকটিস ফলো করে ওয়েবসাইট বিল্ড করি।",
    feature_5_title: "ডেডিকেটেড সাপোর্ট",
    feature_5_description: "প্রজেক্ট শেষ হওয়ার পরেও ফ্রি সাপোর্ট দিই। যেকোনো সমস্যায় পাশে আছি।",
    // Section headers
    features_section_title: "কেন আমাদের বেছে নেবেন?",
    features_section_subtitle: "আমরা শুধু ওয়েবসাইট বানাই না, বিজনেস গ্রো করার টুল তৈরি করি",
    pricing_section_title: "প্রাইসিং প্যাকেজ",
    pricing_section_subtitle: "আপনার বাজেট এবং প্রয়োজন অনুযায়ী প্যাকেজ বেছে নিন",
  }), []);
  
  const { content } = useSiteContent("web-development", "hero", fallbackContent);
  
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section with Green Gradient */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-green-900/50 to-black" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-green-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-green-300 hover:text-white mb-8 transition-colors group">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 mb-6">
                <Code className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-bengali font-medium">
                  <EditableText page="web-development" section="hero" contentKey="badge_text" value={content.badge_text} />
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bengali font-bold text-white mb-6 leading-tight">
                <EditableText page="web-development" section="hero" contentKey="hero_title_start" value={content.hero_title_start} />{" "}
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                  <EditableText page="web-development" section="hero" contentKey="hero_title_highlight" value={content.hero_title_highlight} />
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-green-100/80 font-bengali mb-8 leading-relaxed">
                <EditableText page="web-development" section="hero" contentKey="hero_subtitle" value={content.hero_subtitle} multiline />
              </p>
              
              {/* Quick Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  "কাস্টম ডিজাইন",
                  "মোবাইল রেস্পন্সিভ",
                  "SEO অপটিমাইজড",
                  "ফাস্ট লোডিং",
                  "অ্যাডমিন প্যানেল",
                  "পেমেন্ট ইন্টিগ্রেশন",
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-white/80 font-bengali text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bengali font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 w-full sm:w-auto"
                  >
                    এখনই অর্ডার করুন
                  </Button>
                </a>
              </div>
            </motion.div>
            
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {[0, 1, 2, 3].map((index) => {
                const IconComponent = statsIcons[index];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-green-900/50 to-emerald-900/30 backdrop-blur-sm border border-green-400/20 hover:border-green-400/50 transition-all duration-300 group"
                  >
                    <IconComponent className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-bold text-white mb-1">
                      <EditableText page="web-development" section="hero" contentKey={`stat_${index}_value`} value={content[`stat_${index}_value`]} />
                    </div>
                    <div className="text-green-200/80 font-bengali text-sm">
                      <EditableText page="web-development" section="hero" contentKey={`stat_${index}_label`} value={content[`stat_${index}_label`]} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/20 to-black" />
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bengali font-bold text-white mb-4">
              <EditableText page="web-development" section="hero" contentKey="features_section_title" value={content.features_section_title} />
            </h2>
            <p className="text-green-200/80 font-bengali max-w-2xl mx-auto">
              <EditableText page="web-development" section="hero" contentKey="features_section_subtitle" value={content.features_section_subtitle} />
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const IconComponent = featuresIcons[index];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-green-900/30 to-emerald-900/20 backdrop-blur-sm border border-green-400/20 hover:border-green-400/50 transition-all duration-300 group hover:-translate-y-2"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${featuresGradients[index]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bengali font-bold text-white mb-2">
                    <EditableText page="web-development" section="hero" contentKey={`feature_${index}_title`} value={content[`feature_${index}_title`]} />
                  </h3>
                  <p className="text-green-200/70 font-bengali text-sm leading-relaxed">
                    <EditableText page="web-development" section="hero" contentKey={`feature_${index}_description`} value={content[`feature_${index}_description`]} multiline />
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/30 to-black" />
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bengali font-bold text-white mb-4">
              আমাদের সাম্প্রতিক কাজ
            </h2>
            <p className="text-green-200/80 font-bengali max-w-2xl mx-auto">
              আমাদের ক্লায়েন্টদের জন্য তৈরি করা কিছু ওয়েবসাইট
            </p>
          </motion.div>
          
          {isMobile ? (
            <MobilePortfolioCarousel
              items={portfolioItems}
              serviceType="url"
              onItemClick={(item) => item.live_url && window.open(item.live_url, "_blank")}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl bg-black/40 border border-green-400/20 hover:border-green-400/50 transition-all duration-300"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-green-500 to-emerald-400 text-white font-medium mb-3">
                      ওয়েব ডেভেলপমেন্ট
                    </span>
                    <h3 className="text-xl font-bengali font-bold text-white mb-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-green-300/80 font-bengali text-sm mb-4">{item.description}</p>
                    )}
                    <Button
                      variant="outline"
                      className="w-full font-bengali border-green-400/30 text-green-400 hover:bg-green-400 hover:text-black"
                      onClick={() => item.live_url && window.open(item.live_url, "_blank")}
                      disabled={!item.live_url}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      লাইভ প্রিভিউ
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/20 to-black" />
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 px-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bengali font-bold text-white mb-4">
              ক্লায়েন্টদের মতামত
            </h2>
            <p className="text-green-200/80 font-bengali max-w-2xl mx-auto">
              আমাদের সার্ভিস নিয়ে ক্লায়েন্টরা যা বলছেন
            </p>
          </motion.div>
          
          <div className="space-y-4">
            <InfiniteSlider reviews={reviewsRow1} direction="right" />
            <InfiniteSlider reviews={reviewsRow2} direction="left" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/30 to-black" />
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bengali font-bold text-white mb-4">
              <EditableText page="web-development" section="hero" contentKey="pricing_section_title" value={content.pricing_section_title} />
            </h2>
            <p className="text-green-200/80 font-bengali max-w-2xl mx-auto">
              <EditableText page="web-development" section="hero" contentKey="pricing_section_subtitle" value={content.pricing_section_subtitle} />
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-6 rounded-2xl ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-green-600/40 to-emerald-600/40 border-2 border-green-400' 
                    : 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-400/20'
                } backdrop-blur-sm hover:border-green-400/50 transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 text-sm font-bengali font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full">
                      জনপ্রিয়
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bengali font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-400">{plan.price}</span>
                    <span className="text-gray-400 line-through text-sm">{plan.originalPrice}</span>
                    <span className="px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded">
                      {plan.discount}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-300 font-bengali text-sm">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <AddToCartButton plan={plan} serviceName="ওয়েব ডেভেলপমেন্ট" colorScheme="green" />
              </motion.div>
            ))}
          </div>
          
          {/* Custom Package CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-400/20"
          >
            <h3 className="text-2xl font-bengali font-bold text-white mb-3">কাস্টম প্যাকেজ দরকার?</h3>
            <p className="text-green-200/80 font-bengali mb-6">আপনার স্পেসিফিক রিকোয়ারমেন্ট অনুযায়ী কাস্টম প্যাকেজ পেতে আমাদের সাথে যোগাযোগ করুন</p>
            <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-bengali font-bold">
                হোয়াটসঅ্যাপে মেসেজ করুন
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default WebDevelopmentPage;
