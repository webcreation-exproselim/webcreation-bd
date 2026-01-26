import { useState, useEffect } from "react";
import { Megaphone, Code, Palette, Video, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroProfessional from "@/assets/hero-professional.png";

const services = [
  { icon: Megaphone, label: "ফেসবুক অ্যাডস", href: "#facebook-ads" },
  { icon: Code, label: "ওয়েব ডেভেলপমেন্ট", href: "#web-development" },
  { icon: Palette, label: "গ্রাফিক্স ডিজাইন", href: "#graphics-design" },
  { icon: Video, label: "ভিডিও এডিটিং", href: "#video-editing" },
  { icon: Activity, label: "মোশন গ্রাফিক্স", href: "#motion-graphics" },
];

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Premium Maroon to Black Gradient Background */}
      <div className="absolute inset-0 bg-premium-gradient" />
      
      {/* Technology Grid Pattern Overlay */}
      <div className="absolute inset-0 tech-grid-pattern opacity-100" />
      <div className="absolute inset-0 hex-pattern opacity-100" />

      {/* Radial Glow Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Mouse Follow Glow */}
      <div
        className="pointer-events-none absolute w-[500px] h-[500px] rounded-full opacity-30 transition-all duration-200 ease-out"
        style={{
          background: "radial-gradient(circle, hsl(48, 96%, 53%, 0.12) 0%, transparent 70%)",
          left: mousePosition.x - 250,
          top: mousePosition.y - 250,
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Main Headline */}
            <h1 className="font-bengali text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">
                আপনার ব্যবসার ডিজিটাল রূপান্তর শুরু হোক
              </span>
              <br />
              <span className="text-gradient-gold">আমাদের সাথে</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0 mb-8 font-bengali font-medium leading-relaxed">
              আপনার আইডিয়া, আমাদের এক্সিকিউশন। চলুন একসাথে আপনার ব্র্যান্ডের ডিজিটাল যাত্রা শুরু করি।
            </p>

            {/* Primary CTA */}
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bengali font-bold text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-full animate-pulse-gold hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 transition-all duration-300 hover:scale-105 shadow-xl shadow-yellow-500/30"
            >
              ফ্রি কনসালটেশন নিন
            </Button>
          </div>

          {/* Right Side - Professional Image */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative animate-float">
              {/* Glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 via-red-500/10 to-transparent blur-3xl scale-110" />
              
              <img
                src={heroProfessional}
                alt="Professional Digital Agency Expert"
                className="relative z-10 w-full max-w-md lg:max-w-lg xl:max-w-xl h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Service Cards */}
        <div className="mt-16 lg:mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <a
              key={service.href}
              href={service.href}
              className="group relative p-4 sm:p-6 rounded-xl bg-black/50 border border-white/20 backdrop-blur-sm card-premium hover:border-yellow-500 hover:glow-border-red-gold"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon Container */}
              <div className="mb-3 sm:mb-4 flex justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center group-hover:border-yellow-500/50 group-hover:bg-gradient-to-br group-hover:from-yellow-500/20 group-hover:to-red-500/20 transition-all duration-300">
                  <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 group-hover:text-yellow-300 transition-all duration-300 group-hover:animate-icon-spin" />
                </div>
              </div>
              
              {/* Label */}
              <p className="text-white/90 font-bengali font-medium text-xs sm:text-sm text-center group-hover:text-yellow-400 transition-colors duration-300">
                {service.label}
              </p>

              {/* Hover Glow Overlay */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-yellow-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </a>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-yellow-500/40 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-yellow-400/70 rounded-full" />
        </div>
      </div>
    </section>
  );
}
