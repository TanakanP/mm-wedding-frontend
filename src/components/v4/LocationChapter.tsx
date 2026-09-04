"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

import { PHOTOS, WEDDING } from "@/content/wedding";
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
  const photo = PHOTOS[10];
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
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:gap-[clamp(48px,7vw,104px)]">
        <motion.figure
          {...reveal(reduceMotion, -40)}
          className="relative bg-paper p-3 pb-12 shadow-[0_28px_70px_rgba(104,65,75,0.16)] md:p-4 md:pb-14"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-petal md:min-h-[42rem] md:aspect-auto lg:min-h-[34rem] xl:min-h-[42rem]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 767px) calc(100vw - 64px), (max-width: 1023px) calc(86vw - 32px), (max-width: 1439px) 39vw, 585px"
              className="object-cover"
              style={{ objectPosition: photo.objectPosition }}
            />
          </div>
          <figcaption className="absolute inset-x-0 bottom-4 text-center font-serif text-sm italic text-wine md:bottom-5 md:text-base">
            Meet us in the garden
          </figcaption>
        </motion.figure>

        <motion.div {...reveal(reduceMotion, 40)}>
          <p className="text-[10px] uppercase tracking-[0.32em] text-wine">
            Where we gather
          </p>
          <h2
            id="venue-title"
            className="mt-4 font-serif text-5xl italic leading-none text-wine md:text-7xl"
          >
            Location
          </h2>

          <div className="mt-7 border-y border-wine/20 py-6 text-wine">
            <p className="font-serif text-2xl leading-tight">
              {WEDDING.venue.name}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-wine">
              {WEDDING.venue.receptionName}
            </p>
            <p className="mt-5 max-w-md text-sm leading-7 text-wine">
              {WEDDING.venue.address}
            </p>
            <p className="mt-4 font-serif text-base leading-7 text-wine">
              {WEDDING.dateLong}
              <br />
              {WEDDING.timeLabel}
            </p>
          </div>

          <div className="mt-7 border border-wine/25 bg-paper p-4 shadow-[0_16px_40px_rgba(104,65,75,0.08)] xl:grid xl:grid-cols-[minmax(0,1fr)_176px] xl:items-center xl:gap-5">
            <div>
              <div
                aria-hidden="true"
                className="relative h-44 overflow-hidden border border-wine/15 bg-cream"
                style={{
                  backgroundImage:
                    "linear-gradient(31deg, transparent 47%, rgba(169,112,124,.24) 48%, rgba(169,112,124,.24) 51%, transparent 52%), linear-gradient(-38deg, transparent 47%, rgba(117,96,120,.16) 48%, rgba(117,96,120,.16) 51%, transparent 52%)",
                  backgroundSize: "58px 50px, 74px 62px",
                }}
              >
                <span className="absolute left-[56%] top-[36%] grid size-12 place-items-center rounded-full border border-wine/15 bg-petal text-wine shadow-[0_8px_20px_rgba(104,65,75,0.18)]">
                  <MapPin className="size-6" strokeWidth={1.5} />
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-medium uppercase tracking-[0.2em]">
                <a
                  href={locationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="border-b border-wine pb-1 text-wine transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine"
                >
                  Open location
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

            <div className="mt-7 flex flex-col items-center border-t border-wine/15 pt-6 xl:mt-0 xl:border-l xl:border-t-0 xl:py-1 xl:pl-5">
              <QRCodeSVG
                value={locationUrl}
                size={144}
                marginSize={2}
                bgColor="#FFFAF3"
                fgColor="#51313A"
                title={`Scan for directions to ${WEDDING.venue.name}`}
              />
              <p className="mt-3 text-center text-[9px] uppercase tracking-[0.18em] text-wine">
                Scan for directions
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
