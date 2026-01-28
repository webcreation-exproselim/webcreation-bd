import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { ServicesSection } from "@/components/ServicesSection";
import { WhyChooseSection } from "@/components/WhyChooseSection";
import { ComparisonSection } from "@/components/ComparisonSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { PricingSection } from "@/components/PricingSection";
const Index = () => {
  return <div className="min-h-screen bg-black">
      <Header />
      <HeroSection />
      <StatsSection />
      <WhyChooseSection />
      <ServicesSection />
      <ComparisonSection />
      <PortfolioSection />
      <PricingSection />
      
      {/* Placeholder sections for service details */}
      
      <section id="web-development" className="min-h-[50vh] bg-black flex items-center justify-center border-t border-white/5">
        
      </section>
    </div>;
};
export default Index;