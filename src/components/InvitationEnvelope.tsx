"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Ref } from "react";
import { PHOTOS } from "@/content/wedding";

const flapEase = [0.65, 0, 0.35, 1] as const;
const photoEase = [0.22, 1, 0.36, 1] as const;
const tucked = { y: "8%", rotate: -1, opacity: 0 };
const risen = { y: "-62%", rotate: 1.5, opacity: 1 };

export interface InvitationEnvelopeProps {
  open: boolean;
  seal: "button" | "decorative";
  reduceMotion: boolean;
  onOpen?: () => void;
  openButtonRef?: Ref<HTMLButtonElement>;
  sealDisabled?: boolean;
}

export default function InvitationEnvelope({
  open,
  seal,
  reduceMotion,
  onOpen,
  openButtonRef,
  sealDisabled = false,
}: InvitationEnvelopeProps) {
  const photo = PHOTOS[1];
  const sealClassName = `absolute left-1/2 top-[54%] z-[5] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-foreground/15 bg-accent-primary font-serif text-sm tracking-[0.08em] text-foreground shadow-[0_11px_25px_rgba(75,44,34,0.22)] outline-none focus-visible:ring-4 focus-visible:ring-cream/80 disabled:pointer-events-none md:h-[68px] md:w-[68px] ${reduceMotion ? "" : "transition-transform hover:scale-105"}`;

  return (
    <div className="relative mx-auto h-[46vw] min-h-56 max-h-[335px] w-[min(88vw,610px)] [perspective:1200px]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-petal shadow-[0_31px_64px_rgba(55,23,32,0.34)]" />

        <motion.div
          aria-hidden={!open}
          className={`absolute inset-x-[8%] top-[9%] h-[82%] bg-cream p-2 pb-8 text-foreground shadow-[0_14px_30px_rgba(60,30,38,0.24)] md:p-3 md:pb-10 ${open ? "z-[6]" : "z-[2]"}`}
          initial={reduceMotion ? false : tucked}
          animate={open ? risen : tucked}
          transition={{
            duration: reduceMotion ? 0 : 1.05,
            delay: reduceMotion ? 0 : open ? 0.72 : 0,
            ease: photoEase,
          }}
        >
          <div className="relative h-full overflow-hidden">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              loading="eager"
              sizes="(max-width: 768px) 74vw, 500px"
              className="object-cover"
              style={{ objectPosition: photo.objectPosition }}
            />
          </div>
          <span className="absolute inset-x-0 bottom-2 text-center font-serif text-sm italic md:bottom-3 md:text-base">
            You&apos;re invited
          </span>
        </motion.div>

        <motion.div
          className="absolute inset-x-0 top-0 z-[4] h-[58%] origin-top [transform-style:preserve-3d]"
          initial={reduceMotion ? false : { rotateX: 0 }}
          animate={{ rotateX: open ? 178 : 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.72,
            ease: flapEase,
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-paper [clip-path:polygon(0_0,100%_0,50%_100%)] [backface-visibility:hidden]" />
          <div className="absolute inset-0 bg-petal [clip-path:polygon(0_0,100%_0,50%_100%)] [transform:rotateX(180deg)] [backface-visibility:hidden]" />
        </motion.div>

        <div
          className="absolute inset-0 z-[3] bg-petal [clip-path:polygon(0_12%,50%_60%,100%_12%,100%_100%,0_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-[3] border border-cream/35 [clip-path:polygon(0_12%,50%_60%,100%_12%,100%_100%,0_100%)]"
          aria-hidden="true"
        />

        {seal === "button" ? (
          <motion.button
            ref={openButtonRef}
            type="button"
            onClick={onOpen}
            disabled={open || sealDisabled}
            aria-label="Open M and M wedding invitation"
            className={sealClassName}
            animate={
              !open
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.55, rotate: -12 }
            }
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
          >
            M&amp;M
          </motion.button>
        ) : (
          <motion.div
            className={sealClassName}
            initial={
              reduceMotion ? false : { opacity: 1, scale: 1, rotate: 0 }
            }
            animate={
              open
                ? { opacity: 0, scale: 0.55, rotate: -12 }
                : { opacity: 1, scale: 1, rotate: 0 }
            }
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
            aria-hidden="true"
          >
            M&amp;M
          </motion.div>
        )}
      </div>
    </div>
  );
}
