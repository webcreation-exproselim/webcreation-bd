import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Chatbot } from "./Chatbot";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface PortfolioItem {
  image: string;
  title: string;
  category: string;
}

interface PricingPlan {
  name: string;
  originalPrice: string;
  price: string;
  discount: string;
  features: string[];
  popular?: boolean;
}

interface Review {
  name: string;
  role: string;
  image: string;
  review: string;
  rating: number;
}

interface ServicePageLayoutProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  gradient: string;
  portfolio: PortfolioItem[];
  pricing: PricingPlan[];
  reviews: Review[];
}

export const ServicePageLayout = ({
  icon: Icon,
  title,
  subtitle,
  description,
  features,
  gradient,
  portfolio,
  pricing,
  reviews,
}: ServicePageLayoutProps) => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-black to-black" />
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bengali">হোমে ফিরে যান</span>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center"
          >
            <div className="flex-1">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} p-5 mb-6 shadow-2xl`}>
                <Icon className="w-full h-full text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bengali font-bold text-white mb-4">
                {title}
              </h1>
              <p className="text-lg sm:text-xl text-gradient-gold font-bengali mb-4">
                {subtitle}
              </p>
              <p className="text-white/70 font-bengali text-base sm:text-lg leading-relaxed mb-8">
                {description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/80 font-bengali text-sm sm:text-base">{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-yellow-400 to-red-500 text-black font-bengali font-bold text-lg px-8 py-6 rounded-xl hover:scale-105 transition-transform">
                  এখনই অর্ডার করুন
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-black to-black/95">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bengali font-bold text-white mb-4">
              আমাদের <span className="text-gradient-gold">পোর্টফোলিও</span>
            </h2>
            <p className="text-white/60 font-bengali">আমাদের সাম্প্রতিক কাজের নমুনা দেখুন</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-yellow-400 text-sm font-bengali">{item.category}</span>
                  <h3 className="text-white font-bengali font-bold text-lg">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-black/95 to-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bengali font-bold text-white mb-4">
              প্যাকেজ <span className="text-gradient-gold">প্রাইসিং</span>
            </h2>
            <p className="text-white/60 font-bengali">আপনার বাজেট অনুযায়ী প্যাকেজ বেছে নিন</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-6 sm:p-8 border ${
                  plan.popular 
                    ? 'border-yellow-400/50 bg-gradient-to-b from-yellow-400/10 to-transparent' 
                    : 'border-white/10 bg-white/5'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-red-500 text-black text-xs font-bold px-4 py-1 rounded-full font-bengali">
                    জনপ্রিয়
                  </div>
                )}
                
                <h3 className="text-xl font-bengali font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-white/40 line-through text-sm font-bengali">{plan.originalPrice}</span>
                  <span className="text-2xl sm:text-3xl font-bold text-gradient-gold font-bengali">{plan.price}</span>
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-bengali">{plan.discount}</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-white/70 text-sm font-bengali">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
                  <Button className={`w-full font-bengali ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-black font-bold' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}>
                    অর্ডার করুন
                  </Button>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-black to-red-950/20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bengali font-bold text-white mb-4">
              কাস্টমার <span className="text-gradient-gold">রিভিউ</span>
            </h2>
            <p className="text-white/60 font-bengali">আমাদের সন্তুষ্ট গ্রাহকদের মতামত</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-white font-bengali font-bold">{review.name}</h4>
                    <p className="text-white/60 text-sm font-bengali">{review.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-white/20'}>★</span>
                  ))}
                </div>
                <p className="text-white/70 font-bengali text-sm leading-relaxed">{review.review}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-red-950/20 to-black">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bengali font-bold text-white mb-4">
              আজই শুরু করুন আপনার <span className="text-gradient-gold">ডিজিটাল জার্নি</span>
            </h2>
            <p className="text-white/60 font-bengali mb-8">
              আমাদের এক্সপার্ট টিমের সাথে কথা বলুন এবং আপনার ব্যবসার জন্য সেরা সল্যুশন খুঁজে নিন
            </p>
            <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
              <Button className="bg-gradient-to-r from-yellow-400 to-red-500 text-black font-bengali font-bold text-lg px-10 py-6 rounded-xl hover:scale-105 transition-transform">
                হোয়াটসঅ্যাপে যোগাযোগ করুন
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
};
