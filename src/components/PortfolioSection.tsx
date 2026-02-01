import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Code, Palette, Video, Activity, Layout, ExternalLink, X, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  { id: "landing-page", label: "ল্যান্ডিং পেজ", icon: Layout, gradient: "from-teal-500 to-cyan-400" },
];

// Services that open modal on click (video or image preview)
const modalServices = ["facebook-ads", "graphics-design", "video-editing", "motion-graphics"];
// Services that have video content
const videoServices = ["video-editing", "motion-graphics"];
// Services that open external URL
const urlServices = ["web-development", "landing-page"];

type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
};

// Fallback placeholder items (used when database is empty)
const fallbackData: Record<string, PortfolioItem[]> = {
  "facebook-ads": [
    { id: "fb1", title: "ই-কমার্স ক্যাম্পেইন", description: null, category: "facebook-ads", image_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop" },
    { id: "fb2", title: "রেস্টুরেন্ট প্রমোশন", description: null, category: "facebook-ads", image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop" },
    { id: "fb3", title: "ফ্যাশন ব্র্যান্ড", description: null, category: "facebook-ads", image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop" },
  ],
  "web-development": [
    { id: "web1", title: "ই-কমার্স স্টোর", description: null, category: "web-development", image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop" },
    { id: "web2", title: "কর্পোরেট ওয়েবসাইট", description: null, category: "web-development", image_url: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop" },
    { id: "web3", title: "রেস্টুরেন্ট অর্ডারিং", description: null, category: "web-development", image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop" },
  ],
  "graphics-design": [
    { id: "gd1", title: "লোগো ডিজাইন", description: null, category: "graphics-design", image_url: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&h=600&fit=crop" },
    { id: "gd2", title: "ব্র্যান্ড আইডেন্টিটি", description: null, category: "graphics-design", image_url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop" },
    { id: "gd3", title: "সোশ্যাল মিডিয়া পোস্ট", description: null, category: "graphics-design", image_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=600&fit=crop" },
  ],
  "video-editing": [
    { id: "ve1", title: "প্রোডাক্ট ভিডিও", description: null, category: "video-editing", image_url: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&h=600&fit=crop" },
    { id: "ve2", title: "কমার্শিয়াল অ্যাড", description: null, category: "video-editing", image_url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop" },
    { id: "ve3", title: "সোশ্যাল মিডিয়া রিলস", description: null, category: "video-editing", image_url: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=600&fit=crop" },
  ],
  "motion-graphics": [
    { id: "mg1", title: "অ্যানিমেটেড লোগো", description: null, category: "motion-graphics", image_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop" },
    { id: "mg2", title: "এক্সপ্লেইনার ভিডিও", description: null, category: "motion-graphics", image_url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=600&fit=crop" },
    { id: "mg3", title: "ইনফোগ্রাফিক্স", description: null, category: "motion-graphics", image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop" },
  ],
  "landing-page": [
    { id: "lp1", title: "ই-কমার্স ল্যান্ডিং", description: null, category: "landing-page", image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop" },
    { id: "lp2", title: "অ্যাপ ল্যান্ডিং", description: null, category: "landing-page", image_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop" },
    { id: "lp3", title: "SaaS ল্যান্ডিং", description: null, category: "landing-page", image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop" },
  ],
};

interface PortfolioCardProps {
  item: PortfolioItem;
  serviceId: string;
  onOpenModal: (item: PortfolioItem) => void;
}

const PortfolioCard = ({ item, serviceId, onOpenModal }: PortfolioCardProps) => {
  const isModalService = modalServices.includes(serviceId);
  const isVideoService = videoServices.includes(serviceId);
  const isUrlService = urlServices.includes(serviceId);

  const handleImageClick = () => {
    if (isModalService) {
      onOpenModal(item);
    }
  };

  const handleButtonClick = () => {
    if (isModalService) {
      onOpenModal(item);
    } else if (isUrlService) {
      // For web dev and landing page - just open modal for now
      onOpenModal(item);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-xl overflow-hidden bg-black/40 border border-white/10 hover:border-yellow-400/50 transition-all duration-300"
    >
      {/* Image Container */}
      <div 
        className={`aspect-[4/3] relative overflow-hidden ${isModalService || isUrlService ? 'cursor-pointer' : ''}`}
        onClick={handleImageClick}
      >
        <img 
          src={item.image_url} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Click indicator */}
        {(isModalService || isUrlService) && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-400/40">
              {isVideoService ? (
                <Play className="w-7 h-7 text-white ml-1" fill="white" />
              ) : (
                <ExternalLink className="w-7 h-7 text-white" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4">
        <h4 className="text-white font-bengali font-semibold text-sm sm:text-base mb-2 group-hover:text-yellow-400 transition-colors line-clamp-1">
          {item.title}
        </h4>
        {item.description && (
          <p className="text-white/60 text-xs mb-3 line-clamp-2 font-bengali">
            {item.description}
          </p>
        )}
        
        {/* Live Preview Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full font-bengali border-yellow-400/30 text-yellow-400 hover:bg-yellow-400 hover:text-black group/btn transition-all duration-300"
          onClick={handleButtonClick}
        >
          {isVideoService ? (
            <Play className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" fill="currentColor" />
          ) : (
            <ExternalLink className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
          )}
          দেখুন
        </Button>
      </div>
    </motion.div>
  );
};

export const PortfolioSection = () => {
  const [activeTab, setActiveTab] = useState("facebook-ads");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [portfolioData, setPortfolioData] = useState<Record<string, PortfolioItem[]>>(fallbackData);
  const [loading, setLoading] = useState(true);

  // Fetch portfolio items from database
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data, error } = await supabase
          .from("portfolio_items")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Portfolio fetch error:", error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // Group by category
          const grouped: Record<string, PortfolioItem[]> = {};
          
          // Initialize all categories
          serviceTabs.forEach(tab => {
            grouped[tab.id] = [];
          });

          data.forEach((item) => {
            const category = item.category;
            if (grouped[category]) {
              grouped[category].push(item);
            }
          });

          // Merge with fallback for empty categories
          const mergedData: Record<string, PortfolioItem[]> = {};
          serviceTabs.forEach(tab => {
            if (grouped[tab.id] && grouped[tab.id].length > 0) {
              mergedData[tab.id] = grouped[tab.id];
            } else {
              mergedData[tab.id] = fallbackData[tab.id] || [];
            }
          });

          setPortfolioData(mergedData);
        }
      } catch (err) {
        console.error("Portfolio fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();

    // Set up realtime subscription for portfolio updates
    const channel = supabase
      .channel("portfolio-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "portfolio_items" },
        () => {
          fetchPortfolio();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const items = portfolioData[activeTab] || [];

  const handleOpenModal = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

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

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
          </div>
        ) : (
          /* Portfolio Grid */
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {items.length > 0 ? (
                items.map((item) => (
                  <PortfolioCard 
                    key={item.id} 
                    item={item} 
                    serviceId={activeTab}
                    onOpenModal={handleOpenModal}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-white/60 font-bengali">এই ক্যাটাগরিতে কোন পোর্টফোলিও নেই</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

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

      {/* Fullscreen Preview Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 bg-black/95 border border-white/10 backdrop-blur-xl overflow-hidden">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white font-bengali text-lg sm:text-xl">
                {selectedItem?.title}
              </DialogTitle>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </DialogHeader>
          
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex items-center justify-center p-4 pt-16"
            >
              <img 
                src={selectedItem.image_url} 
                alt={selectedItem.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
