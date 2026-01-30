import { Code } from "lucide-react";
import { ServicePageLayout } from "@/components/ServicePageLayout";

const portfolioItems = [
  {
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
    title: "ই-কমার্স ওয়েবসাইট",
    category: "ওয়েব ডেভেলপমেন্ট"
  },
  {
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600",
    title: "কর্পোরেট ওয়েবসাইট",
    category: "ওয়েব ডেভেলপমেন্ট"
  },
  {
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
    title: "ড্যাশবোর্ড অ্যাপ",
    category: "ওয়েব ডেভেলপমেন্ট"
  },
  {
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
    title: "পোর্টফোলিও সাইট",
    category: "ওয়েব ডেভেলপমেন্ট"
  },
  {
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
    title: "SaaS প্ল্যাটফর্ম",
    category: "ওয়েব ডেভেলপমেন্ট"
  },
  {
    image: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=600",
    title: "ব্লগ ওয়েবসাইট",
    category: "ওয়েব ডেভেলপমেন্ট"
  },
];

const pricingPlans = [
  {
    name: "স্টার্টার",
    originalPrice: "৳১০,০০০",
    price: "৳৫,০০০",
    discount: "৫০% ছাড়",
    features: [
      "৫ পেজ ওয়েবসাইট",
      "মোবাইল রেস্পন্সিভ",
      "বেসিক SEO",
      "কন্টাক্ট ফর্ম",
      "১ মাস ফ্রি সাপোর্ট",
    ],
  },
  {
    name: "প্রিমিয়াম",
    originalPrice: "৳২৫,০০০",
    price: "৳১৫,০০০",
    discount: "৪০% ছাড়",
    popular: true,
    features: [
      "১৫ পেজ ওয়েবসাইট",
      "অ্যাডমিন প্যানেল",
      "অ্যাডভান্সড SEO",
      "পেমেন্ট ইন্টিগ্রেশন",
      "স্পিড অপটিমাইজেশন",
      "৩ মাস ফ্রি সাপোর্ট",
    ],
  },
  {
    name: "বিজনেস",
    originalPrice: "৳১৫,০০০",
    price: "৳৮,০০০",
    discount: "৪৭% ছাড়",
    features: [
      "আনলিমিটেড পেজ",
      "কাস্টম ফিচার্স",
      "API ইন্টিগ্রেশন",
      "ই-কমার্স রেডি",
      "সিকিউরিটি অডিট",
      "৬ মাস ফ্রি সাপোর্ট",
    ],
  },
];

const reviews = [
  {
    name: "ফারহান রশিদ",
    role: "স্টার্টআপ ফাউন্ডার",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    review: "অসাধারণ ওয়েবসাইট তৈরি করেছে! ডিজাইন এবং ফাংশনালিটি দুটোই পারফেক্ট। সময়মতো ডেলিভারি।",
    rating: 5,
  },
  {
    name: "নাফিসা বেগম",
    role: "অনলাইন শপ মালিক",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    review: "ই-কমার্স সাইট বানিয়েছে যেটা খুব স্মুথলি চলছে। কাস্টমাররা সহজেই অর্ডার করতে পারছে।",
    rating: 5,
  },
  {
    name: "সাইফুল ইসলাম",
    role: "বিজনেস কনসালট্যান্ট",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    review: "প্রফেশনাল কর্পোরেট ওয়েবসাইট যা আমার ব্যবসার ক্রেডিবিলিটি বাড়িয়েছে। সাপোর্টও চমৎকার।",
    rating: 5,
  },
];

const WebDevelopmentPage = () => {
  return (
    <ServicePageLayout
      icon={Code}
      title="ওয়েব ডেভেলপমেন্ট"
      subtitle="আধুনিক ও রেস্পন্সিভ ওয়েবসাইট"
      description="আপনার ব্যবসার জন্য কাস্টম ওয়েবসাইট তৈরি করি যা মোবাইল ফ্রেন্ডলি, ফাস্ট এবং SEO অপটিমাইজড। React, Next.js সহ আধুনিক টেকনোলজি ব্যবহার করে স্কেলেবল সল্যুশন ডেভেলপ করি।"
      features={[
        "কাস্টম ডিজাইন",
        "মোবাইল রেস্পন্সিভ",
        "SEO অপটিমাইজড",
        "ফাস্ট লোডিং",
        "অ্যাডমিন প্যানেল",
        "পেমেন্ট ইন্টিগ্রেশন",
        "সিকিউর কোডিং",
        "২৪/৭ সাপোর্ট",
      ]}
      gradient="from-green-500 to-emerald-400"
      portfolio={portfolioItems}
      pricing={pricingPlans}
      reviews={reviews}
    />
  );
};

export default WebDevelopmentPage;
