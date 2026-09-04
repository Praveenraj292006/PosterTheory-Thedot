import React from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';

/* ------------------------------------------------------------------
   Purely presentational — the parent page owns the fetch and passes
   down `loading` + up to three image URLs. Kept generic (not tied to
   the Product type) so it can be reused anywhere three hero images
   and a load state are available.
--------------------------------------------------------------------- */

export interface SplitPosterImages {
  left: string;
  center: string;
  right: string;
}

interface SplitPostersHeroProps {
  loading: boolean;
  images: SplitPosterImages | null;
  /** Used for all three slots if `images` is null (e.g. before data arrives). */
  fallbackImage?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const centerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.82, y: 24, rotateY:0 },
  show: { opacity: 1, scale: 1, y: 0, rotateY:360, transition: { duration: 2, ease: EASE } },
};

const leftVariants: Variants = {
  hidden: { opacity: 0, x: -200, rotate: -10 },
  show: { opacity: 1, x: 0, rotate: 0, transition: { duration: 1, ease: EASE, delay: 0.3 } },
};

const rightVariants: Variants = {
  hidden: { opacity: 0, x: 300, rotate: 10 },
  show: { opacity: 1, x: 0, rotate: 0, transition: { duration: 1, ease: EASE, delay: 0.38 } },
};

const copyVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.55 } },
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

export default function SplitPostersHero({
  loading,
  images,
  fallbackImage,
  eyebrow = 'COLLECTION',
  title = 'SPLIT_POSTERS',
  subtitle = 'Two or three panels, one composition — printed and trimmed to hang as a single set.',
}: SplitPostersHeroProps) {
  const resolved: SplitPosterImages | null =
    images ?? (fallbackImage ? { left: fallbackImage, center: fallbackImage, right: fallbackImage } : null);

  const ready = !loading && Boolean(resolved);

  return (
    <section className="relative border-b-4 border-z-border overflow-hidden bg-black ">
      <div className="max-w-[1440px] mx-auto px-6 pt-28 sm:pt-40 pb-20 ">
        <div className="text-center mb-14">
          <span className="font-mono font-black uppercase tracking-[0.5em] text-xs text-z-muted block mb-6 underline decoration-4 underline-offset-8">
            {eyebrow}
          </span>
          <h1 className="font-display font-bold uppercase italic tracking-tighter text-5xl text-z-paper sm:text-7xl md:text-8xl leading-[0.9] mb-30">
            {title}
          </h1>
        </div>

        {/* Stage — fixed footprint so layout doesn't shift between loading and loaded */}
        <div className="relative h-[320px] sm:h-[420px] md:h-[480px] flex items-center justify-center">
          

          {resolved && (
            <motion.div
              initial="hidden"
              animate={ready ? 'show' : 'hidden'}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Left panel */}
              <motion.div
                variants={leftVariants}
                className="absolute w-[34%] sm:w-[30%] aspect-[3/4] left-1/3 -translate-x-[92%] sm:-translate-x-[105%] z-10 border-2 border-z-border bg-z-paper "
              >
                <img src={resolved.left} alt="Split poster, left panel" className="w-full h-full object-cover" />
              </motion.div>

              {/* Right panel */}
              <motion.div
                variants={rightVariants}
                className="absolute w-[34%] sm:w-[30%] aspect-[3/4] left-2/3 translate-x-[-8%] sm:translate-x-[5%] z-10 border-2 border-z-border bg-z-paper "
              >
                <img src={resolved.right} alt="Split poster, right panel" className="w-full h-full object-cover" />
              </motion.div>

              {/* Center panel */}
              <motion.div
                variants={centerVariants}
                className="relative w-[40%] sm:w-[34%] aspect-[3/4] z-20 border-2 border-z-border bg-z-paper"
              >
                <img src={resolved.center} alt="Split poster, center panel" className="w-full h-full object-cover" />
              </motion.div>
            </motion.div>
          )}
        </div>

        <motion.p
          initial="hidden"
          animate={ready ? 'show' : 'hidden'}
          variants={copyVariants}
          className="font-mono text-sm relative  text-z-muted text-center max-w-[52ch] mx-auto mt-25 leading-7"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}