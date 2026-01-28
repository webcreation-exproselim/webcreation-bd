import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Review = {
  id: number;
  name: string;
  photo: string;
  rating: number;
  service: string;
  review: string;
  serviceGradient: string;
};

const reviewsRow1: Review[] = [
  {
    id: 1,
    name: "মোঃ রফিকুল ইসলাম",
    photo: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    service: "ওয়েব ডেভেলপমেন্ট",
    review: "অসাধারণ সার্ভিস পেয়েছি। আমার ই-কমার্স ওয়েবসাইট এখন পুরোপুরি কার্যকর এবং সুন্দর দেখাচ্ছে।",
    serviceGradient: "from-green-500 to-emerald-400",
  },
  {
    id: 2,
    name: "ফাতেমা বেগম",
    photo: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    service: "গ্রাফিক্স ডিজাইন",
    review: "লোগো ডিজাইন এতো সুন্দর হয়েছে যে সবাই প্রশংসা করছে। ধন্যবাদ টিমকে!",
    serviceGradient: "from-purple-500 to-pink-400",
  },
  {
    id: 3,
    name: "আহমেদ হোসেন",
    photo: "https://i.pravatar.cc/150?img=3",
    rating: 5,
    service: "ল্যান্ডিং পেজ",
    review: "আমার বিজনেসের জন্য পারফেক্ট ল্যান্ডিং পেজ তৈরি করে দিয়েছে। কনভার্শন রেট অনেক বেড়েছে।",
    serviceGradient: "from-blue-500 to-cyan-400",
  },
  {
    id: 4,
    name: "সাবরিনা আক্তার",
    photo: "https://i.pravatar.cc/150?img=9",
    rating: 5,
    service: "ভিডিও এডিটিং",
    review: "YouTube চ্যানেলের জন্য প্রফেশনাল ভিডিও এডিটিং পেয়েছি। সাবস্ক্রাইবার বাড়ছে দ্রুত!",
    serviceGradient: "from-red-500 to-orange-400",
  },
  {
    id: 5,
    name: "মোঃ করিম উদ্দিন",
    photo: "https://i.pravatar.cc/150?img=8",
    rating: 5,
    service: "মোশন গ্রাফিক্স",
    review: "বিজ্ঞাপনের জন্য অসাধারণ মোশন গ্রাফিক্স তৈরি করেছে। ক্লায়েন্টরা খুবই সন্তুষ্ট।",
    serviceGradient: "from-yellow-500 to-amber-400",
  },
  {
    id: 6,
    name: "নাজমুল হক",
    photo: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    service: "ওয়েব ডেভেলপমেন্ট",
    review: "পোর্টফোলিও ওয়েবসাইট এত সুন্দর হয়েছে যে ফ্রিল্যান্সিং এ অনেক কাজ পাচ্ছি।",
    serviceGradient: "from-green-500 to-emerald-400",
  },
];

const reviewsRow2: Review[] = [
  {
    id: 7,
    name: "রাশেদা পারভীন",
    photo: "https://i.pravatar.cc/150?img=20",
    rating: 5,
    service: "গ্রাফিক্স ডিজাইন",
    review: "ব্র্যান্ডিং প্যাকেজ নিয়েছিলাম। সব কিছু একদম পারফেক্ট হয়েছে। সুপার সন্তুষ্ট!",
    serviceGradient: "from-purple-500 to-pink-400",
  },
  {
    id: 8,
    name: "মোঃ আলী হোসেন",
    photo: "https://i.pravatar.cc/150?img=11",
    rating: 5,
    service: "ল্যান্ডিং পেজ",
    review: "ডিজিটাল মার্কেটিং ক্যাম্পেইনের জন্য দারুণ ল্যান্ডিং পেজ পেয়েছি। ROI অনেক ভালো।",
    serviceGradient: "from-blue-500 to-cyan-400",
  },
  {
    id: 9,
    name: "তানিয়া সুলতানা",
    photo: "https://i.pravatar.cc/150?img=23",
    rating: 5,
    service: "ওয়েব ডেভেলপমেন্ট",
    review: "অনলাইন শপ তৈরি করে দিয়েছে অসাধারণ। প্রতিদিন অর্ডার আসছে। ধন্যবাদ!",
    serviceGradient: "from-green-500 to-emerald-400",
  },
  {
    id: 10,
    name: "জাকির হোসেন",
    photo: "https://i.pravatar.cc/150?img=15",
    rating: 5,
    service: "ভিডিও এডিটিং",
    review: "বিয়ের ভিডিও এডিটিং করেছে অসাধারণ। পরিবারের সবাই মুগ্ধ হয়েছে।",
    serviceGradient: "from-red-500 to-orange-400",
  },
  {
    id: 11,
    name: "শাহানা আক্তার",
    photo: "https://i.pravatar.cc/150?img=25",
    rating: 5,
    service: "মোশন গ্রাফিক্স",
    review: "প্রোডাক্ট ভিডিওর জন্য মোশন গ্রাফিক্স তৈরি করেছে। সেলস বেড়েছে ৩ গুণ!",
    serviceGradient: "from-yellow-500 to-amber-400",
  },
  {
    id: 12,
    name: "মোঃ সোহেল রানা",
    photo: "https://i.pravatar.cc/150?img=17",
    rating: 5,
    service: "গ্রাফিক্স ডিজাইন",
    review: "সোশ্যাল মিডিয়া পোস্ট ডিজাইন অনেক ভালো হয়েছে। এনগেজমেন্ট বেড়েছে অনেক।",
    serviceGradient: "from-purple-500 to-pink-400",
  },
];

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="min-w-[300px] sm:min-w-[350px] p-6 rounded-2xl bg-black/60 backdrop-blur-sm border border-white/10 hover:border-yellow-400/30 transition-all duration-300 group">
    <div className="flex items-start gap-4 mb-4">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full blur-sm opacity-60" />
        <Avatar className="w-14 h-14 relative border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/20">
          <AvatarImage src={review.photo} alt={review.name} />
          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-red-500 text-black font-bold">
            {review.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-white text-lg font-bengali">{review.name}</h4>
        <span className={`inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r ${review.serviceGradient} text-white font-medium mt-1`}>
          {review.service}
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

const InfiniteSlider = ({ 
  reviews, 
  direction 
}: { 
  reviews: Review[]; 
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
          duration: direction === "right" ? 30 : 25,
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

export const CustomerReviewSection = () => {
  return (
    <section className="py-16 md:py-24 bg-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 hex-pattern opacity-30" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />
      
      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-red-500/20 border border-yellow-400/30 text-yellow-400 text-sm font-medium mb-4">
              ১৫০০+ সন্তুষ্ট ক্লায়েন্ট
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-bengali">
              আমাদের ক্লায়েন্টদের{" "}
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                মতামত
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-bengali">
              আমাদের সেবা গ্রহণকারী ক্লায়েন্টদের অভিজ্ঞতা ও মতামত দেখুন
            </p>
          </motion.div>
        </div>

        {/* First Slider Row - Right Direction */}
        <div className="mb-4">
          <InfiniteSlider reviews={reviewsRow1} direction="right" />
        </div>

        {/* Second Slider Row - Left Direction */}
        <div>
          <InfiniteSlider reviews={reviewsRow2} direction="left" />
        </div>
      </div>
    </section>
  );
};
