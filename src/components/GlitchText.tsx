import React, { useEffect, useRef } from "react";
import gsap from "gsap";

/* =========================================================
   GLITCH TEXT — GSAP EDITION
   Same Spider-Verse-style neon RGB-split as before, but every
   frame of the glitch is now a GSAP tween instead of a CSS
   @keyframes rule, so it's built the same way as the rest of
   this site's motion (GSAP timelines + randomized values).

   Structure: three stacked copies of the text —
     1. base   — normal theme-colored text, always visible
     2. layer A (cyan)    — clip-path sliced + offset
     3. layer B (magenta) — clip-path sliced + offset the other way
   mix-blend-mode: screen makes the color copies glow instead
   of just sitting flat on top of the dark background.

   Triggers:
     - hover  → a GSAP timeline loops (repeat: -1) for as long
                as the pointer is over it, then eases back to rest
     - ambient → a faint automatic flicker every ~6s (GSAP
                 timeline with repeatDelay), even without interaction
     - burst (prop) → plays the glitch a few times once, e.g.
                       when driven by a ScrollTrigger onEnter
========================================================= */

interface GlitchTextProps {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "div" | "p";
  className?: string;
  /** cyan channel color */
  colorA?: string;
  /** magenta channel color */
  colorB?: string;
  /** faint automatic flicker every few seconds, even without hover */
  ambient?: boolean;
  /** plays a short forced glitch burst once, e.g. driven by a scroll trigger */
  burst?: boolean;
}

const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  as = "span",
  className = "",
  colorA = "#00fff9",
  colorB = "#ff00c1",
  ambient = false,
  burst = false,
}) => {
  const wrapRef = useRef<HTMLElement | null>(null);
  const baseRef = useRef<HTMLSpanElement | null>(null);
  const layerARef = useRef<HTMLSpanElement | null>(null);
  const layerBRef = useRef<HTMLSpanElement | null>(null);

  const hoverTl = useRef<gsap.core.Timeline | null>(null);
  const ambientTl = useRef<gsap.core.Timeline | null>(null);

  /* One reusable "glitch flicker" builder — a handful of quick, randomized
     RGB-split frames plus a grow-bigger scale on the whole wrap, then a
     snap back to rest. Hover, ambient and burst all reuse this, just at
     different intensities/speeds. */
  const buildGlitchTimeline = (scaleAmt: number, frameCount: number, frameDuration: number) => {
    const wrap = wrapRef.current;
    const base = baseRef.current;
    const a = layerARef.current;
    const b = layerBRef.current;
    const tl = gsap.timeline({ paused: true });
    if (!wrap || !base || !a || !b) return tl;

    gsap.set(wrap, { transformOrigin: "50% 50%" });

    for (let i = 0; i < frameCount; i++) {
      const t = i * frameDuration;
      tl.to(wrap, { scale: 1 + (scaleAmt - 1) * gsap.utils.random(0.5, 1), duration: frameDuration, ease: "none" }, t)
        .to(
          a,
          {
            opacity: gsap.utils.random(0.6, 0.95),
            x: gsap.utils.random(-6, 6),
            y: gsap.utils.random(-3, 3),
            clipPath: `inset(${gsap.utils.random(0, 60)}% 0 ${gsap.utils.random(0, 60)}% 0)`,
            duration: frameDuration,
            ease: "none",
          },
          t
        )
        .to(
          b,
          {
            opacity: gsap.utils.random(0.6, 0.95),
            x: gsap.utils.random(-6, 6),
            y: gsap.utils.random(-3, 3),
            clipPath: `inset(${gsap.utils.random(0, 60)}% 0 ${gsap.utils.random(0, 60)}% 0)`,
            duration: frameDuration,
            ease: "none",
          },
          t
        )
        .to(
          base,
          {
            x: gsap.utils.random(-2, 2),
            y: gsap.utils.random(-2, 2),
            skewX: gsap.utils.random(-3, 3),
            duration: frameDuration,
            ease: "none",
          },
          t
        );
    }

    // snap back to a clean rest state
    tl.to(wrap, { scale: 1, duration: 0.18, ease: "power2.out" })
      .to(a, { opacity: 0, x: 0, y: 0, clipPath: "inset(0% 0 100% 0)", duration: 0.18, ease: "power2.out" }, "<")
      .to(b, { opacity: 0, x: 0, y: 0, clipPath: "inset(100% 0 0% 0)", duration: 0.18, ease: "power2.out" }, "<")
      .to(base, { x: 0, y: 0, skewX: 0, duration: 0.18, ease: "power2.out" }, "<");

    return tl;
  };

  // ambient — a faint automatic flicker every ~6s
  useEffect(() => {
    if (!ambient) return;
    const inner = buildGlitchTimeline(1.05, 4, 0.08);
    inner.timeScale(0.7);
    const master = gsap.timeline({ repeat: -1, repeatDelay: 5.5 });
    master.add(inner.play(0));
    ambientTl.current = master;
    return () => {
      master.kill();
      ambientTl.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambient]);

  // burst — forced, plays a few times then settles (e.g. on scroll-in)
  const didBurst = useRef(false);
  useEffect(() => {
    if (!burst || didBurst.current) return;
    didBurst.current = true;
    if (wrapRef.current) gsap.set(wrapRef.current, { zIndex: 50 });
    const tl = buildGlitchTimeline(1.22, 5, 0.07);
    tl.repeat(2);
    tl.eventCallback("onComplete", () => {
      if (wrapRef.current) gsap.set(wrapRef.current, { zIndex: "auto" });
    });
    tl.play(0);
    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burst]);

  // hover — loops continuously while the pointer is over it
  const handleEnter = () => {
    hoverTl.current?.kill();
    if (wrapRef.current) gsap.set(wrapRef.current, { zIndex: 50 });
    const tl = buildGlitchTimeline(1.22, 5, 0.07);
    tl.repeat(-1);
    hoverTl.current = tl;
    tl.play(0);
  };

  const handleLeave = () => {
    hoverTl.current?.kill();
    hoverTl.current = null;
    const wrap = wrapRef.current;
    const base = baseRef.current;
    const a = layerARef.current;
    const b = layerBRef.current;
    if (wrap) gsap.to(wrap, { scale: 1, zIndex: "auto", duration: 0.22, ease: "power2.out" });
    if (base) gsap.to(base, { x: 0, y: 0, skewX: 0, duration: 0.22, ease: "power2.out" });
    if (a) gsap.to(a, { opacity: 0, x: 0, y: 0, clipPath: "inset(0% 0 100% 0)", duration: 0.22, ease: "power2.out" });
    if (b) gsap.to(b, { opacity: 0, x: 0, y: 0, clipPath: "inset(100% 0 0% 0)", duration: 0.22, ease: "power2.out" });
  };

  useEffect(() => {
    return () => {
      hoverTl.current?.kill();
      ambientTl.current?.kill();
    };
  }, []);

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={wrapRef as React.Ref<HTMLElement>}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`relative inline-block cursor-pointer ${className}`}
      style={{ isolation: "isolate" }}
    >
      <span ref={baseRef} className="relative z-[2] inline-block">
        {text}
      </span>
      <span
        ref={layerARef}
        aria-hidden="true"
        className="absolute inset-0 z-[1] whitespace-nowrap pointer-events-none"
        style={{
          color: colorA,
          mixBlendMode: "screen",
          filter: "drop-shadow(0 0 4px currentColor)",
          opacity: 0,
          clipPath: "inset(0% 0 100% 0)",
        }}
      >
        {text}
      </span>
      <span
        ref={layerBRef}
        aria-hidden="true"
        className="absolute inset-0 z-[1] whitespace-nowrap pointer-events-none"
        style={{
          color: colorB,
          mixBlendMode: "screen",
          filter: "drop-shadow(0 0 4px currentColor)",
          opacity: 0,
          clipPath: "inset(100% 0 0% 0)",
        }}
      >
        {text}
      </span>
    </Tag>
  );
};

export default GlitchText;