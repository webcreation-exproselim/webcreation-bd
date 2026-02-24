import { Megaphone, Code, Palette, Video, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ParticleNetwork } from "./ParticleNetwork";
import { ConsultationModal } from "./ConsultationModal";
import { EditableText } from "./EditableText";
import heroProfessional from "@/assets/hero-professional.png";
import { useSiteContent } from "@/hooks/useSiteContent";

const services = [{
  icon: Megaphone,
  label: "ফেসবুক অ্যাডস",
  href: "#facebook-ads"
}, {
  icon: Code,
  label: "ওয়েব ডেভেলপমেন্ট",
  href: "#web-development"
}, {
  icon: Palette,
  label: "গ্রাফিক্স ডিজাইন",
  href: "#graphics-design"
}, {
  icon: Video,
  label: "ভিডিও এডিটিং",
  href: "#video-editing"
}, {
  icon: Activity,
  label: "মোশন গ্রাফিক্স",
  href: "#motion-graphics"
}];

export function HeroSection() {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  // Fallback content
  const fallbackContent = useMemo(() => ({
    badge_text: "সবার আগে বাংলাদেশ",
    title_line1: "আপনার ব্যবসার",
    title_line2: "ডিজিটাল রূপান্তর",
    title_line3: "শুরু হোক",
    subtitle: "ফেসবুক অ্যাডস, ওয়েব ডেভেলপমেন্ট, গ্রাফিক্স ডিজাইন - সব কিছু এক জায়গায়।",
    button_text: "ফ্রি কনসালটেশন নিন",
  }), []);

  const { content } = useSiteContent("home", "hero", fallbackContent);

  return (
    <>
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Fresh Cyan Gradient Background - Like Logo */}
      <div className="absolute inset-0 bg-wcbd-gradient" />
      
      {/* Blue/Purple gradient overlay on right side */}
      <div className="absolute inset-0 bg-gradient-to-l from-blue-500/30 via-purple-500/10 to-transparent pointer-events-none" />
      
      {/* Particle Network Animation */}
      <ParticleNetwork />

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left Side - Text Content */}
          <motion.div 
            className="text-left order-2 lg:order-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <span className="text-orange-500">🚀</span>
              <EditableText 
                page="home" 
                section="hero" 
                contentKey="badge_text"
                value={content.badge_text}
                className="text-white font-bengali text-sm font-medium"
              />
              <span className="text-orange-500">🚀</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-bengali text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-[1.1] text-white drop-shadow-lg">
              <EditableText 
                page="home" 
                section="hero" 
                contentKey="title_line1"
                value={content.title_line1}
              />
              <br />
              <span className="text-gradient-orange">
                <EditableText 
                  page="home" 
                  section="hero" 
                  contentKey="title_line2"
                  value={content.title_line2}
                />
              </span>
              <br />
              <EditableText 
                page="home" 
                section="hero" 
                contentKey="title_line3"
                value={content.title_line3}
              />
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-lg mb-8 font-bengali font-medium leading-relaxed">
              <EditableText 
                page="home" 
                section="hero" 
                contentKey="subtitle"
                value={content.subtitle}
                multiline
              />
            </p>

            {/* Primary CTA */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                onClick={() => setIsConsultationOpen(true)}
                className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white font-bengali font-bold text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-lg hover:from-orange-300 hover:via-orange-400 hover:to-orange-500 transition-all duration-300 shadow-xl shadow-orange-500/30"
              >
                <EditableText 
                  page="home" 
                  section="hero" 
                  contentKey="button_text"
                  value={content.button_text}
                />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Side - Professional Image with Floating Icons */}
          <motion.div 
            className="relative order-1 lg:order-2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative">
              {/* Right Side Icons - Vertical Stack */}
              <div className="absolute top-[15%] right-0 translate-x-[110%] flex flex-col gap-4 z-20 hidden lg:flex">
                {[Palette, Code, Video].map((Icon, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 flex items-center justify-center shadow-lg cursor-pointer hover:border-blue-400 transition-all"
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </motion.div>
                ))}
              </div>

              {/* Bottom Center Icon */}
              <motion.div
                className="absolute bottom-[5%] left-1/2 -translate-x-1/2 z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 flex items-center justify-center shadow-lg cursor-pointer hover:border-blue-400 transition-all">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </motion.div>

              {/* Left Side Icon */}
              <motion.div
                className="absolute top-[40%] left-0 -translate-x-[110%] z-20 hidden lg:block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.0 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 flex items-center justify-center shadow-lg cursor-pointer hover:border-orange-400 transition-all">
                  <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                </div>
              </motion.div>

              {/* Main Image */}
              <img 
                src={heroProfessional} 
                alt="Professional Digital Agency Expert" 
                className="relative z-10 w-60 sm:w-72 md:w-80 lg:w-[340px] xl:w-[400px] h-auto object-contain drop-shadow-2xl"
                loading="eager"
                decoding="async"
              />
            </div>
          </motion.div>
        </div>

        {/* Service Cards - Frosted Glass Style */}
        <motion.div 
          className="mt-16 lg:mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          {services.map((service, index) => (
            <motion.a 
              key={service.href} 
              href={service.href} 
              className="group relative p-4 sm:p-6 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 transition-all duration-300"
              whileHover={{
                y: -8,
                scale: 1.02,
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(34, 211, 238, 0.2)"
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              {/* Icon Container */}
              <div className="mb-3 sm:mb-4 flex justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/50 border border-white/40 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-white/70 transition-all duration-300">
                  <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 group-hover:text-blue-700 transition-all duration-300 group-hover:icon-spin" />
                </div>
              </div>
              
              {/* Label */}
              <p className="text-white font-bengali font-medium text-xs sm:text-sm text-center group-hover:text-white transition-colors duration-300 drop-shadow">
                {service.label}
              </p>

              {/* Hover border glow */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/50 transition-all duration-300 pointer-events-none" />
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2" animate={{
      y: [0, 10, 0]
    }} transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }}>
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-white/80 rounded-full" />
        </div>
      </motion.div>
    </section>
    
    {/* Consultation Modal */}
    <ConsultationModal 
      isOpen={isConsultationOpen} 
      onClose={() => setIsConsultationOpen(false)} 
    />
    </>
  );
}
