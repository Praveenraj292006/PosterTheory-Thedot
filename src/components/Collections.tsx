import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Collection {
  name: string;
  path: string;
  img?: string;
}

interface CollectionCarouselProps {
  collections: Collection[];
}

const Collections: React.FC<CollectionCarouselProps> = ({
  collections,
}) => {
  const [startIndex, setStartIndex] = useState(0);

  const visibleCount = 5;

  const next = () => {
    setStartIndex((prev) => {
      if (prev + visibleCount >= collections.length) {
        return 0;
      }

      return prev + 1;
    });
  };

  const prev = () => {
    setStartIndex((prev) => {
      if (prev === 0) {
        return Math.max(0, collections.length - visibleCount);
      }

      return prev - 1;
    });
  };

  const visibleCollections = Array.from(
    { length: Math.min(visibleCount, collections.length) },
    (_, index) =>
      collections[(startIndex + index) % collections.length]
  );

  return (
    <section className="py-16 sm:py-24 border-b-2 border-z-border overflow-hidden bg-gray-50">

      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-6 ">
        <div className="flex items-end justify-between">

          <div>
            <h2 className="py-10 font-[Bebas] font-black text-3xl sm:text-6xl uppercase tracking-widest text-z-ink">
              Collections
            </h2>
          </div>

          {/* Navigation */}
          {collections.length > visibleCount && (
            <div className="flex gap-2">

              <button
                onClick={prev}
                aria-label="Previous collection"
                className="w-11 h-11 border-2 border-z-border bg-z-paper text-z-ink flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={next}
                aria-label="Next collection"
                className="w-11 h-11 border-2 border-z-border bg-z-paper text-z-ink flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

            </div>
          )}

        </div>
      </div>

      {/* Collection Cards */}
     <div className="max-w-[1440px] mx-auto px-6">

    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:pb-0">

       <AnimatePresence mode="popLayout">

  {visibleCollections.map((cat, index) => (

    <motion.div
      key={`${cat.name}-${startIndex}-${index}`}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
      }}
      style={{
        perspective: 1000,
      }}
      onMouseMove={(e) => {
        const card = e.currentTarget.getBoundingClientRect();

        const x = e.clientX - card.left;
        const y = e.clientY - card.top;

        const centerX = card.width / 2;
        const centerY = card.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        e.currentTarget.style.setProperty(
          "--rotate-x",
          `${rotateX}deg`
        );

        e.currentTarget.style.setProperty(
          "--rotate-y",
          `${rotateY}deg`
        );
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.setProperty("--rotate-x", "0deg");
        e.currentTarget.style.setProperty("--rotate-y", "0deg");
      }}
      className="group/card shrink-0 w-[calc((100vw-3rem)/3)] sm:w-auto snap-start"
    >
  <Link
    to={cat.path}
    className="block"
  >
    <div
      className="
        relative
        aspect-[3/4]
        overflow-hidden
        border-2
        border-z-border
        bg-z-paper
        transform-gpu
        transition-all
        duration-300
        ease-out
        [transform:perspective(1000px)_rotateX(var(--rotate-x))_rotateY(var(--rotate-y))_translateY(0)]
        group-hover/card:-translate-y-3
        group-hover/card:shadow-[12px_16px_0px_0px_var(--color-z-shadow)]
      "
    >

      {cat.img ? (
        <img
          src={cat.img}
          alt={cat.name}
          loading="lazy"
          className="
            w-full
            h-full
            object-cover
            transition-transform
            duration-500
            ease-out
            group-hover/card:scale-110
          "
        />
      ) : (
        <div className="w-full h-full bg-z-border/10 flex items-center justify-center">
          <span className="font-display font-black text-4xl text-z-ink/10 uppercase">
            {cat.name[0]}
          </span>
        </div>
      )}

      {/* Dark overlay */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/80
          via-black/10
          to-transparent
          transition-opacity
          duration-300
          group-hover/card:from-black/70
        "
      />

      {/* Category information */}
      <div className="absolute bottom-0 left-0 right-0 p-4">

        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/60 mb-1">
          Collection
        </p>

        <h3
          className="
            font-display
            font-bold
            text-base
            sm:text-lg
            uppercase
            tracking-tighter
            text-white
            transition-transform
            duration-300
            group-hover/card:translate-x-1
          "
        >
          {cat.name}
        </h3>

      </div>

      {/* Hover indicator */}
      <div
        className="
          absolute
          top-3
          right-3
          w-8
          h-8
          border
          border-white/50
          text-white
          flex
          items-center
          justify-center
          opacity-0
          translate-x-2
          -translate-y-2
          transition-all
          duration-300
          group-hover/card:opacity-100
          group-hover/card:translate-x-0
          group-hover/card:translate-y-0
        "
      >
        →
      </div>

    </div>
  </Link>
</motion.div>

            ))}

          </AnimatePresence>

        </div>

      </div>

      {/* View All */}
      <div className="text-center mt-10">

        <Link
          to="/collection"
          className="inline-block px-8 py-3 bg-z-ink text-white font-mono text-[12px] font-bold uppercase tracking-widest hover:bg-z-ink/80 transition-colors"
        >
          View All Collections
        </Link>

      </div>

    </section>
  );
};

export default Collections;