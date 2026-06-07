"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import RSVPForm from "./RSVPForm";

export default function EventDetails() {
  const [isRSVPOpen, setIsRSVPOpen] = useState(false);

  return (
    <section className="w-full py-24 bg-pastel-cream text-center px-4 relative">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-4xl md:text-5xl text-accent-primary mb-12"
        >
          When & Where
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 text-left mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 border border-stone-200 rounded-xl bg-white/60 backdrop-blur-sm"
          >
            <h3 className="font-serif text-2xl text-stone-800 mb-6 border-b border-stone-200 pb-4">Ceremony</h3>
            <div className="space-y-4 text-stone-600 font-light">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 mt-0.5 text-accent-secondary" />
                <p>Saturday, December 5, 2026</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 mt-0.5 text-accent-secondary" />
                <p>3:00 PM</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-accent-secondary" />
                <p>
                  <span className="font-medium text-stone-800 block">St. Patrick's Cathedral</span>
                  123 Wedding Ave, New York, NY
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 border border-stone-200 rounded-xl bg-white/60 backdrop-blur-sm"
          >
            <h3 className="font-serif text-2xl text-stone-800 mb-6 border-b border-stone-200 pb-4">Reception</h3>
            <div className="space-y-4 text-stone-600 font-light">
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
                  <span className="font-medium text-stone-800 block">The Grand Plaza</span>
                  456 Celebration St, New York, NY
                </p>
              </div>
            </div>
          </motion.div>
        </div>

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
