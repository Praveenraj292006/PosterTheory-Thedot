import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import TextReveal from '../components/Textreveal';
import Placeholder1 from '../assets/wall1.jpg'
import Placeholder2 from '../assets/wall2.jpg'
import Placeholder3 from '../assets/wall3.jpg'
import Placeholder4 from '../assets/wall4.jpg'
import Placeholder5 from '../assets/wall5.jpg'
import Placeholder6 from '../assets/wall6.jpg'

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------
   Dummy data — swap `image` for real customer photos / UGC and wire
   `quote`, `name`, `role`, `rating` up to your reviews API when ready.
   `span` controls how tall the pin sits in the masonry grid — mix
   short/tall entries so the wall reads like a real pinboard rather
   than a uniform card grid.
--------------------------------------------------------------------- */
interface Review {
  id: number;
  name: string;
  quote: string;
  image: string;
  rating: number;
  span: 'short' | 'tall' | 'wide';
}

const REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Ananya Rao',
    quote: 'Better than I expected.',
    image: Placeholder1,
    rating: 5,
    span: 'short',
  },
  {
    id: 2,
    name: 'Kabir Mehta',
    quote: 'Arrived perfectly packed. Flat, clean, ready to frame straight away.',
    image: Placeholder2,
    rating: 5,
    span: 'tall',
  },
  {
    id: 3,
    name: 'Priya Nair',
    quote: 'Even better in person.',
    image: Placeholder3,
    rating: 5,
    span: 'short',
  },
  {
    id: 4,
    name: 'Rohan Das',
    quote: 'Consistently good, every single order.',
    image: Placeholder4,
    rating: 4,
    span: 'wide',
  },
  {
    id: 5,
    name: 'Meera Iyer',
    quote: 'The paper feels far more premium than a typical print.',
    image: Placeholder5,
    rating: 5,
    span: 'tall',
  },
  {
    id: 6,
    name: 'Aditya Verma',
    quote: 'The split poster looks incredible once it is up.',
    image: Placeholder6,
    rating: 5,
    span: 'short',
  },
];

/* Nudge each pin off-grid by a few degrees — the thing that makes a
   pinboard feel handled rather than laid out by a machine. */
const TILT = [-1.4, 1.1, -0.8, 1.6, -1.2, 0.9];

const SPAN_CLASS: Record<Review['span'], string> = {
  short: 'aspect-[4/5]',
  tall: 'aspect-[3/4.4]',
  wide: 'aspect-[16/11]',
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'fill-z-paper text-z-paper' : 'text-z-paper/25'}`}
        />
      ))}
    </div>
  );
}

interface PinProps {
  review: Review;
  tilt: number;
}

function Pin({ review, tilt }: PinProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 60, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      whileHover={{ rotate: 0, scale: 1.03, zIndex: 20 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="pin-card break-inside-avoid mb-6 sm:mb-8 relative bg-z-ink border-2 border-z-paper origin-center will-change-transform"
    >
      {/* pushpin mark */}
      <span
        aria-hidden="true"
        className="absolute -top-2.5 left-6 sm:left-8 w-5 h-5 rounded-full bg-z-paper border-2 border-z-ink z-10"
      />

      <div className={`relative w-full overflow-hidden border-b-2 border-z-paper ${SPAN_CLASS[review.span]}`}>
        <img
          src={review.image}
          alt={review.name}
          loading="lazy"
          className="pin-img w-full h-full object-cover grayscale transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-z-ink via-transparent to-transparent opacity-60" />

        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute -bottom-6 -left-1 font-display italic text-z-paper text-[90px] sm:text-[120px] leading-none mix-blend-difference"
        >
          &ldquo;
        </span>
      </div>

      <div className="p-6 sm:p-7 pt-9">
        <p className="font-display italic font-bold text-xl sm:text-2xl leading-[1.15] tracking-tight text-z-paper mb-5">
          {review.quote}
        </p>

        <div className="flex items-center justify-between">
          <p className="font-mono font-bold uppercase tracking-widest text-xs text-z-paper">
            {review.name}
          </p>
          <StarRow rating={review.rating} />
        </div>
      </div>
    </motion.article>
  );
}

const Reviews = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set('.help-reveal', { y: 80, opacity: 0 });
      gsap.set('.help-line', { width: '0%', opacity: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.to('.help-reveal', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power4.out',
        stagger: 0.15,
      })
        .to('.help-line', { width: '100%', duration: 0.8, ease: 'power4.inOut' }, '-=0.4')
        .to('.help-line', { width: '0%', duration: 0.7, ease: 'power4.inOut' });

      // gentle parallax drift on the pins as the board scrolls by —
      // one orchestrated effect for the whole grid, not per-card noise
      if (boardRef.current) {
        const pins = gsap.utils.toArray<HTMLElement>('.pin-card', boardRef.current);
        pins.forEach((pin, i) => {
          gsap.to(pin, {
            y: i % 3 === 0 ? -26 : i % 3 === 1 ? -10 : -40,
            ease: 'none',
            scrollTrigger: {
              trigger: pin,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          });
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={pageRef} className="pt-24 sm:pt-40 pb-32 min-h-screen bg-z-ink text-z-paper overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6">
        <header ref={heroRef} className="mb-20 text-center border-b-4 border-z-paper/30 pb-16">
          <span className="help-reveal text-[14px] font-display uppercase tracking-[0.5em] text-z-paper/60 font-black mb-10 block underline decoration-4 underline-offset-8">
            Reviews
          </span>
          <TextReveal className="help-reveal help-title font-display font-bold text-6xl md:text-9xl tracking-tighter uppercase leading-[0.85] italic text-z-paper">
            Loved by the People Who Hang Them.
          </TextReveal>
        </header>

        <div
          ref={boardRef}
          className="max-w-[1400px] mx-auto columns-1 sm:columns-2 lg:columns-3 gap-6 sm:gap-8"
        >
          {REVIEWS.map((review, i) => (
            <Pin key={review.id} review={review} tilt={TILT[i % TILT.length]} />
          ))}
        </div>
      </div>

      <style>{`
        .pin-card:hover .pin-img {
          filter: grayscale(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .pin-card { transition: none !important; }
        }
      `}</style>
    </section>
  );
};

export default Reviews;