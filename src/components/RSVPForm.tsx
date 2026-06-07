"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

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

export default function RSVPForm({ isOpen, onClose }: RSVPFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount to ensure scroll is restored
    return () => {
      document.body.style.overflow = 'unset';
    };
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

  const onSubmit = async (data: RSVPFormValues) => {
    // In a real app, send to API here
    console.log(data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    // Optional: reset form after closing so it's fresh next time
    setTimeout(() => {
      setIsSubmitted(false);
      reset();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={handleClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full h-full md:h-auto max-w-2xl bg-white/95 md:bg-white/95 backdrop-blur-md rounded-none md:rounded-2xl shadow-xl border-0 md:border md:border-stone-200 max-h-full md:max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header - Static */}
            <div className="shrink-0 px-6 pt-8 pb-4 sm:px-8 sm:pt-10 sm:pb-6 md:px-12 border-b border-stone-200/60 relative bg-white/95 z-10">
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 transition-colors bg-white/50 md:bg-transparent rounded-full backdrop-blur-sm md:backdrop-blur-none"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="font-serif text-4xl text-center text-accent-primary mb-2">The Invitation</h2>
              <p className="text-center text-stone-500 font-light">Hirouen at US Wedding & Event VENUE</p>
              <p className="text-center text-stone-500 font-light">18.00 - 22.00 | 5 December 2026</p>
            </div>

            {/* Body & Footer */}
            {isSubmitted ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center overflow-y-auto">
                <h3 className="font-serif text-2xl text-stone-800 mb-2">Thank you!</h3>
                <p className="text-stone-600 font-light">Your response has been recorded.</p>
                <button
                  onClick={handleClose}
                  className="mt-8 bg-stone-100 hover:bg-stone-200 text-stone-800 px-6 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden text-left">
                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto bg-white p-6 sm:p-8 md:px-12 md:py-8 flex flex-col gap-4 md:gap-6">
                  {/* 1. Name */}
                  <div className="shrink-0">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Tell us your name</label>
                    <input
                      {...register("name")}
                      className="w-full sm:w-2/3 md:w-1/2 px-4 py-2 border border-stone-300 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors"
                      placeholder="John & Jane Doe"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  {/* 2. Side (Groom/Bride) */}
                  <div className="shrink-0">
                    <label className="block text-sm font-medium text-stone-700 mb-2">Which side are you from?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="groom" {...register("side")} className="accent-accent-secondary" />
                        <span className="text-stone-600">Groom</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="bride" {...register("side")} className="accent-accent-secondary" />
                        <span className="text-stone-600">Bride</span>
                      </label>
                    </div>
                    {errors.side && <p className="text-red-500 text-sm mt-1">{errors.side.message}</p>}
                  </div>

                  {/* 3. Relation Dropdown */}
                  <AnimatePresence>
                    {side && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: "auto" }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden shrink-0"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Relationship</label>
                            <select
                              {...register("relation")}
                              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors bg-white"
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
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <label className="block text-sm font-medium text-stone-700 mb-1">Please specify</label>
                                <input
                                  {...register("otherRelation")}
                                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors"
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
                    <label className="block text-sm font-medium text-stone-700 mb-2">Will you be attending?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="yes" {...register("attending")} className="accent-accent-secondary" />
                        <span className="text-stone-600">Joyfully Accepts</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="no" {...register("attending")} className="accent-accent-secondary" />
                        <span className="text-stone-600">Regretfully Declines</span>
                      </label>
                    </div>
                    {errors.attending && <p className="text-red-500 text-sm mt-1">{errors.attending.message}</p>}
                  </div>

                  <AnimatePresence mode="wait">
                    {/* Logic if Attending */}
                    {attending === "yes" && (
                      <motion.div 
                        key="attending"
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: "auto" }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-2 md:gap-6 overflow-hidden shrink-0"
                      >
                        {/* Guest Count */}
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">How many follower(s)?</label>
                          <input
                            type="number"
                            min="1"
                            {...register("guestCount")}
                            className="w-24 px-4 py-2 border border-stone-300 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors"
                            placeholder="1"
                          />
                        </div>

                        {/* Alcohol Checkbox */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...register("drinksAlcohol")} className="accent-accent-secondary" />
                            <span className="text-stone-700 font-medium">I will be drinking alcohol</span>
                          </label>
                          <p className="text-xs text-stone-500 mt-1.5 italic">
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
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden shrink-0"
                      >
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">A Note for the Couple</label>
                          <textarea
                            {...register("message")}
                            rows={4}
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors resize-none"
                            placeholder="Leave your wishes..."
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer - Static */}
                <div className="shrink-0 p-6 sm:px-8 md:px-12 md:py-8 border-t border-stone-200/60 bg-white/95 z-10">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-accent-primary hover:bg-stone-800 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-70"
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