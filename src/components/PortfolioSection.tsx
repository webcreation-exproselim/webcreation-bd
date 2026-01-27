import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Code, Palette, Video, Activity, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type ServiceTab = {
  id: string;
  label: string;
  icon: typeof Megaphone;
  gradient: string;
};

const serviceTabs: ServiceTab[] = [
  { id: "facebook-ads", label: "ফেসবুক অ্যাডস", icon: Megaphone, gradient: "from-blue-500 to-cyan-400" },
  { id: "web-development", label: "ওয়েব ডেভেলপমেন্ট", icon: Code, gradient: "from-green-500 to-emerald-400" },
  { id: "graphics-design", label: "গ্রাফিক্স ডিজাইন", icon: Palette, gradient: "from-purple-500 to-pink-400" },
  { id: "video-editing", label: "ভিডিও এডিটিং", icon: Video, gradient: "from-red-500 to-orange-400" },
  { id: "motion-graphics", label: "মোশন গ্রাফিক্স", icon: Activity, gradient: "from-yellow-500 to-amber-400" },
];

// Placeholder portfolio items - replace with actual data
const portfolioData: Record<string, { id: number; title: string; image?: string; video?: string; liveUrl?: string }[]> = {
  "facebook-ads": [
    { id: 1, title: "ই-কমার্স ক্যাম্পেইন", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop" },
    { id: 2, title: "রেস্টুরেন্ট প্রমোশন", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" },
    { id: 3, title: "ফ্যাশন ব্র্যান্ড", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop" },
    { id: 4, title: "লিড জেনারেশন", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" },
    { id: 5, title: "অ্যাপ ইনস্টল", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop" },
    { id: 6, title: "ব্র্যান্ড অ্যাওয়ারনেস", image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=300&fit=crop" },
  ],
  "web-development": [
    { id: 1, title: "ই-কমার্স স্টোর", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop", liveUrl: "#" },
    { id: 2, title: "কর্পোরেট ওয়েবসাইট", image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop", liveUrl: "#" },
    { id: 3, title: "রেস্টুরেন্ট অর্ডারিং", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop", liveUrl: "#" },
    { id: 4, title: "পোর্টফোলিও সাইট", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop", liveUrl: "#" },
    { id: 5, title: "বুকিং সিস্টেম", image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop", liveUrl: "#" },
    { id: 6, title: "এডুকেশন প্লাটফর্ম", image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop", liveUrl: "#" },
  ],
  "graphics-design": [
    { id: 1, title: "লোগো ডিজাইন", image: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=300&fit=crop" },
    { id: 2, title: "ব্র্যান্ড আইডেন্টিটি", image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop" },
    { id: 3, title: "সোশ্যাল মিডিয়া পোস্ট", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop" },
    { id: 4, title: "প্যাকেজিং ডিজাইন", image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=300&fit=crop" },
    { id: 5, title: "বিজনেস কার্ড", image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400&h=300&fit=crop" },
    { id: 6, title: "ব্যানার ডিজাইন", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop" },
  ],
  "video-editing": [
    { id: 1, title: "প্রোডাক্ট ভিডিও", video: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", image: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400&h=300&fit=crop" },
    { id: 2, title: "কমার্শিয়াল অ্যাড", video: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop" },
    { id: 3, title: "সোশ্যাল মিডিয়া রিলস", video: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop" },
    { id: 4, title: "কর্পোরেট ভিডিও", video: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop" },
  ],
  "motion-graphics": [
    { id: 1, title: "অ্যানিমেটেড লোগো", video: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop" },
    { id: 2, title: "এক্সপ্লেইনার ভিডিও", video: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=300&fit=crop" },
    { id: 3, title: "ইনফোগ্রাফিক্স", video: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" },
    { id: 4, title: "3D অ্যানিমেশন", video: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop" },
  ],
};

const PortfolioCard = ({ 
  item, 
  isVideo 
}: { 
  item: { id: number; title: string; image?: string; video?: string; liveUrl?: string }; 
  isVideo: boolean;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-xl overflow-hidden bg-black/40 border border-white/10 hover:border-yellow-400/50 transition-all duration-300"
    >
      {/* Image/Video Container */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {isVideo && isPlaying && item.video ? (
          <video 
            src={item.video} 
            className="w-full h-full object-cover"
            autoPlay
            controls
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <>
            <img 
              src={item.image} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        )}

        {/* Play Button for Video */}
        {isVideo && !isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Play className="w-7 h-7 text-black ml-1" fill="black" />
            </div>
          </button>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4">
        <h4 className="text-white font-bengali font-semibold text-sm sm:text-base mb-3 group-hover:text-yellow-400 transition-colors">
          {item.title}
        </h4>
        
        {/* Live Preview Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full font-bengali border-yellow-400/30 text-yellow-400 hover:bg-yellow-400 hover:text-black group/btn transition-all duration-300"
          onClick={() => isVideo ? setIsPlaying(!isPlaying) : window.open(item.liveUrl || '#', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
          {isVideo ? 'Live Preview' : 'Live Preview'}
        </Button>
      </div>
    </motion.div>
  );
};

export const PortfolioSection = () => {
  const [activeTab, setActiveTab] = useState("facebook-ads");
  const isVideoTab = activeTab === "video-editing" || activeTab === "motion-graphics";
  const items = portfolioData[activeTab] || [];

  return (
    <section id="portfolio" className="py-16 md:py-24 bg-gradient-to-b from-black via-black/95 to-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 tech-grid-pattern opacity-10" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-red-500/20 border border-yellow-400/30 mb-6"
          >
            <span className="text-yellow-400">🎨</span>
            <span className="text-sm sm:text-base text-white font-bengali font-medium">
              আমাদের কাজ দেখুন
            </span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bengali font-bold text-white mb-4">
            আমাদের <span className="text-gradient-gold">পোর্টফোলিও</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-bengali">
            বিভিন্ন সার্ভিসের সফল প্রজেক্ট গুলো দেখুন
          </p>
        </motion.div>

        {/* Service Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 md:mb-12"
        >
          {serviceTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full font-bengali text-sm sm:text-base font-medium
                transition-all duration-300
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-black shadow-lg shadow-yellow-400/25' 
                  : 'bg-black/60 text-white/80 border border-white/10 hover:border-yellow-400/50 hover:text-white'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </motion.div>

        {/* Dynamic Title based on Tab */}
        <motion.h3
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl md:text-3xl font-bengali font-bold text-gradient-gold text-center mb-8"
        >
          আমাদের {serviceTabs.find(t => t.id === activeTab)?.label} পোর্টফোলিও
        </motion.h3>

        {/* Portfolio Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {items.map((item) => (
              <PortfolioCard key={item.id} item={item} isVideo={isVideoTab} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Load More / CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10 md:mt-12"
        >
          <Button
            variant="outline"
            className="font-bengali border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3 rounded-full text-base"
          >
            আরও দেখুন
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
