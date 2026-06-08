export type VideoRenderKind = "iframe" | "video" | "html" | "unknown";

export interface VideoRenderInfo {
  kind: VideoRenderKind;
  src: string;
  platform: string | null;
}

const normalizeUrl = (value: string) => value.trim();

const normalizeUrlWithProtocol = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^(https?:)?\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const normalizeBracketedLink = (value: string) => {
  let text = value.trim();
  const markdownLink = text.match(/\[(?:[^\]]+)\]\((https?:\/\/[^\s)]+)\)/i);
  if (markdownLink?.[1]) {
    return markdownLink[1];
  }
  text = text.replace(/src=\s*"\[?(https?:\/\/[^\]"\s]+)\]?"/gi, 'src="$1"');
  const bracketOnly = text.match(/^\[?(https?:\/\/[^\]\s]+)\]?$/i);
  if (bracketOnly?.[1]) {
    return bracketOnly[1];
  }
  return text;
};

/**
 * Convert Livebox player URL to direct HLS `.m3u8` stream URL when possible.
 * Example:
 *  https://account20.livebox.co.in/livebox/player/?chnl=Divinityone
 * -> https://account20.livebox.co.in/Divinityonehls/Live.m3u8
 */
export const convertLiveboxToHls = (value?: string | null): string | null => {
  if (!value) return null;
  try {
    const s = value.trim();
    // Normalize bracketed/markdown links first
    const cleaned = normalizeBracketedLink(s);
    const url = new URL(cleaned.startsWith("//") ? `https:${cleaned}` : cleaned);
    // Hostnames like account20.livebox.co.in
    if (url.hostname && url.pathname && url.pathname.includes("/livebox/player")) {
      // Extract chnl param
      const chnl = url.searchParams.get("chnl") || url.searchParams.get("channel") || null;
      if (chnl) {
        // Construct HLS path: /{chnl}hls/Live.m3u8
        const hlsPath = `/${encodeURIComponent(chnl)}hls/Live.m3u8`;
        return `${url.protocol}//${url.hostname}${hlsPath}`;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
};

const isRawEmbedHtml = (value: string) => {
  const trimmed = value.trim();
  return /<iframe[\s\S]*<\/iframe>/i.test(trimmed) || /<video[\s\S]*<\/video>/i.test(trimmed) || /<embed[\s\S]*>/i.test(trimmed);
};

export const extractYouTubeId = (value?: string | null): string | null => {
  if (!value) return null;
  const s = value.trim();
  const normalized = s.replace(/^https?:\/\//i, "");

  const watchMatch = normalized.match(/[?&]v=([\w-]{11})/);
  if (watchMatch?.[1]) return watchMatch[1];

  const shortMatch = normalized.match(/youtu\.be\/([\w-]{11})/);
  if (shortMatch?.[1]) return shortMatch[1];

  const embedMatch = normalized.match(/embed\/([\w-]{11})/);
  if (embedMatch?.[1]) return embedMatch[1];

  const shortsMatch = normalized.match(/shorts\/([\w-]{11})/);
  if (shortsMatch?.[1]) return shortsMatch[1];

  const liveMatch = normalized.match(/\/live\/([\w-]{11})/);
  if (liveMatch?.[1]) return liveMatch[1];

  return null;
};

const getYouTubeEmbedUrl = (value: string) => {
  const videoId = extractYouTubeId(value);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  const trimmed = value.trim();
  if (/^UC[\w-]{20,}$/i.test(trimmed)) {
    return `https://www.youtube.com/embed/live_stream?channel=${trimmed}`;
  }

  if (trimmed.includes("youtube.com/embed/")) return trimmed;
  if (trimmed.includes("youtu.be/")) return trimmed.replace("youtu.be/", "www.youtube.com/embed/");
  if (trimmed.includes("watch?v=")) return trimmed.replace("watch?v=", "embed/");
  return trimmed;
};

const getVimeoEmbedUrl = (value: string) => {
  try {
    const url = new URL(normalizeUrlWithProtocol(value));
    if (url.hostname.includes("vimeo.com")) {
      const match = url.pathname.match(/\/(?:video\/)?(\d+)/);
      if (match?.[1]) return `https://player.vimeo.com/video/${match[1]}`;
    }
  } catch (error) {
    // ignore
  }
  return value.trim();
};

const getTwitchEmbedUrl = (value: string) => {
  try {
    const url = new URL(normalizeUrlWithProtocol(value));
    const pathParts = url.pathname.split("/").filter(Boolean);
    const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";

    if (pathParts[0] === "videos" && pathParts[1]) {
      return `https://player.twitch.tv/?video=${pathParts[1]}&parent=${parent}`;
    }
    if (pathParts[0] === "clips" && pathParts[1]) {
      return `https://clips.twitch.tv/embed?clip=${pathParts[1]}&parent=${parent}`;
    }
    if (pathParts[0] && pathParts[0] !== "embed") {
      return `https://player.twitch.tv/?channel=${pathParts[0]}&parent=${parent}`;
    }
  } catch (error) {
    // ignore
  }
  return value.trim();
};

const getFacebookEmbedUrl = (value: string) => {
  const encoded = encodeURIComponent(value.trim());
  return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=0`;
};

const getInstagramEmbedUrl = (value: string) => {
  try {
    const url = new URL(normalizeUrlWithProtocol(value));
    const cleanPath = url.pathname.replace(/\/$/, "");
    return `https://www.instagram.com${cleanPath}/embed/`;
  } catch (error) {
    return value.trim();
  }
};

const getTwitterEmbedUrl = (value: string) => {
  return `https://twitframe.com/show?url=${encodeURIComponent(value.trim())}`;
};

const getDailymotionEmbedUrl = (value: string) => {
  try {
    const url = new URL(normalizeUrlWithProtocol(value));
    const match = url.pathname.match(/\/video\/([\w-]+)/);
    if (match?.[1]) return `https://www.dailymotion.com/embed/video/${match[1]}`;
  } catch (error) {
    // ignore
  }
  return value.trim();
};

export const getVideoRenderInfo = (value?: string | null): VideoRenderInfo => {
  if (!value) return { kind: "unknown", src: "", platform: null };
  const trimmed = normalizeBracketedLink(value);
  // Prefer known direct HLS for Livebox embeds
  const liveboxHls = convertLiveboxToHls(trimmed);
  if (liveboxHls) {
    return { kind: "video", src: liveboxHls, platform: "livebox_hls" };
  }
  if (!trimmed) return { kind: "unknown", src: "", platform: null };

  if (isRawEmbedHtml(trimmed)) {
    return { kind: "html", src: trimmed, platform: "embed_html" };
  }

  const lower = trimmed.toLowerCase();

  if (/\.(mp4|webm|mov|ogg|ogv)(\?.*)?$/.test(lower) || /^data:video\//.test(lower) || /^blob:/.test(lower)) {
    return { kind: "video", src: trimmed, platform: "direct" };
  }

  if (/\.m3u8(\?.*)?$/.test(lower)) {
    return { kind: "video", src: trimmed, platform: "hls" };
  }

  if (/^(uc[\w-]{20,})$/i.test(trimmed) || lower.includes("youtube.com") || lower.includes("youtu.be/")) {
    return { kind: "iframe", src: getYouTubeEmbedUrl(trimmed), platform: "youtube" };
  }

  if (lower.includes("vimeo.com")) {
    return { kind: "iframe", src: getVimeoEmbedUrl(trimmed), platform: "vimeo" };
  }

  if (lower.includes("twitch.tv")) {
    return { kind: "iframe", src: getTwitchEmbedUrl(trimmed), platform: "twitch" };
  }

  if (lower.includes("facebook.com") || lower.includes("fb.watch")) {
    return { kind: "iframe", src: getFacebookEmbedUrl(trimmed), platform: "facebook" };
  }

  if (lower.includes("instagram.com")) {
    return { kind: "iframe", src: getInstagramEmbedUrl(trimmed), platform: "instagram" };
  }

  if (lower.includes("twitter.com") || lower.includes("x.com")) {
    return { kind: "iframe", src: getTwitterEmbedUrl(trimmed), platform: "twitter" };
  }

  if (lower.includes("dailymotion.com")) {
    return { kind: "iframe", src: getDailymotionEmbedUrl(trimmed), platform: "dailymotion" };
  }

  if (/^(https?:\/\/|\/\/)/.test(trimmed)) {
    return { kind: "iframe", src: trimmed, platform: "unknown" };
  }

  return { kind: "unknown", src: "", platform: null };
};
