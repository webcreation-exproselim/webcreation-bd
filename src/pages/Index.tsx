import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { ServicesSection } from "@/components/ServicesSection";
import { WhyChooseSection } from "@/components/WhyChooseSection";
import { ComparisonSection } from "@/components/ComparisonSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { PricingSection } from "@/components/PricingSection";
import { CustomerReviewSection } from "@/components/CustomerReviewSection";
import { WorkWithUsSection } from "@/components/WorkWithUsSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <HeroSection />
      <StatsSection />
      <WhyChooseSection />
      <ServicesSection />
      <ComparisonSection />
      <PortfolioSection />
      <PricingSection />
      <CustomerReviewSection />
      <WorkWithUsSection />
      <Footer />
    </div>
  );
};

export default Index;