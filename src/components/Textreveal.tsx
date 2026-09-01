import React, { useLayoutEffect, useRef, ElementType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   TYPES
   - `as`   : which tag to render the text in (h1, h2, span...)
   - `start`: ScrollTrigger start position
   - `delay`: optional delay (seconds) before the reveal plays
========================================================= */

interface TextRevealProps {
  children: React.ReactNode;
  as?: ElementType;
  className?: string;
  maskClassName?: string;
  start?: string;
  delay?: number;
}

/* =========================================================
   TEXT REVEAL
   A block mask sweeps left -> center -> right across the
   text. The text stays invisible until the mask has fully
   covered it, then gets revealed as the mask exits right.
   This is the SAME animation used on the Collections
   heading — drop this component around any text anywhere
   in the app to get the identical effect.
========================================================= */

const TextReveal: React.FC<TextRevealProps> = ({
  children,
  as: Tag = "h2",
  className = "",
  maskClassName = "bg-black",
  start = "top 75%",
  delay = 0,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const text = textRef.current;
    const mask = maskRef.current;
    if (!wrapper || !text || !mask) return;

    const ctx = gsap.context(() => {
      // Text is hidden up front — it only becomes visible once the mask is fully covering it, so nothing "leaks" before the animation runs.
      gsap.set(text, { autoAlpha: 0 });
      gsap.set(mask, { xPercent: -101 });

      const tl = gsap.timeline({ paused: true, delay });

      tl.to(mask, { xPercent: 0, duration: 0.55, ease: "power4.inOut" }) // mask slides in from the left, covering the text
        .set(text, { autoAlpha: 1 }) // reveal the text NOW — it's hidden behind the mask, so this is invisible to the viewer
        .to(mask, { xPercent: 101, duration: 0.75, ease: "power4.inOut" }, "+=0.05"); // mask exits right, wiping the text into view

      const trigger = ScrollTrigger.create({
        trigger: wrapper,
        start,
        onEnter: () => tl.play(0),
        onEnterBack: () => tl.play(0), // replay when scrolling back up into view too
        onLeaveBack: () => {
          // reset so the reveal can play again next time it enters
          tl.pause(0);
          gsap.set(text, { autoAlpha: 0 });
          gsap.set(mask, { xPercent: -101 });
        },
      });

      // recalc trigger positions once layout has settled
      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        trigger.kill();
        tl.kill();
      };
    }, wrapper);

    return () => ctx.revert();
  }, [start, delay]);

  return (
    <div ref={wrapperRef} className="relative inline-block overflow-hidden">
      {React.createElement(Tag, { ref: textRef, className }, children)}
      <div ref={maskRef} className={`heading-mask absolute inset-0 z-10 pointer-events-none ${maskClassName}`} />
    </div>
  );
};

export default TextReveal;

/* =========================================================
   USAGE ELSEWHERE
   -------------------------------------------------------
   import TextReveal from "./TextReveal";

   <TextReveal as="h2" className="font-[Bebas] font-black text-3xl sm:text-6xl uppercase tracking-widest text-z-ink">
     New Arrivals
   </TextReveal>

   Props you can tweak per-instance:
   - as             : "h1" | "h2" | "span" | ... (default "h2")
   - start          : ScrollTrigger start, e.g. "top 90%" for an earlier trigger
   - delay          : stagger multiple reveals, e.g. delay={0.15}
   - maskClassName  : swap "bg-black" for any bg color/utility
========================================================= */