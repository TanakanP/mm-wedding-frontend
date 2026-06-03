"use client";

import { motion } from "framer-motion";

const milestones = [
  { year: "2018", title: "First Met", description: "At a local coffee shop where we talked for hours." },
  { year: "2020", title: "First Trip", description: "Our memorable journey to the mountains." },
  { year: "2024", title: "The Proposal", description: "A magical evening under the stars." },
];

export default function OurStory() {
  return (
    <section className="w-full py-24 bg-pastel-mint text-center px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-4xl md:text-5xl text-accent-primary mb-16"
        >
          Our Story
        </motion.h2>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-300 before:to-transparent">
          {milestones.map((milestone, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.2 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-stone-200 text-stone-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                 <div className="w-3 h-3 bg-accent-secondary rounded-full"></div>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-lg shadow-sm text-left border border-stone-100">
                <span className="font-serif text-accent-secondary text-lg">{milestone.year}</span>
                <h3 className="font-bold text-xl text-stone-800 mt-1">{milestone.title}</h3>
                <p className="text-stone-600 mt-2 font-light leading-relaxed">{milestone.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
