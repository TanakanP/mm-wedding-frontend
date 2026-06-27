"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import RSVPForm from "./RSVPForm";

export default function EventDetails() {
  const [isRSVPOpen, setIsRSVPOpen] = useState(false);

  return (
    <section id="garden-path" className="garden-snap-section w-full flex items-center bg-cream garden-texture text-center px-4 relative">
      <div className="max-w-4xl mx-auto w-full pt-[var(--nav-offset)]">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-4xl md:text-5xl text-accent-primary mb-8"
        >
          When & Where
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto p-8 border border-sage/20 rounded-xl bg-background/60 backdrop-blur-sm text-left mb-8"
        >
          <h3 className="font-serif text-2xl text-foreground mb-6 border-b border-sage/20 pb-4">Reception</h3>
          <div className="space-y-4 text-foreground/70 font-light">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 mt-0.5 text-accent-secondary" />
              <p>Saturday, December 5, 2026</p>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-0.5 text-accent-secondary" />
              <p>5:30 PM - Midnight</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-0.5 text-accent-secondary" />
              <p>
                <span className="font-medium text-foreground block">The Grand Orchard Pavilion</span>
                456 Celebration Lane, New York, NY
              </p>
            </div>
            <p className="text-sm text-foreground/60 pl-8 -mt-1">Evening garden banquet under the stars • Dancing among the trees.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button 
            onClick={() => setIsRSVPOpen(true)}
            className="bg-accent-primary hover:bg-stone-800 text-white font-medium py-3 px-10 rounded-lg transition-colors text-lg shadow-sm"
          >
            RSVP Now
          </button>
        </motion.div>
      </div>

      <RSVPForm isOpen={isRSVPOpen} onClose={() => setIsRSVPOpen(false)} />
    </section>
  );
}