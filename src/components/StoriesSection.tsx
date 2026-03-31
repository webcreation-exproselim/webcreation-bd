import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Facebook, Eye, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StoryViewer } from "./StoryViewer";

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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
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

  const openStory = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  if (stories.length === 0) return null;

  return (
    <>
      <section id="stories" className="bg-black py-6 sm:py-8 md:py-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-bengali">সাম্প্রতিক আপডেট</h3>
                <p className="text-[10px] sm:text-xs text-gray-500">আমাদের লেটেস্ট পোস্ট দেখুন</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <span className="text-[10px] sm:text-xs text-blue-400 font-medium">{stories.length}টি পোস্ট</span>
            </div>
          </div>

          {/* Horizontal Scroll Cards - Ad Style */}
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {stories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                onClick={() => openStory(i)}
                className="group relative flex-shrink-0 w-[160px] sm:w-[200px] md:w-[220px] snap-start rounded-xl overflow-hidden cursor-pointer active:scale-[0.97] transition-transform duration-200"
              >
                {/* Image with gradient ring effect */}
                <div className="relative w-full aspect-[3/4] bg-gray-800 overflow-hidden rounded-xl ring-2 ring-transparent group-hover:ring-pink-500/50 transition-all duration-300">
                  {story.thumbnail_url ? (
                    <img
                      src={story.thumbnail_url}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/60 to-purple-900/60">
                      <Facebook className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400/50" />
                    </div>
                  )}

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

                  {/* Top badge - Sponsored/Ad style */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                    <Facebook className="w-3 h-3 text-blue-400" fill="#60a5fa" />
                    <span className="text-[9px] sm:text-[10px] text-white/80 font-medium">Post</span>
                  </div>

                  {/* View indicator */}
                  <div className="absolute top-2 right-2 w-7 h-7 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-3.5 h-3.5 text-white" />
                  </div>

                  {/* Content at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
                    <h4 className="text-[11px] sm:text-xs font-bold text-white font-bengali line-clamp-2 leading-snug mb-1 drop-shadow-lg">
                      {story.title}
                    </h4>
                    {story.caption && (
                      <p className="text-[9px] sm:text-[10px] text-white/50 font-bengali line-clamp-1">
                        {story.caption}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-1">
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Viewer Modal */}
      <StoryViewer
        stories={stories}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}
