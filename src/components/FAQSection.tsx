"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is the dress code?",
    answer: "We request formal attire. For women, floor-length gowns or elegant cocktail dresses. For men, a tuxedo or a dark suit and tie."
  },
  {
    question: "Can I bring a plus one?",
    answer: "Due to limited space at our venue, we are only able to accommodate guests who are formally named on the invitation."
  },
  {
    question: "Is there parking available?",
    answer: "Yes, complimentary valet parking will be available at both the ceremony and reception venues."
  },
  {
    question: "Are children welcome?",
    answer: "While we love your little ones, we have chosen for our wedding day to be an adults-only celebration. We hope this advance notice means you are still able to share our big day and will enjoy having the evening off!"
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full py-24 bg-pastel-cream px-4">
      <div className="max-w-3xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-4xl md:text-5xl text-center text-accent-primary mb-12"
        >
          Frequently Asked Questions
        </motion.h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-stone-200 rounded-lg overflow-hidden bg-white/60 backdrop-blur-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-medium text-stone-800">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-4 text-stone-600 font-light">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
