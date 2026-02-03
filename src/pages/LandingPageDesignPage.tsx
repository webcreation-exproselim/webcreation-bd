import { motion } from "framer-motion";
import { 
  Layout, ArrowLeft, CheckCircle, Star, TrendingUp, 
  MousePointer, Users, Zap, Award, Clock, Target, Layers,
  ExternalLink, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDynamicPortfolio } from "@/hooks/useDynamicPortfolio";
import { useMemo } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EditableText } from "@/components/EditableText";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobilePortfolioCarousel } from "@/components/MobilePortfolioCarousel";
import { ServicePricingCard, PricingPlanData } from "@/components/ServicePricingCard";

// Fallback Portfolio Items
const fallbackPortfolioItems = [
  {
    id: "lp1",
    title: "SaaS ল্যান্ডিং পেজ",
    image_url: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop",
    description: "৬০% কনভার্সন",
    category: "landing-page",
    live_url: null
  },
  {
    id: "lp2",
    title: "প্রোডাক্ট লঞ্চ পেজ",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    description: "৫০০+ সেলস",
    category: "landing-page",
    live_url: null
  },
  {
    id: "lp3",
    title: "লিড জেন পেজ",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    description: "১০০০+ লিড",
    category: "landing-page",
    live_url: null
  },
  {
    id: "lp4",
    title: "ইভেন্ট ল্যান্ডিং পেজ",
    image_url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop",
    description: "৩০০+ রেজিস্ট্রেশন",
    category: "landing-page",
    live_url: null
  },
  {
    id: "lp5",
    title: "অ্যাপ ডাউনলোড পেজ",
    image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
    description: "৫K+ ডাউনলোড",
    category: "landing-page",
    live_url: null
  },
  {
    id: "lp6",
    title: "সার্ভিস পেজ",
    image_url: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=800&h=600&fit=crop",
    description: "হাই কনভার্সন",
    category: "landing-page",
    live_url: null
  },
];

// Reviews for sliding
const reviewsRow1 = [
  {
    id: 1,
    name: "ফয়সাল আহমেদ",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ল্যান্ডিং পেজ কনভার্সন রেট ৪০% বাড়িয়ে দিয়েছে। ডিজাইন এবং UX দুটোই চমৎকার!",
    business: "ডিজিটাল মার্কেটার"
  },
  {
    id: 2,
    name: "তাহমিনা আক্তার",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "অনলাইন কোর্সের জন্য যে পেজ বানিয়েছে সেটা থেকে অনেক সেল পাচ্ছি। অসাধারণ!",
    business: "কোর্স ক্রিয়েটর"
  },
  {
    id: 3,
    name: "শাহরিয়ার কবির",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ক্লায়েন্টদের জন্য বেশ কিছু ল্যান্ডিং পেজ বানিয়েছে। সবগুলোই হাই কনভার্টিং!",
    business: "এজেন্সি মালিক"
  },
  {
    id: 4,
    name: "নাফিসা সুলতানা",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "লিড জেন পেজ থেকে প্রতিদিন লিড আসছে। A/B টেস্টিং করে বেস্ট ভার্সন বের করেছে!",
    business: "মার্কেটিং কনসালট্যান্ট"
  },
  {
    id: 5,
    name: "রাকিব হোসেন",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "SaaS প্রোডাক্টের জন্য ল্যান্ডিং পেজ বানিয়েছে যেটা সাইনআপ ৫ গুণ বাড়িয়েছে!",
    business: "SaaS ফাউন্ডার"
  },
];

const reviewsRow2 = [
  {
    id: 6,
    name: "জাহিদ হাসান",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ইভেন্টের জন্য ল্যান্ডিং পেজ বানিয়েছে। রেজিস্ট্রেশন টার্গেট ছাড়িয়ে গেছে!",
    business: "ইভেন্ট অর্গানাইজার"
  },
  {
    id: 7,
    name: "ফারিয়া ইসলাম",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "মোবাইল ফার্স্ট ডিজাইন করেছে যেটা ফোনে পারফেক্ট দেখায়। কনভার্সন বেড়েছে!",
    business: "ই-কমার্স মালিক"
  },
  {
    id: 8,
    name: "আরিফুল রহমান",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "স্পিড অপটিমাইজড পেজ বানিয়েছে যেটা ১ সেকেন্ডেই লোড হয়। SEO তেও হেল্প করেছে!",
    business: "টেক এন্ট্রেপ্রেনার"
  },
  {
    id: 9,
    name: "সাবিনা খাতুন",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "CRM ইন্টিগ্রেশন করে দিয়েছে। এখন অটোমেটিক লিড ক্যাপচার হচ্ছে!",
    business: "সেলস ম্যানেজার"
  },
  {
    id: 10,
    name: "কামাল উদ্দিন",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "থ্যাংক ইউ পেজ দিয়ে আপসেল করছি। অ্যাডিশনাল রেভেন্যু জেনারেট হচ্ছে!",
    business: "অনলাইন বিজনেস ওনার"
  },
];

// Pricing Plans - Home page style with detailed features
const pricingPlans = [
  {
    id: "lp-starter",
    name: "Starter Package",
    price: "৳১,৫০০",
    priceNum: 1500,
    originalPrice: "৳২,০০০",
    originalPriceNum: 2000,
    discount: "40%",
    note: "No Advanced Payment",
    icon: "star" as const,
    features: [
      "Domain ❌",
      "Hosting ❌",
      "Fraud Customer Checker ❌",
      "Courier Integration",
      "Order Invoice Print",
      "Live Chat Setup",
      "Pixel & Conversion API Setup",
      "Sales Converting Unique Design",
      "Easy Order Management",
      "Easy Checkout",
      "Thank You Page",
      "Pro Plugin",
      "24/7 Support",
      "3 Time Revision",
      "Video Tutorial",
    ],
  },
  {
    id: "lp-premium",
    name: "Premium Package",
    price: "৳২,০০০",
    priceNum: 2000,
    originalPrice: "৳৩,২০০",
    originalPriceNum: 3200,
    discount: "40%",
    popular: true,
    note: "No Advanced Payment",
    icon: "zap" as const,
    features: [
      ".SHOP Domain - 01 Year",
      "10 GB Bdix NVME Hosting SSD",
      "Hosting 01 Year",
      "cPanel & Full Access",
      "Fraud Customer Checker",
      "Courier Integration",
      "Order Invoice Print",
      "Live Chat Setup",
      "Pixel & Conversion API Setup",
      "Sales Converting Unique Design",
      "Fast Loading Speed",
      "Easy Order Management",
      "Easy Checkout",
      "Thank You Page",
      "Pro Plugin",
      "24/7 Priority Support",
      "Video Tutorial",
    ],
  },
  {
    id: "lp-business",
    name: "Business Package",
    price: "৳৩,০০০",
    priceNum: 3000,
    originalPrice: "৳৪,২০০",
    originalPriceNum: 4200,
    discount: "30%",
    note: "Domain Hosting Fee in Advance",
    icon: "crown" as const,
    features: [
      ".COM Domain - 01 Year",
      "10 GB Bdix NVME Hosting SSD",
      "Hosting 01 Year",
      "cPanel & Full Access",
      "Fraud Customer Checker",
      "Courier Integration",
      "Order Invoice Print",
      "Live Chat Setup",
      "Pixel & Conversion API Setup",
      "Sales Converting Unique Design",
      "Super Fast Loading Speed",
      "Easy Order Management",
      "Easy Checkout",
      "Thank You Page",
      "Pro Plugin",
      "24/7 Priority Support",
      "2 Time Revision",
      "Video Tutorial",
    ],
  },
];

// Stats icons
const statsIcons = [TrendingUp, MousePointer, Users, Clock];

// Features icons and gradients
const featuresIcons = [Target, Layers, Zap, MousePointer, Award, Users];
const featuresGradients = [
  "from-teal-500 to-cyan-400",
  "from-cyan-500 to-blue-400",
  "from-blue-500 to-indigo-400",
  "from-teal-600 to-emerald-400",
  "from-emerald-500 to-teal-400",
  "from-cyan-600 to-teal-400",
];

// Review Card Component
const ReviewCard = ({ review }: { review: typeof reviewsRow1[0] }) => (
  <div className="min-w-[300px] sm:min-w-[350px] p-6 rounded-2xl bg-gradient-to-br from-teal-900/40 to-cyan-900/40 backdrop-blur-sm border border-teal-400/20 hover:border-teal-400/50 transition-all duration-300 group">
    <div className="flex items-start gap-4 mb-4">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-sm opacity-60" />
        <Avatar className="w-14 h-14 relative border-2 border-teal-400/50 shadow-lg shadow-teal-400/20">
          <AvatarImage src={review.photo} alt={review.name} />
          <AvatarFallback className="bg-gradient-to-br from-teal-400 to-cyan-400 text-white font-bold">
            {review.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-white text-lg font-bengali">{review.name}</h4>
        <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 text-white font-medium mt-1">
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

const LandingPageDesignPage = () => {
  const isMobile = useIsMobile();
  const { portfolioItems, loading: portfolioLoading } = useDynamicPortfolio("landing-page", fallbackPortfolioItems);
  
  const fallbackContent = useMemo(() => ({
    badge_text: "কনভার্সন এক্সপার্ট",
    hero_title_start: "হাই-কনভার্টিং",
    hero_title_highlight: "ল্যান্ডিং পেজ",
    hero_subtitle: "কনভার্সন অপটিমাইজড ল্যান্ডিং পেজ যা আপনার ভিজিটরদের কাস্টমারে রূপান্তর করবে। প্রফেশনাল ডিজাইন, ফাস্ট লোডিং এবং মোবাইল ফ্রেন্ডলি ল্যান্ডিং পেজ তৈরি করি।",
    // Stats
    stat_0_value: "৩০০+",
    stat_0_label: "ল্যান্ডিং পেজ",
    stat_1_value: "৫০%+",
    stat_1_label: "এভারেজ কনভার্সন",
    stat_2_value: "২০০+",
    stat_2_label: "হ্যাপি ক্লায়েন্ট",
    stat_3_value: "২৪/৭",
    stat_3_label: "সাপোর্ট",
    // Features
    feature_0_title: "কনভার্সন অপটিমাইজড",
    feature_0_description: "সাইকোলজিক্যাল ট্রিগার এবং বেস্ট প্র্যাকটিস ফলো করে হাই-কনভার্টিং পেজ ডিজাইন করি।",
    feature_1_title: "A/B টেস্টিং রেডি",
    feature_1_description: "মাল্টিপল ভার্সন তৈরি করে টেস্ট করার সুযোগ রাখি যাতে বেস্ট পারফর্মার খুঁজে পান।",
    feature_2_title: "লাইটনিং ফাস্ট",
    feature_2_description: "১ সেকেন্ডের মধ্যে লোড হওয়া পেজ যা বাউন্স রেট কমায় এবং কনভার্সন বাড়ায়।",
    feature_3_title: "স্মার্ট CTA",
    feature_3_description: "স্ট্র্যাটেজিক পজিশনে CTA বাটন যা ভিজিটরদের অ্যাকশন নিতে উৎসাহিত করে।",
    feature_4_title: "ট্রাস্ট সিগন্যাল",
    feature_4_description: "টেস্টিমোনিয়াল, ব্যাজ, সার্টিফিকেট ইন্টিগ্রেশন যা ভিজিটরদের বিশ্বাস বাড়ায়।",
    feature_5_title: "লিড ক্যাপচার",
    feature_5_description: "স্মার্ট ফর্ম এবং CRM ইন্টিগ্রেশন যা অটোমেটিক লিড ক্যাপচার করে।",
    // Section headers
    features_section_title: "কেন আমাদের বেছে নেবেন?",
    features_section_subtitle: "আমরা শুধু সুন্দর পেজ বানাই না, কনভার্সন মেশিন তৈরি করি",
  }), []);
  
  const { content } = useSiteContent("landing-page", "hero", fallbackContent);
  
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section with Teal/Cyan Gradient */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-teal-900/50 to-black" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-teal-300 hover:text-white mb-8 transition-colors group">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-400/30 mb-6">
                <Layout className="w-5 h-5 text-teal-400" />
                <span className="text-teal-300 font-bengali font-medium">
                  <EditableText page="landing-page" section="hero" contentKey="badge_text" value={content.badge_text} />
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bengali font-bold text-white mb-6 leading-tight">
                <EditableText page="landing-page" section="hero" contentKey="hero_title_start" value={content.hero_title_start} />{" "}
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
                  <EditableText page="landing-page" section="hero" contentKey="hero_title_highlight" value={content.hero_title_highlight} />
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-teal-100/80 font-bengali mb-8 leading-relaxed">
                <EditableText page="landing-page" section="hero" contentKey="hero_subtitle" value={content.hero_subtitle} multiline />
              </p>
              
              {/* Quick Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  "কনভার্সন অপটিমাইজড",
                  "A/B টেস্টিং রেডি",
                  "মোবাইল ফার্স্ট",
                  "ফাস্ট লোডিং",
                  "SEO ফ্রেন্ডলি",
                  "CRM ইন্টিগ্রেশন",
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
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bengali font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300 w-full sm:w-auto"
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
                    className="p-6 rounded-2xl bg-gradient-to-br from-teal-900/50 to-cyan-900/30 backdrop-blur-sm border border-teal-400/20 hover:border-teal-400/50 transition-all duration-300 group"
                  >
                    <IconComponent className="w-8 h-8 text-teal-400 mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-bold text-white mb-1">
                      <EditableText page="landing-page" section="hero" contentKey={`stat_${index}_value`} value={content[`stat_${index}_value`]} />
                    </div>
                    <div className="text-teal-200/80 font-bengali text-sm">
                      <EditableText page="landing-page" section="hero" contentKey={`stat_${index}_label`} value={content[`stat_${index}_label`]} />
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
        <div className="absolute inset-0 bg-gradient-to-b from-black via-teal-950/20 to-black" />
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bengali font-bold text-white mb-4">
              <EditableText page="landing-page" section="hero" contentKey="features_section_title" value={content.features_section_title} />
            </h2>
            <p className="text-teal-200/80 font-bengali max-w-2xl mx-auto">
              <EditableText page="landing-page" section="hero" contentKey="features_section_subtitle" value={content.features_section_subtitle} />
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
                  className="p-6 rounded-2xl bg-gradient-to-br from-teal-900/30 to-cyan-900/20 backdrop-blur-sm border border-teal-400/20 hover:border-teal-400/50 transition-all duration-300 group hover:-translate-y-2"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${featuresGradients[index]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bengali font-bold text-white mb-2">
                    <EditableText page="landing-page" section="hero" contentKey={`feature_${index}_title`} value={content[`feature_${index}_title`]} />
                  </h3>
                  <p className="text-teal-200/70 font-bengali text-sm leading-relaxed">
                    <EditableText page="landing-page" section="hero" contentKey={`feature_${index}_description`} value={content[`feature_${index}_description`]} multiline />
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-teal-950/30 to-black" />
        
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
            <p className="text-teal-200/80 font-bengali max-w-2xl mx-auto">
              আমাদের ক্লায়েন্টদের জন্য তৈরি করা কিছু ল্যান্ডিং পেজ
            </p>
          </motion.div>
          
          {isMobile ? (
            <MobilePortfolioCarousel
              items={portfolioItems}
              serviceType="url"
              onItemClick={(item) => {
                if (item.live_url) {
                  window.open(item.live_url, "_blank", "noopener,noreferrer");
                }
              }}
              accentColor="teal"
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
                className="group relative overflow-hidden rounded-2xl bg-black/40 border border-teal-400/20 hover:border-teal-400/50 transition-all duration-300"
              >
                {/* Image - Show top portion of website screenshot */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Card Content */}
                <div className="p-5">
                  <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 text-white font-medium mb-3">
                    ল্যান্ডিং পেজ
                  </span>
                  <h3 className="text-lg font-bengali font-bold text-white mb-1 line-clamp-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-teal-300/80 font-bengali text-sm mb-4">{item.description}</p>
                  )}
                  <Button 
                    variant="outline"
                    size="sm"
                    className={`w-full border-teal-400/50 text-teal-400 hover:bg-teal-400 hover:text-black font-bengali ${!item.live_url ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => item.live_url && window.open(item.live_url, "_blank", "noopener,noreferrer")}
                    disabled={!item.live_url}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    লাইভ প্রিভিউ
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-teal-950/20 to-black" />
        
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
            <p className="text-teal-200/80 font-bengali max-w-2xl mx-auto">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black via-teal-950/30 to-black" />
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bengali font-bold text-white mb-4">
              প্রাইসিং প্যাকেজ
            </h2>
            <p className="text-teal-200/80 font-bengali max-w-2xl mx-auto">
              আপনার বাজেট এবং প্রয়োজন অনুযায়ী প্যাকেজ বেছে নিন
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <ServicePricingCard
                key={plan.id}
                plan={plan as PricingPlanData}
                serviceName="ল্যান্ডিং পেজ"
                gradient="from-teal-500 to-cyan-400"
                accentColor="teal"
                index={index}
              />
            ))}
          </div>
          
          {/* Custom Package CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-teal-900/40 to-cyan-900/40 border border-teal-400/20"
          >
            <h3 className="text-2xl font-bengali font-bold text-white mb-3">কাস্টম প্যাকেজ দরকার?</h3>
            <p className="text-teal-200/80 font-bengali mb-6">আপনার স্পেসিফিক রিকোয়ারমেন্ট অনুযায়ী কাস্টম প্যাকেজ পেতে আমাদের সাথে যোগাযোগ করুন</p>
            <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 font-bengali font-bold">
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

export default LandingPageDesignPage;
