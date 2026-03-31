import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Facebook, ExternalLink, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  title: string;
  facebook_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
}

export function StoriesSection() {
  const [stories, setStories] = useState<Story[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStories();
    const channel = supabase
      .channel("stories-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, fetchStories)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchStories = async () => {
    const { data } = await supabase
      .from("stories")
      .select("id, title, facebook_url, thumbnail_url, caption, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (data) setStories(data);
  };

  if (stories.length === 0) return null;

  return (
    <section className="bg-black py-4 sm:py-6 md:py-8 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
          <h3 className="text-sm sm:text-base font-semibold text-white/80 font-bengali tracking-wide">সাম্প্রতিক পোস্ট</h3>
        </div>

        {/* Horizontal Scroll Cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {stories.map((story, i) => (
            <motion.a
              key={story.id}
              href={story.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="group relative flex-shrink-0 w-[200px] sm:w-[240px] md:w-[270px] snap-start rounded-2xl overflow-hidden bg-gray-900/80 border border-white/[0.06] hover:border-white/15 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 active:scale-[0.97]"
            >
              {/* Image */}
              <div className="relative w-full aspect-[4/3] bg-gray-800 overflow-hidden">
                {story.thumbnail_url ? (
                  <img
                    src={story.thumbnail_url}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-purple-900/40">
                    <Facebook className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400/60" />
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Facebook badge */}
                <div className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-3.5">
                <h4 className="text-[13px] sm:text-sm font-semibold text-white font-bengali line-clamp-2 leading-snug mb-1">
                  {story.title}
                </h4>
                {story.caption && (
                  <p className="text-[11px] sm:text-xs text-gray-400 font-bengali line-clamp-2 leading-relaxed">
                    {story.caption}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-2 text-blue-400 group-hover:text-blue-300 transition-colors">
                  <span className="text-[10px] sm:text-[11px] font-medium">পোস্ট দেখুন</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
