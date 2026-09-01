import React, { useLayoutEffect, useRef } from "react";

import { Link } from "react-router-dom";
import TextReveal from "./Textreveal";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AboutProps {
  aboutImage?: string;
  pageReady: boolean;
}

const About: React.FC<AboutProps> = ({ aboutImage, pageReady }) => {
  const sectionRef = useRef<HTMLElement>(null);

  const maskRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Don't initialize GSAP until
    // backend content has rendered.
    if (!pageReady) return;

    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      /*
       * INITIAL STATE
       */

      gsap.set(maskRef.current, {
        scaleX: 1,
        transformOrigin: "left center",
      });

      gsap.set(contentRef.current, {
        y: 60,
        opacity: 0,
      });

      gsap.set(imageRef.current, {
        y: 80,
        opacity: 0,
        scale: 0.96,
      });

      /*
       * TIMELINE
       */

      const tl = gsap.timeline({
        paused: true,
      });

      // Black mask reveals from left → right
      tl.to(maskRef.current, {
        scaleX: 0,
        duration: 1,
        ease: "power4.inOut",
      });

      // Text enters
      tl.to(
        contentRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power4.out",
        },
        "-=0.5",
      );

      // Image enters slightly later
      tl.to(
        imageRef.current,
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power4.out",
        },
        "-=0.55",
      );

      /*
       * SCROLL TRIGGER
       */

      ScrollTrigger.create({
        trigger: section,

        // Animation starts when About
        // enters the lower part of viewport.
        start: "top 75%",

        // We only need enter / leave-back.
        toggleActions: "play none none reverse",

        onEnter: () => {
          tl.play();
        },

        onLeaveBack: () => {
          tl.reverse();
        },
      });

      /*
       * VERY IMPORTANT
       *
       * Backend sections may have changed
       * the document height.
       */
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, [pageReady]);

  return (
    <section
      ref={sectionRef}
      className=" relative py-20 sm:py-32 px-4 sm:px-6 bg-black overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className=" grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* CONTENT */}

          <div ref={contentRef} className="relative">
            <TextReveal className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.3em] text-z-muted font-bold mb-4">About Us</TextReveal>

            <h2 className=" font-display   text-3xl sm:text-5xl uppercase tracking-tighter text-white leading-[0.9] mb-6">
              Posters That
              <br />
              Define Your Space
            </h2>

            <div
              className="  space-y-4  text-[12px]  sm:text-[13px]  font-mono  text-white/70  leading-relaxed   max-w-xl"
            >
              <p>We believe your walls should reflect who you are. Every poster in our collection is carefully curated — from anime and movies to minimalist art and typography.</p>

              <p>Printed on premium 300 GSM matte paper with vibrant, fade-resistant inks. Available in 6 sizes and multiple panel layouts.</p>
            </div>

            <Link
              to="/story"
              className="inline-block mt-8 px-8 py-3 border border-white text-white font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all "
            >
              Read Our Story
            </Link>
          </div>

          {/* IMAGE */}

          <div
            ref={imageRef}
            className=" relative aspect-[4/5] overflow-hidden border border-white/20 bg-white "
          >
            {aboutImage ? (
              <img
                src={aboutImage}
                alt="About Poster Theory"
                className=" w-full h-full object-cover
                "
              />
            ) : (
              <div className=" w-full h-full flex items-center justify-center bg-z-paper"
              >
                <span className=" text-[10px] font-mono text-z-muted uppercase tracking-widest " >
                  About Image
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REVEAL MASK */}

      <div
        ref={maskRef}
        className=" absolute inset-0 bg-black z-20 pointer-events-none
        "
      />
    </section>
  );
};

export default About;
