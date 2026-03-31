import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Facebook, Plus } from "lucide-react";
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
      <section className="bg-background py-5 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Stories Row - Instagram Style */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {stories.map((story, i) => (
              <motion.button
                key={story.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                onClick={() => openStory(i)}
                className="group flex flex-col items-center gap-2 flex-shrink-0 snap-start focus:outline-none"
              >
                {/* Gradient Ring */}
                <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                  {/* White gap ring */}
                  <div className="p-[3px] rounded-full bg-background">
                    {/* Image circle */}
                    <div className="w-[72px] h-[72px] sm:w-[82px] sm:h-[82px] md:w-[96px] md:h-[96px] rounded-full overflow-hidden bg-muted">
                      {story.thumbnail_url ? (
                        <img
                          src={story.thumbnail_url}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Facebook className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Label */}
                <span className="text-[11px] sm:text-xs text-foreground/80 font-bengali font-medium max-w-[80px] sm:max-w-[90px] md:max-w-[100px] truncate text-center">
                  {story.title}
                </span>
              </motion.button>
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
