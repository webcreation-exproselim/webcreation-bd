import { motion } from "framer-motion";
import { 
  Palette, ArrowLeft, CheckCircle, Star, TrendingUp, 
  Target, Layers, Users, Zap, Award, Clock, Shield, Eye,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

// Portfolio Items
const portfolioItems = [
  {
    id: 1,
    title: "ব্র্যান্ড লোগো",
    image: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&h=600&fit=crop",
    result: "ইউনিক আইডেন্টিটি",
    category: "লোগো ডিজাইন"
  },
  {
    id: 2,
    title: "সোশ্যাল মিডিয়া পোস্ট",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    result: "৫০০% এনগেজমেন্ট",
    category: "সোশ্যাল মিডিয়া"
  },
  {
    id: 3,
    title: "ব্র্যান্ড গাইডলাইন",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop",
    result: "কম্প্লিট ব্র্যান্ডিং",
    category: "ব্র্যান্ড আইডেন্টিটি"
  },
  {
    id: 4,
    title: "বিজনেস কার্ড",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=600&fit=crop",
    result: "প্রিমিয়াম ফিনিশ",
    category: "প্রিন্ট ডিজাইন"
  },
  {
    id: 5,
    title: "পোস্টার ডিজাইন",
    image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&h=600&fit=crop",
    result: "আই-ক্যাচিং",
    category: "মার্কেটিং"
  },
  {
    id: 6,
    title: "প্যাকেজিং ডিজাইন",
    image: "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800&h=600&fit=crop",
    result: "শেল্ফ-রেডি",
    category: "প্যাকেজিং"
  },
];

// Reviews for sliding
const reviewsRow1 = [
  {
    id: 1,
    name: "মাহমুদ হাসান",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "আমার ব্র্যান্ডের জন্য পারফেক্ট লোগো তৈরি করেছে। প্রফেশনাল এবং ক্রিয়েটিভ কাজ!",
    business: "ব্র্যান্ড মালিক"
  },
  {
    id: 2,
    name: "রুবিনা খাতুন",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "সোশ্যাল মিডিয়া পোস্টগুলো অসাধারণ! এনগেজমেন্ট অনেক বেড়ে গেছে।",
    business: "ফ্যাশন ডিজাইনার"
  },
  {
    id: 3,
    name: "আরিফ রহমান",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "মেনু ডিজাইন থেকে সাইনবোর্ড সব কিছু প্রফেশনালি করেছে। হাইলি রিকমেন্ডেড!",
    business: "রেস্টুরেন্ট মালিক"
  },
  {
    id: 4,
    name: "সালমা আক্তার",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "প্যাকেজিং ডিজাইন করেছে যেটা প্রোডাক্ট সেল অনেক বাড়িয়ে দিয়েছে!",
    business: "প্রোডাক্ট মালিক"
  },
  {
    id: 5,
    name: "তানভীর হোসেন",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ব্র্যান্ড গাইডলাইন তৈরি করে দিয়েছে যা আমার বিজনেসকে প্রফেশনাল লুক দিয়েছে।",
    business: "স্টার্টআপ ফাউন্ডার"
  },
];

const reviewsRow2 = [
  {
    id: 6,
    name: "জাকির হোসেন",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "লোগো এবং ব্র্যান্ডিং দুটোই এক্সিলেন্ট। ক্লায়েন্টরা খুব পছন্দ করেছে!",
    business: "এজেন্সি মালিক"
  },
  {
    id: 7,
    name: "নাসরিন সুলতানা",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ইনফোগ্রাফিক্স ডিজাইন অসাধারণ। কমপ্লেক্স ডেটা সহজে বোঝা যায়!",
    business: "কন্টেন্ট মার্কেটার"
  },
  {
    id: 8,
    name: "রাসেল আহমেদ",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "ব্যানার ডিজাইন দিয়ে ওয়েবসাইটের লুক কমপ্লিটলি চেঞ্জ হয়ে গেছে!",
    business: "ই-কমার্স মালিক"
  },
  {
    id: 9,
    name: "ফাতেমা বেগম",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "বিজনেস কার্ড এত সুন্দর হয়েছে যে সবাই জিজ্ঞেস করে কোথায় বানিয়েছি!",
    business: "কনসালট্যান্ট"
  },
  {
    id: 10,
    name: "কামরুল ইসলাম",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    review: "মার্কেটিং ম্যাটেরিয়াল সব প্রফেশনাল এবং কোহেসিভ। গ্রেট ওয়ার্ক!",
    business: "মার্কেটিং ম্যানেজার"
  },
];

// Pricing Plans
const pricingPlans = [
  {
    name: "স্টার্টআপ",
    originalPrice: "৳৩,০০০",
    price: "৳১,৭০০",
    discount: "৪৩% ছাড়",
    features: [
      "লোগো ডিজাইন (৩টি কনসেপ্ট)",
      "৩টি রিভিশন",
      "সোর্স ফাইল",
      "বিজনেস কার্ড ডিজাইন",
      "সোশ্যাল মিডিয়া কিট",
    ],
  },
  {
    name: "বিজনেস",
    originalPrice: "৳৫,০০০",
    price: "৳৩,০০০",
    discount: "৪০% ছাড়",
    popular: true,
    features: [
      "লোগো ডিজাইন (৫টি কনসেপ্ট)",
      "আনলিমিটেড রিভিশন",
      "ব্র্যান্ড গাইডলাইন",
      "স্টেশনারি ডিজাইন",
      "১০টি সোশ্যাল পোস্ট",
      "প্রিন্ট রেডি ফাইল",
    ],
  },
  {
    name: "কর্পোরেট",
    originalPrice: "৳১০,০০০",
    price: "৳৫,০০০",
    discount: "৫০% ছাড়",
    features: [
      "ফুল ব্র্যান্ড আইডেন্টিটি",
      "মাল্টিপল লোগো ভ্যারিয়েশন",
      "কম্প্রিহেনসিভ ব্র্যান্ড গাইড",
      "সকল মার্কেটিং ম্যাটেরিয়াল",
      "৩০টি সোশ্যাল পোস্ট",
      "প্রায়োরিটি সাপোর্ট",
    ],
  },
];

// Stats
const stats = [
  { value: "১০০০+", label: "ডিজাইন প্রজেক্ট", icon: TrendingUp },
  { value: "৫০০+", label: "ব্র্যান্ড তৈরি", icon: Layers },
  { value: "২০০+", label: "সন্তুষ্ট ক্লায়েন্ট", icon: Users },
  { value: "২৪/৭", label: "সাপোর্ট", icon: Clock },
];

// Features
const features = [
  {
    icon: Target,
    title: "ইউনিক ডিজাইন",
    description: "প্রতিটি প্রজেক্টের জন্য ইউনিক এবং কাস্টম ডিজাইন তৈরি করি যা আপনার ব্র্যান্ডকে আলাদা করে।",
    gradient: "from-purple-500 to-pink-400"
  },
  {
    icon: Layers,
    title: "ব্র্যান্ড কনসিস্টেন্সি",
    description: "সব প্ল্যাটফর্মে একই ব্র্যান্ড আইডেন্টিটি মেইনটেইন করি যাতে কাস্টমাররা সহজে চিনতে পারে।",
    gradient: "from-pink-500 to-rose-400"
  },
  {
    icon: Zap,
    title: "ফাস্ট ডেলিভারি",
    description: "সময়মতো ডেলিভারি নিশ্চিত করি। আর্জেন্ট প্রজেক্টের জন্য এক্সপ্রেস অপশনও আছে।",
    gradient: "from-orange-500 to-amber-400"
  },
  {
    icon: Award,
    title: "প্রিমিয়াম কোয়ালিটি",
    description: "হাই-রেজোলিউশন ফাইল এবং প্রিন্ট-রেডি আউটপুট যা সব জায়গায় পারফেক্ট দেখায়।",
    gradient: "from-emerald-500 to-teal-400"
  },
  {
    icon: Shield,
    title: "আনলিমিটেড রিভিশন",
    description: "আপনি সন্তুষ্ট না হওয়া পর্যন্ত রিভিশন দিই। কোনো হিডেন চার্জ নেই।",
    gradient: "from-violet-500 to-purple-400"
  },
  {
    icon: Eye,
    title: "মডার্ন ট্রেন্ড",
    description: "লেটেস্ট ডিজাইন ট্রেন্ড ফলো করি যাতে আপনার ব্র্যান্ড আপ-টু-ডেট থাকে।",
    gradient: "from-cyan-500 to-blue-400"
  },
];

// Review Card Component
const ReviewCard = ({ review }: { review: typeof reviewsRow1[0] }) => (
  <div className="min-w-[300px] sm:min-w-[350px] p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm border border-purple-400/20 hover:border-purple-400/50 transition-all duration-300 group">
    <div className="flex items-start gap-4 mb-4">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm opacity-60" />
        <Avatar className="w-14 h-14 relative border-2 border-purple-400/50 shadow-lg shadow-purple-400/20">
          <AvatarImage src={review.photo} alt={review.name} />
          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold">
            {review.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-white text-lg font-bengali">{review.name}</h4>
        <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-400 text-white font-medium mt-1">
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

const GraphicsDesignPage = () => {
  const [selectedItem, setSelectedItem] = useState<typeof portfolioItems[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section with Purple/Pink Gradient */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900/50 to-black" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-purple-300 hover:text-white mb-8 transition-colors group">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 mb-6">
                <Palette className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-bengali font-medium">ক্রিয়েটিভ ডিজাইন এজেন্সি</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bengali font-bold text-white mb-6 leading-tight">
                গ্রাফিক্স ডিজাইন দিয়ে{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                  ব্র্যান্ড বিল্ড করুন
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-purple-100/80 font-bengali mb-8 leading-relaxed">
                প্রফেশনাল গ্রাফিক্স ডিজাইন সার্ভিস যা আপনার ব্র্যান্ড আইডেন্টিটি তৈরি করে। 
                লোগো থেকে শুরু করে সোশ্যাল মিডিয়া পোস্ট, ব্যানার, ব্রোশিওর - সবকিছু আধুনিক ও আকর্ষণীয়ভাবে ডিজাইন করি।
              </p>
              
              {/* Quick Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  "লোগো ডিজাইন",
                  "ব্র্যান্ড আইডেন্টিটি",
                  "সোশ্যাল মিডিয়া গ্রাফিক্স",
                  "প্রিন্ট ডিজাইন",
                  "প্যাকেজিং ডিজাইন",
                  "মার্কেটিং ম্যাটেরিয়াল",
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-pink-400 flex-shrink-0" />
                    <span className="text-white/80 font-bengali text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bengali font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 w-full sm:w-auto"
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
                  className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/30 backdrop-blur-sm border border-purple-400/20 hover:border-purple-400/50 transition-all duration-300 group"
                >
                  <stat.icon className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-purple-200/80 font-bengali text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />
        
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
            <p className="text-purple-200/80 font-bengali max-w-2xl mx-auto">
              আমরা শুধু ডিজাইন করি না, ব্র্যান্ড তৈরি করি যা মানুষের মনে গেঁথে থাকে
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
                className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-sm border border-purple-400/20 hover:border-purple-400/50 transition-all duration-300 group hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bengali font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-purple-200/70 font-bengali text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black" />
        
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
            <p className="text-purple-200/80 font-bengali max-w-2xl mx-auto">
              আমাদের ক্লায়েন্টদের জন্য তৈরি করা কিছু ডিজাইন
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
                onClick={() => {
                  setSelectedItem(item);
                  setIsModalOpen(true);
                }}
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
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-400 text-white font-medium mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-bengali font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-purple-300 font-bengali text-sm">{item.result}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />
        
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
            <p className="text-purple-200/80 font-bengali max-w-2xl mx-auto">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black" />
        
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
            <p className="text-purple-200/80 font-bengali max-w-2xl mx-auto">
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
                    ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/40 border-2 border-purple-400' 
                    : 'bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-400/20'
                } backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 text-sm font-bengali font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                      জনপ্রিয়
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bengali font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-purple-400">{plan.price}</span>
                    <span className="text-gray-400 line-through text-sm">{plan.originalPrice}</span>
                    <span className="px-2 py-1 text-xs font-bold bg-pink-500/20 text-pink-300 rounded">
                      {plan.discount}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-300 font-bengali text-sm">
                      <CheckCircle className="w-5 h-5 text-pink-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
                  <Button 
                    className={`w-full font-bengali font-bold ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                        : 'bg-purple-600/50 hover:bg-purple-600'
                    }`}
                  >
                    অর্ডার করুন
                  </Button>
                </a>
              </motion.div>
            ))}
          </div>
          
          {/* Custom Package CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-400/20"
          >
            <h3 className="text-2xl font-bengali font-bold text-white mb-3">কাস্টম প্যাকেজ দরকার?</h3>
            <p className="text-purple-200/80 font-bengali mb-6">আপনার স্পেসিফিক রিকোয়ারমেন্ট অনুযায়ী কাস্টম প্যাকেজ পেতে আমাদের সাথে যোগাযোগ করুন</p>
            <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bengali font-bold">
                হোয়াটসঅ্যাপে মেসেজ করুন
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Portfolio Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl bg-black/95 border-purple-400/30 p-0 overflow-hidden">
          {selectedItem && (
            <div className="relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full h-auto"
              />
              <div className="p-6 bg-gradient-to-t from-black to-transparent">
                <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-400 text-white font-medium mb-2">
                  {selectedItem.category}
                </span>
                <h3 className="text-2xl font-bengali font-bold text-white mb-2">{selectedItem.title}</h3>
                <p className="text-purple-300 font-bengali">{selectedItem.result}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default GraphicsDesignPage;
