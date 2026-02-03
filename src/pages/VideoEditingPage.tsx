import { motion } from "framer-motion";
import { 
  Video, ArrowLeft, CheckCircle, Star, TrendingUp, 
  Play, Users, Zap, Award, Clock, Sparkles, Film, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useMemo } from "react";
import { VideoPlayerModal, getRandomDemoVideo } from "@/components/VideoPlayerModal";
import { useDynamicPortfolio } from "@/hooks/useDynamicPortfolio";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EditableText } from "@/components/EditableText";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobilePortfolioCarousel } from "@/components/MobilePortfolioCarousel";
import { ServicePricingCard, PricingPlanData } from "@/components/ServicePricingCard";

// Fallback Portfolio Items
const fallbackPortfolioItems = [
  {
    id: "vid1",
    title: "প্রোডাক্ট ভিডিও",
    image_url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop",
    description: "১০K+ ভিউ",
    category: "video-editing"
  },
  {
    id: "vid2",
    title: "কর্পোরেট ভিডিও",
    image_url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop",
    description: "প্রফেশনাল",
    category: "video-editing"
  },
  {
    id: "vid3",
    title: "YouTube ভিডিও",
    image_url: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=600&fit=crop",
    description: "৫০K+ সাবস্ক্রাইবার",
    category: "video-editing"
  },
  {
    id: "vid4",
    title: "রিলস ভিডিও",
    image_url: "https://images.unsplash.com/photo-1605826832916-d0ea9d6fe71e?w=800&h=600&fit=crop",
    description: "ভাইরাল কন্টেন্ট",
    category: "video-editing"
  },
  {
    id: "vid5",
    title: "ইভেন্ট ভিডিও",
    image_url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
    description: "হাই কোয়ালিটি",
    category: "video-editing"
  },
  {
    id: "vid6",
    title: "অ্যাড ভিডিও",
    image_url: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&h=600&fit=crop",
    description: "৩x সেলস",
    category: "video-editing"
  },
];

// Reviews for sliding
const reviewsRow1 = [
  {
    id: 1,
    name: "সাকিব আল হাসান",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "YouTube ভিডিও এডিটিং করে অনেক প্রফেশনাল কোয়ালিটি দিয়েছে। ভিউ অনেক বেড়েছে!",
    business: "ইউটিউবার"
  },
  {
    id: 2,
    name: "তাসনিম ফারহানা",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "রিলস ভিডিও এডিটিং অসাধারণ! ট্রান্সিশন এবং ইফেক্টস সব পারফেক্ট।",
    business: "কন্টেন্ট ক্রিয়েটর"
  },
  {
    id: 3,
    name: "রাজীব করিম",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "প্রোডাক্ট ভিডিও বানিয়েছে যেটা সেলস বাড়িয়ে দিয়েছে। কোয়ালিটি অনেক ভালো।",
    business: "বিজনেস ওনার"
  },
  {
    id: 4,
    name: "সুমাইয়া ইসলাম",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "কর্পোরেট ভিডিও এত সুন্দর হয়েছে যে ক্লায়েন্টরা মুগ্ধ হয়ে গেছে!",
    business: "মার্কেটিং ম্যানেজার"
  },
  {
    id: 5,
    name: "মাহমুদ হাসান",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ওয়েডিং ভিডিও এডিট করেছে যেটা সিনেমাটিক ফিল দেয়। অসাধারণ!",
    business: "ফটোগ্রাফার"
  },
];

const reviewsRow2 = [
  {
    id: 6,
    name: "জাহিদ রহমান",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "টিকটক ভিডিও এডিটিং ফাস্ট এবং ট্রেন্ডি। ফলোয়ার বাড়ছে দ্রুত!",
    business: "ইনফ্লুয়েন্সার"
  },
  {
    id: 7,
    name: "নুসরাত জাহান",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "মিউজিক ভিডিও বানিয়েছে যেটা অনেক প্রফেশনাল। সবাই জিজ্ঞেস করছে কোথায় বানিয়েছি!",
    business: "সিঙ্গার"
  },
  {
    id: 8,
    name: "রাসেল আহমেদ",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ট্রেনিং ভিডিও এডিট করে দিয়েছে যেটা স্টুডেন্টরা খুব পছন্দ করছে!",
    business: "অনলাইন কোর্স ক্রিয়েটর"
  },
  {
    id: 9,
    name: "ফারিয়া আক্তার",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ভ্লগ এডিটিং এত সুন্দর হয়েছে যে চ্যানেলের গ্রোথ অনেক বেড়েছে!",
    business: "ভ্লগার"
  },
  {
    id: 10,
    name: "ইমরান খান",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "অ্যাড ভিডিও বানিয়েছে যেটা থেকে সেলস ৩ গুণ বেড়ে গেছে। অসাধারণ ROI!",
    business: "ই-কমার্স উদ্যোক্তা"
  },
];

// Pricing Plans - Home page style with detailed features
const pricingPlans = [
  {
    id: "vid-basic",
    name: "Basic Package",
    price: "৳২,০০০",
    priceNum: 2000,
    originalPrice: "৳৩,০০০",
    originalPriceNum: 3000,
    discount: "33%",
    note: "Quick Delivery",
    icon: "star" as const,
    features: [
      "৫ মিনিট পর্যন্ত ভিডিও",
      "বেসিক কাট ও ট্রিম",
      "ব্যাকগ্রাউন্ড মিউজিক",
      "টেক্সট ওভারলে",
      "Color Correction",
      "HD Quality Export",
      "২টি রিভিশন",
      "3 Days Delivery",
    ],
  },
  {
    id: "vid-pro",
    name: "Professional Package",
    price: "৳৫,০০০",
    priceNum: 5000,
    originalPrice: "৳৭,০০০",
    originalPriceNum: 7000,
    discount: "29%",
    popular: true,
    note: "Best Value",
    icon: "zap" as const,
    features: [
      "১৫ মিনিট পর্যন্ত ভিডিও",
      "অ্যাডভান্সড এডিটিং",
      "কালার গ্রেডিং",
      "সাউন্ড ডিজাইন",
      "মোশন গ্রাফিক্স",
      "ট্রানজিশন ইফেক্ট",
      "টাইটেল অ্যানিমেশন",
      "4K Quality Export",
      "আনলিমিটেড রিভিশন",
      "5 Days Delivery",
    ],
  },
  {
    id: "vid-premium",
    name: "Premium Package",
    price: "৳১০,০০০",
    priceNum: 10000,
    originalPrice: "৳১৫,০০০",
    originalPriceNum: 15000,
    discount: "33%",
    note: "Cinematic Quality",
    icon: "crown" as const,
    features: [
      "৩০ মিনিট পর্যন্ত ভিডিও",
      "সিনেমাটিক এডিটিং",
      "VFX ইফেক্টস",
      "ভয়েস ওভার সাপোর্ট",
      "সাবটাইটেল",
      "কাস্টম গ্রাফিক্স",
      "স্টোরিবোর্ড সাপোর্ট",
      "মাল্টি-ক্যাম এডিট",
      "4K/8K Quality Export",
      "এক্সপ্রেস ডেলিভারি",
      "ডেডিকেটেড সাপোর্ট",
    ],
  },
];

// Stats icons
const statsIcons = [TrendingUp, Play, Users, Clock];

// Features icons and gradients
const featuresIcons = [Film, Sparkles, Zap, Award, Play, Users];
const featuresGradients = [
  "from-red-500 to-orange-400",
  "from-orange-500 to-amber-400",
  "from-amber-500 to-yellow-400",
  "from-rose-500 to-red-400",
  "from-red-600 to-rose-500",
  "from-orange-600 to-red-500",
];

// Review Card Component
const ReviewCard = ({ review }: { review: typeof reviewsRow1[0] }) => (
  <div className="min-w-[300px] sm:min-w-[350px] p-6 rounded-2xl bg-gradient-to-br from-red-900/40 to-orange-900/40 backdrop-blur-sm border border-red-400/20 hover:border-red-400/50 transition-all duration-300 group">
    <div className="flex items-start gap-4 mb-4">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur-sm opacity-60" />
        <Avatar className="w-14 h-14 relative border-2 border-red-400/50 shadow-lg shadow-red-400/20">
          <AvatarImage src={review.photo} alt={review.name} />
          <AvatarFallback className="bg-gradient-to-br from-red-400 to-orange-400 text-white font-bold">
            {review.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-white text-lg font-bengali">{review.name}</h4>
        <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-red-500 to-orange-400 text-white font-medium mt-1">
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

const VideoEditingPage = () => {
  const isMobile = useIsMobile();
  const { portfolioItems, loading: portfolioLoading } = useDynamicPortfolio("video-editing", fallbackPortfolioItems);
  const [selectedItem, setSelectedItem] = useState<typeof fallbackPortfolioItems[0] | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  
  const fallbackContent = useMemo(() => ({
    badge_text: "প্রফেশনাল ভিডিও এডিটিং",
    hero_title_start: "সিনেমাটিক",
    hero_title_highlight: "ভিডিও এডিটিং",
    hero_subtitle: "প্রফেশনাল ভিডিও এডিটিং সার্ভিস যা আপনার কন্টেন্টকে পরবর্তী স্তরে নিয়ে যাবে। YouTube ভিডিও থেকে শুরু করে কর্পোরেট প্রেজেন্টেশন, সোশ্যাল মিডিয়া রিলস - সব ধরনের ভিডিও এডিট করি।",
    // Stats
    stat_0_value: "৮০০+",
    stat_0_label: "ভিডিও এডিট",
    stat_1_value: "৫০M+",
    stat_1_label: "টোটাল ভিউ",
    stat_2_value: "২০০+",
    stat_2_label: "হ্যাপি ক্লায়েন্ট",
    stat_3_value: "২৪/৭",
    stat_3_label: "সাপোর্ট",
    // Features
    feature_0_title: "প্রফেশনাল কাটিং",
    feature_0_description: "স্টোরিটেলিং এর জন্য পারফেক্ট কাটিং এবং ট্রান্সিশন যা ভিউয়ারদের এনগেজড রাখে।",
    feature_1_title: "কালার গ্রেডিং",
    feature_1_description: "সিনেমাটিক লুক দেওয়ার জন্য প্রফেশনাল কালার করেকশন এবং গ্রেডিং।",
    feature_2_title: "মোশন গ্রাফিক্স",
    feature_2_description: "আই-ক্যাচিং মোশন গ্রাফিক্স এবং অ্যানিমেশন যা ভিডিওকে প্রফেশনাল করে তোলে।",
    feature_3_title: "সাউন্ড ডিজাইন",
    feature_3_description: "ক্লিয়ার অডিও, ব্যাকগ্রাউন্ড মিউজিক এবং সাউন্ড ইফেক্টস যা ভিডিওর কোয়ালিটি বাড়ায়।",
    feature_4_title: "VFX ইফেক্টস",
    feature_4_description: "ভিজ্যুয়াল ইফেক্টস এবং কম্পোজিটিং যা সাধারণ ভিডিওকে অসাধারণ করে তোলে।",
    feature_5_title: "ফাস্ট ডেলিভারি",
    feature_5_description: "সময়মতো ডেলিভারি নিশ্চিত করি। আর্জেন্ট প্রজেক্টের জন্য এক্সপ্রেস অপশনও আছে।",
    // Section headers
    features_section_title: "কেন আমাদের বেছে নেবেন?",
    features_section_subtitle: "আমরা শুধু ভিডিও এডিট করি না, গল্প বলি যা দর্শকদের মন জয় করে",
  }), []);
  
  const { content } = useSiteContent("video-editing", "hero", fallbackContent);

  const handlePlayVideo = (item: typeof fallbackPortfolioItems[0]) => {
    setSelectedItem(item);
    setVideoUrl(getRandomDemoVideo());
    setIsVideoOpen(true);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section with Red/Orange Gradient */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-red-900/50 to-black" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-red-300 hover:text-white mb-8 transition-colors group">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 mb-6">
                <Video className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-bengali font-medium">
                  <EditableText page="video-editing" section="hero" contentKey="badge_text" value={content.badge_text} />
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bengali font-bold text-white mb-6 leading-tight">
                <EditableText page="video-editing" section="hero" contentKey="hero_title_start" value={content.hero_title_start} />{" "}
                <span className="bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                  <EditableText page="video-editing" section="hero" contentKey="hero_title_highlight" value={content.hero_title_highlight} />
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-red-100/80 font-bengali mb-8 leading-relaxed">
                <EditableText page="video-editing" section="hero" contentKey="hero_subtitle" value={content.hero_subtitle} multiline />
              </p>
              
              {/* Quick Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  "প্রফেশনাল কাটিং",
                  "কালার গ্রেডিং",
                  "সাউন্ড ডিজাইন",
                  "মোশন গ্রাফিক্স",
                  "VFX ইফেক্টস",
                  "4K রেন্ডারিং",
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <span className="text-white/80 font-bengali text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bengali font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 w-full sm:w-auto"
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
                    className="p-6 rounded-2xl bg-gradient-to-br from-red-900/50 to-orange-900/30 backdrop-blur-sm border border-red-400/20 hover:border-red-400/50 transition-all duration-300 group"
                  >
                    <IconComponent className="w-8 h-8 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-bold text-white mb-1">
                      <EditableText page="video-editing" section="hero" contentKey={`stat_${index}_value`} value={content[`stat_${index}_value`]} />
                    </div>
                    <div className="text-red-200/80 font-bengali text-sm">
                      <EditableText page="video-editing" section="hero" contentKey={`stat_${index}_label`} value={content[`stat_${index}_label`]} />
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
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/20 to-black" />
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bengali font-bold text-white mb-4">
              <EditableText page="video-editing" section="hero" contentKey="features_section_title" value={content.features_section_title} />
            </h2>
            <p className="text-red-200/80 font-bengali max-w-2xl mx-auto">
              <EditableText page="video-editing" section="hero" contentKey="features_section_subtitle" value={content.features_section_subtitle} />
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
                  className="p-6 rounded-2xl bg-gradient-to-br from-red-900/30 to-orange-900/20 backdrop-blur-sm border border-red-400/20 hover:border-red-400/50 transition-all duration-300 group hover:-translate-y-2"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${featuresGradients[index]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bengali font-bold text-white mb-2">
                    <EditableText page="video-editing" section="hero" contentKey={`feature_${index}_title`} value={content[`feature_${index}_title`]} />
                  </h3>
                  <p className="text-red-200/70 font-bengali text-sm leading-relaxed">
                    <EditableText page="video-editing" section="hero" contentKey={`feature_${index}_description`} value={content[`feature_${index}_description`]} multiline />
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/30 to-black" />
        
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
            <p className="text-red-200/80 font-bengali max-w-2xl mx-auto">
              আমাদের ক্লায়েন্টদের জন্য তৈরি করা কিছু ভিডিও প্রজেক্ট
            </p>
          </motion.div>
          
          {isMobile ? (
            <MobilePortfolioCarousel
              items={portfolioItems}
              serviceType="video"
              onItemClick={(item) => handlePlayVideo(item)}
              accentColor="red"
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
                onClick={() => handlePlayVideo(item)}
                className="group relative overflow-hidden rounded-2xl cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-red-500/80 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-red-500 to-orange-400 text-white font-medium mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-bengali font-bold text-white mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-red-300 font-bengali text-sm">{item.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/20 to-black" />
        
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
            <p className="text-red-200/80 font-bengali max-w-2xl mx-auto">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/30 to-black" />
        
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
            <p className="text-red-200/80 font-bengali max-w-2xl mx-auto">
              আপনার বাজেট এবং প্রয়োজন অনুযায়ী প্যাকেজ বেছে নিন
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <ServicePricingCard
                key={plan.id}
                plan={plan as PricingPlanData}
                serviceName="ভিডিও এডিটিং"
                gradient="from-red-500 to-orange-400"
                accentColor="red"
                index={index}
              />
            ))}
          </div>
          
          {/* Custom Package CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-400/20"
          >
            <h3 className="text-2xl font-bengali font-bold text-white mb-3">কাস্টম প্যাকেজ দরকার?</h3>
            <p className="text-red-200/80 font-bengali mb-6">আপনার স্পেসিফিক রিকোয়ারমেন্ট অনুযায়ী কাস্টম প্যাকেজ পেতে আমাদের সাথে যোগাযোগ করুন</p>
            <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 font-bengali font-bold">
                হোয়াটসঅ্যাপে মেসেজ করুন
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={videoUrl}
        title={selectedItem?.title || ""}
        thumbnail={selectedItem?.image_url}
      />

      <Footer />
      <Chatbot />
    </div>
  );
};

export default VideoEditingPage;
