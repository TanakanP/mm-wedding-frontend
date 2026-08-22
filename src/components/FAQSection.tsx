"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { WEDDING } from "@/content/wedding";
import { useSections } from "@/hooks/useSections";
import { INVITATION_REPLAY_EVENT } from "@/lib/invitation";
import { jumpToTop } from "@/lib/scroll";

const faqs = [
  {
    question: "What should we wear in the garden?",
    answer:
      "We request formal attire. For women, floor-length gowns or elegant cocktail dresses. For men, a tuxedo or a dark suit and tie.",
  },
  {
    question: "May I bring a plus one to wander with me?",
    answer:
      "Due to limited space at our venue, we are only able to accommodate guests who are formally named on the invitation.",
  },
  {
    question: "Is there parking available among the blooms?",
    answer:
      "Yes, complimentary valet parking will be available at both the ceremony and reception venues.",
  },
  {
    question: "Are little sprouts welcome?",
    answer:
      "While we love your little ones, we have chosen for our wedding day to be an adults-only celebration. We hope this advance notice means you are still able to share our big day and will enjoy having the evening off!",
  },
];

function reveal(reduceMotion: boolean, delay = 0) {
  return reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { delay },
      };
}

function accordionMotion(reduceMotion: boolean) {
  return reduceMotion
    ? {}
    : {
        initial: { height: 0, opacity: 0, scaleY: 0.96, rotateX: -1 },
        animate: { height: "auto", opacity: 1, scaleY: 1, rotateX: 0 },
        exit: { height: 0, opacity: 0, scaleY: 0.96, rotateX: -1 },
        transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] as const },
      };
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { scrollToTop } = useSections();
  const reduceMotion = Boolean(useReducedMotion());
  const replayInvitation = () => {
    jumpToTop();
    window.dispatchEvent(new Event(INVITATION_REPLAY_EVENT));
  };

  return (
    <div
      id="garden-whispers"
      aria-labelledby="garden-whispers-title"
      className="garden-section w-full px-4 pb-10 pt-4 md:px-8 md:pb-16"
    >
      <div className="mx-auto w-full max-w-4xl border border-wine/15 bg-cream px-5 py-16 shadow-[0_24px_65px_rgba(72,36,46,.13)] sm:px-8 md:px-14 md:py-20">
        <div className="mx-auto w-full max-w-3xl">
          <motion.h2
            {...reveal(reduceMotion)}
            id="garden-whispers-title"
            className="mb-3 text-center font-serif text-4xl italic text-wine md:text-5xl"
          >
            Garden Whispers
          </motion.h2>
          <p className="mb-10 text-center text-sm font-light tracking-wide text-wine">
            A few gentle answers as you prepare your visit
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={index}
                  {...reveal(reduceMotion, index * 0.1)}
                  className={`overflow-hidden border bg-paper/70 transition-colors ${isOpen ? "border-dusty shadow-sm" : "border-wine/20"}`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    className="flex w-full items-center justify-between px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine md:px-6"
                  >
                    <span
                      className={`font-medium transition-colors ${isOpen ? "text-wine" : "text-foreground"}`}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 ${reduceMotion ? "" : "transition-all duration-300"} ${isOpen ? "rotate-180 text-wine" : "text-wine/60"}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${index}`}
                        {...accordionMotion(reduceMotion)}
                        className="origin-top"
                      >
                        <div className="border-t border-wine/10 px-5 pb-5 pt-3 font-light leading-relaxed text-foreground/80 md:px-6">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        <footer className="mt-16 w-full border-t border-wine/20 pb-0 pt-10 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-light tracking-wide text-wine/80">
              Planted with love • M &amp; M • {WEDDING.dateLabel} • {WEDDING.venue.name}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-wine">
              <button
                onClick={scrollToTop}
                className="transition-colors hover:text-foreground focus:outline-none focus-visible:underline"
              >
                Back to the top
              </button>
              <span aria-hidden="true">•</span>
              <button
                onClick={replayInvitation}
                className="transition-colors hover:text-foreground focus:outline-none focus-visible:underline"
              >
                Replay invitation
              </button>
              <span aria-hidden="true">•</span>
              <span className="text-wine">
                Wander the garden above to RSVP and plant wishes
              </span>
            </div>
            <p className="mt-4 text-[10px] text-wine">
              © {WEDDING.venue.name} — all are welcome in spirit
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
