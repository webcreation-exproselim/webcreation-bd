import { Video } from "lucide-react";
import { ServicePageLayout } from "@/components/ServicePageLayout";

const portfolioItems = [
  {
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600",
    title: "প্রোডাক্ট ভিডিও",
    category: "ভিডিও এডিটিং"
  },
  {
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600",
    title: "কর্পোরেট ভিডিও",
    category: "ভিডিও এডিটিং"
  },
  {
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600",
    title: "YouTube ভিডিও",
    category: "ভিডিও এডিটিং"
  },
  {
    image: "https://images.unsplash.com/photo-1605826832916-d0ea9d6fe71e?w=600",
    title: "রিলস ভিডিও",
    category: "ভিডিও এডিটিং"
  },
  {
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600",
    title: "ইভেন্ট ভিডিও",
    category: "ভিডিও এডিটিং"
  },
  {
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600",
    title: "অ্যাড ভিডিও",
    category: "ভিডিও এডিটিং"
  },
];

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

const reviews = [
  {
    name: "সাকিব আল হাসান",
    role: "ইউটিউবার",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    review: "YouTube ভিডিও এডিটিং করে অনেক প্রফেশনাল কোয়ালিটি দিয়েছে। ভিউ অনেক বেড়েছে!",
    rating: 5,
  },
  {
    name: "তাসনিম ফারহানা",
    role: "কন্টেন্ট ক্রিয়েটর",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    review: "রিলস ভিডিও এডিটিং অসাধারণ! ট্রান্সিশন এবং ইফেক্টস সব পারফেক্ট।",
    rating: 5,
  },
  {
    name: "রাজীব করিম",
    role: "বিজনেস ওনার",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    review: "প্রোডাক্ট ভিডিও বানিয়েছে যেটা সেলস বাড়িয়ে দিয়েছে। কোয়ালিটি অনেক ভালো।",
    rating: 5,
  },
];

const VideoEditingPage = () => {
  return (
    <ServicePageLayout
      icon={Video}
      title="ভিডিও এডিটিং"
      subtitle="সিনেমাটিক কোয়ালিটি ভিডিও"
      description="প্রফেশনাল ভিডিও এডিটিং সার্ভিস যা আপনার কন্টেন্টকে পরবর্তী স্তরে নিয়ে যাবে। YouTube ভিডিও থেকে শুরু করে কর্পোরেট প্রেজেন্টেশন, সোশ্যাল মিডিয়া রিলস - সব ধরনের ভিডিও এডিট করি।"
      features={[
        "প্রফেশনাল কাটিং",
        "কালার গ্রেডিং",
        "সাউন্ড ডিজাইন",
        "মোশন গ্রাফিক্স",
        "ভিজ্যুয়াল ইফেক্টস",
        "সাবটাইটেল",
        "ভয়েস ওভার",
        "4K রেন্ডারিং",
      ]}
      gradient="from-red-500 to-orange-400"
      portfolio={portfolioItems}
      pricing={pricingPlans}
      reviews={reviews}
    />
  );
};

export default VideoEditingPage;
