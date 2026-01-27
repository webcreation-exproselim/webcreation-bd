import { motion } from "framer-motion";
import { Megaphone, Code, Palette, Video, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Megaphone,
    title: "ফেসবুক অ্যাডস",
    description: "টার্গেটেড ফেসবুক বিজ্ঞাপন ক্যাম্পেইন যা আপনার ব্যবসায় সর্বোচ্চ ROI নিয়ে আসবে। প্রফেশনাল অ্যাড ম্যানেজমেন্ট ও অপটিমাইজেশন।",
    features: ["টার্গেট অডিয়েন্স রিসার্চ", "ক্রিয়েটিভ ডিজাইন", "A/B টেস্টিং", "পারফরম্যান্স রিপোর্ট"],
    gradient: "from-blue-500 to-cyan-400",
    href: "#facebook-ads",
  },
  {
    icon: Code,
    title: "ওয়েব ডেভেলপমেন্ট",
    description: "আধুনিক ও রেস্পন্সিভ ওয়েবসাইট যা আপনার ব্র্যান্ডকে অনলাইনে প্রফেশনালভাবে উপস্থাপন করবে। ফুল-স্ট্যাক সল্যুশন।",
    features: ["কাস্টম ডিজাইন", "মোবাইল রেস্পন্সিভ", "SEO অপটিমাইজড", "ফাস্ট লোডিং"],
    gradient: "from-green-500 to-emerald-400",
    href: "#web-development",
  },
  {
    icon: Palette,
    title: "গ্রাফিক্স ডিজাইন",
    description: "ক্রিয়েটিভ গ্রাফিক্স ডিজাইন যা আপনার ব্র্যান্ড আইডেন্টিটি তৈরি করবে। লোগো থেকে সোশ্যাল মিডিয়া পোস্ট সবকিছু।",
    features: ["লোগো ডিজাইন", "ব্র্যান্ড আইডেন্টিটি", "সোশ্যাল মিডিয়া", "প্রিন্ট ডিজাইন"],
    gradient: "from-purple-500 to-pink-400",
    href: "#graphics-design",
  },
  {
    icon: Video,
    title: "ভিডিও এডিটিং",
    description: "প্রফেশনাল ভিডিও এডিটিং সার্ভিস যা আপনার কন্টেন্টকে পরবর্তী স্তরে নিয়ে যাবে। সিনেমাটিক কোয়ালিটি।",
    features: ["প্রফেশনাল কাট", "কালার গ্রেডিং", "সাউন্ড ডিজাইন", "মোশন গ্রাফিক্স"],
    gradient: "from-red-500 to-orange-400",
    href: "#video-editing",
  },
  {
    icon: Activity,
    title: "মোশন গ্রাফিক্স",
    description: "আই-ক্যাচিং মোশন গ্রাফিক্স যা আপনার মেসেজকে জীবন্ত করে তুলবে। অ্যানিমেটেড লোগো থেকে এক্সপ্লেইনার ভিডিও।",
    features: ["অ্যানিমেটেড লোগো", "এক্সপ্লেইনার ভিডিও", "ইনফোগ্রাফিক্স", "3D অ্যানিমেশন"],
    gradient: "from-yellow-500 to-amber-400",
    href: "#motion-graphics",
  },
];

export const ServicesSection = () => {
  return (
    <section id="services" className="py-16 md:py-24 bg-gradient-to-b from-black via-black/95 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 tech-grid-pattern opacity-20" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bengali font-bold text-white">
            আমাদের <span className="text-gradient-gold">সার্ভিস</span> সমূহ
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-bengali">
            আপনার ব্যবসার ডিজিটাল সাফল্যের জন্য আমাদের প্রফেশনাল সার্ভিস গুলো
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              {/* Animated gradient border */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 rounded-2xl opacity-30 group-hover:opacity-100 blur transition-all duration-500 group-hover:blur-md" />
              
              {/* Card */}
              <div className="relative bg-black/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 group-hover:border-yellow-400/30 transition-all duration-500 h-full flex flex-col">
                {/* Icon */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${service.gradient} p-3.5 sm:p-4 mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-full h-full text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bengali font-bold text-white mb-3 group-hover:text-gradient-gold transition-all duration-300">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-white/70 font-bengali mb-4 sm:mb-6 leading-relaxed flex-grow">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs sm:text-sm text-white/60 font-bengali">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-red-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <a href={service.href}>
                  <Button
                    variant="outline"
                    className="w-full font-bengali border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400 group/btn transition-all duration-300"
                  >
                    বিস্তারিত দেখুন
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </a>

                {/* Corner Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
