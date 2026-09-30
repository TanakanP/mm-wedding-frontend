"use client";

import { useEffect, useRef, useState } from "react";

const FILM_SRC = "/videos/wedding-film.mp4";
const POSTER_SRC = "/videos/wedding-film-poster.jpg";
const FILM_LABEL = "A little film of Natthida and Tanakan by the lake";

export default function RetroVideoPlayer() {
  const frameRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const playRef = useRef<(() => Promise<void>) | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setShouldLoad(true);
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    let active = true;
    let pending = false;
    let attempt = 0;
    const cancel = () => { attempt++; pending = false; };
    cancelRef.current = cancel;
    const resumeVideo = async () => {
      if (!active || pending || document.visibilityState !== "visible") return;
      pending = true;
      const currentAttempt = ++attempt;
      setPlaybackFailed(false);
      try {
        if (video.error || video.readyState === HTMLMediaElement.HAVE_NOTHING) video.load();
        await video.play();
        if (active && currentAttempt === attempt) {
          setNeedsGesture(false);
          setIsVideoVisible(true);
        }
      } catch {
        if (active && currentAttempt === attempt) {
          setNeedsGesture(true);
          setIsVideoVisible(false);
          setPlaybackFailed(true);
        }
      } finally {
        if (currentAttempt === attempt) pending = false;
      }
    };
    playRef.current = resumeVideo;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        cancel();
        setIsVideoVisible(false);
        return;
      }

      void resumeVideo();
    };

    const handlePageHide = () => { cancel(); setIsVideoVisible(false); };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", resumeVideo);
    window.addEventListener("pagehide", handlePageHide);
    void resumeVideo();

    return () => {
      active = false;
      cancel();
      playRef.current = null;
      cancelRef.current = null;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", resumeVideo);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [shouldLoad]);

  return (
    <figure
      ref={frameRef}
      className="film-frame mx-auto w-full max-w-[320px]"
    >
      <div
        className="film-frame-viewport relative aspect-[9/16] overflow-hidden bg-paper bg-cover bg-center"
        style={{ backgroundImage: `url('${POSTER_SRC}')` }}
      >
        <video
          ref={videoRef}
          className={`h-full w-full object-contain transition-opacity duration-300 ${
            isVideoVisible ? "opacity-100" : "opacity-0"
          }`}
          poster={POSTER_SRC}
          muted
          autoPlay
          loop
          playsInline
          preload="none"
          aria-label={FILM_LABEL}
          onPlaying={() => {
            if (document.visibilityState !== "visible") return;
            setNeedsGesture(false);
            setPlaybackFailed(false);
            setIsVideoVisible(true);
          }}
          onWaiting={() => setIsVideoVisible(false)}
          onError={() => {
            cancelRef.current?.();
            setIsVideoVisible(false);
            setNeedsGesture(true);
            setPlaybackFailed(true);
          }}
        >
          {shouldLoad && <source src={FILM_SRC} type="video/mp4" />}
        </video>
        {needsGesture && (
          <button
            type="button"
            className="absolute inset-0 z-10 grid place-items-center bg-foreground/15 text-wine"
            onClick={() => {
              void playRef.current?.();
            }}
            aria-label={`Play ${FILM_LABEL}`}
          >
            <span className="rounded-full bg-cream px-4 py-2 font-serif text-sm italic shadow-[0_8px_20px_rgba(104,65,75,0.22)]">
              Play film
            </span>
          </button>
        )}
        {playbackFailed && (
          <p role="status" className="sr-only">The film couldn&apos;t play. Please try the Play film button again.</p>
        )}
      </div>
    </figure>
  );
}
