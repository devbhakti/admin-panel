"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface HlsVideoPlayerProps {
  src: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
}

export function HlsVideoPlayer({
  src,
  className,
  controls,
  autoPlay,
  muted,
  playsInline,
}: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isHlsSource = /\.m3u8(\?.*)?$/i.test(src);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (isHlsSource && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      if (autoPlay) {
        video.muted = true;
        video.play().catch(() => {});
      }
      return () => {
        hls.destroy();
      };
    }

    return undefined;
  }, [src, autoPlay, isHlsSource]);

  return (
    <video
      ref={videoRef}
      src={isHlsSource ? undefined : src}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      playsInline={playsInline}
    />
  );
}
