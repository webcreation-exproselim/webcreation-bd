import { Megaphone } from "lucide-react";
import { ServicePageLayout } from "@/components/ServicePageLayout";

const portfolioItems = [
  {
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600",
    title: "ই-কমার্স ক্যাম্পেইন",
    category: "ফেসবুক অ্যাডস"
  },
  {
    image: "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=600",
    title: "লিড জেনারেশন",
    category: "ফেসবুক অ্যাডস"
  },
  {
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
    title: "ব্র্যান্ড অ্যাওয়ারনেস",
    category: "ফেসবুক অ্যাডস"
  },
  {
    image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600",
    title: "রিটার্গেটিং ক্যাম্পেইন",
    category: "ফেসবুক অ্যাডস"
  },
  {
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
    title: "ভিডিও অ্যাড ক্যাম্পেইন",
    category: "ফেসবুক অ্যাডস"
  },
  {
    image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600",
    title: "ক্যারোসেল অ্যাড",
    category: "ফেসবুক অ্যাডস"
  },
];

const pricingPlans = [
  {
    name: "স্টার্টার",
    originalPrice: "৳৫,০০০",
    price: "৳৩,৫০০",
    discount: "৩০% ছাড়",
    features: [
      "১টি ক্যাম্পেইন সেটআপ",
      "৫টি অ্যাড ক্রিয়েটিভ",
      "টার্গেট অডিয়েন্স রিসার্চ",
      "সাপ্তাহিক রিপোর্ট",
      "১ মাস সাপোর্ট",
    ],
  },
  {
    name: "প্রিমিয়াম",
    originalPrice: "৳১০,০০০",
    price: "৳৭,০০০",
    discount: "৩০% ছাড়",
    popular: true,
    features: [
      "৩টি ক্যাম্পেইন সেটআপ",
      "১৫টি অ্যাড ক্রিয়েটিভ",
      "অ্যাডভান্সড টার্গেটিং",
      "A/B টেস্টিং",
      "দৈনিক রিপোর্ট",
      "২ মাস সাপোর্ট",
    ],
  },
  {
    name: "বিজনেস",
    originalPrice: "৳২০,০০০",
    price: "৳১৫,০০০",
    discount: "২৫% ছাড়",
    features: [
      "আনলিমিটেড ক্যাম্পেইন",
      "৩০+ অ্যাড ক্রিয়েটিভ",
      "ফুল ফানেল স্ট্র্যাটেজি",
      "রিটার্গেটিং সেটআপ",
      "২৪/৭ মনিটরিং",
      "৩ মাস সাপোর্ট",
    ],
  },
];

const reviews = [
  {
    name: "রাহাত হোসেন",
    role: "ই-কমার্স উদ্যোক্তা",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    review: "ফেসবুক অ্যাডস সার্ভিস নেওয়ার পর আমার সেলস ৩ গুণ বেড়ে গেছে। অসাধারণ টার্গেটিং এবং ক্রিয়েটিভ!",
    rating: 5,
  },
  {
    name: "সাবরিনা আক্তার",
    role: "বিউটি ব্র্যান্ড মালিক",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    review: "প্রতি মাসে কনসিস্টেন্ট রেজাল্ট পাচ্ছি। ROI অনেক ভালো এবং কাস্টমার সাপোর্টও চমৎকার।",
    rating: 5,
  },
  {
    name: "তানভীর আহমেদ",
    role: "রেস্টুরেন্ট মালিক",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    review: "লোকাল টার্গেটিং করে অনেক কাস্টমার পেয়েছি। এক মাসেই ইনভেস্টমেন্ট উঠে গেছে।",
    rating: 5,
  },
];

const FacebookAdsPage = () => {
  return (
    <ServicePageLayout
      icon={Megaphone}
      title="ফেসবুক অ্যাডস"
      subtitle="টার্গেটেড মার্কেটিং যা রেজাল্ট দেয়"
      description="প্রফেশনাল ফেসবুক অ্যাডস ম্যানেজমেন্ট সার্ভিস যা আপনার ব্যবসায়ের জন্য সর্বোচ্চ ROI নিশ্চিত করে। আমাদের এক্সপার্ট টিম আপনার অডিয়েন্সকে সঠিকভাবে টার্গেট করে এবং কনভার্সন অপটিমাইজ করে।"
      features={[
        "টার্গেট অডিয়েন্স রিসার্চ",
        "ক্রিয়েটিভ অ্যাড ডিজাইন",
        "A/B টেস্টিং",
        "পারফরম্যান্স রিপোর্টিং",
        "রিটার্গেটিং ক্যাম্পেইন",
        "লুকঅ্যালাইক অডিয়েন্স",
        "ক্যাম্পেইন অপটিমাইজেশন",
        "২৪/৭ মনিটরিং",
      ]}
      gradient="from-blue-500 to-cyan-400"
      portfolio={portfolioItems}
      pricing={pricingPlans}
      reviews={reviews}
    />
  );
};

export default FacebookAdsPage;
