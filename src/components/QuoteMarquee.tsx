import React from 'react';
import { motion } from 'motion/react';

const quotes = [
  "main character energy ✦",
  "romanticize your space ✦",
  "soft chaos ✦",
  "this is your sign ✦",
  "intentional living ✦",
  "curated for you ✦",
  "the art of being ✦",
];

export default function QuoteMarquee() {
  return (
    <div className="bg-z-ink py-4 overflow-hidden relative border-y-2 border-z-border shadow-xl z-20">
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ 
          duration: 20, 
          ease: "linear", 
          repeat: Infinity 
        }}
      >
        {[...quotes, ...quotes].map((quote, idx) => (
          <span 
            key={idx} 
            className="text-z-paper font-display font-black text-lg sm:text-xl uppercase tracking-tighter mx-4 sm:mx-8"
          >
            {quote}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
