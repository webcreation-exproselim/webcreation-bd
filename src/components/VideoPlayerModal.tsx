import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Volume2, VolumeX, Maximize, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  thumbnail?: string;
}

// Sample demo video URLs (free videos from different sources)
const demoVideos = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
];

export function getRandomDemoVideo(): string {
  return demoVideos[Math.floor(Math.random() * demoVideos.length)];
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function isYouTubeUrl(url: string): boolean {
  return getYouTubeId(url) !== null;
}

export function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  thumbnail,
}: VideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const youtubeId = getYouTubeId(videoUrl);
  const isYouTube = !!youtubeId;

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setProgress(0);
      setIsLoaded(false);
    }
  }, [isOpen]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-5xl mx-4 rounded-2xl overflow-hidden bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title */}
            <div className="absolute top-4 left-4 z-20">
              <h3 className="text-white font-bengali font-bold text-lg bg-black/50 px-4 py-2 rounded-lg">
                {title}
              </h3>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video">
              {isYouTube ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  title={title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  frameBorder="0"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    poster={thumbnail}
                    className="w-full h-full object-cover"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedData={() => setIsLoaded(true)}
                    onEnded={() => setIsPlaying(false)}
                    muted={isMuted}
                    playsInline
                  />

                  {/* Play overlay when not playing */}
                  {!isPlaying && isLoaded && (
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={handlePlayPause}
                    >
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-2xl"
                      >
                        <Play className="w-12 h-12 text-white ml-2" />
                      </motion.div>
                    </div>
                  )}

                  {/* Loading indicator */}
                  {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="w-16 h-16 border-4 border-white/20 border-t-red-500 rounded-full animate-spin" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Controls - only for non-YouTube videos */}
            {!isYouTube && isLoaded && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                {/* Progress Bar */}
                <div
                  className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-4"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlayPause}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={handleFullscreen}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
