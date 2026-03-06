export const DEFAULT_PORTFOLIO_VIDEO_THUMBNAIL =
  "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&h=600&fit=crop";

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function getYouTubeId(url?: string | null): string | null {
  const input = (url || "").trim();
  if (!input) return null;

  if (YOUTUBE_ID_PATTERN.test(input)) return input;

  try {
    const parsed = new URL(input);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      if (id && YOUTUBE_ID_PATTERN.test(id)) return id;
    }

    const vParam = parsed.searchParams.get("v");
    if (vParam && YOUTUBE_ID_PATTERN.test(vParam)) return vParam;

    const parts = parsed.pathname.split("/").filter(Boolean);
    const markerIndex = parts.findIndex(
      (part) => part === "shorts" || part === "embed" || part === "v",
    );

    if (markerIndex !== -1) {
      const candidate = parts[markerIndex + 1];
      if (candidate && YOUTUBE_ID_PATTERN.test(candidate)) return candidate;
    }
  } catch {
    // ignore invalid urls
  }

  const fallbackMatch = input.match(
    /(?:youtube\.com\/(?:shorts|embed|watch)\S*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
  );

  return fallbackMatch?.[1] ?? null;
}

export function getYouTubeThumbnail(url?: string | null): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function getPortfolioVideoSource(
  imageUrl?: string | null,
  liveUrl?: string | null,
  fallbackVideoUrl?: string,
): string {
  return (
    liveUrl ||
    (getYouTubeId(imageUrl) ? imageUrl || null : null) ||
    fallbackVideoUrl ||
    ""
  );
}

export function getPortfolioVideoThumbnail(
  imageUrl?: string | null,
  liveUrl?: string | null,
): string {
  return (
    getYouTubeThumbnail(liveUrl) ||
    getYouTubeThumbnail(imageUrl) ||
    imageUrl ||
    DEFAULT_PORTFOLIO_VIDEO_THUMBNAIL
  );
}
