import { motion } from "framer-motion";
import { X, Check, AlertTriangle, Zap, Shield, TrendingUp, Smartphone, Gauge } from "lucide-react";
import comparisonIllustration1 from "@/assets/comparison-illustration-1.png";
import comparisonIllustration2 from "@/assets/comparison-illustration-2.png";

const regularWebsitePoints = [
  { icon: AlertTriangle, text: "স্লো লোডিং স্পিড" },
  { icon: X, text: "মোবাইল ফ্রেন্ডলি নয়" },
  { icon: X, text: "SEO অপটিমাইজড নয়" },
  { icon: X, text: "সিকিউরিটি দুর্বল" },
  { icon: X, text: "আধুনিক ডিজাইন নেই" },
  { icon: X, text: "সেলস ফোকাসড নয়" },
];

const webCreationPoints = [
  { icon: Gauge, text: "সুপার ফাস্ট লোডিং" },
  { icon: Smartphone, text: "১০০% মোবাইল রেস্পন্সিভ" },
  { icon: TrendingUp, text: "SEO অপটিমাইজড" },
  { icon: Shield, text: "শক্তিশালী সিকিউরিটি" },
  { icon: Zap, text: "আধুনিক UI/UX ডিজাইন" },
  { icon: Check, text: "সেলস জেনারেটিং ফোকাস" },
];

export const ComparisonSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-black via-black/95 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 tech-grid-pattern opacity-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-red-500/20 border border-yellow-400/30 mb-6"
          >
            <span className="text-yellow-400">⚡</span>
            <span className="text-sm sm:text-base text-white font-bengali font-medium">
              পার্থক্য দেখুন
            </span>
          </motion.div>

          {/* Title - Split into lines for better readability */}
          <h2 className="font-bengali font-bold text-white mb-4">
            <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/80 mb-2">
              সাধারণ ওয়েবসাইট
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              <span className="text-gradient-gold">vs</span>
            </span>
            <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl mt-2">
              <span className="text-gradient-gold">Web Creation BD</span>
              <span className="text-white/80"> ওয়েবসাইট</span>
            </span>
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-bengali">
            সঠিক সিদ্ধান্ত নিন এবং আপনার ব্যবসাকে এগিয়ে নিয়ে যান
          </p>
        </motion.div>

        {/* Decorative Images */}
        <div className="grid grid-cols-2 gap-4 md:gap-8 mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="relative rounded-2xl overflow-hidden border border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-500">
              <img 
                src={comparisonIllustration1} 
                alt="Digital Growth" 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-xs sm:text-sm font-bengali text-white/90 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                  ডিজিটাল গ্রোথ 📈
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative group"
          >
            <div className="relative rounded-2xl overflow-hidden border border-green-400/20 hover:border-green-400/50 transition-all duration-500">
              <img 
                src={comparisonIllustration2} 
                alt="Super Fast Speed" 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-xs sm:text-sm font-bengali text-white/90 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                  সুপার ফাস্ট স্পিড ⚡
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Regular Website - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-red-500/30 h-full overflow-hidden">
              {/* Red glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl" />
              
              {/* Header */}
              <div className="relative flex items-center gap-3 mb-6 pb-4 border-b border-red-500/20">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bengali font-bold text-red-400">
                  সাধারণ ওয়েবসাইট
                </h3>
              </div>

              {/* Mock Website Preview */}
              <div className="relative mb-6 rounded-xl overflow-hidden border border-red-500/20">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                  {/* Fake website mockup */}
                  <div className="absolute inset-4 border border-gray-700 rounded-lg overflow-hidden">
                    <div className="h-6 bg-gray-700 flex items-center px-2 gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-600 rounded" />
                      <div className="h-3 w-full bg-gray-700 rounded" />
                      <div className="h-3 w-2/3 bg-gray-700 rounded" />
                      <div className="h-8 w-1/3 bg-gray-600 rounded mt-4" />
                    </div>
                  </div>
                  {/* Slow loading indicator */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-red-400 text-xs bg-red-500/20 px-2 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Slow</span>
                  </div>
                </div>
              </div>

              {/* Points List */}
              <ul className="relative space-y-3">
                {regularWebsitePoints.map((point, index) => (
                  <motion.li
                    key={point.text}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-3 text-white/70 font-bengali"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <point.icon className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-sm sm:text-base">{point.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Web Creation BD - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            {/* Animated border */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
              <div 
                className="absolute inset-0 bg-[conic-gradient(from_0deg,#facc15,#22c55e,#facc15,#22c55e,#facc15)] opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                style={{ animation: "spin 4s linear infinite" }}
              />
            </div>

            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>

            <div className="relative bg-black rounded-2xl p-6 sm:p-8 border border-yellow-400/30 h-full overflow-hidden">
              {/* Gold glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-green-500/5 rounded-2xl" />
              
              {/* Header */}
              <div className="relative flex items-center gap-3 mb-6 pb-4 border-b border-yellow-400/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-green-500 flex items-center justify-center">
                  <Check className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bengali font-bold text-gradient-gold">
                  Web Creation BD
                </h3>
              </div>

              {/* Mock Website Preview */}
              <div className="relative mb-6 rounded-xl overflow-hidden border border-yellow-400/30">
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
                  {/* Premium website mockup */}
                  <div className="absolute inset-4 border border-yellow-400/30 rounded-lg overflow-hidden bg-gradient-to-b from-black/80 to-black">
                    <div className="h-6 bg-gradient-to-r from-yellow-400/20 to-green-500/20 flex items-center px-2 gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 w-3/4 bg-gradient-to-r from-yellow-400/40 to-green-500/40 rounded" />
                      <div className="h-3 w-full bg-white/10 rounded" />
                      <div className="h-3 w-2/3 bg-white/10 rounded" />
                      <div className="h-8 w-1/3 bg-gradient-to-r from-yellow-400 to-green-500 rounded mt-4" />
                    </div>
                  </div>
                  {/* Fast indicator */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-full">
                    <Zap className="w-3 h-3" />
                    <span>Super Fast</span>
                  </div>
                </div>
              </div>

              {/* Points List */}
              <ul className="relative space-y-3">
                {webCreationPoints.map((point, index) => (
                  <motion.li
                    key={point.text}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-3 text-white font-bengali"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400/20 to-green-500/20 flex items-center justify-center flex-shrink-0">
                      <point.icon className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="text-sm sm:text-base">{point.text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-white/80 font-bengali text-lg mb-4">
            আপনার ব্যবসার জন্য সেরা ওয়েবসাইট তৈরি করতে আজই যোগাযোগ করুন
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-green-500 text-black font-bengali font-bold rounded-full shadow-lg hover:shadow-yellow-400/25 transition-all duration-300"
          >
            ফ্রি কনসালটেশন নিন
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
