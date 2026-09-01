import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "./Textreveal";

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   LAYOUT CONFIG
   Purely visual placement/aspect for the gallery-wall collage
   on the right — no size names or prices are rendered, this
   is layout geometry only (position, proportions, rotation).
========================================================= */

interface LayoutPoster {
  id: string;
  w: number;
  h: number;
  rotate: number;
  z: number;
  pos: React.CSSProperties;
}

const LAYOUT_POSTERS: LayoutPoster[] = [
  { id: "p1", w: 108, h: 108, rotate: 0, z: 2, pos: { bottom: "4%", left: "2%" } },
  { id: "p2", w: 172, h: 114, rotate: 0, z: 3, pos: { top: "4%", left: "8%" } },
  { id: "p3", w: 150, h: 100, rotate: 0, z: 4, pos: { top: "2%", right: "0%" } },
  { id: "p4", w: 196, h: 288, rotate: 0, z: 6, pos: { top: "20%", left: "32%" } },
  { id: "p5", w: 142, h: 210, rotate: 0, z: 5, pos: { bottom: "0%", right: "4%" } },
];

/* =========================================================
   POSTER FRAME
   Outer node = GSAP owns it (scroll-in entrance + idle float).
   Inner motion.div = Framer Motion owns it (hover tilt + glare).
   Kept on separate nodes so the two libraries never fight over
   the same `transform`.
========================================================= */

const PosterFrame = React.forwardRef<HTMLDivElement, { poster: LayoutPoster }>(({ poster }, outerRef) => {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 280, damping: 22 });
  const springRotateY = useSpring(rotateY, { stiffness: 280, damping: 22 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareBackground = useMotionTemplate`radial-gradient(160px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.28), transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 14);
    rotateX.set((0.5 - py) * 14);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div ref={outerRef} className="layout-poster absolute" style={{ width: poster.w, height: poster.h, zIndex: poster.z, opacity: 0, ...poster.pos }}>
      <motion.div onMouseMove={handleMouseMove} onMouseLeave={resetTilt} whileHover={{ scale: 1.06, zIndex: 20 }} style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="relative w-full h-full bg-z-paper border-2 border-z-paper shadow-[10px_10px_0px_0px_rgba(255,255,255,0.15)]">

        {/* registration marks */}
        <span className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-z-paper/60" />
        <span className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-z-paper/60" />

        {/* placeholder art — halftone dots, no external image dependency */}
        <div className="relative w-full h-full overflow-hidden bg-z-ink">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1.5px)", backgroundSize: "8px 8px" }} />
          <motion.div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{ background: glareBackground }} />
        </div>

      </motion.div>
    </div>
  );
});
PosterFrame.displayName = "PosterFrame";

/* =========================================================
   CUSTOMIZE SECTION
========================================================= */

const Customize: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const postersWrapRef = useRef<HTMLDivElement>(null);
  const posterOuterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // seamless infinite marquee — track is duplicated once in JSX, loop -50%
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, { xPercent: -50, duration: 18, ease: "linear", repeat: -1 });
      }

      // staggered fade/rise for the copy column
      if (leftColRef.current) {
        const items = leftColRef.current.querySelectorAll(".reveal-item");
        gsap.set(items, { opacity: 0, y: 24 });

        ScrollTrigger.create({
          trigger: leftColRef.current,
          start: "top 80%",
          onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" }),
          onEnterBack: () => gsap.to(items, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" }),
        });
      }

      // poster gallery-wall entrance — each frame settles into place, then drifts idly forever
      gsap.set(posterOuterRefs.current, { scale: 0.6, y: 50, rotate: 0 });

      ScrollTrigger.create({
        trigger: postersWrapRef.current,
        start: "top 78%",
        once: true,
        onEnter: () => {
          LAYOUT_POSTERS.forEach((cfg, i) => {
            const el = posterOuterRefs.current[i];
            if (!el) return;
            gsap.to(el, {
              opacity: 1,
              scale: 1,
              y: 0,
              rotate: cfg.rotate,
              duration: 0.85,
              delay: i * 0.12,
              ease: "back.out(1.6)",
              onComplete: () => {
                // gentle infinite bob once each frame has landed
                gsap.to(el, { y: "+=12", duration: 2.4 + i * 0.3, yoyo: true, repeat: -1, ease: "sine.inOut" });
              },
            });
          });
        },
      });
    }, section);

    // subtle parallax drift on the whole collage while scrolling past
    const parallax = gsap.to(postersWrapRef.current, {
      y: -30,
      ease: "none",
      scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 },
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      ctx.revert();
      parallax.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative py-10 sm:py-28 border-b-2 border-z-border overflow-hidden bg-z-ink text-z-paper m-10">
      {/* ================================================= AMBIENT MARQUEE ================================================= */}
      <div className="absolute top-6 left-0 right-0 overflow-hidden select-none pointer-events-none">
        <div ref={marqueeRef} className="flex w-max whitespace-nowrap">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center pr-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-z-paper/15 pr-6">Custom Sizes • Your Design • Premium Print •</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6  grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        {/* ================================================= LEFT — COPY ================================================= */}
        <div ref={leftColRef}>
          <p className="reveal-item font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-z-paper/50 mb-4">Build Your Own</p>

          <TextReveal as="h2" className="font-display  text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tighter leading-[1] text-z-paper" maskClassName="bg-z-paper">
            Customize Your Poster
          </TextReveal>

          <p className="reveal-item mt-6 max-w-md font-mono text-sm sm:text-base text-z-paper/60 leading-relaxed">
            Pick your size, drop in your design, and we print it exactly your way — from compact prints to oversized wall art.
          </p>

          <Link to="/customize" className="reveal-item group/btn inline-flex items-center gap-3 mt-10 px-8 py-4 bg-z-paper text-z-ink font-mono text-[12px] font-bold uppercase tracking-widest hover:bg-z-paper/90 transition-colors">
            <span>Start Customizing</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
          </Link>
        </div>

        {/* ================================================= RIGHT — POSTER GALLERY-WALL LAYOUT ================================================= */}
        <div ref={postersWrapRef} className="relative h-[380px] sm:h-[440px] lg:h-[480px] w-full max-w-[540px] mx-auto lg:mx-0">
          {LAYOUT_POSTERS.map((poster, i) => (
            <PosterFrame key={poster.id} poster={poster} ref={(el) => (posterOuterRefs.current[i] = el)} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Customize;