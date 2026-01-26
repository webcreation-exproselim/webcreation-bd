import { useState, useEffect } from "react";
import { Megaphone, Code, Palette, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  { icon: Megaphone, label: "ফেসবুক অ্যাডস", href: "#facebook-ads" },
  { icon: Code, label: "ওয়েব ডেভেলপমেন্ট", href: "#web-development" },
  { icon: Palette, label: "গ্রাফিক্স ডিজাইন", href: "#graphics-design" },
  { icon: Play, label: "ভিডিও এডিটিং", href: "#video-editing" },
  { icon: Sparkles, label: "মোশন গ্রাফিক্স", href: "#motion-graphics" },
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dark Maroon Gradient Background */}
      <div className="absolute inset-0 bg-gradient-maroon" />
      
      {/* Radial gradient overlays */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 via-transparent to-black/60" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-crimson/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Circuit/Polygon Pattern Overlay */}
      <div className="absolute inset-0 polygon-pattern opacity-30" />

      {/* Mouse Follow Glow */}
      <div
        className="pointer-events-none absolute w-[600px] h-[600px] rounded-full opacity-20 transition-all duration-300 ease-out"
        style={{
          background: "radial-gradient(circle, hsl(45, 93%, 47%, 0.15) 0%, transparent 70%)",
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-20">
        {/* Main Headline */}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
          <span className="text-gradient-gold">
            আপনার ব্যবসার ডিজিটাল রূপান্তর
          </span>
          <br />
          <span className="text-white">শুরু হোক আমাদের সাথে</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10 font-sans leading-relaxed">
          আপনার আইডিয়া, আমাদের এক্সিকিউশন। চলুন একসাথে আপনার ব্র্যান্ডের ডিজিটাল যাত্রা শুরু করি।
        </p>

        {/* Primary CTA */}
        <Button
          size="lg"
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-luxury-dark font-bold text-lg px-10 py-6 rounded-full animate-pulse-gold hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 transition-all duration-300 hover:scale-105"
        >
          ফ্রি কনসালটেশন নিন
        </Button>

        {/* Service Mini Cards */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <a
              key={service.href}
              href={service.href}
              className="group relative p-6 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm card-3d-hover glow-border-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-luxury-maroon-light to-luxury-dark border border-white/10 flex items-center justify-center group-hover:border-yellow-500/50 transition-all duration-300">
                  <service.icon className="w-7 h-7 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
                </div>
              </div>
              
              {/* Label */}
              <p className="text-white/80 font-medium text-sm group-hover:text-yellow-400 transition-colors duration-300">
                {service.label}
              </p>

              {/* Hover Glow Border Effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-luxury-crimson via-yellow-500 to-luxury-crimson bg-clip-border" style={{ padding: '2px' }}>
                  <div className="w-full h-full rounded-xl bg-black/60" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-yellow-500/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-yellow-400/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}
