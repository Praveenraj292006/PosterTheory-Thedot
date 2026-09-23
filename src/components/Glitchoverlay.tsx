import React, { useEffect, useRef } from "react";
import gsap from "gsap";

/* =========================================================
   GLITCH OVERLAY — GSAP EDITION
   The section-wide counterpart to GlitchText, also rebuilt on
   GSAP timelines. Faint neon color bands + scanlines sweep
   over an entire section, like the dimension-glitch
   transitions in Spider-Verse — plus an optional GSAP
   camera-shake applied straight to a target element (e.g.
   the section itself) when it bursts.

   Drop it as an absolutely-positioned child of any
   `position: relative` container — it fills that container
   and never blocks clicks (pointer-events: none).
========================================================= */

interface GlitchOverlayProps {
  /** faint automatic color-band flicker every few seconds */
  ambient?: boolean;
  /** plays a short forced glitch burst once, e.g. on scroll-in */
  burst?: boolean;
  colorA?: string;
  colorB?: string;
  className?: string;
  /** element to give a brief GSAP camera-shake to when the overlay bursts */
  shakeTargetRef?: React.RefObject<HTMLElement | null>;
}

const GlitchOverlay: React.FC<GlitchOverlayProps> = ({
  ambient = true,
  burst = false,
  colorA = "#00fff9",
  colorB = "#ff00c1",
  className = "",
  shakeTargetRef,
}) => {
  const scanRef = useRef<HTMLSpanElement | null>(null);
  const barARef = useRef<HTMLSpanElement | null>(null);
  const barBRef = useRef<HTMLSpanElement | null>(null);
  const ambientTl = useRef<gsap.core.Timeline | null>(null);

  const buildBandTimeline = (frameCount: number, frameDuration: number) => {
    const a = barARef.current;
    const b = barBRef.current;
    const scan = scanRef.current;
    const tl = gsap.timeline({ paused: true });
    if (!a || !b) return tl;

    for (let i = 0; i < frameCount; i++) {
      const t = i * frameDuration;
      tl.to(
        a,
        {
          opacity: gsap.utils.random(0.08, 0.18),
          x: gsap.utils.random(-14, 14),
          clipPath: `inset(${gsap.utils.random(0, 70)}% 0 ${gsap.utils.random(0, 70)}% 0)`,
          duration: frameDuration,
          ease: "none",
        },
        t
      ).to(
        b,
        {
          opacity: gsap.utils.random(0.08, 0.18),
          x: gsap.utils.random(-14, 14),
          clipPath: `inset(${gsap.utils.random(0, 70)}% 0 ${gsap.utils.random(0, 70)}% 0)`,
          duration: frameDuration,
          ease: "none",
        },
        t
      );
      if (scan) tl.to(scan, { opacity: gsap.utils.random(0.2, 0.85), duration: frameDuration, ease: "none" }, t);
    }

    tl.to([a, b], { opacity: 0, x: 0, duration: 0.15, ease: "power2.out" });
    if (scan) tl.to(scan, { opacity: 0.4, duration: 0.15, ease: "power2.out" }, "<");

    return tl;
  };

  // ambient — faint, automatic, always-on
  useEffect(() => {
    if (!ambient) return;
    const inner = buildBandTimeline(4, 0.09);
    inner.timeScale(0.6);
    const master = gsap.timeline({ repeat: -1, repeatDelay: 6.5 });
    master.add(inner.play(0));
    ambientTl.current = master;
    return () => {
      master.kill();
      ambientTl.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambient]);

  // burst — forced, plays a few times then settles (e.g. on scroll-in),
  // plus a brief GSAP camera-shake on the shake target, if given
  const didBurst = useRef(false);
  useEffect(() => {
    if (!burst || didBurst.current) return;
    didBurst.current = true;

    const tl = buildBandTimeline(4, 0.09);
    tl.repeat(2);
    tl.play(0);

    const target = shakeTargetRef?.current;
    let shake: gsap.core.Timeline | null = null;
    if (target) {
      shake = gsap.timeline();
      shake
        .to(target, { x: -3, y: 1, duration: 0.06, ease: "none" })
        .to(target, { x: 3, y: -1, duration: 0.06, ease: "none" })
        .to(target, { x: -2, y: 2, duration: 0.06, ease: "none" })
        .to(target, { x: 2, y: -1, duration: 0.06, ease: "none" })
        .to(target, { x: 0, y: 0, duration: 0.1, ease: "power2.out" });
    }

    return () => {
      tl.kill();
      shake?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burst]);

  useEffect(() => {
    return () => {
      ambientTl.current?.kill();
    };
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 z-40 overflow-hidden ${className}`} aria-hidden="true">
      <span
        ref={scanRef}
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "overlay",
          opacity: 0.4,
        }}
      />
      <span
        ref={barARef}
        className="absolute inset-0"
        style={{ background: colorA, mixBlendMode: "screen", opacity: 0 }}
      />
      <span
        ref={barBRef}
        className="absolute inset-0"
        style={{ background: colorB, mixBlendMode: "screen", opacity: 0 }}
      />
    </div>
  );
};

export default GlitchOverlay;