import { Chatbot } from "@/components/Chatbot";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StoriesSection } from "@/components/StoriesSection";

const OfferPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-16 lg:pt-20">
        <section className="border-b border-border bg-gradient-to-b from-background via-card/60 to-background">
          <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 lg:px-16 lg:py-20">
            <div className="max-w-3xl space-y-4">
              <p className="font-bengali text-sm font-medium text-primary">সর্বশেষ অফার</p>
              <h1 className="font-bengali text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                আমাদের নতুন অফার ও ফেসবুক পোস্ট এক জায়গায় দেখুন
              </h1>
              <p className="max-w-2xl font-bengali text-sm leading-7 text-muted-foreground sm:text-base">
                এখানে আমাদের চলমান অফার, নতুন আপডেট আর সাম্প্রতিক পোস্টগুলো একসাথে পাবেন।
              </p>
            </div>
          </div>
        </section>

        <StoriesSection />
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default OfferPage;