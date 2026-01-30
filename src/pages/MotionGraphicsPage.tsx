import { Activity } from "lucide-react";
import { ServicePageLayout } from "@/components/ServicePageLayout";

const portfolioItems = [
  {
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600",
    title: "অ্যানিমেটেড লোগো",
    category: "মোশন গ্রাফিক্স"
  },
  {
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600",
    title: "এক্সপ্লেইনার ভিডিও",
    category: "মোশন গ্রাফিক্স"
  },
  {
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600",
    title: "ইনফোগ্রাফিক্স অ্যানিমেশন",
    category: "মোশন গ্রাফিক্স"
  },
  {
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
    title: "কিনেটিক টাইপোগ্রাফি",
    category: "মোশন গ্রাফিক্স"
  },
  {
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600",
    title: "3D অ্যানিমেশন",
    category: "মোশন গ্রাফিক্স"
  },
  {
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    title: "সোশ্যাল মিডিয়া অ্যানিমেশন",
    category: "মোশন গ্রাফিক্স"
  },
];

const pricingPlans = [
  {
    name: "স্টার্টার",
    originalPrice: "৳৫,০০০",
    price: "৳৩,৫০০",
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
    name: "প্রফেশনাল",
    originalPrice: "৳১২,০০০",
    price: "৳৮,০০০",
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
    name: "এন্টারপ্রাইজ",
    originalPrice: "৳২৫,০০০",
    price: "৳১৮,০০০",
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

const reviews = [
  {
    name: "ইমরান হোসেন",
    role: "অ্যাপ ডেভেলপার",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    review: "অ্যাপের জন্য এক্সপ্লেইনার ভিডিও বানিয়েছে যেটা ইউজারদের কাছে অনেক পছন্দ হয়েছে!",
    rating: 5,
  },
  {
    name: "সুমাইয়া ইসলাম",
    role: "মার্কেটিং ম্যানেজার",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    review: "অ্যানিমেটেড অ্যাড ক্যাম্পেইন করেছে যেটার CTR অনেক বেশি পেয়েছি। অসাধারণ কাজ!",
    rating: 5,
  },
  {
    name: "নাঈম আহমেদ",
    role: "স্টার্টআপ ফাউন্ডার",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    review: "লোগো অ্যানিমেশন এবং ইন্ট্রো ভিডিও দুটোই প্রফেশনাল। ব্র্যান্ড ভ্যালু বাড়িয়ে দিয়েছে।",
    rating: 5,
  },
];

const MotionGraphicsPage = () => {
  return (
    <ServicePageLayout
      icon={Activity}
      title="মোশন গ্রাফিক্স"
      subtitle="আই-ক্যাচিং অ্যানিমেশন"
      description="ক্রিয়েটিভ মোশন গ্রাফিক্স যা আপনার মেসেজকে জীবন্ত করে তোলে। অ্যানিমেটেড লোগো, এক্সপ্লেইনার ভিডিও, কিনেটিক টাইপোগ্রাফি থেকে শুরু করে 3D অ্যানিমেশন পর্যন্ত সব ধরনের মোশন ওয়ার্ক করি।"
      features={[
        "অ্যানিমেটেড লোগো",
        "এক্সপ্লেইনার ভিডিও",
        "ইনফোগ্রাফিক্স অ্যানিমেশন",
        "কিনেটিক টাইপোগ্রাফি",
        "3D অ্যানিমেশন",
        "ক্যারেক্টার অ্যানিমেশন",
        "ভিজ্যুয়াল ইফেক্টস",
        "সাউন্ড ডিজাইন",
      ]}
      gradient="from-yellow-500 to-amber-400"
      portfolio={portfolioItems}
      pricing={pricingPlans}
      reviews={reviews}
    />
  );
};

export default MotionGraphicsPage;
