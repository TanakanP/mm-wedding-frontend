"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";

export default function RetroVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useHydrationSafeReducedMotion();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion) {
      video.pause();
      return;
    }

    void video.play().catch(() => setIsPlaying(false));
  }, [reduceMotion]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (hasError) {
      setHasError(false);
      video.load();
    }

    if (video.paused) {
      await video.play().catch(() => setHasError(true));
    } else {
      video.pause();
    }
  };

  return (
    <figure className="retro-player-shell mx-auto w-full max-w-[320px] rounded-[1.5rem] p-3 shadow-[0_28px_60px_rgba(81,49,58,0.25)]">
      <div className="rounded-[1.15rem] bg-[#302c30] p-2.5 shadow-[inset_0_0_0_1px_rgba(255,250,243,0.12)]">
        <div className="relative aspect-[9/16] overflow-hidden rounded-[0.8rem] bg-[#171519]">
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            poster="/videos/garden-memory-poster.jpg"
            muted
            autoPlay={!reduceMotion}
            loop
            playsInline
            preload="metadata"
            aria-label="A little film of Natthida and Tanakan by the lake"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => {
              setHasError(true);
              setIsPlaying(false);
            }}
          >
            <source src="/videos/garden-memory.mp4" type="video/mp4" />
          </video>
          {hasError && (
            <div className="absolute inset-x-4 bottom-4 rounded-lg bg-foreground/85 px-3 py-2 text-center text-[10px] leading-relaxed text-cream">
              Our little film is taking a moment to load.
            </div>
          )}
        </div>
      </div>

      <figcaption className="flex items-center justify-between gap-3 px-2 pb-1 pt-3 text-wine">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em]">Our little film</p>
          <div className="mt-1 flex gap-1" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index} className="h-px w-2 bg-wine/35" />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={hasError ? "Retry our little film" : isPlaying ? "Pause our little film" : "Play our little film"}
          className="grid size-9 shrink-0 place-items-center rounded-full border border-wine/25 bg-paper text-wine shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
        >
          {hasError ? (
            <RotateCcw className="size-4" strokeWidth={1.7} />
          ) : isPlaying ? (
            <Pause className="size-4" fill="currentColor" strokeWidth={1.5} />
          ) : (
            <Play className="size-4 translate-x-px" fill="currentColor" strokeWidth={1.5} />
          )}
        </button>
      </figcaption>
    </figure>
  );
}
