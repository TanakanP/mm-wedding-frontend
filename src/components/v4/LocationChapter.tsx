"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import { QRCodeSVG } from "qrcode.react";

import { WEDDING } from "@/content/wedding";
import { getLocationUrl } from "@/lib/location";

const viewport = { once: true, amount: 0.2 } as const;

function reveal(reduceMotion: boolean, x: number) {
  return reduceMotion
    ? {}
    : {
        initial: { opacity: 0, x },
        whileInView: { opacity: 1, x: 0 },
        viewport,
        transition: {
          duration: 0.78,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };
}

export default function LocationChapter() {
  const reduceMotion = useHydrationSafeReducedMotion();
  const locationUrl = getLocationUrl(
    WEDDING.venue.mapUrl,
    WEDDING.venue.address
  );

  return (
    <section
      id="venue"
      aria-labelledby="venue-title"
      className="garden-section garden-texture overflow-hidden bg-cream px-5 py-20 md:px-[7vw] md:py-28"
    >
      <motion.div
        {...reveal(reduceMotion, 0)}
        className="mx-auto max-w-5xl"
      >
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.32em] text-wine">
            WHERE FOREVER BEGIN
          </p>
          <h2
            id="venue-title"
            className="mt-4 font-serif text-5xl italic leading-none text-wine md:text-7xl"
          >
            Location
          </h2>

          <div className="mx-auto mt-7 max-w-2xl border-y border-wine/20 py-6 text-wine">
            <p className="font-serif text-2xl leading-tight md:text-3xl">
              {WEDDING.venue.name}
            </p>
            <p className="mt-3 text-sm leading-7 text-wine/80">
              {WEDDING.venue.address}
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden border border-wine/25 bg-paper p-3 shadow-[0_20px_55px_rgba(104,65,75,0.12)] md:grid md:grid-cols-[minmax(0,1fr)_220px] md:items-stretch md:p-4">
          <div className="min-w-0 overflow-hidden border border-wine/15 bg-cream">
            <iframe
              src={WEDDING.venue.mapEmbedUrl}
              title="Map to US Wedding & Event VENUE"
              width="400"
              height="300"
              className="block h-[300px] w-full border-0 md:h-[380px]"
              allowFullScreen
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <div className="flex flex-col items-center justify-center border-t border-wine/15 px-4 py-7 md:border-l md:border-t-0 md:px-6 md:py-4">
            <QRCodeSVG
              value={locationUrl}
              size={144}
              marginSize={2}
              bgColor="#FFFAF3"
              fgColor="#51313A"
              title={`Directions to ${WEDDING.venue.name}`}
            />
            <div className="mt-5 flex flex-col items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em]">
              <a
                href={locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b border-wine pb-1 text-wine transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine"
              >
                OPEN LOCATION
              </a>
              {WEDDING.venue.calendarUrl && (
                <a
                  href={WEDDING.venue.calendarUrl}
                  className="border-b border-wine/40 pb-1 text-wine transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine"
                >
                  Add to calendar
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
