import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { PortfolioSection } from "@/components/PortfolioSection";
import { motion } from "framer-motion";
import { FileImage } from "lucide-react";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30"
          >
            <FileImage className="w-8 h-8 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold font-bengali text-white mb-4"
          >
            আমাদের <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">পোর্টফোলিও</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/60 font-bengali max-w-2xl mx-auto"
          >
            আমাদের সাম্প্রতিক কাজগুলো দেখুন এবং আমাদের দক্ষতা সম্পর্কে জানুন
          </motion.p>
        </div>
      </section>

      {/* Portfolio Section (reused from homepage) */}
      <PortfolioSection />

      <Footer />
      <Chatbot />
    </div>
  );
}
