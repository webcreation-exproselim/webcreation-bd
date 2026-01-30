import { Palette } from "lucide-react";
import { ServicePageLayout } from "@/components/ServicePageLayout";

const portfolioItems = [
  {
    image: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=600",
    title: "ব্র্যান্ড লোগো",
    category: "গ্রাফিক্স ডিজাইন"
  },
  {
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600",
    title: "সোশ্যাল মিডিয়া পোস্ট",
    category: "গ্রাফিক্স ডিজাইন"
  },
  {
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600",
    title: "ব্র্যান্ড গাইডলাইন",
    category: "গ্রাফিক্স ডিজাইন"
  },
  {
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600",
    title: "বিজনেস কার্ড",
    category: "গ্রাফিক্স ডিজাইন"
  },
  {
    image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600",
    title: "পোস্টার ডিজাইন",
    category: "গ্রাফিক্স ডিজাইন"
  },
  {
    image: "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600",
    title: "প্যাকেজিং ডিজাইন",
    category: "গ্রাফিক্স ডিজাইন"
  },
];

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

const reviews = [
  {
    name: "মাহমুদ হাসান",
    role: "ব্র্যান্ড মালিক",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    review: "আমার ব্র্যান্ডের জন্য পারফেক্ট লোগো তৈরি করেছে। প্রফেশনাল এবং ক্রিয়েটিভ কাজ!",
    rating: 5,
  },
  {
    name: "রুবিনা খাতুন",
    role: "ফ্যাশন ডিজাইনার",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    review: "সোশ্যাল মিডিয়া পোস্টগুলো অসাধারণ! এনগেজমেন্ট অনেক বেড়ে গেছে।",
    rating: 5,
  },
  {
    name: "আরিফ রহমান",
    role: "রেস্টুরেন্ট মালিক",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    review: "মেনু ডিজাইন থেকে সাইনবোর্ড সব কিছু প্রফেশনালি করেছে। হাইলি রিকমেন্ডেড!",
    rating: 5,
  },
];

const GraphicsDesignPage = () => {
  return (
    <ServicePageLayout
      icon={Palette}
      title="গ্রাফিক্স ডিজাইন"
      subtitle="ক্রিয়েটিভ ডিজাইন যা ব্র্যান্ড বিল্ড করে"
      description="প্রফেশনাল গ্রাফিক্স ডিজাইন সার্ভিস যা আপনার ব্র্যান্ড আইডেন্টিটি তৈরি করে। লোগো থেকে শুরু করে সোশ্যাল মিডিয়া পোস্ট, ব্যানার, ব্রোশিওর - সবকিছু আধুনিক ও আকর্ষণীয়ভাবে ডিজাইন করি।"
      features={[
        "লোগো ডিজাইন",
        "ব্র্যান্ড আইডেন্টিটি",
        "সোশ্যাল মিডিয়া গ্রাফিক্স",
        "প্রিন্ট ডিজাইন",
        "প্যাকেজিং ডিজাইন",
        "ব্যানার ডিজাইন",
        "ইনফোগ্রাফিক্স",
        "মার্কেটিং ম্যাটেরিয়াল",
      ]}
      gradient="from-purple-500 to-pink-400"
      portfolio={portfolioItems}
      pricing={pricingPlans}
      reviews={reviews}
    />
  );
};

export default GraphicsDesignPage;
