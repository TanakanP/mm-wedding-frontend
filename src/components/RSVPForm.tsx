"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X } from "lucide-react";

import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import { lockDocumentScroll } from "@/lib/scroll";
import { WEDDING } from "@/content/wedding";
import PlantWishWall from "./PlantWishWall";

const rsvpSchema = z.object({
  name: z.string().min(2, "Name is required"),
  side: z.enum(["groom", "bride"], { message: "Please select whose side you are from" }),
  relation: z.string().min(1, "Please select your relationship"),
  otherRelation: z.string().optional(),
  attending: z.enum(["yes", "no"], { message: "Please select if you are attending" }),
  guestCount: z.string().optional(),
  drinksAlcohol: z.boolean().optional(),
  message: z.string().optional(),
});

type RSVPFormValues = z.infer<typeof rsvpSchema>;

interface RSVPFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const groomRelations = ["Family", "High School Friend", "University Friend", "Colleague", "Other"];
const brideRelations = ["Family", "Childhood Friend", "University Friend", "Colleague", "Other"];
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function motionProps<T extends object>(reduceMotion: boolean, props: T) {
  return reduceMotion ? {} : props;
}

export default function RSVPForm({ isOpen, onClose }: RSVPFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<RSVPFormValues | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const submissionStatusRef = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useHydrationSafeReducedMotion();

  // Transient petal shower (outside the cardRef so it does not affect downloads)
  const [showerPetals, setShowerPetals] = useState<
    Array<{ id: number; x: number; delay: number; duration: number; rotate: number }>
  >([]);

  useEffect(() => {
    if (!isOpen) return;

    return lockDocumentScroll();
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RSVPFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      drinksAlcohol: false,
      relation: "",
    }
  });

  const side = watch("side");
  const attending = watch("attending");
  const relation = watch("relation");
  const validationMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => typeof message === "string");

  // Trigger living petals on success mount for attending=yes (outside card)
  useEffect(() => {
    if (isSubmitted && submittedData?.attending === "yes") {
      const t = setTimeout(() => {
        triggerPetalShower(5);
      }, 380);
      return () => clearTimeout(t);
    }
  }, [isSubmitted, submittedData?.attending]);

  // Stabilize userWish object reference so PlantWishWall effect (dep on [userWish])
  // does not re-run on every parent re-render (e.g. showerPetals updates).
  const userWishForWall = useMemo(() => {
    if (submittedData && submittedData.attending === "yes" && submittedData.message && submittedData.message.trim()) {
      return { name: submittedData.name, message: submittedData.message.trim() };
    }
    return undefined;
  }, [submittedData]);

  const onSubmit = async (data: RSVPFormValues) => {
    // In a real app, send to API here
    console.log(data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmittedData(data);
    setIsSubmitted(true);
  };

  const handleClose = useCallback(() => {
    onClose();
    // Optional: reset form after closing so it's fresh next time
    setTimeout(() => {
      setIsSubmitted(false);
      setSubmittedData(null);
      setShowerPetals([]);
      reset();
    }, 300);
  }, [onClose, reset]);

  useEffect(() => {
    if (!isOpen) return;

    openerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
      (firstFocusable ?? dialogRef.current)?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const focusIsInside = document.activeElement instanceof Node
        && dialogRef.current.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === first || !focusIsInside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !focusIsInside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      openerRef.current?.focus({ preventScroll: true });
      openerRef.current = null;
    };
  }, [handleClose, isOpen]);

  useEffect(() => {
    if (!isSubmitted) return;

    const focusFrame = window.requestAnimationFrame(() => {
      submissionStatusRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [isSubmitted]);

  const triggerPetalShower = (count = 6) => {
    const newPetals = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: 18 + Math.random() * 64, // centered-ish over card area
      delay: Math.random() * 0.25,
      duration: 1.1 + Math.random() * 0.9,
      rotate: (Math.random() - 0.5) * 70,
    }));
    setShowerPetals((prev) => [...prev, ...newPetals]);

    // Auto-cleanup after animation (longer than longest duration)
    setTimeout(() => {
      setShowerPetals((prev) => prev.filter((p) => !newPetals.some((np) => np.id === p.id)));
    }, 2600);
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    // Gentle petal shower on Save Picture (Warm Gold action)
    triggerPetalShower(9);
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(cardRef.current, { scale: 2 });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "MM_Wedding_Invitation.png";
    link.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-wine/55 p-0 backdrop-blur-sm md:p-4">
          <motion.div
            {...motionProps(reduceMotion, {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
            })}
            className="absolute inset-0"
            onClick={handleClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rsvp-dialog-title"
            aria-describedby="rsvp-dialog-description"
            tabIndex={-1}
            {...motionProps(reduceMotion, {
              initial: { opacity: 0, scale: 0.95, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.95, y: 20 },
            })}
            className="relative flex h-full max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-none border-0 bg-cream shadow-[0_28px_80px_rgba(46,32,36,.35)] backdrop-blur-md md:h-auto md:max-h-[90vh] md:rounded-sm md:border md:border-wine/20"
          >
            {/* Header - Static */}
            <div className="relative z-10 shrink-0 border-b border-wine/15 bg-cream px-6 pb-4 pt-8 sm:px-8 sm:pb-6 sm:pt-10 md:px-12">
              <button 
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-full bg-cream/70 p-2 text-wine/70 backdrop-blur-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine md:bg-transparent md:backdrop-blur-none"
                aria-label="Close RSVP dialog"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 id="rsvp-dialog-title" className="mb-2 text-center font-serif text-4xl italic text-wine">The Invitation</h2>
              <p className="text-center font-light text-wine/80">{WEDDING.venue.name}</p>
              <p className="text-center font-light text-wine/80">{WEDDING.timeLabel} | {WEDDING.dateLabel}</p>
              <p id="rsvp-dialog-description" className="sr-only">
                Complete this form to respond to M and M&apos;s wedding invitation.
              </p>
              <p
                ref={submissionStatusRef}
                role="status"
                aria-live="polite"
                tabIndex={-1}
                className="sr-only"
              >
                {isSubmitting
                  ? "Submitting your RSVP."
                  : isSubmitted && submittedData
                    ? `Thank you, ${submittedData.name}. Your RSVP has been received.`
                    : ""}
              </p>
            </div>

            {/* Body & Footer */}
            {isSubmitted && submittedData ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center overflow-y-auto bg-cream">
                {submittedData.attending === "yes" ? (
                  <>
                    {/* Living card area (max-w-md centered) + transient petal shower (outside cardRef) */}
                    <div className="relative w-full max-w-md flex flex-col items-center">
                      <div 
                        ref={cardRef}
                        className="w-full bg-cream p-8 md:p-12 border border-sage/20 shadow-sm rounded-xl mb-6 relative overflow-hidden"
                      >
                        {/* Living growing flower (inside card so captured by download) */}
                        <div className="flex justify-center -mt-2 mb-4">
                          <motion.div
                            {...motionProps(reduceMotion, {
                              initial: { scale: 0.45, opacity: 0.65, rotate: -6 },
                              animate: { scale: 1, opacity: 1, rotate: 0 },
                              transition: { type: "spring", stiffness: 110, damping: 13, delay: 0.12 },
                            })}
                            className="relative w-14 h-14"
                            aria-hidden="true"
                          >
                            {/* Stem */}
                            <div className="absolute left-1/2 top-[52%] w-px h-6 bg-sage/60 -translate-x-1/2 z-0" />
                            {/* Petals (reuse .petal primitive, gold center) */}
                            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                              <div
                                key={i}
                                className="petal absolute origin-[50%_125%]"
                                style={{
                                  left: "50%",
                                  top: "44%",
                                  transform: `rotate(${deg}deg) translateY(-8px)`,
                                  width: "9px",
                                  height: "9px",
                                }}
                              />
                            ))}
                            <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[17px] h-[17px] rounded-full bg-accent-primary z-10" />
                          </motion.div>
                        </div>

                        <div className="absolute top-0 left-0 w-full h-2 bg-accent-secondary"></div>
                        <h3 className="font-serif text-3xl text-wine mb-6">M &amp; M</h3>
                        <p className="text-sage font-light mb-2">Joyfully invite</p>
                        <h4 className="font-serif text-2xl text-foreground mb-6">{submittedData.name}</h4>
                        <div className="space-y-2 text-foreground/70 font-light text-sm">
                          <p>To celebrate their wedding</p>
                          <p className="font-medium text-foreground mt-4">{WEDDING.dateLabel}</p>
                          <p>{WEDDING.timeLabel}</p>
                          <p className="mt-4">{WEDDING.venue.name}</p>
                        </div>
                      </div>

                      <button
                        onClick={downloadCard}
                        className="bg-accent-primary hover:bg-foreground text-foreground hover:text-cream px-6 py-3 rounded-lg transition-colors font-medium w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                      >
                        Save Picture
                      </button>
                      <button
                        onClick={handleClose}
                        className="mt-4 text-sage hover:text-foreground underline transition-colors text-sm"
                      >
                        Close
                      </button>

                      {/* Petal shower layer (ephemeral, outside cardRef, does not affect html2canvas) */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                        {showerPetals.map((p) => (
                          <motion.div
                            key={p.id}
                            className="petal"
                            style={{ left: `${p.x}%`, top: "-4%" }}
                            {...motionProps(reduceMotion, {
                              initial: { y: 0, opacity: 0.85, rotate: 0 },
                              animate: { y: "170%", opacity: 0, rotate: p.rotate },
                              transition: { duration: p.duration, delay: p.delay, ease: "easeOut" },
                            })}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Plant Your Wish Wall - growing garden of sample + user messages (below, wider) */}
                    <div className="w-full max-w-xl px-2 mt-6">
                      <PlantWishWall userWish={userWishForWall} />
                    </div>
                  </>
                ) : (
                  <div className="w-full max-w-md bg-cream p-8 md:p-12 border border-sage/20 shadow-sm rounded-xl flex flex-col items-center">
                    <h3 className="font-serif text-2xl text-wine mb-4">Thank You, {submittedData.name}</h3>
                    <p className="text-foreground/70 font-light mb-8">We appreciate your kind wishes from afar.</p>
                    
                    <div className="w-48 h-48 bg-background border-2 border-dashed border-sage/30 flex items-center justify-center rounded-lg mb-6">
                      <p className="text-sage/70 text-sm font-light">QR Code Space</p>
                    </div>
                    
                    <p className="text-sage font-light text-sm mb-8">For your blessings</p>
                    
                    <button
                      onClick={handleClose}
                      className="bg-sage/10 hover:bg-sage/20 text-foreground px-6 py-2 rounded-lg transition-colors w-full"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                aria-busy={isSubmitting}
                className="flex flex-col flex-1 overflow-hidden text-left"
              >
                <p className="sr-only" role="alert">
                  {validationMessages.length > 0
                    ? `Please correct the RSVP form. ${validationMessages.join(". ")}.`
                    : ""}
                </p>
                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto bg-cream p-6 sm:p-8 md:px-12 md:py-8 flex flex-col gap-4 md:gap-6">
                  {/* 1. Name */}
                  <div className="shrink-0">
                    <label htmlFor="rsvp-name" className="block text-sm font-medium text-foreground mb-1">Tell us your name</label>
                    <input
                      id="rsvp-name"
                      {...register("name")}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "rsvp-name-error" : undefined}
                      className="w-full sm:w-2/3 md:w-1/2 px-4 py-2 border border-sage/30 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors bg-cream"
                      placeholder="John & Jane Doe"
                    />
                    {errors.name && <p id="rsvp-name-error" className="text-red-700 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  {/* 2. Side (Groom/Bride) */}
                  <fieldset
                    className="shrink-0"
                    aria-invalid={Boolean(errors.side)}
                    aria-describedby={errors.side ? "rsvp-side-error" : undefined}
                  >
                    <legend className="block text-sm font-medium text-foreground mb-2">Which side are you from?</legend>
                    <div className="flex gap-4">
                      <label htmlFor="rsvp-side-groom" className="flex items-center gap-2 cursor-pointer">
                        <input
                          id="rsvp-side-groom"
                          type="radio"
                          value="groom"
                          {...register("side")}
                          aria-describedby={errors.side ? "rsvp-side-error" : undefined}
                          className="accent-accent-secondary"
                        />
                        <span className="text-foreground/80">Groom</span>
                      </label>
                      <label htmlFor="rsvp-side-bride" className="flex items-center gap-2 cursor-pointer">
                        <input
                          id="rsvp-side-bride"
                          type="radio"
                          value="bride"
                          {...register("side")}
                          aria-describedby={errors.side ? "rsvp-side-error" : undefined}
                          className="accent-accent-secondary"
                        />
                        <span className="text-foreground/80">Bride</span>
                      </label>
                    </div>
                    {errors.side && <p id="rsvp-side-error" className="text-red-700 text-sm mt-1">{errors.side.message}</p>}
                  </fieldset>

                  {/* 3. Relation Dropdown */}
                  <AnimatePresence>
                    {side && (
                      <motion.div 
                        {...motionProps(reduceMotion, {
                          initial: { opacity: 0, height: 0 },
                          animate: { opacity: 1, height: "auto" },
                          exit: { opacity: 0, height: 0 },
                        })}
                        className="overflow-hidden shrink-0"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                          <div>
                            <label htmlFor="rsvp-relation" className="block text-sm font-medium text-foreground mb-1">Relationship</label>
                            <select
                              id="rsvp-relation"
                              {...register("relation")}
                              aria-invalid={Boolean(errors.relation)}
                              aria-describedby={errors.relation ? "rsvp-relation-error" : undefined}
                              className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors bg-cream"
                            >
                              <option value="">Select a relationship...</option>
                              {(side === "groom" ? groomRelations : brideRelations).map((rel) => (
                                <option key={rel} value={rel}>{rel}</option>
                              ))}
                            </select>
                            {errors.relation && <p id="rsvp-relation-error" className="text-red-700 text-sm mt-1">{errors.relation.message}</p>}
                          </div>

                          <AnimatePresence>
                            {relation === "Other" && (
                              <motion.div
                                {...motionProps(reduceMotion, {
                                  initial: { opacity: 0 },
                                  animate: { opacity: 1 },
                                  exit: { opacity: 0 },
                                })}
                              >
                                <label htmlFor="rsvp-other-relation" className="block text-sm font-medium text-foreground mb-1">Please specify</label>
                                <input
                                  id="rsvp-other-relation"
                                  {...register("otherRelation")}
                                  className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors bg-cream"
                                  placeholder="e.g., Friend of parent"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 4. Attending */}
                  <fieldset
                    className="shrink-0"
                    aria-invalid={Boolean(errors.attending)}
                    aria-describedby={errors.attending ? "rsvp-attending-error" : undefined}
                  >
                    <legend className="block text-sm font-medium text-foreground mb-2">Will you be attending?</legend>
                    <div className="flex gap-4">
                      <label htmlFor="rsvp-attending-yes" className="flex items-center gap-2 cursor-pointer">
                        <input
                          id="rsvp-attending-yes"
                          type="radio"
                          value="yes"
                          {...register("attending")}
                          aria-describedby={errors.attending ? "rsvp-attending-error" : undefined}
                          className="accent-accent-secondary"
                        />
                        <span className="text-foreground/80">Joyfully Accepts</span>
                      </label>
                      <label htmlFor="rsvp-attending-no" className="flex items-center gap-2 cursor-pointer">
                        <input
                          id="rsvp-attending-no"
                          type="radio"
                          value="no"
                          {...register("attending")}
                          aria-describedby={errors.attending ? "rsvp-attending-error" : undefined}
                          className="accent-accent-secondary"
                        />
                        <span className="text-foreground/80">Regretfully Declines</span>
                      </label>
                    </div>
                    {errors.attending && <p id="rsvp-attending-error" className="text-red-700 text-sm mt-1">{errors.attending.message}</p>}
                  </fieldset>

                  <AnimatePresence mode="wait">
                    {/* Logic if Attending */}
                    {attending === "yes" && (
                      <motion.div 
                        key="attending"
                        {...motionProps(reduceMotion, {
                          initial: { opacity: 0, height: 0 },
                          animate: { opacity: 1, height: "auto" },
                          exit: { opacity: 0, height: 0 },
                        })}
                        className="flex flex-col gap-2 md:gap-6 overflow-hidden shrink-0"
                      >
                        {/* Guest Count */}
                        <div>
                          <label htmlFor="rsvp-guest-count" className="block text-sm font-medium text-foreground mb-1">How many follower(s)?</label>
                          <input
                            id="rsvp-guest-count"
                            type="number"
                            min="1"
                            {...register("guestCount")}
                            className="w-24 px-4 py-2 border border-sage/30 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors bg-cream"
                            placeholder="1"
                          />
                        </div>

                        {/* Alcohol Checkbox */}
                        <div>
                          <label htmlFor="rsvp-drinks-alcohol" className="flex items-center gap-2 cursor-pointer">
                            <input
                              id="rsvp-drinks-alcohol"
                              type="checkbox"
                              {...register("drinksAlcohol")}
                              aria-describedby="rsvp-drinks-alcohol-help"
                              className="accent-accent-secondary"
                            />
                            <span className="text-foreground font-medium">I will be drinking alcohol</span>
                          </label>
                          <p id="rsvp-drinks-alcohol-help" className="text-xs text-sage mt-1.5 italic">
                            * Our alcohol will be only beers and liquors
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* A Note for the Couple (Shown for both Yes and No if an attending choice is made) */}
                  <AnimatePresence>
                    {attending && (
                      <motion.div
                        {...motionProps(reduceMotion, {
                          initial: { opacity: 0, height: 0 },
                          animate: { opacity: 1, height: "auto" },
                          exit: { opacity: 0, height: 0 },
                        })}
                        className="overflow-hidden shrink-0"
                      >
                        <div>
                          <label htmlFor="rsvp-message" className="block text-sm font-medium text-foreground mb-1">A Note for the Couple</label>
                          <textarea
                            id="rsvp-message"
                            {...register("message")}
                            rows={4}
                            className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors resize-none bg-cream"
                            placeholder="Leave your wishes..."
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer - Static */}
                <div className="shrink-0 p-6 sm:px-8 md:px-12 md:py-8 border-t border-sage/20 bg-cream z-10">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-sm bg-wine py-3 font-medium text-cream transition-colors hover:bg-foreground disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                  >
                    {isSubmitting ? "Sending..." : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
