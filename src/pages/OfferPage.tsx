import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Facebook, ExternalLink, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Chatbot } from "@/components/Chatbot";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StoryViewer } from "@/components/StoryViewer";

interface Story {
  id: string;
  title: string;
  facebook_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
}

const OfferPage = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    fetchStories();
    const channel = supabase
      .channel("stories-offer-page")
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-16 lg:pt-20">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-background via-card/60 to-background">
          <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 lg:px-16 lg:py-20">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-bengali text-sm font-medium text-primary">সর্বশেষ অফার</span>
              </div>
              <h1 className="font-bengali text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                আমাদের নতুন অফার ও আপডেট
              </h1>
              <p className="max-w-2xl font-bengali text-sm leading-7 text-muted-foreground sm:text-base">
                এখানে আমাদের চলমান অফার, নতুন আপডেট আর সাম্প্রতিক পোস্টগুলো একসাথে পাবেন।
              </p>
            </div>
          </div>
        </section>

        {/* Stories Grid - Big Cards */}
        <section className="py-10 sm:py-14 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {stories.length === 0 ? (
              <p className="text-center text-muted-foreground font-bengali py-20">কোনো পোস্ট নেই</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {stories.map((story, i) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    onClick={() => openStory(i)}
                    className="group relative cursor-pointer"
                  >
                    {/* Card with gradient border */}
                    <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-muted ring-2 ring-transparent group-hover:ring-primary/40 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      {story.thumbnail_url ? (
                        <img
                          src={story.thumbnail_url}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/60 to-purple-900/60">
                          <Facebook className="w-14 h-14 text-muted-foreground/40" />
                        </div>
                      )}

                      {/* Gradient overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

                      {/* Top badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <Facebook className="w-3.5 h-3.5 text-blue-400" fill="#60a5fa" />
                        <span className="text-[10px] sm:text-[11px] text-white/90 font-medium">Post</span>
                      </div>

                      {/* Content at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <h4 className="text-xs sm:text-sm font-bold text-white font-bengali line-clamp-2 leading-snug mb-1.5 drop-shadow-lg">
                          {story.title}
                        </h4>
                        {story.caption && (
                          <p className="text-[10px] sm:text-[11px] text-white/50 font-bengali line-clamp-2 mb-2">
                            {story.caption}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-white/70 group-hover:text-white transition-colors">
                          <ExternalLink className="w-3 h-3" />
                          <span className="text-[10px] sm:text-[11px] font-bengali font-medium">পোস্ট দেখুন</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <Chatbot />

      <StoryViewer
        stories={stories}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};

export default OfferPage;
