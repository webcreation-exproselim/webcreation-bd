import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  live_url?: string | null;
}

interface MobilePortfolioCarouselProps {
  items: PortfolioItem[];
  serviceType: "modal" | "video" | "url";
  onItemClick: (item: PortfolioItem) => void;
  accentColor?: string;
}

export function MobilePortfolioCarousel({
  items,
  serviceType,
  onItemClick,
  accentColor = "yellow",
}: MobilePortfolioCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    containScroll: "trimSnaps",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const isUrlService = serviceType === "url";
  const isVideoService = serviceType === "video";

  const handleItemClick = (item: PortfolioItem) => {
    if (serviceType === "modal" || serviceType === "video") {
      onItemClick(item);
    }
  };

  const handleLivePreview = (item: PortfolioItem) => {
    if (isUrlService && item.live_url) {
      window.open(item.live_url, "_blank", "noopener,noreferrer");
    } else {
      onItemClick(item);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60 font-bengali">এই ক্যাটাগরিতে কোন পোর্টফোলিও নেই</p>
      </div>
    );
  }

  return (
    <div className="relative px-2">
      {/* Carousel */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-[0_0_85%] min-w-0 pl-4 first:pl-0"
            >
              <div className="group relative rounded-xl overflow-hidden bg-black/40 border border-white/10 hover:border-yellow-400/50 transition-all duration-300 will-change-transform">
                {/* Image Container */}
                <div
                  className={`aspect-[4/3] relative overflow-hidden ${
                    serviceType !== "url" ? "cursor-pointer" : ""
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className={`w-full h-full ${
                      isUrlService ? "object-cover object-top" : "object-cover"
                    } group-hover:scale-105 transition-transform duration-500`}
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Click indicator for modal/video services */}
                  {(serviceType === "modal" || serviceType === "video") && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center shadow-lg",
                        "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-yellow-400/40"
                      )}>
                        {isVideoService ? (
                          <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                        ) : (
                          <ExternalLink className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-4">
                  <h4 className="text-white font-bengali font-semibold text-base mb-2 group-hover:text-yellow-400 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-white/60 text-sm mb-3 line-clamp-2 font-bengali">
                      {item.description}
                    </p>
                  )}

                  {/* Live Preview Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full font-bengali border-yellow-400/30 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-300",
                      isUrlService && !item.live_url && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleLivePreview(item)}
                    disabled={isUrlService && !item.live_url}
                  >
                    {isVideoService ? (
                      <Play className="w-4 h-4 mr-2" fill="currentColor" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    {isUrlService ? "লাইভ প্রিভিউ" : "দেখুন"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className={cn(
          "absolute left-0 top-1/3 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
          "bg-black/60 border border-white/20 text-white",
          canScrollPrev ? "hover:bg-yellow-400 hover:text-black hover:border-yellow-400" : "opacity-30 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        className={cn(
          "absolute right-0 top-1/3 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
          "bg-black/60 border border-white/20 text-white",
          canScrollNext ? "hover:bg-yellow-400 hover:text-black hover:border-yellow-400" : "opacity-30 cursor-not-allowed"
        )}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              index === selectedIndex
                ? "bg-yellow-400 scale-125"
                : "bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
