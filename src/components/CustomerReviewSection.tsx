import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EditableText } from "./EditableText";

type Review = {
  id: string;
  name: string;
  photo: string | null;
  rating: number;
  service: string;
  review: string;
  service_gradient: string | null;
};

// Fallback reviews for when database is empty
const fallbackReviewsRow1: Review[] = [
  {
    id: "1",
    name: "মোঃ রফিকুল ইসলাম",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    service: "ওয়েব ডেভেলপমেন্ট",
    review: "অসাধারণ সার্ভিস পেয়েছি। আমার ই-কমার্স ওয়েবসাইট এখন পুরোপুরি কার্যকর এবং সুন্দর দেখাচ্ছে।",
    service_gradient: "from-green-500 to-emerald-400",
  },
  {
    id: "2",
    name: "ফাতেমা বেগম",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    service: "গ্রাফিক্স ডিজাইন",
    review: "লোগো ডিজাইন এতো সুন্দর হয়েছে যে সবাই প্রশংসা করছে। ধন্যবাদ টিমকে!",
    service_gradient: "from-purple-500 to-pink-400",
  },
  {
    id: "3",
    name: "আহমেদ হোসেন",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    service: "ল্যান্ডিং পেজ",
    review: "আমার বিজনেসের জন্য পারফেক্ট ল্যান্ডিং পেজ তৈরি করে দিয়েছে। কনভার্শন রেট অনেক বেড়েছে।",
    service_gradient: "from-blue-500 to-cyan-400",
  },
  {
    id: "4",
    name: "সাবরিনা আক্তার",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    service: "ভিডিও এডিটিং",
    review: "YouTube চ্যানেলের জন্য প্রফেশনাল ভিডিও এডিটিং পেয়েছি। সাবস্ক্রাইবার বাড়ছে দ্রুত!",
    service_gradient: "from-red-500 to-orange-400",
  },
  {
    id: "5",
    name: "মোঃ করিম উদ্দিন",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    service: "মোশন গ্রাফিক্স",
    review: "বিজ্ঞাপনের জন্য অসাধারণ মোশন গ্রাফিক্স তৈরি করেছে। ক্লায়েন্টরা খুবই সন্তুষ্ট।",
    service_gradient: "from-yellow-500 to-amber-400",
  },
  {
    id: "6",
    name: "নাজমুল হক",
    photo: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    service: "ওয়েব ডেভেলপমেন্ট",
    review: "পোর্টফোলিও ওয়েবসাইট এত সুন্দর হয়েছে যে ফ্রিল্যান্সিং এ অনেক কাজ পাচ্ছি।",
    service_gradient: "from-green-500 to-emerald-400",
  },
];

const fallbackReviewsRow2: Review[] = [
  {
    id: "7",
    name: "রাশেদা পারভীন",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    service: "গ্রাফিক্স ডিজাইন",
    review: "ব্র্যান্ডিং প্যাকেজ নিয়েছিলাম। সব কিছু একদম পারফেক্ট হয়েছে। সুপার সন্তুষ্ট!",
    service_gradient: "from-purple-500 to-pink-400",
  },
  {
    id: "8",
    name: "মোঃ আলী হোসেন",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    service: "ল্যান্ডিং পেজ",
    review: "ডিজিটাল মার্কেটিং ক্যাম্পেইনের জন্য দারুণ ল্যান্ডিং পেজ পেয়েছি। ROI অনেক ভালো।",
    service_gradient: "from-blue-500 to-cyan-400",
  },
  {
    id: "9",
    name: "তানিয়া সুলতানা",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    service: "ওয়েব ডেভেলপমেন্ট",
    review: "অনলাইন শপ তৈরি করে দিয়েছে অসাধারণ। প্রতিদিন অর্ডার আসছে। ধন্যবাদ!",
    service_gradient: "from-green-500 to-emerald-400",
  },
  {
    id: "10",
    name: "জাকির হোসেন",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    service: "ভিডিও এডিটিং",
    review: "বিয়ের ভিডিও এডিটিং করেছে অসাধারণ। পরিবারের সবাই মুগ্ধ হয়েছে।",
    service_gradient: "from-red-500 to-orange-400",
  },
  {
    id: "11",
    name: "শাহানা আক্তার",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    service: "মোশন গ্রাফিক্স",
    review: "প্রোডাক্ট ভিডিওর জন্য মোশন গ্রাফিক্স তৈরি করেছে। সেলস বেড়েছে ৩ গুণ!",
    service_gradient: "from-yellow-500 to-amber-400",
  },
  {
    id: "12",
    name: "মোঃ সোহেল রানা",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    service: "গ্রাফিক্স ডিজাইন",
    review: "সোশ্যাল মিডিয়া পোস্ট ডিজাইন অনেক ভালো হয়েছে। এনগেজমেন্ট বেড়েছে অনেক।",
    service_gradient: "from-purple-500 to-pink-400",
  },
];

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="min-w-[300px] sm:min-w-[350px] p-6 rounded-2xl bg-black/60 backdrop-blur-sm border border-white/10 hover:border-yellow-400/30 transition-all duration-300 group">
    <div className="flex items-start gap-4 mb-4">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full blur-sm opacity-60" />
        <Avatar className="w-14 h-14 relative border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/20">
          <AvatarImage src={review.photo || undefined} alt={review.name} />
          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-red-500 text-black font-bold">
            {review.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-white text-lg font-bengali">{review.name}</h4>
        <span className={`inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r ${review.service_gradient || "from-yellow-500 to-amber-400"} text-white font-medium mt-1`}>
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
          duration: direction === "right" ? 18 : 15,
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
  const [reviewsRow1, setReviewsRow1] = useState<Review[]>(fallbackReviewsRow1);
  const [reviewsRow2, setReviewsRow2] = useState<Review[]>(fallbackReviewsRow2);
  const [totalCount, setTotalCount] = useState(1500);

  // Fallback content
  const fallbackContent = useMemo(() => ({
    badge_text: "+ সন্তুষ্ট ক্লায়েন্ট",
    section_title_start: "আমাদের ক্লায়েন্টদের",
    section_title_highlight: "মতামত",
    section_subtitle: "আমাদের সেবা গ্রহণকারী ক্লায়েন্টদের অভিজ্ঞতা ও মতামত দেখুন",
  }), []);

  const { content } = useSiteContent("home", "reviews", fallbackContent);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("customer_reviews")
        .select("id, name, photo, rating, service, review, service_gradient")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        // Split reviews into two rows
        const half = Math.ceil(data.length / 2);
        setReviewsRow1(data.slice(0, half));
        setReviewsRow2(data.slice(half));
        setTotalCount(1500 + data.length);
      }
    };

    fetchReviews();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("customer-reviews-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customer_reviews",
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
              {totalCount}<EditableText page="home" section="reviews" contentKey="badge_text" value={content.badge_text} />
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-bengali">
              <EditableText page="home" section="reviews" contentKey="section_title_start" value={content.section_title_start} />{" "}
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                <EditableText page="home" section="reviews" contentKey="section_title_highlight" value={content.section_title_highlight} />
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-bengali">
              <EditableText page="home" section="reviews" contentKey="section_subtitle" value={content.section_subtitle} multiline />
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
