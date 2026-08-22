"use client";

import Image from "next/image";
import { useState } from "react";

import { PHOTOS, WEDDING } from "@/content/wedding";
import GardenPath from "./GardenPath";
import RSVPForm from "./RSVPForm";

export default function EventDetails() {
  const [isRSVPOpen, setIsRSVPOpen] = useState(false);

  return (
    <>
      <section
        id="schedule"
        className="garden-section garden-texture bg-cream px-5 py-20 md:px-8 md:py-28"
      >
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] md:items-center">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-sage/70">The celebration</p>
            <h2 className="font-serif text-4xl text-accent-primary md:text-5xl">The day unfolds</h2>
            <GardenPath schedule={WEDDING.schedule} />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image
              src={PHOTOS[3].src}
              alt={PHOTOS[3].alt}
              fill
              sizes="(max-width: 767px) 100vw, 36vw"
              className="object-cover"
              style={{ objectPosition: PHOTOS[3].objectPosition }}
            />
          </div>
        </div>
      </section>

      <section
        aria-label="A memory from our journey"
        className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[16/7]"
      >
        <Image
          src={PHOTOS[4].src}
          alt={PHOTOS[4].alt}
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: PHOTOS[4].objectPosition }}
        />
      </section>

      <section
        id="venue"
        className="garden-section grid bg-cream px-5 py-20 md:grid-cols-2 md:px-8 md:py-28"
      >
        <div className="mx-auto flex w-full max-w-xl flex-col justify-center py-10 md:px-12">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-sage/70">Where we gather</p>
          <h2 className="font-serif text-4xl text-accent-primary md:text-5xl">Reception</h2>
          <div className="mt-8 space-y-3 text-foreground/75">
            <p>{WEDDING.dateLong}</p>
            <p>{WEDDING.timeLabel}</p>
            <p className="pt-4 font-medium text-foreground">{WEDDING.venue.receptionName}</p>
            <p>{WEDDING.venue.address}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium text-accent-primary">
            {WEDDING.venue.mapUrl && (
              <a href={WEDDING.venue.mapUrl} target="_blank" rel="noreferrer">
                Open location
              </a>
            )}
            {WEDDING.venue.calendarUrl && (
              <a href={WEDDING.venue.calendarUrl}>Add to calendar</a>
            )}
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={PHOTOS[10].src}
            alt={PHOTOS[10].alt}
            fill
            sizes="(max-width: 767px) 100vw, 52vw"
            className="object-cover"
            style={{ objectPosition: PHOTOS[10].objectPosition }}
          />
        </div>
      </section>

      <section
        aria-label="More memories together"
        className="grid gap-3 bg-cream px-5 py-12 sm:grid-cols-3 md:px-8 md:py-20"
      >
        {[PHOTOS[5], PHOTOS[8], PHOTOS[9]].map((photo) => (
          <figure key={photo.id} className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 639px) 100vw, 33vw"
              className="object-cover"
              style={{ objectPosition: photo.objectPosition }}
            />
          </figure>
        ))}
      </section>

      <section
        id="rsvp"
        className="garden-section garden-texture bg-cream px-5 py-20 text-center md:px-8 md:py-28"
      >
        <div className="mx-auto max-w-xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-sage/70">With love</p>
          <h2 className="font-serif text-4xl text-accent-primary md:text-5xl">RSVP with love</h2>
          <p className="mt-5 text-foreground/75">We would be honored to celebrate with you.</p>
          <button
            type="button"
            onClick={() => setIsRSVPOpen(true)}
            className="mt-8 rounded-lg bg-accent-primary px-10 py-3 text-lg font-medium text-white shadow-sm transition-colors hover:bg-foreground"
          >
            RSVP Now
          </button>
        </div>
      </section>

      <RSVPForm isOpen={isRSVPOpen} onClose={() => setIsRSVPOpen(false)} />
    </>
  );
}
