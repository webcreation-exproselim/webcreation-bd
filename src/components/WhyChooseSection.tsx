import { motion } from "framer-motion";
import { Shield, Headphones, Package, Zap, Award, Users } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "বেশি সেল ও সিকিউরিটি",
    description: "আমরা বেশি সেল করতে পারি এমন সব ওয়েবসাইট ও ল্যান্ডিং পেজ ডিজাইন করি যা শতভাগ হ্যাকিং থেকে মুক্ত থাকে।",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    icon: Headphones,
    title: "২৪ ঘন্টা সাপোর্ট",
    description: "ডেডিকেটেড হোয়াটসঅ্যাপ গ্রুপের মাধ্যমে সকাল থেকে মধ্য রাত পর্যন্ত আমাদের এক্সপার্ট টিম যেকোনো সমস্যা সমাধান করে থাকেন।",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    icon: Package,
    title: "প্যাকেজ ভিত্তিক",
    description: "আমাদের ৫৫০০ টাকা থেকে শুরু করে ১,২৫,০০০ টাকা পর্যন্ত ৮ টি প্যাকেজ রয়েছে। সামর্থ্য অনুযায়ী আপনার প্যাকেজ চয়েজ করতে পারবেন।",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "দ্রুত ডেলিভারি",
    description: "আমরা নির্ধারিত সময়ের মধ্যে প্রজেক্ট ডেলিভারি দিই। দ্রুত এবং মানসম্মত কাজের জন্য আমরা পরিচিত।",
    gradient: "from-orange-400 to-orange-600",
  },
  {
    icon: Award,
    title: "কোয়ালিটি গ্যারান্টি",
    description: "প্রতিটি কাজে আমরা সর্বোচ্চ মান বজায় রাখি। আপনার সন্তুষ্টি না পাওয়া পর্যন্ত আমরা কাজ করে যাই।",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "এক্সপার্ট টিম",
    description: "আমাদের টিমে রয়েছে অভিজ্ঞ ডিজাইনার, ডেভেলপার এবং মার্কেটার যারা আপনার ব্যবসাকে সফল করতে প্রতিশ্রুতিবদ্ধ।",
    gradient: "from-cyan-500 to-teal-500",
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
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
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
        
        {/* Hover glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />

        {/* Icon */}
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${feature.gradient} p-3.5 sm:p-4 mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <feature.icon className="w-full h-full text-white" />
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bengali font-bold text-white mb-3 group-hover:text-gradient-brand transition-all duration-300">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-sm sm:text-base text-white/70 font-bengali leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

export const WhyChooseSection = () => {
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
              ২০০০+ প্রজেক্টে বিশ্বস্ত
            </span>
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bengali font-bold text-white mb-4">
            কেন <span className="text-gradient-brand">Web Creation BD</span> থেকে সার্ভিস নিবেন?
          </h2>

          {/* Subtitle */}
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-3xl mx-auto font-bengali">
            বেশি সেল জেনারেট করতে পারে এমন ফাংশনাল ওয়েবসাইট ডিজাইন করে থাকে আমাদের টিম Web Creation BD!
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
