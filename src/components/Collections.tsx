import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from "motion/react";
import TextReveal from "./Textreveal";

/* =========================================================
   TYPES
========================================================= */

interface Collection {
  name: string;
  path: string;
  img?: string;
}

interface CollectionCarouselProps {
  collections: Collection[];
}

/* =========================================================
   COLLECTION CARD
   Interactive 3D tilt driven by Framer Motion spring values
   (smooth, physics-based — no manual DOM style mutation),
   plus a cursor-following spotlight glare on hover.
========================================================= */

const CollectionCard: React.FC<{ cat: Collection }> = ({ cat }) => {
  // raw tilt targets, springed for a smooth "settle" feel
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 25 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 25 });

  // cursor position (0-100%) driving the glare gradient
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareBackground = useMotionTemplate`radial-gradient(220px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35), transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 16);
    rotateX.set((0.5 - py) * 16);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: "easeOut" }} style={{ perspective: 1000 }} className="collection-card group/card shrink-0 w-[calc((100vw-3rem)/3)] sm:w-auto snap-start">
      <Link to={cat.path} className="block">
        <motion.div onMouseMove={handleMouseMove} onMouseLeave={resetTilt} whileHover={{ y: -12, scale: 1.02 }} style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="relative aspect-[3/4] overflow-hidden border-2 border-z-border bg-z-paper group-hover/card:shadow-[12px_16px_0px_0px_var(--color-z-shadow)] transition-shadow duration-300">
          {/* image or fallback initial */}
          {cat.img ? (
            <img src={cat.img} alt={cat.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-110" />
          ) : (
            <div className="w-full h-full bg-z-border/10 flex items-center justify-center">
              <span className="font-display font-black text-4xl text-z-ink/10 uppercase">{cat.name[0]}</span>
            </div>
          )}

          {/* cursor-following spotlight glare */}
          <motion.div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{ background: glareBackground }} />

          {/* dark overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300 group-hover/card:from-black/70" />

          {/* category info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
           
            <TextReveal as="h3" className="font-display font-bold text-base sm:text-lg uppercase tracking-tighter text-white transition-transform duration-300 group-hover/card:translate-x-1">{cat.name}</TextReveal>
          </div>

          {/* hover arrow indicator */}
          <div className="absolute top-3 right-3 w-8 h-8 border border-white/50 text-white flex items-center justify-center opacity-0 translate-x-2 -translate-y-2 transition-all duration-300 group-hover/card:opacity-100 group-hover/card:translate-x-0 group-hover/card:translate-y-0">→</div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

/* =========================================================
   COLLECTIONS COMPONENT
========================================================= */

const Collections: React.FC<CollectionCarouselProps> = ({ collections }) => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 5;

  const next = () => {
    setStartIndex((prev) => (prev + visibleCount >= collections.length ? 0 : prev + 1));
  };

  const prev = () => {
    setStartIndex((prevIndex) => (prevIndex === 0 ? Math.max(0, collections.length - visibleCount) : prevIndex - 1));
  };

  const visibleCollections = Array.from({ length: Math.min(visibleCount, collections.length) }, (_, index) => collections[(startIndex + index) % collections.length]);

  return (
    <section className="py-16 sm:py-24 border-b-2 border-z-border overflow-hidden bg-gray-50">
      {/* ================================================= HEADER ================================================= */}
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-end justify-between">
          <TextReveal as="h2" className="font-display py-3 font-500 text-3xl sm:text-6xl uppercase tracking-tighter text-z-ink">
            Collections
          </TextReveal>

          {/* navigation arrows */}
          {collections.length > visibleCount && (
            <div className="flex gap-2">
              <button type="button" onClick={prev} aria-label="Previous collection" className="w-11 h-11 border-2 border-z-border bg-z-paper text-z-ink flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button type="button" onClick={next} aria-label="Next collection" className="w-11 h-11 border-2 border-z-border bg-z-paper text-z-ink flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================================================= CARDS ================================================= */}
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:pb-0">
          <AnimatePresence mode="popLayout">
            {/* keyed by a stable identity (path/name) so AnimatePresence only animates the card entering/leaving, not the whole row */}
            {visibleCollections.map((cat) => (
              <CollectionCard key={cat.path || cat.name} cat={cat} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ================================================= VIEW ALL ================================================= */}
      <div className="text-center mt-10">
        <Link to="/collection" className="inline-block px-8 py-3 bg-z-ink text-white font-mono text-[12px] font-bold uppercase tracking-widest hover:bg-z-ink/80 transition-colors">
          View All Collections
        </Link>
      </div>
    </section>
  );
};

export default Collections;