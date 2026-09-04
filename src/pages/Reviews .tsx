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
--------------------------------------------------------------------- */
interface Review {
  id: number;
  name: string;
  quote: string;
  image: string;
  rating: number;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Ananya Rao',
    quote:
      'The print quality is honestly better than I expected. The colours are sharp, the matte finish looks premium, and it fits perfectly on my wall.',
    image: Placeholder1,
    rating: 5,
  },
  {
    id: 2,
    name: 'Kabir Mehta',
    quote:
      'Ordered a few posters for my new room and they arrived perfectly packed. The prints were flat, clean, and ready to frame straight away.',
    image: Placeholder2,
    rating: 5,
  },
  {
    id: 3,
    name: 'Priya Nair',
    quote:
      'The designs look even better in person. The details are crisp and the overall quality gives the room a much more finished look.',
    image: Placeholder3,
    rating: 5,
  },
  {
    id: 4,
    name: 'Rohan Das',
    quote:
      'I have ordered multiple posters from Poster Theory now and the quality has been consistently good. Definitely coming back for more.',
    image: Placeholder4,
    rating: 4,
  },
  {
    id: 5,
    name: 'Meera Iyer',
    quote:
      'Really loved how the poster turned out. The colours matched the preview nicely and the paper feels much more premium than typical prints.',
    image: Placeholder5,
    rating: 5,
  },
  {
    id: 6,
    name: 'Aditya Verma',
    quote:
      'The split poster looks amazing once it is put together. The alignment is clean and the final piece looks great above my desk.',
    image: Placeholder6,
    rating: 5,
  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-z-paper text-z-paper' : 'text-z-paper/25'}`}
        />
      ))}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  reversed: boolean;
}

function ReviewCard({ review, reversed }: ReviewCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="grid md:grid-cols-2 gap-8 md:gap-16 items-center border-2 border-z-paper p-6 sm:p-10"
    >
      <div className={`relative aspect-[4/3] overflow-hidden border-2 border-z-paper ${reversed ? 'md:order-2' : ''}`}>
        <img
          src={review.image}
          alt={review.name}
          loading="lazy"
          className="w-full h-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
        />
      </div>

      <div className={`relative ${reversed ? 'md:order-1' : ''}`}>
        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-6 -left-2 sm:-top-10 sm:-left-4 font-display italic text-z-paper/10 text-[110px] sm:text-[160px] leading-none"
        >
          &ldquo;
        </span>

        <div className="relative">
          <StarRow rating={review.rating} />

          <p className="font-display italic font-bold text-2xl sm:text-3xl md:text-4xl leading-[1.15] tracking-tight text-z-paper mt-6 mb-8">
            {review.quote}
          </p>

          <div>
            <p className="font-mono font-bold uppercase tracking-widest text-sm text-z-paper">
              {review.name}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

const Reviews = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

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
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={pageRef} className="pt-24 sm:pt-40 pb-32 min-h-screen bg-z-ink text-z-paper">
      <div className="max-w-[1440px] mx-auto px-6">
        <header ref={heroRef} className="mb-24 text-center border-b-4 border-z-paper/30 pb-16">
          <span className="help-reveal text-[14px] font-display uppercase tracking-[0.5em] text-z-paper/60 font-black mb-10 block underline decoration-4 underline-offset-8">
            Reviews
          </span>
          <TextReveal className="help-reveal help-title font-display font-bold text-6xl md:text-9xl tracking-tighter uppercase leading-[0.85] italic text-z-paper">
            Loved by the People Who Hang Them.
          </TextReveal>
        
        </header>

        <div className="max-w-[1400px] mx-auto flex flex-col gap-16 sm:gap-24">
          {REVIEWS.map((review, i) => (
            <ReviewCard key={review.id} review={review} reversed={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;