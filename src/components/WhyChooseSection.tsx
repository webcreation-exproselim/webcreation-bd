import { motion } from "framer-motion";
import { Shield, Headphones, Package, Zap, Award, Users } from "lucide-react";
import { useMemo } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EditableText } from "./EditableText";

const featureIcons = [Shield, Headphones, Package, Zap, Award, Users];
const featureGradients = [
  "from-cyan-400 to-blue-500",
  "from-blue-500 to-purple-500",
  "from-purple-500 to-pink-500",
  "from-orange-400 to-orange-600",
  "from-green-500 to-emerald-500",
  "from-cyan-500 to-teal-500",
];

interface FeatureCardProps {
  index: number;
  title: string;
  description: string;
  gradient: string;
  icon: typeof Shield;
  page: string;
  section: string;
}

const FeatureCard = ({ index, title, description, gradient, icon: Icon, page, section }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      {/* Card */}
      <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 h-full overflow-hidden">
        {/* Bottom gradient border */}
        <div className={`pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
        
        {/* Hover glow effect */}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />

        {/* Icon */}
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${gradient} p-3.5 sm:p-4 mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-full h-full text-white" />
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bengali font-bold text-white mb-3 group-hover:text-gradient-brand transition-all duration-300">
          <EditableText 
            page={page} 
            section={section} 
            contentKey={`feature_${index}_title`} 
            value={title} 
          />
        </h3>

        {/* Description */}
        <p className="text-sm sm:text-base text-white/70 font-bengali leading-relaxed">
          <EditableText 
            page={page} 
            section={section} 
            contentKey={`feature_${index}_description`} 
            value={description} 
            multiline 
          />
        </p>
      </div>
    </motion.div>
  );
};

export const WhyChooseSection = () => {
  // Fallback content for all features
  const fallbackContent = useMemo(() => ({
    badge_text: "২০০০+ প্রজেক্টে বিশ্বস্ত",
    section_title_start: "কেন",
    section_title_highlight: "Web Creation BD",
    section_title_end: "থেকে সার্ভিস নিবেন?",
    section_subtitle: "বেশি সেল জেনারেট করতে পারে এমন ফাংশনাল ওয়েবসাইট ডিজাইন করে থাকে আমাদের টিম Web Creation BD!",
    // Feature 0
    feature_0_title: "মডার্ন টেকনোলজি",
    feature_0_description: "React, Next.js, Node.js সহ লেটেস্ট টেকনোলজি ব্যবহার করে স্কেলেবল এবং ফাস্ট ওয়েবসাইট তৈরি করি।",
    // Feature 1
    feature_1_title: "মোবাইল ফাস্ট",
    feature_1_description: "সব ডিভাইসে পারফেক্ট দেখায় এমন রেস্পন্সিভ ডিজাইন যা ইউজার এক্সপেরিয়েন্স বাড়ায়।",
    // Feature 2
    feature_2_title: "লাইটনিং ফাস্ট",
    feature_2_description: "স্পিড অপটিমাইজেশন করে লোডিং টাইম কমিয়ে ইউজার এনগেজমেন্ট এবং SEO র্যাংকিং বাড়াই।",
    // Feature 3
    feature_3_title: "সিকিউর কোডিং",
    feature_3_description: "আমরা বেশি সেল করতে পারি এমন সব ওয়েবসাইট ও ল্যান্ডিং পেজ ডিজাইন করি যা শতভাগ হ্যাকিং থেকে মুক্ত থাকে।",
    // Feature 4
    feature_4_title: "SEO অপটিমাইজড",
    feature_4_description: "প্রতিটি কাজে আমরা সর্বোচ্চ মান বজায় রাখি। আপনার সন্তুষ্টি না পাওয়া পর্যন্ত আমরা কাজ করে যাই।",
    // Feature 5
    feature_5_title: "ডেডিকেটেড সাপোর্ট",
    feature_5_description: "ডেডিকেটেড হোয়াটসঅ্যাপ গ্রুপের মাধ্যমে সকাল থেকে মধ্য রাত পর্যন্ত আমাদের এক্সপার্ট টিম যেকোনো সমস্যা সমাধান করে থাকেন।",
  }), []);

  const { content } = useSiteContent("home", "why-choose", fallbackContent);

  return (
    <section className="py-16 md:py-24 bg-dark-gradient relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 tech-grid-pattern opacity-10" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 mb-6"
          >
            <span className="text-cyan-400">★</span>
            <span className="text-sm sm:text-base text-white font-bengali font-medium">
              <EditableText page="home" section="why-choose" contentKey="badge_text" value={content.badge_text} />
            </span>
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bengali font-bold text-white mb-4">
            <EditableText page="home" section="why-choose" contentKey="section_title_start" value={content.section_title_start} />{" "}
            <span className="text-gradient-brand">
              <EditableText page="home" section="why-choose" contentKey="section_title_highlight" value={content.section_title_highlight} />
            </span>{" "}
            <EditableText page="home" section="why-choose" contentKey="section_title_end" value={content.section_title_end} />
          </h2>

          {/* Subtitle */}
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-3xl mx-auto font-bengali">
            <EditableText page="home" section="why-choose" contentKey="section_subtitle" value={content.section_subtitle} multiline />
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <FeatureCard 
              key={index}
              index={index}
              title={content[`feature_${index}_title`]}
              description={content[`feature_${index}_description`]}
              gradient={featureGradients[index]}
              icon={featureIcons[index]}
              page="home"
              section="why-choose"
            />
          ))}
        </div>
      </div>
    </section>
  );
};
