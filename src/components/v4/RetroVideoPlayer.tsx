"use client";

import { useEffect, useRef, useState } from "react";

export default function RetroVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const resumeVideo = () => {
      if (document.visibilityState !== "visible") return;

      if (video.readyState === HTMLMediaElement.HAVE_NOTHING) {
        video.load();
      }

      void video
        .play()
        .then(() => setIsVideoVisible(true))
        .catch(() => setIsVideoVisible(false));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsVideoVisible(false);
        return;
      }

      resumeVideo();
    };

    const handlePageHide = () => setIsVideoVisible(false);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", resumeVideo);
    window.addEventListener("pagehide", handlePageHide);
    resumeVideo();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", resumeVideo);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return (
    <figure className="retro-player-shell mx-auto w-full max-w-[320px] rounded-[1.5rem] p-3 shadow-[0_28px_60px_rgba(81,49,58,0.25)]">
      <div className="rounded-[1.15rem] bg-[#302c30] p-2.5 shadow-[inset_0_0_0_1px_rgba(255,250,243,0.12)]">
        <div
          className="relative aspect-[9/16] overflow-hidden rounded-[0.8rem] bg-[#171519] bg-cover bg-center"
          style={{ backgroundImage: "url('/videos/dress-code-film-poster.jpg')" }}
        >
          <video
            ref={videoRef}
            className={`h-full w-full object-contain transition-opacity duration-300 ${
              isVideoVisible ? "opacity-100" : "opacity-0"
            }`}
            poster="/videos/dress-code-film-poster.jpg"
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            aria-label="A little film of Natthida and Tanakan by the lake"
            onPlaying={() => setIsVideoVisible(true)}
            onWaiting={() => setIsVideoVisible(false)}
            onStalled={() => setIsVideoVisible(false)}
          >
            <source src="/videos/dress-code-film.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </figure>
  );
}
