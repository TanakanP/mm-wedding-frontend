"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useRef, useMemo } from "react";
import { X } from "lucide-react";

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

function motionProps<T extends object>(reduceMotion: boolean, props: T) {
  return reduceMotion ? {} : props;
}

export default function RSVPForm({ isOpen, onClose }: RSVPFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<RSVPFormValues | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = Boolean(useReducedMotion());

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
    }
  });

  const side = watch("side");
  const attending = watch("attending");
  const relation = watch("relation");

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

  const handleClose = () => {
    onClose();
    // Optional: reset form after closing so it's fresh next time
    setTimeout(() => {
      setIsSubmitted(false);
      setSubmittedData(null);
      setShowerPetals([]);
      reset();
    }, 300);
  };

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-foreground/40 backdrop-blur-sm">
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
            {...motionProps(reduceMotion, {
              initial: { opacity: 0, scale: 0.95, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.95, y: 20 },
            })}
            className="relative w-full h-full md:h-auto max-w-2xl bg-cream md:bg-cream backdrop-blur-md rounded-none md:rounded-2xl shadow-xl border-0 md:border md:border-sage/20 max-h-full md:max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header - Static */}
            <div className="shrink-0 px-6 pt-8 pb-4 sm:px-8 sm:pt-10 sm:pb-6 md:px-12 border-b border-sage/20 relative bg-cream z-10">
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-sage/70 hover:text-foreground transition-colors bg-cream/70 md:bg-transparent rounded-full backdrop-blur-sm md:backdrop-blur-none"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="font-serif text-4xl text-center text-accent-primary mb-2">The Invitation</h2>
              <p className="text-center text-sage font-light">{WEDDING.venue.name}</p>
              <p className="text-center text-sage font-light">{WEDDING.timeLabel} | {WEDDING.dateLabel}</p>
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
                        <h3 className="font-serif text-3xl text-accent-primary mb-6">M &amp; M</h3>
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
                        className="bg-accent-primary hover:bg-foreground text-white px-6 py-3 rounded-lg transition-colors font-medium w-full sm:w-auto"
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
                    <h3 className="font-serif text-2xl text-accent-primary mb-4">Thank You, {submittedData.name}</h3>
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
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden text-left">
                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto bg-cream p-6 sm:p-8 md:px-12 md:py-8 flex flex-col gap-4 md:gap-6">
                  {/* 1. Name */}
                  <div className="shrink-0">
                    <label className="block text-sm font-medium text-foreground mb-1">Tell us your name</label>
                    <input
                      {...register("name")}
                      className="w-full sm:w-2/3 md:w-1/2 px-4 py-2 border border-sage/30 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors bg-cream"
                      placeholder="John & Jane Doe"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  {/* 2. Side (Groom/Bride) */}
                  <div className="shrink-0">
                    <label className="block text-sm font-medium text-foreground mb-2">Which side are you from?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="groom" {...register("side")} className="accent-accent-secondary" />
                        <span className="text-foreground/80">Groom</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="bride" {...register("side")} className="accent-accent-secondary" />
                        <span className="text-foreground/80">Bride</span>
                      </label>
                    </div>
                    {errors.side && <p className="text-red-500 text-sm mt-1">{errors.side.message}</p>}
                  </div>

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
                            <label className="block text-sm font-medium text-foreground mb-1">Relationship</label>
                            <select
                              {...register("relation")}
                              className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors bg-cream"
                            >
                              <option value="">Select a relationship...</option>
                              {(side === "groom" ? groomRelations : brideRelations).map((rel) => (
                                <option key={rel} value={rel}>{rel}</option>
                              ))}
                            </select>
                            {errors.relation && <p className="text-red-500 text-sm mt-1">{errors.relation.message}</p>}
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
                                <label className="block text-sm font-medium text-foreground mb-1">Please specify</label>
                                <input
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
                  <div className="shrink-0">
                    <label className="block text-sm font-medium text-foreground mb-2">Will you be attending?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="yes" {...register("attending")} className="accent-accent-secondary" />
                        <span className="text-foreground/80">Joyfully Accepts</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="no" {...register("attending")} className="accent-accent-secondary" />
                        <span className="text-foreground/80">Regretfully Declines</span>
                      </label>
                    </div>
                    {errors.attending && <p className="text-red-500 text-sm mt-1">{errors.attending.message}</p>}
                  </div>

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
                          <label className="block text-sm font-medium text-foreground mb-1">How many follower(s)?</label>
                          <input
                            type="number"
                            min="1"
                            {...register("guestCount")}
                            className="w-24 px-4 py-2 border border-sage/30 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors bg-cream"
                            placeholder="1"
                          />
                        </div>

                        {/* Alcohol Checkbox */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...register("drinksAlcohol")} className="accent-accent-secondary" />
                            <span className="text-foreground font-medium">I will be drinking alcohol</span>
                          </label>
                          <p className="text-xs text-sage mt-1.5 italic">
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
                          <label className="block text-sm font-medium text-foreground mb-1">A Note for the Couple</label>
                          <textarea
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
                    className="w-full bg-accent-primary hover:bg-foreground text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-70"
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
