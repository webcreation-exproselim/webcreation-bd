import { motion } from "framer-motion";
import { 
  Video, ArrowLeft, CheckCircle, Star, TrendingUp, 
  Play, Users, Zap, Award, Clock, Sparkles, Film,
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
    title: "প্রোডাক্ট ভিডিও",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop",
    result: "১০K+ ভিউ",
    category: "প্রোডাক্ট"
  },
  {
    id: 2,
    title: "কর্পোরেট ভিডিও",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop",
    result: "প্রফেশনাল",
    category: "কর্পোরেট"
  },
  {
    id: 3,
    title: "YouTube ভিডিও",
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=600&fit=crop",
    result: "৫০K+ সাবস্ক্রাইবার",
    category: "YouTube"
  },
  {
    id: 4,
    title: "রিলস ভিডিও",
    image: "https://images.unsplash.com/photo-1605826832916-d0ea9d6fe71e?w=800&h=600&fit=crop",
    result: "ভাইরাল কন্টেন্ট",
    category: "সোশ্যাল মিডিয়া"
  },
  {
    id: 5,
    title: "ইভেন্ট ভিডিও",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600&fit=crop",
    result: "হাই কোয়ালিটি",
    category: "ইভেন্ট"
  },
  {
    id: 6,
    title: "অ্যাড ভিডিও",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&h=600&fit=crop",
    result: "৩x সেলস",
    category: "অ্যাডভার্টাইজিং"
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

// Pricing Plans
const pricingPlans = [
  {
    name: "বেসিক",
    originalPrice: "৳৩,০০০",
    price: "৳২,০০০",
    discount: "৩৩% ছাড়",
    features: [
      "৫ মিনিট পর্যন্ত ভিডিও",
      "বেসিক কাট ও ট্রিম",
      "ব্যাকগ্রাউন্ড মিউজিক",
      "টেক্সট ওভারলে",
      "২টি রিভিশন",
    ],
  },
  {
    name: "প্রফেশনাল",
    originalPrice: "৳৭,০০০",
    price: "৳৫,০০০",
    discount: "২৯% ছাড়",
    popular: true,
    features: [
      "১৫ মিনিট পর্যন্ত ভিডিও",
      "অ্যাডভান্সড এডিটিং",
      "কালার গ্রেডিং",
      "সাউন্ড ডিজাইন",
      "মোশন গ্রাফিক্স",
      "আনলিমিটেড রিভিশন",
    ],
  },
  {
    name: "প্রিমিয়াম",
    originalPrice: "৳১৫,০০০",
    price: "৳১০,০০০",
    discount: "৩৩% ছাড়",
    features: [
      "৩০ মিনিট পর্যন্ত ভিডিও",
      "সিনেমাটিক এডিটিং",
      "VFX ইফেক্টস",
      "ভয়েস ওভার",
      "সাবটাইটেল",
      "এক্সপ্রেস ডেলিভারি",
    ],
  },
];

// Stats
const stats = [
  { value: "৮০০+", label: "ভিডিও এডিট", icon: TrendingUp },
  { value: "৫০M+", label: "টোটাল ভিউ", icon: Play },
  { value: "২০০+", label: "হ্যাপি ক্লায়েন্ট", icon: Users },
  { value: "২৪/৭", label: "সাপোর্ট", icon: Clock },
];

// Features
const features = [
  {
    icon: Film,
    title: "প্রফেশনাল কাটিং",
    description: "স্টোরিটেলিং এর জন্য পারফেক্ট কাটিং এবং ট্রান্সিশন যা ভিউয়ারদের এনগেজড রাখে।",
    gradient: "from-red-500 to-orange-400"
  },
  {
    icon: Sparkles,
    title: "কালার গ্রেডিং",
    description: "সিনেমাটিক লুক দেওয়ার জন্য প্রফেশনাল কালার করেকশন এবং গ্রেডিং।",
    gradient: "from-orange-500 to-amber-400"
  },
  {
    icon: Zap,
    title: "মোশন গ্রাফিক্স",
    description: "আই-ক্যাচিং মোশন গ্রাফিক্স এবং অ্যানিমেশন যা ভিডিওকে প্রফেশনাল করে তোলে।",
    gradient: "from-amber-500 to-yellow-400"
  },
  {
    icon: Award,
    title: "সাউন্ড ডিজাইন",
    description: "ক্লিয়ার অডিও, ব্যাকগ্রাউন্ড মিউজিক এবং সাউন্ড ইফেক্টস যা ভিডিওর কোয়ালিটি বাড়ায়।",
    gradient: "from-rose-500 to-red-400"
  },
  {
    icon: Play,
    title: "VFX ইফেক্টস",
    description: "ভিজ্যুয়াল ইফেক্টস এবং কম্পোজিটিং যা সাধারণ ভিডিওকে অসাধারণ করে তোলে।",
    gradient: "from-red-600 to-rose-500"
  },
  {
    icon: Users,
    title: "ফাস্ট ডেলিভারি",
    description: "সময়মতো ডেলিভারি নিশ্চিত করি। আর্জেন্ট প্রজেক্টের জন্য এক্সপ্রেস অপশনও আছে।",
    gradient: "from-orange-600 to-red-500"
  },
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
  const [selectedItem, setSelectedItem] = useState<typeof portfolioItems[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                <span className="text-red-300 font-bengali font-medium">প্রফেশনাল ভিডিও এডিটিং</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bengali font-bold text-white mb-6 leading-tight">
                সিনেমাটিক{" "}
                <span className="bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                  ভিডিও এডিটিং
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-red-100/80 font-bengali mb-8 leading-relaxed">
                প্রফেশনাল ভিডিও এডিটিং সার্ভিস যা আপনার কন্টেন্টকে পরবর্তী স্তরে নিয়ে যাবে। 
                YouTube ভিডিও থেকে শুরু করে কর্পোরেট প্রেজেন্টেশন, সোশ্যাল মিডিয়া রিলস - সব ধরনের ভিডিও এডিট করি।
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
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-red-900/50 to-orange-900/30 backdrop-blur-sm border border-red-400/20 hover:border-red-400/50 transition-all duration-300 group"
                >
                  <stat.icon className="w-8 h-8 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-red-200/80 font-bengali text-sm">{stat.label}</div>
                </motion.div>
              ))}
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
              কেন আমাদের বেছে নেবেন?
            </h2>
            <p className="text-red-200/80 font-bengali max-w-2xl mx-auto">
              আমরা শুধু ভিডিও এডিট করি না, গল্প বলি যা দর্শকদের মন জয় করে
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
                className="p-6 rounded-2xl bg-gradient-to-br from-red-900/30 to-orange-900/20 backdrop-blur-sm border border-red-400/20 hover:border-red-400/50 transition-all duration-300 group hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bengali font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-red-200/70 font-bengali text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
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
                  <p className="text-red-300 font-bengali text-sm">{item.result}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
                    ? 'bg-gradient-to-br from-red-600/40 to-orange-600/40 border-2 border-red-400' 
                    : 'bg-gradient-to-br from-red-900/30 to-orange-900/20 border border-red-400/20'
                } backdrop-blur-sm hover:border-red-400/50 transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 text-sm font-bengali font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full">
                      জনপ্রিয়
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bengali font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-red-400">{plan.price}</span>
                    <span className="text-gray-400 line-through text-sm">{plan.originalPrice}</span>
                    <span className="px-2 py-1 text-xs font-bold bg-orange-500/20 text-orange-300 rounded">
                      {plan.discount}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-300 font-bengali text-sm">
                      <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
                  <Button 
                    className={`w-full font-bengali font-bold ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
                        : 'bg-red-600/50 hover:bg-red-600'
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

      {/* Portfolio Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl bg-black/95 border-red-400/30 p-0 overflow-hidden">
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
                <span className="inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-red-500 to-orange-400 text-white font-medium mb-2">
                  {selectedItem.category}
                </span>
                <h3 className="text-2xl font-bengali font-bold text-white mb-2">{selectedItem.title}</h3>
                <p className="text-red-300 font-bengali">{selectedItem.result}</p>
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

export default VideoEditingPage;
