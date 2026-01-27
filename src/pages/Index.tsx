import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { ServicesSection } from "@/components/ServicesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      
      {/* Placeholder sections for service details */}
      <section id="facebook-ads" className="min-h-[50vh] bg-black flex items-center justify-center border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
          <h2 className="text-3xl font-bengali font-bold text-gradient-gold">ফেসবুক অ্যাডস বিস্তারিত</h2>
        </div>
      </section>
      <section id="web-development" className="min-h-[50vh] bg-black flex items-center justify-center border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
          <h2 className="text-3xl font-bengali font-bold text-gradient-gold">ওয়েব ডেভেলপমেন্ট বিস্তারিত</h2>
        </div>
      </section>
    </div>
  );
};

export default Index;
