import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import { Link } from "react-router-dom";
import PosterMarquee from "./PosterMarquee";
import PosterCollage from "./PosterCollage";
import api from "../lib/api";

interface Collection {
  name: string;
  path: string;
}

const FALLBACK_IMAGES = [
  { url: "/uploads/hero/placeholder.png", ref: "001" },
];

export default function Hero() {
  const [images, setImages] = useState(FALLBACK_IMAGES);

  const heroRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const buttonsRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    api
      .get("/api/products/homepage")
      .then((res) => {
        const heroImages = res.data?.hero_images?.images;

        if (Array.isArray(heroImages) && heroImages.length > 0) {
          const valid = heroImages.filter((i: any) => i.url);

          if (valid.length > 0) {
            setImages(valid);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
  if (!heroRef.current) return;

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top 75%",
        end: "top 30%",
        toggleActions: "play none none reverse",
      },
      defaults: {
        ease: "power4.out",
      },
    });

    gsap.set(".hero-reveal-line", {
      yPercent: 110,
      opacity: 0,
    });

    gsap.set(eyebrowRef.current, {
      y: 20,
      opacity: 0,
    });

    gsap.set(paragraphRef.current, {
      y: 30,
      opacity: 0,
    });

    gsap.set(buttonsRef.current, {
      y: 25,
      opacity: 0,
    });

    gsap.set(statsRef.current, {
      y: 25,
      opacity: 0,
    });

    tl.to(eyebrowRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.5,
    });

    tl.to(
      ".hero-reveal-line",
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
      },
      "-=0.2"
    );

    tl.to(
      paragraphRef.current,
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
      },
      "-=0.4"
    );

    tl.to(
      buttonsRef.current,
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
      },
      "-=0.3"
    );

    tl.to(
      statsRef.current,
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
      },
      "-=0.3"
    );
  }, heroRef);

  return () => ctx.revert();
}, []);

  return (
    <section
      ref={heroRef}
      className="relative z-10 min-h-screen w-full overflow-hidden justify-center"
    >
      {/* Background */}
      <div className="absolute w-full inset-0" />

      <div className="relative w-full max-w-screen h-screen overflow-hidden md:rounded-none bg-linear-to-b from-black from-30% via-gray-900 via-70% to-gray-50 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] items-center z-10 lg:my-0">

        {/* MOBILE POSTER BACKGROUND */}
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none opacity-30">
          <PosterMarquee images={images} />
        </div>

        {/* MOBILE OVERLAY */}
        <div className="absolute inset-0 lg:hidden bg-z-ink/40 pointer-events-none" />

        {/* HERO CONTENT */}
        <div className="relative z-20 flex flex-col items-start p-6 sm:p-10">

          {/* Heading */}
          <h1
            ref={headingRef}
            className="font-display  text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tighter text-z-paper leading-[0.9] mb-4 sm:mb-6"
          >
            <span className="block overflow-hidden">
              <span className="hero-reveal-line block">
                Premium Posters
              </span>
            </span>

            <span className="block overflow-hidden">
              <span className="hero-reveal-line block text-z-muted">
                For Your Walls
              </span>
            </span>
          </h1>

          {/* Description */}
          <p
            ref={paragraphRef}
            className="text-[12px] sm:text-[14px] font-[Montserrat] font-700 text-z-muted leading-relaxed mb-6 sm:mb-8 max-w-md"
          >
            Curated poster prints in Anime, Movies, Music, Minimal & more.
            Available in A3 to Pocket sizes. Printed on 300 GSM matte paper.
          </p>

          {/* Buttons */}
          <div
            ref={buttonsRef}
            className="flex flex-wrap gap-3 sm:gap-4"
          >
            <Link
              to="/collection"
              className="px-6 sm:px-8 py-3 bg-z-paper text-z-ink font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-widest hover:bg-z-muted transition-colors"
            >
              Shop Now
            </Link>

            <Link
              to="/customize"
              className="px-6 sm:px-8 py-3 border border-z-paper/50 text-z-paper font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-widest hover:bg-z-paper hover:text-z-ink transition-all"
            >
              Custom Print
            </Link>
          </div>

          {/* Stats */}
          <div
            ref={statsRef}
            className="flex items-center gap-4 sm:gap-6 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-z-border/50"
          >
            <div>
              <p className="font-display font-black text-xl sm:text-2xl text-z-paper">
                500+
              </p>
              <p className="text-[8px] sm:text-[9px] font-mono text-z-muted uppercase">
                Happy Customers
              </p>
            </div>

            <div className="w-px h-6 sm:h-8 bg-z-border" />

            <div>
              <p className="font-display font-black text-xl sm:text-2xl text-z-paper">
                6
              </p>
              <p className="text-[8px] sm:text-[9px] font-mono text-z-muted uppercase">
                Print Sizes
              </p>
            </div>

            <div className="w-px h-6 sm:h-8 bg-z-border" />

            <div>
              <p className="font-display font-black text-xl sm:text-2xl text-z-paper">
                ₹69
              </p>
              <p className="text-[8px] sm:text-[9px] font-mono text-z-muted uppercase">
                Starting At
              </p>
            </div>
          </div>
        </div>

        {/* DESKTOP POSTER COLLAGE */}
        <div className="hidden lg:block relative h-full w-full overflow-hidden bg-transparent">
          <PosterCollage images={images} />
        </div>
      </div>
    </section>
  );
}