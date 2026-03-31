import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Facebook, ExternalLink } from "lucide-react";

interface Story {
  id: string;
  title: string;
  facebook_url: string;
  thumbnail_url: string | null;
  caption: string | null;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export function StoryViewer({ stories, initialIndex, open, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const story = stories[currentIndex];
  const DURATION = 6000; // 6 seconds per story

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
  }, [initialIndex, open]);

  // Auto-advance timer
  useEffect(() => {
    if (!open) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          goNext();
          return 0;
        }
        return prev + (100 / (DURATION / 50));
      });
    }, 50);
    return () => clearInterval(interval);
  }, [currentIndex, open]);

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, goNext, goPrev, onClose]);

  if (!open || !story) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Story Container */}
        <motion.div
          key={story.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-[420px] h-[85vh] max-h-[750px] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-3 px-3">
            {stories.map((_, i) => (
              <div key={i} className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                  style={{
                    width: i < currentIndex ? "100%" : i === currentIndex ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-8 right-3 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image */}
          <div className="absolute inset-0">
            {story.thumbnail_url ? (
              <img
                src={story.thumbnail_url}
                alt={story.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                <Facebook className="w-20 h-20 text-blue-400/40" />
              </div>
            )}
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>

          {/* Content overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-5 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                <Facebook className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-white/70 text-xs font-medium">Facebook Post</span>
            </div>
            <h3 className="text-white font-bengali font-bold text-lg leading-snug mb-2 line-clamp-3">
              {story.title}
            </h3>
            {story.caption && (
              <p className="text-white/60 font-bengali text-sm line-clamp-3 mb-4 leading-relaxed">
                {story.caption}
              </p>
            )}
            <a
              href={story.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full transition-colors shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="font-bengali">পোস্ট দেখুন</span>
            </a>
          </div>

          {/* Tap zones for navigation */}
          <div className="absolute inset-0 z-10 flex">
            <button
              className="w-1/3 h-full focus:outline-none"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
            />
            <div className="w-1/3 h-full" />
            <button
              className="w-1/3 h-full focus:outline-none"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
            />
          </div>

          {/* Arrow buttons (desktop) */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentIndex < stories.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
