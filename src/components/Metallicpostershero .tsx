import React, { useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';

/* ------------------------------------------------------------------
   Purely presentational, same contract as SplitPostersHero: the
   parent owns the fetch and passes `loading` + an image. Only one
   poster here (metallic posters aren't multi-panel) — the animation
   budget goes into selling the "magnetic pull" instead.
--------------------------------------------------------------------- */

interface MetallicPostersHeroProps {
  loading: boolean;
  image: string | null;
  fallbackImage?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/* 14 filings arranged evenly around the poster. Fixed (not random) so
   the field always reads the same way — deliberate, not chaotic. */
const FILING_COUNT = 14;
const FILINGS = Array.from({ length: FILING_COUNT }, (_, i) => {
  const angle = (360 / FILING_COUNT) * i;
  const rad = (angle * Math.PI) / 180;
  return {
    angle,
    // Resting distance from center, as a % of the stage — slight
    // variation so they don't sit in a perfectly uniform ring.
    restRadius: 58 + (i % 3) * 4,
    startRadius: 145 + (i % 4) * 10,
    x: Math.cos(rad),
    y: Math.sin(rad),
  };
});

const posterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.55, y: -30 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 16, delay: 0.42 },
  },
};

const glowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: {
    opacity: [0, 0.55, 0],
    scale: [0.6, 1.25, 1.4],
    transition: { duration: 0.7, ease: EASE, delay: 0.42 },
  },
};

const copyVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.85 } },
};

function LoadCropSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.1, ease: 'linear', repeat: Infinity }}
      className="w-6 h-6 border-2 border-z-border relative"
      aria-hidden="true"
    >
      <span className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-full bg-z-border" />
      <span className="absolute top-1/2 left-0 -translate-y-1/2 h-px w-full bg-z-border" />
    </motion.div>
  );
}





export default function MetallicPostersHero({
  loading,
  image,
  fallbackImage,
  eyebrow = 'COLLECTION',
  title = 'METALLIC_POSTERS',
  subtitle = 'Brushed metal sheet prints with a magnetic backing — they hold flat against any steel surface, no pins, no tape.',
}: MetallicPostersHeroProps) {
  const resolved = image ?? fallbackImage ?? null;
  const ready = !loading && Boolean(resolved);

  return (
    <section className="relative border-b-4 border-z-border overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 pt-28 sm:pt-40 pb-25">
        <div className="text-center">
          <span className="font-mono font-black uppercase tracking-[0.5em] text-xs text-z-muted block mb-6 underline decoration-4 underline-offset-8">
            {eyebrow}
          </span>
          <h1 className="font-display font-bold uppercase   tracking-tighter text-5xl sm:text-7xl md:text-8xl leading-[0.9] ">
            {title}
          </h1>
        </div>
        
      </div>
    </section>
  );
}