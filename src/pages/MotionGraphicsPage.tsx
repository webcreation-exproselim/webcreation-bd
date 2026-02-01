import { motion } from "framer-motion";
import { 
  Activity, ArrowLeft, CheckCircle, Star, TrendingUp, 
  Sparkles, Users, Zap, Award, Clock, Play, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { VideoPlayerModal, getRandomDemoVideo } from "@/components/VideoPlayerModal";
import { AddToCartButton } from "@/components/AddToCartButton";

// Portfolio Items
const portfolioItems = [
  {
    id: 1,
    title: "অ্যানিমেটেড লোগো",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop",
    result: "ব্র্যান্ড রিকগনিশন",
    category: "লোগো অ্যানিমেশন"
  },
  {
    id: 2,
    title: "এক্সপ্লেইনার ভিডিও",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop",
    result: "৮০% কনভার্সন",
    category: "এক্সপ্লেইনার"
  },
  {
    id: 3,
    title: "ইনফোগ্রাফিক্স অ্যানিমেশন",
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=600&fit=crop",
    result: "ডেটা ভিজ্যুয়ালাইজেশন",
    category: "ইনফোগ্রাফিক্স"
  },
  {
    id: 4,
    title: "কিনেটিক টাইপোগ্রাফি",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    result: "এনগেজিং কন্টেন্ট",
    category: "টাইপোগ্রাফি"
  },
  {
    id: 5,
    title: "3D অ্যানিমেশন",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=600&fit=crop",
    result: "প্রিমিয়াম কোয়ালিটি",
    category: "3D"
  },
  {
    id: 6,
    title: "সোশ্যাল মিডিয়া অ্যানিমেশন",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    result: "ভাইরাল কন্টেন্ট",
    category: "সোশ্যাল মিডিয়া"
  },
];

// Reviews for sliding
const reviewsRow1 = [
  {
    id: 1,
    name: "ইমরান হোসেন",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "অ্যাপের জন্য এক্সপ্লেইনার ভিডিও বানিয়েছে যেটা ইউজারদের কাছে অনেক পছন্দ হয়েছে!",
    business: "অ্যাপ ডেভেলপার"
  },
  {
    id: 2,
    name: "সুমাইয়া ইসলাম",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "অ্যানিমেটেড অ্যাড ক্যাম্পেইন করেছে যেটার CTR অনেক বেশি পেয়েছি। অসাধারণ কাজ!",
    business: "মার্কেটিং ম্যানেজার"
  },
  {
    id: 3,
    name: "নাঈম আহমেদ",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "লোগো অ্যানিমেশন এবং ইন্ট্রো ভিডিও দুটোই প্রফেশনাল। ব্র্যান্ড ভ্যালু বাড়িয়ে দিয়েছে।",
    business: "স্টার্টআপ ফাউন্ডার"
  },
  {
    id: 4,
    name: "তাসনিম আক্তার",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "কিনেটিক টাইপোগ্রাফি দিয়ে মেসেজ অনেক ইমপ্যাক্টফুল হয়েছে!",
    business: "কন্টেন্ট ক্রিয়েটর"
  },
  {
    id: 5,
    name: "রাকিব হোসেন",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "3D অ্যানিমেশন এত সুন্দর হয়েছে যে ক্লায়েন্টরা মুগ্ধ হয়ে গেছে!",
    business: "এজেন্সি মালিক"
  },
];

const reviewsRow2 = [
  {
    id: 6,
    name: "শাহরিয়ার কবির",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "প্রোডাক্ট অ্যানিমেশন দিয়ে সেলস বাড়িয়ে দিয়েছে। অসাধারণ!",
    business: "ই-কমার্স মালিক"
  },
  {
    id: 7,
    name: "ফারিয়া সুলতানা",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ইনফোগ্রাফিক্স অ্যানিমেশন দিয়ে কমপ্লেক্স ডেটা সহজে বোঝানো গেছে!",
    business: "ডেটা অ্যানালিস্ট"
  },
  {
    id: 8,
    name: "জাহিদ হাসান",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ক্যারেক্টার অ্যানিমেশন অনেক এক্সপ্রেসিভ এবং এনগেজিং হয়েছে!",
    business: "ভিডিও প্রোডিউসার"
  },
  {
    id: 9,
    name: "রুবিনা খাতুন",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "সোশ্যাল মিডিয়া অ্যানিমেশন এনগেজমেন্ট ৫ গুণ বাড়িয়ে দিয়েছে!",
    business: "সোশ্যাল মিডিয়া ম্যানেজার"
  },
  {
    id: 10,
    name: "কামরুল ইসলাম",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ট্রেড শো এর জন্য অ্যানিমেশন বানিয়েছে যেটা সবার নজর কেড়েছে!",
    business: "বিজনেস ডেভেলপার"
  },
];

// Pricing Plans
const pricingPlans = [
  {
    id: "motion-starter",
    name: "স্টার্টার",
    originalPrice: "৳৫,০০০",
    price: "৳৩,৫০০",
    priceNum: 3500,
    originalPriceNum: 5000,
    discount: "৩০% ছাড়",
    features: [
      "অ্যানিমেটেড লোগো",
      "৫ সেকেন্ড ইন্ট্রো",
      "সোশ্যাল মিডিয়া রেডি",
      "২টি রিভিশন",
      "HD কোয়ালিটি",
    ],
  },
  {
    id: "motion-pro",
    name: "প্রফেশনাল",
    originalPrice: "৳১২,০০০",
    price: "৳৮,০০০",
    priceNum: 8000,
    originalPriceNum: 12000,
    discount: "৩৩% ছাড়",
    popular: true,
    features: [
      "৬০ সেকেন্ড এক্সপ্লেইনার",
      "ভয়েস ওভার ইন্টিগ্রেশন",
      "কাস্টম ইলাস্ট্রেশন",
      "সাউন্ড ইফেক্টস",
      "আনলিমিটেড রিভিশন",
      "4K কোয়ালিটি",
    ],
  },
  {
    id: "motion-enterprise",
    name: "এন্টারপ্রাইজ",
    originalPrice: "৳২৫,০০০",
    price: "৳১৮,০০০",
    priceNum: 18000,
    originalPriceNum: 25000,
    discount: "২৮% ছাড়",
    features: [
      "৩ মিনিট+ অ্যানিমেশন",
      "3D এলিমেন্টস",
      "ক্যারেক্টার অ্যানিমেশন",
      "স্টোরিবোর্ড তৈরি",
      "স্ক্রিপ্ট রাইটিং",
      "প্রায়োরিটি ডেলিভারি",
    ],
  },
];

// Stats
const stats = [
  { value: "৫০০+", label: "অ্যানিমেশন প্রজেক্ট", icon: TrendingUp },
  { value: "১০০%", label: "ক্লায়েন্ট সন্তুষ্টি", icon: Award },
  { value: "১৫০+", label: "হ্যাপি ক্লায়েন্ট", icon: Users },
  { value: "২৪/৭", label: "সাপোর্ট", icon: Clock },
];

// Features
const features = [
  {
    icon: Wand2,
    title: "কাস্টম অ্যানিমেশন",
    description: "প্রতিটি প্রজেক্টের জন্য ইউনিক এবং কাস্টম অ্যানিমেশন তৈরি করি যা আপনার ব্র্যান্ডকে আলাদা করে।",
    gradient: "from-yellow-500 to-amber-400"
  },
  {
    icon: Sparkles,
    title: "এক্সপ্লেইনার ভিডিও",
    description: "কমপ্লেক্স আইডিয়াকে সহজে বোঝানোর জন্য এনগেজিং এক্সপ্লেইনার ভিডিও তৈরি করি।",
    gradient: "from-amber-500 to-orange-400"
  },
  {
    icon: Play,
    title: "লোগো অ্যানিমেশন",
    description: "আপনার লোগোকে জীবন্ত করে তুলি যা ব্র্যান্ড রিকগনিশন বাড়ায়।",
    gradient: "from-orange-500 to-yellow-400"
  },
  {
    icon: Zap,
    title: "3D অ্যানিমেশন",
    description: "হাই-এন্ড 3D অ্যানিমেশন যা আপনার কন্টেন্টকে প্রিমিয়াম লুক দেয়।",
    gradient: "from-yellow-600 to-amber-500"
  },
  {
    icon: Activity,
    title: "কিনেটিক টাইপোগ্রাফি",
    description: "টেক্সটকে অ্যানিমেট করে মেসেজকে আরও ইমপ্যাক্টফুল করে তুলি।",
    gradient: "from-amber-600 to-yellow-500"
  },
  {
    icon: Users,
    title: "ক্যারেক্টার অ্যানিমেশন",
    description: "এক্সপ্রেসিভ ক্যারেক্টার অ্যানিমেশন যা গল্প বলে এবং দর্শকদের এনগেজ করে।",
    gradient: "from-orange-600 to-amber-500"
  },
];

// Review Card Component
const ReviewCard = ({ review }: { review: typeof reviewsRow1[0] }) => (
  <div className="min-w-[300px] sm:min-w-[350px] p-6 rounded-2xl bg-gradient-to-br from-yellow-900/40 to-amber-900/40 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300 group">
    <div className="flex items-start gap-4 mb-4">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full blur-sm opacity-60" />
        <Avatar className="w-14 h-14 relative border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/20">
          <AvatarImage src={review.photo} alt={review.name} />
          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-400 text-white font-bold">
            {review.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-white text-lg font-bengali">{review.name}</h4>
        <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 text-white font-medium mt-1">
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

const MotionGraphicsPage = () => {
  const [selectedItem, setSelectedItem] = useState<typeof portfolioItems[0] | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const handlePlayVideo = (item: typeof portfolioItems[0]) => {
    setSelectedItem(item);
    setVideoUrl(getRandomDemoVideo());
    setIsVideoOpen(true);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section with Yellow/Amber Gradient */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-950 via-amber-900/50 to-black" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-yellow-300 hover:text-white mb-8 transition-colors group">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 mb-6">
                <Activity className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-300 font-bengali font-medium">ক্রিয়েটিভ মোশন স্টুডিও</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bengali font-bold text-white mb-6 leading-tight">
                আই-ক্যাচিং{" "}
                <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  মোশন গ্রাফিক্স
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-yellow-100/80 font-bengali mb-8 leading-relaxed">
                ক্রিয়েটিভ মোশন গ্রাফিক্স যা আপনার মেসেজকে জীবন্ত করে তোলে। অ্যানিমেটেড লোগো, এক্সপ্লেইনার ভিডিও, 
                কিনেটিক টাইপোগ্রাফি থেকে শুরু করে 3D অ্যানিমেশন পর্যন্ত সব ধরনের মোশন ওয়ার্ক করি।
              </p>
              
              {/* Quick Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  "অ্যানিমেটেড লোগো",
                  "এক্সপ্লেইনার ভিডিও",
                  "কিনেটিক টাইপোগ্রাফি",
                  "3D অ্যানিমেশন",
                  "ক্যারেক্টার অ্যানিমেশন",
                  "ভিজ্যুয়াল ইফেক্টস",
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-white/80 font-bengali text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bengali font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 w-full sm:w-auto"
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
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-yellow-900/50 to-amber-900/30 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300 group"
                >
                  <stat.icon className="w-8 h-8 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-yellow-200/80 font-bengali text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-yellow-950/20 to-black" />
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bengali font-bold text-white mb-4">
              কেন আমাদের বেছে নেবেন?
            </h2>
            <p className="text-yellow-200/80 font-bengali max-w-2xl mx-auto">
              আমরা মোশন গ্রাফিক্সকে শিল্পে পরিণত করি যা মানুষের মনে গেঁথে থাকে
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-yellow-900/30 to-amber-900/20 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300 group hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bengali font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-yellow-200/70 font-bengali text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-yellow-950/30 to-black" />
        
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
            <p className="text-yellow-200/80 font-bengali max-w-2xl mx-auto">
              আমাদের ক্লায়েন্টদের জন্য তৈরি করা কিছু মোশন গ্রাফিক্স প্রজেক্ট
            </p>
          </motion.div>
          
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
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/80 flex items-center justify-center">
                    <Play className="w-8 h-8 text-black ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-medium mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-bengali font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-yellow-300 font-bengali text-sm">{item.result}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-yellow-950/20 to-black" />
        
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
            <p className="text-yellow-200/80 font-bengali max-w-2xl mx-auto">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black via-yellow-950/30 to-black" />
        
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
            <p className="text-yellow-200/80 font-bengali max-w-2xl mx-auto">
              আপনার বাজেট এবং প্রয়োজন অনুযায়ী প্যাকেজ বেছে নিন
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
                    ? 'bg-gradient-to-br from-yellow-600/40 to-amber-600/40 border-2 border-yellow-400' 
                    : 'bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border border-yellow-400/20'
                } backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 text-sm font-bengali font-bold bg-gradient-to-r from-yellow-500 to-amber-500 text-black rounded-full">
                      জনপ্রিয়
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bengali font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-yellow-400">{plan.price}</span>
                    <span className="text-gray-400 line-through text-sm">{plan.originalPrice}</span>
                    <span className="px-2 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 rounded">
                      {plan.discount}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-300 font-bengali text-sm">
                      <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <AddToCartButton plan={plan} serviceName="মোশন গ্রাফিক্স" colorScheme="yellow" />
              </motion.div>
            ))}
          </div>
          
          {/* Custom Package CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border border-yellow-400/20"
          >
            <h3 className="text-2xl font-bengali font-bold text-white mb-3">কাস্টম প্যাকেজ দরকার?</h3>
            <p className="text-yellow-200/80 font-bengali mb-6">আপনার স্পেসিফিক রিকোয়ারমেন্ট অনুযায়ী কাস্টম প্যাকেজ পেতে আমাদের সাথে যোগাযোগ করুন</p>
            <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bengali font-bold">
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
        thumbnail={selectedItem?.image}
      />

      <Footer />
      <Chatbot />
    </div>
  );
};

export default MotionGraphicsPage;
