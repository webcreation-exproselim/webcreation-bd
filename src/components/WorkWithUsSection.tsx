import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EditableText } from "./EditableText";

const benefits = [
  "১০০% সন্তুষ্টি গ্যারান্টি",
  "২৪/৭ কাস্টমার সাপোর্ট",
  "সাশ্রয়ী মূল্যে প্রিমিয়াম সার্ভিস",
  "অভিজ্ঞ প্রফেশনাল টিম",
  "দ্রুত ডেলিভারি",
  "ফ্রি রিভিশন সুবিধা",
];

const services = [
  "ওয়েব ডেভেলপমেন্ট",
  "গ্রাফিক্স ডিজাইন",
  "ভিডিও এডিটিং",
  "মোশন গ্রাফিক্স",
  "ফেসবুক অ্যাডস",
  "ল্যান্ডিং পেজ",
];

export function WorkWithUsSection() {
  // Fallback content
  const fallbackContent = useMemo(() => ({
    badge_text: "আমাদের সাথে কাজ করুন",
    section_title_start: "আপনার ব্যবসার",
    section_title_highlight: "ডিজিটাল সাফল্যের",
    section_title_end: "অংশীদার",
    section_description: "Web Creation BD আপনার ব্যবসার জন্য সেরা মানের ডিজিটাল সার্ভিস প্রদান করে। আমাদের অভিজ্ঞ টিম আপনার প্রতিটি প্রজেক্টে সর্বোচ্চ মনোযোগ দিয়ে কাজ করে।",
    stats_badge: "১৫০০+ সফল প্রজেক্ট সম্পন্ন",
    whatsapp_button: "হোয়াটসঅ্যাপে মেসেজ করুন",
    call_button: "কল করুন",
  }), []);

  const { content } = useSiteContent("home", "work-with-us", fallbackContent);

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-black via-red-950/20 to-black overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 hex-pattern opacity-30" />
      
      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative">
              {/* Glow Effect Behind Image */}
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 via-red-500/20 to-yellow-400/20 rounded-3xl blur-2xl" />
              
              {/* Main Image Container */}
              <div className="relative bg-gradient-to-br from-red-900/40 to-black/60 rounded-3xl p-6 md:p-8 border border-white/10 backdrop-blur-sm">
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-yellow-400/30 to-yellow-600/10 rounded-full blur-xl" />
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-red-500/30 to-red-700/10 rounded-full blur-xl" />
                
                {/* Service Grid */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {services.map((service, index) => (
                    <motion.div
                      key={service}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-black/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10 hover:border-yellow-400/30 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-yellow-400/20 to-red-500/20 flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                      </div>
                      <p className="font-bengali text-white/90 text-xs md:text-sm font-medium">
                        {service}
                      </p>
                    </motion.div>
                  ))}
                </div>
                
                {/* Stats Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-6 flex justify-center"
                >
                  <div className="bg-gradient-to-r from-yellow-400/20 to-red-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-yellow-400/30">
                    <span className="font-bengali text-yellow-400 font-bold text-sm md:text-base">
                      <EditableText page="home" section="work-with-us" contentKey="stats_badge" value={content.stats_badge} />
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/10 to-red-500/10 border border-yellow-400/30 mb-6"
            >
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="font-bengali text-yellow-400 text-sm font-medium">
                <EditableText page="home" section="work-with-us" contentKey="badge_text" value={content.badge_text} />
              </span>
            </motion.div>

            {/* Title */}
            <h2 className="font-bengali text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              <EditableText page="home" section="work-with-us" contentKey="section_title_start" value={content.section_title_start} />{" "}
              <span className="text-gradient-gold">
                <EditableText page="home" section="work-with-us" contentKey="section_title_highlight" value={content.section_title_highlight} />
              </span>{" "}
              <EditableText page="home" section="work-with-us" contentKey="section_title_end" value={content.section_title_end} />
            </h2>

            {/* Description */}
            <p className="font-bengali text-white/70 text-base md:text-lg mb-8 leading-relaxed">
              <EditableText page="home" section="work-with-us" contentKey="section_description" value={content.section_description} multiline />
            </p>

            {/* Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-black" />
                  </div>
                  <span className="font-bengali text-white/80 text-sm md:text-base">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bengali font-bold hover:from-yellow-500 hover:to-yellow-600 px-6 py-6 text-base rounded-xl shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 transition-all duration-300 group"
              >
                <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  হোয়াটসঅ্যাপে মেসেজ করুন
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white/5 text-white font-bengali font-medium hover:bg-white/10 hover:border-yellow-400/50 px-6 py-6 text-base rounded-xl transition-all duration-300"
              >
                <a href="tel:+8801332052874">
                  <Phone className="w-5 h-5 mr-2" />
                  কল করুন
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
