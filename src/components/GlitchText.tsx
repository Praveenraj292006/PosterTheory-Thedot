import React, { useEffect } from "react";

/* =========================================================
   GLITCH TEXT
   A Spider-Verse / Spider-Verse-glitch-inspired neon RGB-split
   effect — the rest of the site is strict black & white, so
   this is the one place color (electric cyan + hot magenta)
   is allowed to break the rules and grab attention.

   Three stacked copies of the same text:
     1. base   — normal white/theme text, always visible
     2. layer A (cyan)    — sliced + offset via clip-path
     3. layer B (magenta) — sliced + offset the other way
   mix-blend-mode: screen makes the color copies glow on the
   dark background instead of just sitting on top of it.

   Triggers:
     - hover        → runs continuously while hovered (CSS-only)
     - ambient       → a faint automatic flicker every ~6s, so it
                        stands out even before anyone interacts
     - burst (prop)  → plays a short forced glitch burst once,
                        e.g. when the element scrolls into view
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
  /** plays a short forced glitch burst while true (e.g. driven by a scroll trigger) */
  burst?: boolean;
}

const STYLE_ID = "glitch-text-styles";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.innerHTML = `
    .glitch-wrap {
      position: relative;
      display: inline-block;
      isolation: isolate;
      cursor: pointer;
    }
    .glitch-base {
      position: relative;
      z-index: 2;
      display: inline-block;
      transform: translate(0, 0);
    }
    .glitch-layer {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      opacity: 0;
      white-space: nowrap;
      mix-blend-mode: screen;
      filter: drop-shadow(0 0 4px currentColor);
      animation-play-state: paused;
      animation-timing-function: steps(2, jump-end);
    }
    .glitch-layer--a { color: var(--glitch-color-a, #00fff9); }
    .glitch-layer--b { color: var(--glitch-color-b, #ff00c1); }

    @keyframes glitchSliceA {
      0%   { opacity: 0.95; clip-path: inset(10% 0 70% 0); transform: translate(-3px, -1px); }
      20%  { opacity: 0.9;  clip-path: inset(55% 0 10% 0); transform: translate(3px, 1px); }
      40%  { opacity: 0.9;  clip-path: inset(5% 0 80% 0);  transform: translate(-2px, 2px); }
      60%  { opacity: 0.9;  clip-path: inset(70% 0 5% 0);  transform: translate(2px, -2px); }
      80%  { opacity: 0.9;  clip-path: inset(30% 0 40% 0); transform: translate(-3px, 0); }
      100% { opacity: 0;    clip-path: inset(0 0 100% 0);  transform: translate(0, 0); }
    }
    @keyframes glitchSliceB {
      0%   { opacity: 0.95; clip-path: inset(60% 0 10% 0); transform: translate(3px, 1px); }
      20%  { opacity: 0.9;  clip-path: inset(5% 0 75% 0);  transform: translate(-3px, -1px); }
      40%  { opacity: 0.9;  clip-path: inset(75% 0 5% 0);  transform: translate(2px, 2px); }
      60%  { opacity: 0.9;  clip-path: inset(15% 0 60% 0); transform: translate(-2px, -2px); }
      80%  { opacity: 0.9;  clip-path: inset(45% 0 25% 0); transform: translate(3px, 0); }
      100% { opacity: 0;    clip-path: inset(100% 0 0 0);  transform: translate(0, 0); }
    }
    @keyframes glitchJitter {
      0%, 100% { transform: translate(0, 0); }
      20%  { transform: translate(-1px, 1px); }
      40%  { transform: translate(1px, -1px) skewX(1deg); }
      60%  { transform: translate(-1px, -1px); }
      80%  { transform: translate(1px, 1px) skewX(-1deg); }
    }
    @keyframes glitchAmbientA {
      0%, 44%, 58%, 100% { opacity: 0; clip-path: inset(0 0 100% 0); transform: translate(0, 0); }
      48% { opacity: 0.85; clip-path: inset(20% 0 55% 0); transform: translate(-3px, 0); }
      53% { opacity: 0.85; clip-path: inset(55% 0 15% 0); transform: translate(3px, 0); }
    }
    @keyframes glitchAmbientB {
      0%, 44%, 58%, 100% { opacity: 0; clip-path: inset(100% 0 0 0); transform: translate(0, 0); }
      48% { opacity: 0.85; clip-path: inset(55% 0 20% 0); transform: translate(3px, 0); }
      53% { opacity: 0.85; clip-path: inset(15% 0 60% 0); transform: translate(-3px, 0); }
    }
    @keyframes glitchAmbientJitter {
      0%, 44%, 58%, 100% { transform: translate(0, 0); }
      48% { transform: translate(-1px, 0); }
      53% { transform: translate(1px, 0); }
    }

    /* ambient — faint, automatic, always-on flicker */
    .glitch-wrap.glitch-ambient .glitch-layer--a {
      animation: glitchAmbientA 15s ease-in-out infinite;
      animation-play-state: running;
    }
    .glitch-wrap.glitch-ambient .glitch-layer--b {
      animation: glitchAmbientB 6s ease-in-out infinite;
      animation-play-state: running;
    }
    .glitch-wrap.glitch-ambient .glitch-base {
      animation: glitchAmbientJitter 6s ease-in-out infinite;
    }

    /* hover — the full, punchy loop, only while the pointer is over it */
    .glitch-wrap:hover .glitch-layer--a {
      animation: glitchSliceA 0.5s steps(2, jump-end) infinite;
      animation-play-state: running;
    }
    .glitch-wrap:hover .glitch-layer--b {
      animation: glitchSliceB 0.5s steps(2, jump-end) infinite;
      animation-play-state: running;
    }
    .glitch-wrap:hover .glitch-base {
      animation: glitchJitter 0.5s steps(2, jump-end) infinite;
    }
    .glitch-wrap:hover .glitch-base {
      text-shadow: 0 0 8px rgba(0, 255, 249, 0.55), 0 0 16px rgba(255, 0, 193, 0.4);
    }

    /* burst — forced, plays a few times then settles (e.g. on scroll-in) */
    .glitch-wrap.is-bursting .glitch-layer--a {
      animation: glitchSliceA 0.8s steps(2, jump-end) 3;
      animation-play-state: running;
    }
    .glitch-wrap.is-bursting .glitch-layer--b {
      animation: glitchSliceB 0.4s steps(2, jump-end) 3;
      animation-play-state: running;
    }
    .glitch-wrap.is-bursting .glitch-base {
      animation: glitchJitter 0.4s steps(2, jump-end) 3;
      text-shadow: 0 0 10px rgba(0, 255, 249, 0.6), 0 0 20px rgba(255, 0, 193, 0.45);
    }
  `;
  document.head.appendChild(style);
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
  useEffect(() => {
    ensureStyles();
  }, []);

  const Tag = as as React.ElementType;

  const wrapClass = [
    "glitch-wrap",
    ambient ? "glitch-ambient" : "",
    burst ? "is-bursting" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      className={wrapClass}
      style={
        {
          "--glitch-color-a": colorA,
          "--glitch-color-b": colorB,
        } as React.CSSProperties
      }
    >
      <span className="glitch-base">{text}</span>
      <span className="glitch-layer glitch-layer--a" aria-hidden="true">
        {text}
      </span>
      <span className="glitch-layer glitch-layer--b" aria-hidden="true">
        {text}
      </span>
    </Tag>
  );
};

export default GlitchText;