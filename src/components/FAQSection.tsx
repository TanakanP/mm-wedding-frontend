"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What should we wear in the garden?",
    answer: "We request formal attire. For women, floor-length gowns or elegant cocktail dresses. For men, a tuxedo or a dark suit and tie."
  },
  {
    question: "May I bring a plus one to wander with me?",
    answer: "Due to limited space at our venue, we are only able to accommodate guests who are formally named on the invitation."
  },
  {
    question: "Is there parking available among the blooms?",
    answer: "Yes, complimentary valet parking will be available at both the ceremony and reception venues."
  },
  {
    question: "Are little sprouts welcome?",
    answer: "While we love your little ones, we have chosen for our wedding day to be an adults-only celebration. We hope this advance notice means you are still able to share our big day and will enjoy having the evening off!"
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="garden-whispers" className="w-full py-24 bg-cream garden-texture px-4">
      <div className="max-w-3xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-4xl md:text-5xl text-center text-accent-primary mb-3"
        >
          Garden Whispers
        </motion.h2>
        <p className="text-center text-sage/70 font-light mb-10 tracking-wide text-sm">A few gentle answers as you prepare your visit</p>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg overflow-hidden bg-background/60 backdrop-blur-sm transition-colors ${isOpen ? 'border-accent-secondary/40 shadow-sm' : 'border-sage/20'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary/40 rounded-lg"
                >
                  <span className={`font-medium transition-colors ${isOpen ? 'text-accent-primary' : 'text-foreground'}`}>{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 transition-all duration-300 ${isOpen ? 'rotate-180 text-accent-secondary' : 'text-sage/60'}`}
                  />
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      initial={{ height: 0, opacity: 0, scaleY: 0.96, rotateX: -1 }}
                      animate={{ height: "auto", opacity: 1, scaleY: 1, rotateX: 0 }}
                      exit={{ height: 0, opacity: 0, scaleY: 0.96, rotateX: -1 }}
                      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                      className="origin-top"
                    >
                      <div className="px-6 pb-5 pt-1 text-foreground/75 font-light leading-relaxed border-t border-sage/10">
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
    </section>
  );
}
