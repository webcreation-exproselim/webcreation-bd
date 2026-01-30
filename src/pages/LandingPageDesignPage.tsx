import { Layout } from "lucide-react";
import { ServicePageLayout } from "@/components/ServicePageLayout";

const portfolioItems = [
  {
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600",
    title: "SaaS ল্যান্ডিং পেজ",
    category: "ল্যান্ডিং পেজ"
  },
  {
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
    title: "প্রোডাক্ট লঞ্চ পেজ",
    category: "ল্যান্ডিং পেজ"
  },
  {
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
    title: "লিড জেন পেজ",
    category: "ল্যান্ডিং পেজ"
  },
  {
    image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600",
    title: "ইভেন্ট ল্যান্ডিং পেজ",
    category: "ল্যান্ডিং পেজ"
  },
  {
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
    title: "অ্যাপ ডাউনলোড পেজ",
    category: "ল্যান্ডিং পেজ"
  },
  {
    image: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=600",
    title: "সার্ভিস পেজ",
    category: "ল্যান্ডিং পেজ"
  },
];

const pricingPlans = [
  {
    name: "স্টার্টার",
    originalPrice: "৳৩,০০০",
    price: "৳১,৫০০",
    discount: "৫০% ছাড়",
    features: [
      "সিঙ্গেল পেজ ডিজাইন",
      "মোবাইল রেস্পন্সিভ",
      "বেসিক অ্যানিমেশন",
      "কন্টাক্ট ফর্ম",
      "SEO অপটিমাইজড",
    ],
  },
  {
    name: "প্রিমিয়াম",
    originalPrice: "৳৪,০০০",
    price: "৳২,০০০",
    discount: "৫০% ছাড়",
    popular: true,
    features: [
      "মাল্টি-সেকশন পেজ",
      "অ্যাডভান্সড অ্যানিমেশন",
      "A/B টেস্টিং রেডি",
      "লিড ক্যাপচার ফর্ম",
      "অ্যানালিটিক্স সেটআপ",
      "স্পিড অপটিমাইজড",
    ],
  },
  {
    name: "বিজনেস",
    originalPrice: "৳৬,০০০",
    price: "৳৩,০০০",
    discount: "৫০% ছাড়",
    features: [
      "ফুল ফানেল ল্যান্ডিং",
      "থ্যাংক ইউ পেজ",
      "ইমেইল ইন্টিগ্রেশন",
      "CRM কানেক্ট",
      "হিটম্যাপ সেটআপ",
      "কনভার্সন ট্র্যাকিং",
    ],
  },
];

const reviews = [
  {
    name: "ফয়সাল আহমেদ",
    role: "ডিজিটাল মার্কেটার",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    review: "ল্যান্ডিং পেজ কনভার্সন রেট ৪০% বাড়িয়ে দিয়েছে। ডিজাইন এবং UX দুটোই চমৎকার!",
    rating: 5,
  },
  {
    name: "তাহমিনা আক্তার",
    role: "কোর্স ক্রিয়েটর",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    review: "অনলাইন কোর্সের জন্য যে পেজ বানিয়েছে সেটা থেকে অনেক সেল পাচ্ছি। অসাধারণ!",
    rating: 5,
  },
  {
    name: "শাহরিয়ার কবির",
    role: "এজেন্সি মালিক",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    review: "ক্লায়েন্টদের জন্য বেশ কিছু ল্যান্ডিং পেজ বানিয়েছে। সবগুলোই হাই কনভার্টিং!",
    rating: 5,
  },
];

const LandingPageDesignPage = () => {
  return (
    <ServicePageLayout
      icon={Layout}
      title="ল্যান্ডিং পেজ ডিজাইন"
      subtitle="হাই-কনভার্টিং ল্যান্ডিং পেজ"
      description="কনভার্সন অপটিমাইজড ল্যান্ডিং পেজ যা আপনার ভিজিটরদের কাস্টমারে রূপান্তর করবে। প্রফেশনাল ডিজাইন, ফাস্ট লোডিং এবং মোবাইল ফ্রেন্ডলি ল্যান্ডিং পেজ তৈরি করি।"
      features={[
        "কনভার্সন অপটিমাইজড",
        "A/B টেস্টিং রেডি",
        "মোবাইল ফার্স্ট",
        "ফাস্ট লোডিং",
        "SEO ফ্রেন্ডলি",
        "লিড ক্যাপচার ফর্ম",
        "অ্যানালিটিক্স রেডি",
        "CRM ইন্টিগ্রেশন",
      ]}
      gradient="from-teal-500 to-cyan-400"
      portfolio={portfolioItems}
      pricing={pricingPlans}
      reviews={reviews}
    />
  );
};

export default LandingPageDesignPage;
