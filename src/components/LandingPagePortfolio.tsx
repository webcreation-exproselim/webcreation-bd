import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Eye, X, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  live_url?: string | null;
  sub_category?: string | null;
}

interface LandingCategory {
  id: string;
  name: string;
  display_order: number;
}

const ITEMS_PER_PAGE = 9;

export const LandingPagePortfolio = () => {
  const [allItems, setAllItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<LandingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [previewItem, setPreviewItem] = useState<PortfolioItem | null>(null);

  // Fetch portfolio items and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, catsRes] = await Promise.all([
          supabase
            .from("portfolio_items")
            .select("*")
            .eq("category", "landing-page")
            .order("created_at", { ascending: false }),
          supabase
            .from("landing_page_categories")
            .select("*")
            .order("display_order", { ascending: true }),
        ]);

        if (itemsRes.data && itemsRes.data.length > 0) {
          setAllItems(itemsRes.data);
        }
        if (catsRes.data) {
          setCategories(catsRes.data);
        }
      } catch (err) {
        console.error("Portfolio fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const channel = supabase
      .channel("lp-portfolio-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "portfolio_items" }, () => { fetchData(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "landing_page_categories" }, () => { fetchData(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Build category chips with counts
  const categoryChips = useMemo(() => {
    const chips: { name: string; label: string; count: number }[] = [
      { name: "all", label: "সব দেখুন", count: allItems.length },
    ];

    categories.forEach((cat) => {
      const count = allItems.filter((item) => item.sub_category === cat.name).length;
      chips.push({ name: cat.name, label: cat.name, count });
    });

    return chips;
  }, [allItems, categories]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return allItems;
    return allItems.filter((item) => item.sub_category === activeCategory);
  }, [allItems, activeCategory]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  if (loading) {
    return (
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-teal-950/30 to-black" />
        <div className="flex items-center justify-center py-16 relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      </section>
    );
  }

  if (allItems.length === 0) return null;

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-teal-950/30 to-black" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bengali font-bold text-white mb-4">
            আমাদের সাম্প্রতিক কাজ
          </h2>
          <p className="text-teal-200/80 font-bengali max-w-2xl mx-auto">
            আমাদের ক্লায়েন্টদের জন্য তৈরি করা ল্যান্ডিং পেজ — মোট{" "}
            <span className="text-teal-400 font-bold">{filteredItems.length}</span> টি প্রজেক্ট
          </p>
        </motion.div>

        {/* Category Filter Chips - Grid Layout */}
        {categoryChips.length > 1 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-10 justify-center">
            {categoryChips.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryChange(cat.name)}
                className={`
                  px-3 py-2 sm:px-4 sm:py-2.5 rounded-full font-bengali text-xs sm:text-sm font-medium
                  transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap
                  ${activeCategory === cat.name
                    ? "bg-gradient-to-r from-teal-400 to-cyan-500 text-black shadow-lg shadow-teal-400/25"
                    : "bg-black/60 text-white/80 border border-white/10 hover:border-teal-400/50 hover:text-white"
                  }
                `}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.name
                    ? "bg-black/20 text-black"
                    : "bg-white/10 text-white/60"
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Portfolio Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6"
          >
            {visibleItems.map((item, index) => (
              <PortfolioCard
                key={item.id}
                item={item}
                index={index}
                onPreview={setPreviewItem}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-10">
            <Button
              variant="outline"
              className="font-bengali border-teal-400/50 text-teal-400 hover:bg-teal-400 hover:text-black px-8 py-3 rounded-full text-base"
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            >
              <ChevronDown className="w-5 h-5 mr-2" />
              আরও দেখুন ({filteredItems.length - visibleCount} টি বাকি)
            </Button>
          </div>
        )}
      </div>

      {/* Fullscreen Preview Modal */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 bg-black/95 border border-teal-400/20 backdrop-blur-xl overflow-hidden">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white font-bengali text-lg sm:text-xl">
                {previewItem?.title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {previewItem?.live_url && (
                  <a
                    href={previewItem.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bengali font-medium hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    লাইভ ভিজিট
                  </a>
                )}
                <button
                  onClick={() => setPreviewItem(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </DialogHeader>

          {previewItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex items-center justify-center p-4 pt-16"
            >
              <img
                src={previewItem.image_url}
                alt={previewItem.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
                decoding="async"
              />
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

// Separate card component with auto-scroll image effect
const PortfolioCard = ({
  item,
  index,
  onPreview,
}: {
  item: PortfolioItem;
  index: number;
  onPreview: (item: PortfolioItem) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index * 0.03, 0.2) }}
      className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-black/50 border border-teal-400/15 hover:border-teal-400/50 transition-colors duration-300"
    >
      {/* Image with auto-scroll on hover */}
      <div
        className="aspect-[4/3] relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover transition-all duration-[5000ms] ease-in-out will-change-[object-position]"
          style={{
            objectPosition: isHovered ? "center bottom" : "center top",
          }}
          loading="lazy"
          decoding="async"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onPreview(item)}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
            title="প্রিভিউ"
          >
            <Eye className="w-5 h-5 text-white" />
          </button>
          {item.live_url && (
            <a
              href={item.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-teal-500/80 backdrop-blur-sm border border-teal-400/50 flex items-center justify-center hover:bg-teal-500 transition-colors"
              title="লাইভ ভিজিট"
            >
              <ExternalLink className="w-5 h-5 text-white" />
            </a>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-2.5 sm:p-4">
        <h4 className="text-white font-bengali font-semibold text-xs sm:text-base mb-2 sm:mb-3 group-hover:text-teal-400 transition-colors line-clamp-1">
          {item.title}
        </h4>
        <div className="flex gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-teal-400/30 text-teal-400 hover:bg-teal-400 hover:text-black font-bengali text-[10px] sm:text-sm h-7 sm:h-9 transition-all"
            onClick={() => onPreview(item)}
          >
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
            প্রিভিউ
          </Button>
          <Button
            size="sm"
            className={`flex-1 font-bengali text-[10px] sm:text-sm h-7 sm:h-9 transition-all ${
              item.live_url
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
            onClick={() => item.live_url && window.open(item.live_url, "_blank", "noopener,noreferrer")}
            disabled={!item.live_url}
          >
            <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
            লাইভ
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
