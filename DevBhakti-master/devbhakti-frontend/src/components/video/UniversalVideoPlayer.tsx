"use client";

import React from "react";
import { getVideoRenderInfo } from "@/lib/utils/videoUtils";
import { HlsVideoPlayer } from "@/components/video/HlsVideoPlayer";

interface UniversalVideoPlayerProps {
  url: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsInline?: boolean;
}

export function UniversalVideoPlayer({
  url,
  className = "w-full h-full",
  autoPlay = false,
  muted = false,
  controls = false,
  playsInline = true,
}: UniversalVideoPlayerProps) {
  const info = getVideoRenderInfo(url);

  const getPlayerSrc = (src: string, platform: string | null) => {
    if (!src) return "";
    if (platform === "youtube" && autoPlay) {
      const glue = src.includes("?") ? "&" : "?";
      let params = `autoplay=1`;
      if (muted) params += `&mute=1`;
      params += `&rel=0`;
      return `${src}${glue}${params}`;
    }
    return src;
  };

  if (info.kind === "iframe") {
    return (
      <iframe
        src={getPlayerSrc(info.src, info.platform)}
        title="Video Player"
        className={className}
        allow={`accelerometer; ${autoPlay ? 'autoplay;' : ''} clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share`}
        allowFullScreen
        frameBorder={0}
      />
    );
  }

  if (info.kind === "video") {
    return (
      <HlsVideoPlayer
        src={info.src}
        className={className}
        autoPlay={autoPlay}
        muted={muted}
        controls={controls}
        playsInline={playsInline}
      />
    );
  }

  if (info.kind === "html") {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: info.src }}
      />
    );
  }

  // Fallback state if URL is invalid or unknown
  return (
    <div className={`bg-black/10 flex items-center justify-center ${className}`}>
      <span className="text-sm text-foreground/50">Unsupported video format</span>
    </div>
  );
}
