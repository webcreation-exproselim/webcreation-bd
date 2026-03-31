import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Facebook } from "lucide-react";
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
    <section className="bg-black py-3 sm:py-4 md:py-6 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-3 px-3 sm:mx-0 sm:px-0"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {stories.map((story, i) => (
            <motion.a
              key={story.id}
              href={story.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-1.5 sm:gap-2 shrink-0 group cursor-pointer active:scale-95 transition-transform"
            >
              {/* Gradient Ring */}
              <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] md:w-20 md:h-20 rounded-full p-[2.5px] sm:p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform duration-200">
                <div className="w-full h-full rounded-full bg-black p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                    {story.thumbnail_url ? (
                      <img
                        src={story.thumbnail_url}
                        alt={story.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Facebook className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-400" />
                    )}
                  </div>
                </div>
              </div>
              {/* Title */}
              <span className="text-[10px] sm:text-[11px] md:text-xs text-gray-400 group-hover:text-white transition-colors font-bengali max-w-[64px] sm:max-w-[72px] md:max-w-[80px] text-center truncate leading-tight">
                {story.title}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
