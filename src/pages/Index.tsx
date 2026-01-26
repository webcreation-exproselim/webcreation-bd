import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      
      {/* Placeholder sections to enable scrolling */}
      <section id="facebook-ads" className="min-h-screen bg-background flex items-center justify-center">
        <h2 className="text-3xl font-bold text-foreground">Facebook Ads Section</h2>
      </section>
      <section id="web-development" className="min-h-screen bg-muted flex items-center justify-center">
        <h2 className="text-3xl font-bold text-foreground">Web Development Section</h2>
      </section>
    </div>
  );
};

export default Index;
