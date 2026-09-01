import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const promoImages = [
  "/uploads/hero/placeholder.png",
  "/uploads/hero/placeholder.png",
  "/uploads/hero/placeholder.png",
];

export default function PromotionalPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % promoImages.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/75 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

          <motion.div className="relative z-10 w-full max-w-[1000px] overflow-hidden border-2 border-white bg-black shadow-[12px_12px_0px_0px_rgba(255,255,255,0.15)]" initial={{ opacity: 0, y: 80, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.96 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
            <button type="button" onClick={onClose} aria-label="Close promotion" className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center border border-white/60 bg-black/70 text-white hover:bg-white hover:text-black transition-all">
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-[65vh] min-h-[500px] max-h-[680px]">
              <AnimatePresence mode="wait">
                <motion.img key={currentImage} src={promoImages[currentImage]} alt="Poster Theory promotion" className="absolute inset-0 w-full h-full object-cover" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.9, ease: "easeOut" }} />
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="absolute left-0 right-0 bottom-0 p-6 sm:p-10 md:p-14">
                <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-white/60 mb-4">
                  POSTER_THEORY // LIMITED_DROP
                </p>

                <h2 className="font-display font-black text-4xl sm:text-6xl md:text-8xl uppercase tracking-tighter leading-[0.82] text-white max-w-[700px]">
                  NEW WALLS.
                  <br />
                  NEW ENERGY.
                </h2>

                <p className="mt-5 max-w-lg font-mono text-[11px] sm:text-[13px] uppercase tracking-wide leading-relaxed text-white/70">
                  Discover our latest collection of premium posters designed to redefine your space.
                </p>

                <div className="flex flex-wrap gap-3 mt-7">
                  <Link to="/collection" onClick={onClose} className="inline-flex items-center gap-3 px-6 py-3.5 bg-white text-black font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-white border border-white transition-all">
                    Shop Collection
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link to="/customize" onClick={onClose} className="inline-flex items-center px-6 py-3.5 border border-white/60 text-white font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Custom Print
                  </Link>
                </div>
              </div>

              <div className="absolute bottom-5 right-6 sm:right-10 flex gap-2">
                {promoImages.map((_, index) => (
                  <button key={index} type="button" onClick={() => setCurrentImage(index)} className={`h-[3px] transition-all duration-300 ${index === currentImage ? "w-10 bg-white" : "w-4 bg-white/40"}`} aria-label={`Show promotion ${index + 1}`} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}