import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import PosterMarquee from "./PosterMarquee";
import api from "../lib/api";

const FALLBACK_IMAGES = [
  { url: '/uploads/hero/placeholder.png', ref: '001' },
];

export default function Hero() {
  const [images, setImages] = useState(FALLBACK_IMAGES);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    api.get('/api/products/homepage').then(res => {
      const heroImages = res.data?.hero_images?.images;
      if (Array.isArray(heroImages) && heroImages.length > 0) {
        const valid = heroImages.filter((i: any) => i.url);
        if (valid.length > 0) setImages(valid);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

 return (
  <section className="relative flex z-10 min-h-screen w-full overflow-hidden px-4 sm:px-6 py-10 lg:py-20 justify-center">

    {/* Background */}
    <div className="absolute w-full inset-0 " />

 <div className="relative w-full max-w-[1640px] h-[700px] overflow-hidden lg:rounded-[40px] md:rounded-none bg-z-ink grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] items-center z-10 bg-radial from-white/5 to-black lg:my-0 my-10">

  {/* MOBILE POSTER BACKGROUND */}
  <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none opacity-30">
    <PosterMarquee images={images} />
  </div>

  {/* MOBILE OVERLAY */}
  <div className="absolute inset-0 lg:hidden bg-z-ink/40 pointer-events-none" />

  {/* HERO CONTENT */}
  <div className="relative z-20 flex flex-col items-start p-6 sm:p-10">
    
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tighter text-z-paper leading-[0.9] mb-4 sm:mb-6"
    >
      Premium Posters<br />
      <span className="text-z-muted">For Your Walls</span>
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-[12px] sm:text-[14px] font-mono text-z-muted leading-relaxed mb-6 sm:mb-8 max-w-md"
    >
      Curated poster prints in Anime, Movies, Music, Minimal & more. Available in A3 to Pocket sizes. Printed on 300 GSM matte paper.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap gap-3 sm:gap-4"
    >
      <Link to="/collection" className="px-6 sm:px-8 py-3 bg-z-paper text-z-ink font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-widest hover:bg-z-muted transition-colors">
        Shop Now
      </Link>

      <Link to="/customize" className="px-6 sm:px-8 py-3 border border-z-paper/50 text-z-paper font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-widest hover:bg-z-paper hover:text-z-ink transition-all">
        Custom Print
      </Link>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="flex items-center gap-4 sm:gap-6 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-z-border/50"
    >
      <div>
        <p className="font-display font-black text-xl sm:text-2xl text-z-paper">500+</p>
        <p className="text-[8px] sm:text-[9px] font-mono text-z-muted uppercase">Happy Customers</p>
      </div>

      <div className="w-px h-6 sm:h-8 bg-z-border" />

      <div>
        <p className="font-display font-black text-xl sm:text-2xl text-z-paper">6</p>
        <p className="text-[8px] sm:text-[9px] font-mono text-z-muted uppercase">Print Sizes</p>
      </div>

      <div className="w-px h-6 sm:h-8 bg-z-border" />

      <div>
        <p className="font-display font-black text-xl sm:text-2xl text-z-paper">₹69</p>
        <p className="text-[8px] sm:text-[9px] font-mono text-z-muted uppercase">Starting At</p>
      </div>
    </motion.div>

  </div>

  {/* DESKTOP POSTER MARQUEE */}
  <div className="hidden lg:block relative h-[700px] w-full overflow-hidden">
    <PosterMarquee images={images} />
  </div>

</div>

      
    



   

  </section>
);
}