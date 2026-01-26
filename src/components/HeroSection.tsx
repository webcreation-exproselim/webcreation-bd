import { Megaphone, Code, Palette, Video, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ParticleNetwork } from "./ParticleNetwork";
import heroProfessional from "@/assets/hero-professional.png";
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
  return <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Bright Red Gradient Background */}
      <div className="absolute inset-0 bg-bnp-gradient" />
      
      {/* Golden/Orange gradient overlay on right side */}
      <div className="absolute inset-0 bg-gradient-to-l from-yellow-500/30 via-orange-500/10 to-transparent pointer-events-none" />
      
      {/* Particle Network Animation */}
      <ParticleNetwork />

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left Side - Text Content */}
          <motion.div className="text-center lg:text-left order-2 lg:order-1" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          ease: "easeOut"
        }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <span className="text-yellow-400">🚀</span>
              <span className="text-white/90 font-bengali text-sm">সবার আগে বাংলাদেশ</span>
              <span className="text-yellow-400">🚀</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-bengali text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold mb-4 leading-tight text-white">
              আপনার ব্যবসার{" "}
              <span className="text-gradient-gold relative">
                ডিজিটাল রূপান্তর
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></span>
              </span>
              <br />
              <span className="text-white">শুরু হোক</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 mb-8 font-bengali font-medium leading-relaxed">
              ফেসবুক অ্যাডস, ওয়েব ডেভেলপমেন্ট, গ্রাফিক্স ডিজাইন - সব কিছু এক জায়গায়।
            </p>

            {/* Primary CTA */}
            <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.98
          }}>
              <Button size="lg" className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bengali font-bold text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-full animate-pulse-gold hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-xl">
                ফ্রি কনসালটেশন নিন
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
              {/* Glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/30 via-red-600/20 to-transparent blur-3xl scale-125" />
              
              {/* Floating Service Icons Around Image */}
              {services.map((service, index) => {
                const positions = [
                  { top: '5%', left: '-10%', delay: 0 },
                  { top: '25%', right: '-5%', delay: 0.2 },
                  { top: '50%', left: '-15%', delay: 0.4 },
                  { top: '70%', right: '-10%', delay: 0.6 },
                  { bottom: '10%', left: '0%', delay: 0.8 },
                ];
                const pos = positions[index];
                
                return (
                  <motion.div
                    key={service.label}
                    className="absolute z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg"
                    style={{ 
                      top: pos.top, 
                      left: pos.left, 
                      right: pos.right, 
                      bottom: pos.bottom 
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      y: [0, -8, 0],
                    }}
                    transition={{ 
                      opacity: { duration: 0.5, delay: 0.5 + pos.delay },
                      scale: { duration: 0.5, delay: 0.5 + pos.delay },
                      y: { duration: 2 + index * 0.3, repeat: Infinity, ease: "easeInOut", delay: pos.delay }
                    }}
                    whileHover={{ 
                      scale: 1.2, 
                      boxShadow: "0 0 20px rgba(251, 191, 36, 0.6)",
                      borderColor: "rgba(251, 191, 36, 0.8)"
                    }}
                  >
                    <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400" />
                  </motion.div>
                );
              })}
              
              <img 
                src={heroProfessional} 
                alt="Professional Digital Agency Expert" 
                className="relative z-10 w-full max-w-sm lg:max-w-md xl:max-w-lg h-auto object-contain drop-shadow-2xl" 
              />
            </div>
          </motion.div>
        </div>

        {/* Service Cards - Frosted Glass Style */}
        <motion.div className="mt-16 lg:mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-5xl mx-auto" initial={{
        opacity: 0,
        y: 40
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        delay: 0.4,
        ease: "easeOut"
      }}>
          {services.map((service, index) => <motion.a key={service.href} href={service.href} className="group relative p-4 sm:p-6 rounded-xl glass-card transition-all duration-300" whileHover={{
          y: -8,
          scale: 1.02,
          boxShadow: "0 0 15px rgba(251, 191, 36, 0.5), 0 0 30px rgba(220, 38, 38, 0.3)"
        }} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.5 + index * 0.1
        }}>
              {/* Icon Container */}
              <div className="mb-3 sm:mb-4 flex justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center group-hover:border-yellow-400/50 group-hover:bg-yellow-500/10 transition-all duration-300">
                  <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 group-hover:text-yellow-300 transition-all duration-300 group-hover:icon-spin" />
                </div>
              </div>
              
              {/* Label */}
              <p className="text-white/90 font-bengali font-medium text-xs sm:text-sm text-center group-hover:text-yellow-400 transition-colors duration-300">
                {service.label}
              </p>

              {/* Hover border glow */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-yellow-400 transition-all duration-300 pointer-events-none" />
            </motion.a>)}
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
        <div className="w-6 h-10 border-2 border-yellow-500/40 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-yellow-400/70 rounded-full" />
        </div>
      </motion.div>
    </section>;
}