"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

const rsvpSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  attending: z.enum(["yes", "no"], { message: "Please select an option" }),
  dietaryRestrictions: z.string().optional(),
  message: z.string().optional(),
});

type RSVPFormValues = z.infer<typeof rsvpSchema>;

export default function RSVPForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RSVPFormValues>({
    resolver: zodResolver(rsvpSchema),
  });

  const onSubmit = async (data: RSVPFormValues) => {
    // In a real app, send to API here
    console.log(data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
  };

  return (
    <section className="w-full py-24 bg-pastel-blue px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/70 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-sm border border-stone-200"
        >
          <h2 className="font-serif text-4xl text-center text-accent-primary mb-2">RSVP</h2>
          <p className="text-center text-stone-500 font-light mb-8">Please respond by August 1st, 2026</p>

          {isSubmitted ? (
            <div className="text-center py-12">
              <h3 className="font-serif text-2xl text-stone-800 mb-2">Thank you!</h3>
              <p className="text-stone-600 font-light">Your response has been recorded.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                <input
                  {...register("fullName")}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors"
                  placeholder="John & Jane Doe"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
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

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Dietary Restrictions</label>
                <input
                  {...register("dietaryRestrictions")}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors"
                  placeholder="e.g., Vegetarian, Gluten-Free"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">A Note for the Couple</label>
                <textarea
                  {...register("message")}
                  rows={4}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors resize-none"
                  placeholder="Optional..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent-primary hover:bg-stone-800 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Send RSVP"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
