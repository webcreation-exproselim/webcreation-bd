import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <HeroSection />
      
      {/* Placeholder sections to enable scrolling */}
      <section id="facebook-ads" className="min-h-screen bg-premium-gradient flex items-center justify-center border-t border-white/5">
        <h2 className="text-3xl font-bengali font-bold text-gradient-gold">ফেসবুক অ্যাডস সেকশন</h2>
      </section>
      <section id="web-development" className="min-h-screen bg-black flex items-center justify-center border-t border-white/5">
        <h2 className="text-3xl font-bengali font-bold text-gradient-gold">ওয়েব ডেভেলপমেন্ট সেকশন</h2>
      </section>
    </div>
  );
};

export default Index;
