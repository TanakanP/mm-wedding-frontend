"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { RSVP_FILM_PHOTOS } from "@/content/wedding";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import { getRSVPFilmLayout, selectRSVPFilmPhotos, type RSVPFilmLayout } from "@/lib/rsvpFilmLayout";

type LoadStatus = "loading" | "ready" | "failed";
type FilmStyle = CSSProperties & Record<`--${string}`, string | number>;

export default function RSVPFilmBackground({ modalOpen }: { modalOpen: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const aliveRef = useRef(false);
  const seededRef = useRef(false);
  const nearRef = useRef(false);
  const batchStartRef = useRef(0);
  const stalledRef = useRef(false);
  const attemptRef = useRef(0);
  const [layout, setLayout] = useState<RSVPFilmLayout | null>(null);
  const [width, setWidth] = useState(0);
  const [start, setStart] = useState(0);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [saveData, setSaveData] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [loads, setLoads] = useState<Record<string, LoadStatus>>({});
  const reduceMotion = useHydrationSafeReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const section = root?.parentElement;
    if (!root || !section) return;
    aliveRef.current = true;
    const measure = () => {
      const rect = section.getBoundingClientRect();
      const next = getRSVPFilmLayout(rect.width, rect.height);
      if (!next) return;
      setLayout(previous => previous && previous.planeWidth === next.planeWidth && previous.planeHeight === next.planeHeight && previous.framePitch === next.framePitch ? previous : next);
      setWidth(rect.width);
      if (!seededRef.current) {
        seededRef.current = true;
        setStart(Math.floor(Math.random() * RSVP_FILM_PHOTOS.length));
      }
    };
    const updateNear = (value: boolean) => {
      if (value && !nearRef.current && stalledRef.current) {
        stalledRef.current = false;
        batchStartRef.current = 0;
        attemptRef.current += 1;
        setAttempt(attemptRef.current);
        setStalled(false);
        setLoads(previous => Object.fromEntries(Object.entries(previous).filter(([, status]) => status !== "loading")));
      }
      nearRef.current = value;
      setNear(value);
    };
    const checkViewport = () => {
      const rect = section.getBoundingClientRect();
      setVisible(rect.bottom > 0 && rect.top < window.innerHeight);
      updateNear(rect.bottom > -600 && rect.top < window.innerHeight + 600);
    };
    const visibilityChanged = () => setPageVisible(document.visibilityState === "visible");
    const initialize = () => {
      measure();
      checkViewport();
      visibilityChanged();
      setSaveData((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true);
    };
    const initialFrame = window.requestAnimationFrame(initialize);
    const resize = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    resize?.observe(section);
    if (!resize) window.addEventListener("resize", measure);
    const observers: IntersectionObserver[] = [];
    let fallbackFrame = 0;
    const fallbackCheck = () => {
      if (fallbackFrame) return;
      fallbackFrame = window.requestAnimationFrame(() => { fallbackFrame = 0; checkViewport(); });
    };
    if (typeof IntersectionObserver !== "undefined") {
      const nearObserver = new IntersectionObserver(entries => updateNear(entries.some(e => e.isIntersecting)), { rootMargin: "600px 0px" });
      const visibleObserver = new IntersectionObserver(entries => setVisible(entries.some(e => e.isIntersecting)), { rootMargin: "0px" });
      observers.push(nearObserver, visibleObserver);
      observers.forEach(observer => observer.observe(section));
    } else {
      window.addEventListener("scroll", fallbackCheck, { passive: true });
      window.addEventListener("resize", fallbackCheck);
    }
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      aliveRef.current = false;
      window.cancelAnimationFrame(initialFrame);
      window.cancelAnimationFrame(fallbackFrame);
      resize?.disconnect();
      observers.forEach(observer => observer.disconnect());
      window.removeEventListener("resize", measure);
      window.removeEventListener("resize", fallbackCheck);
      window.removeEventListener("scroll", fallbackCheck);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, []);

  const active = selectRSVPFilmPhotos(RSVP_FILM_PHOTOS, width, start, saveData);
  const rows = Array.from({ length: layout?.rowCount ?? 12 }, (_, row) =>
    Array.from({ length: (layout?.sequenceRepeats ?? 1) * 8 }, (_, slot) => active[(row * 11 + slot) % active.length])
  );
  const sources = [...new Set(rows.flat().filter(Boolean).map(photo => photo.src))];
  const sourceKey = sources.join("\n");
  const pending = sources.filter(src => loads[src] === "loading");
  const pendingKey = pending.join("\n");
  const canLoad = near && pageVisible && !modalOpen && layout !== null;

  useEffect(() => {
    if (!canLoad || stalled) return;
    if (pendingKey) {
      if (!batchStartRef.current) batchStartRef.current = Date.now();
      const timer = setTimeout(() => {
        if (aliveRef.current) { stalledRef.current = true; setStalled(true); }
      }, Math.max(0, 15_000 - (Date.now() - batchStartRef.current)));
      return () => clearTimeout(timer);
    }
    batchStartRef.current = 0;
    const next = sourceKey.split("\n").filter(src => src && !loads[src]).slice(0, 4);
    if (!next.length) return;
    // Yield before admitting a batch so card rendering/interaction takes priority.
    const timer = setTimeout(() => {
      if (!aliveRef.current) return;
      setLoads(previous => ({ ...previous, ...Object.fromEntries(next.map(src => [src, "loading" as const])) }));
    }, 0);
    return () => clearTimeout(timer);
  }, [canLoad, stalled, sourceKey, pendingKey, loads]);

  const settle = (src: string, status: "ready" | "failed", generation: number) => {
    if (!aliveRef.current || generation !== attemptRef.current) return;
    setLoads(previous => previous[src] === status ? previous : { ...previous, [src]: status });
  };
  const paused = modalOpen || reduceMotion || saveData || !visible || !pageVisible || !layout;
  const owners = new Map<string, string>();
  rows.forEach((photos, row) => photos.forEach((photo, slot) => {
    if (photo && !owners.has(photo.src)) owners.set(photo.src, `${row}-${slot}`);
  }));
  const style: FilmStyle = layout ? {
    width: layout.planeWidth, height: layout.planeHeight,
    "--rsvp-film-angle": `${layout.angleDeg}deg`,
    "--rsvp-film-pitch": `${layout.framePitch}px`,
    "--rsvp-film-rail": `${layout.railHeight}px`,
    "--rsvp-film-row-height": `${layout.rowPitch}px`,
    "--rsvp-film-group": `${layout.groupWidth}px`,
  } : {};

  return (
    <div ref={rootRef} className="rsvp-film-background">
      <div aria-hidden="true" className="rsvp-film-decoration">
        <div data-film-plane="true" data-paused={Boolean(paused)} className={`rsvp-film-plane${layout ? "" : " rsvp-film-unmeasured"}`} style={style}>
          {rows.map((photos, row) => {
            const speed = width < 768 ? [10, 12, 11][row % 3] : [14, 16, 15][row % 3];
            const duration = (layout?.groupWidth ?? 1440) / speed;
            return (
              <div key={row} data-film-row={row + 1} className="rsvp-film-row">
                <div className="rsvp-film-track" style={{ animationDuration: `${duration}s`, animationDelay: `${-(row % 8) * duration / 8}s`, animationDirection: row % 2 ? "reverse" : "normal", animationPlayState: paused ? "paused" : "running" }}>
                  {[0, 1].map(copy => (
                    <div key={copy} data-film-group={copy + 1} className="rsvp-film-group">
                      {photos.map((photo, slot) => photo && (
                        <div key={slot} data-photo-src={photo.src} className="rsvp-film-frame">
                          <div className="rsvp-film-aperture">
                            {/* Inline decorative fallback needs no network request. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.blurDataURL} alt="" className="rsvp-film-placeholder" />
                            {(loads[photo.src] === "ready" || (loads[photo.src] === "loading" && copy === 0 && owners.get(photo.src) === `${row}-${slot}`)) && (
                              <Image key={attempt} src={photo.src} alt="" fill sizes={`${(layout?.framePitch ?? 180) - 12}px`} loading="eager" fetchPriority="low" className="rsvp-film-photo" onLoad={() => settle(photo.src, "ready", attempt)} onError={() => settle(photo.src, "failed", attempt)} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="rsvp-film-wash" />
      </div>

    </div>
  );
}
