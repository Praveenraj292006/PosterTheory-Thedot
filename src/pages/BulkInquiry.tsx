import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------
   Content — kept as data so the JSX below stays purely structural.
   Swap POSTER_GALLERY / HERO_IMAGES for real product photography
   (e.g. '/assets/bulk/run-01.jpg') before shipping.
--------------------------------------------------------------------- */

interface BuyerCard {
  tag: string;
  copy: string;
}

const BUYER_TYPES: BuyerCard[] = [
  { tag: 'BUSINESS', copy: 'Branch launches, retail decor, and trade-show backdrops printed to spec.' },
  { tag: 'RESELLER', copy: 'Wholesale pricing on repeat runs, ready to relabel and resell.' },
  { tag: 'EVENT_ORGANIZER', copy: 'Directional signage and stage art, delivered before load-in.' },
  { tag: 'INFLUENCER_/_CREATOR', copy: 'Merch drops and fan prints without a minimum that punishes you.' },
  { tag: 'AGENCY', copy: 'Multi-client batching with separate proofs, one consolidated invoice.' },
  { tag: 'EDUCATIONAL_INSTITUTION', copy: 'Classroom sets and campus notices at education-friendly rates.' },
];

const MARQUEE_ITEMS = [
  'OFFSET_PRINTING', 'DIGITAL_PRINTING', 'MATTE', 'GLOSS', 'SATIN',
  'CUSTOM_SIZES', 'DIE_CUT', 'BULK_FULFILLMENT',
];

interface GalleryImage {
  src: string;
  label: string;
}

const HERO_IMAGES: [GalleryImage, GalleryImage] = [
  { src: 'https://picsum.photos/seed/poster-theory-hero-a/700/900', label: 'Event run, 500pc' },
  { src: 'https://picsum.photos/seed/poster-theory-hero-b/700/900', label: 'Retail launch, 1200pc' },
];

const POSTER_GALLERY: GalleryImage[] = [
  { src: 'https://picsum.photos/seed/poster-theory-gallery-1/600/800', label: 'Branding run' },
  { src: 'https://picsum.photos/seed/poster-theory-gallery-2/600/800', label: 'Motivational set' },
  { src: 'https://picsum.photos/seed/poster-theory-gallery-3/600/800', label: 'Campus notices' },
  { src: 'https://picsum.photos/seed/poster-theory-gallery-4/600/800', label: 'Pop culture drop' },
];

/* ------------------------------------------------------------------
   Subtle pointer-tilt on the hero image stack. GSAP-driven, resets
   smoothly on leave. Kept local — no external tilt library needed.
--------------------------------------------------------------------- */
function useTilt() {
  const wrapRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, {
      rotateY: x * 8,
      rotateX: -y * 8,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 900,
    });
  };

  const onLeave = () => {
    const el = wrapRef.current;
    if (!el) return;
    gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' });
  };

  return { wrapRef, onMove, onLeave };
}

export default function BulkInquiry() {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const { wrapRef: heroImgRef, onMove: onHeroMove, onLeave: onHeroLeave } = useTilt();

  useLayoutEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set('.bulk-reveal', { y: 80, opacity: 0 });
      gsap.set('.bulk-line', { width: '0%', opacity: 1 });
      gsap.set('.bulk-img', { scale: 1.12, opacity: 0 });

      // Hero eyebrow / title / underline sweep
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      heroTl
        .to('.bulk-eyebrow', { y: 0, opacity: 1, duration: 0.6, ease: 'power4.out' })
        .to('.bulk-title', { y: 0, opacity: 1, duration: 0.9, ease: 'power4.out' }, '-=0.3')
        .to('.bulk-hero-copy', { y: 0, opacity: 1, duration: 0.7, ease: 'power4.out' }, '-=0.5')
        .to('.bulk-hero-actions', { y: 0, opacity: 1, duration: 0.7, ease: 'power4.out' }, '-=0.5')
        .to('.bulk-line', { width: '100%', duration: 0.8, ease: 'power4.inOut' }, '-=0.4')
        .to('.bulk-line', { width: '0%', duration: 0.7, ease: 'power4.inOut' });

      // Hero images: scale-in + continuous parallax drift while scrolling
      gsap.utils.toArray<HTMLElement>('.bulk-hero-img').forEach((img, i) => {
        gsap.to(img, {
          scale: 1,
          opacity: 1,
          duration: 1,
          delay: 0.15 + i * 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: heroRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
        });
        gsap.to(img, {
          yPercent: i % 2 === 0 ? -10 : 10,
          ease: 'none',
          scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      // Generic section + gallery reveals
      gsap.utils.toArray<HTMLElement>('.bulk-section').forEach((section) => {
        gsap.fromTo(
          section,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('.bulk-img:not(.bulk-hero-img)').forEach((img, i) => {
        gsap.to(img, {
          scale: 1,
          opacity: 1,
          duration: 0.9,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: img, start: 'top 90%', toggleActions: 'play none none reverse' },
        });
      });

      // Infinite marquee — GSAP tween rather than a CSS keyframe that
      // would need registering in the global stylesheet.
      if (marqueeTrackRef.current) {
        gsap.to(marqueeTrackRef.current, {
          xPercent: -50,
          duration: 24,
          ease: 'none',
          repeat: -1,
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="pt-24 sm:pt-40 pb-32 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6">
        <header
          ref={heroRef}
          className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center border-b-4 border-z-border pb-16"
        >
          <div>
          
            <h1 className="bulk-reveal bulk-title font-display font-bold text-5xl md:text-7xl tracking-tighter uppercase leading-[0.9] italic">
               Bulk Posters
              <br />
              Made For Every
              <br />
              <span> Requirement</span>
            </h1>
            <div className="bulk-line h-1 bg-z-ink mt-8 max-w-[300px]" />
            <p className="bulk-reveal bulk-hero-copy mt-8 font-mono font-semibold text-sm text-z-muted leading-7 max-w-[48ch]">
              Whether you need posters for your business, evens, campaigns, resale, or personal projects — Poster Theory helps you create high-quality posters in any quantity. <br />

                <span >From small quantity requirements to large-scale orders, we provide flexible solutions with multiple sizes and customized options based on your needs.</span>

            </p>
            <div className="bulk-reveal bulk-hero-actions mt-10 flex items-center gap-6 flex-wrap">
              <Link
                to="/bulk-inquiry/form"
                className="inline-flex items-center gap-3 border-2 border-z-border bg-z-ink text-z-paper font-mono font-bold uppercase tracking-widest text-sm px-8 py-4 shadow-[6px_6px_0px_0px_var(--color-z-shadow)] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0px_0px_var(--color-z-shadow)]"
              >
                Get bulk quote
                <ArrowRight className="w-4 h-4" />
              </Link>
              
            </div>
          </div>

          <div
            ref={heroImgRef}
            onMouseMove={onHeroMove}
            onMouseLeave={onHeroLeave}
            className="relative h-[420px] sm:h-[480px]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <img
              src={HERO_IMAGES[0].src}
              alt={HERO_IMAGES[0].label}
              className="bulk-img bulk-hero-img absolute top-0 left-[4%] w-[60%] aspect-[3/4] object-cover border-2 border-z-border -rotate-6 shadow-[6px_6px_0px_0px_var(--color-z-shadow)]"
            />
            <img
              src={HERO_IMAGES[1].src}
              alt={HERO_IMAGES[1].label}
              className="bulk-img bulk-hero-img absolute top-[10%] left-[32%] w-[58%] aspect-[3/4] object-cover border-2 border-z-border rotate-3 shadow-[6px_6px_0px_0px_var(--color-z-shadow)]"
            />
          </div>
        </header>

        {/* <div className="bulk-section overflow-hidden border-y-2 border-z-border bg-z-ink py-4 mb-24">
          <div ref={marqueeTrackRef} className="flex w-max">
            {Array.from({ length: 2 }).map((_, rep) => (
              <React.Fragment key={rep}>
                {MARQUEE_ITEMS.map((item) => (
                  <span
                    key={`${rep}-${item}`}
                    className="font-mono font-bold uppercase tracking-widest text-sm text-z-paper px-6 whitespace-nowrap"
                  >
                    {item}
                  </span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div> */}

        <section className="bulk-section mb-24">
          <div className="flex items-end justify-between gap-6 flex-wrap mb-10 border-b-2 border-z-border pb-6">
            <h2 className="font-display  uppercase italic text-3xl md:text-4xl tracking-tight">
              Built for how you order
            </h2>
          
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t-2 border-l-2 border-z-border">
            {BUYER_TYPES.map((c) => (
              <div
                key={c.tag}
                className="group border-r-2 border-b-2 border-z-border p-7 transition-colors hover:bg-z-ink hover:text-z-paper"
              >
                <p className="font-mono font-bold uppercase tracking-widest text-sm mb-3">{c.tag}</p>
                <p className="font-mono text-sm text-z-muted leading-6 group-hover:text-z-paper/70">
                  {c.copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* <section className="bulk-section mb-24">
          <div className="mb-10 border-b-2 border-z-border pb-6">
            <h2 className="font-display  uppercase italic text-3xl md:text-4xl tracking-tight">
              Recent bulk runs
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {POSTER_GALLERY.map((img) => (
              <div key={img.label} className="overflow-hidden border-2 border-z-border">
                <img
                  src={img.src}
                  alt={img.label}
                  className="bulk-img w-full aspect-[3/4] object-cover transition-transform duration-500 hover:scale-[1.05]"
                />
              </div>
            ))}
          </div>
        </section> */}

        <section className="bulk-section relative border-2 border-z-border bg-z-ink text-z-paper text-center py-20 px-6">
          <h2 className="font-display  uppercase italic text-3xl md:text-5xl tracking-tight max-w-[22ch] mx-auto mb-10 leading-[0.95]">
            Tell us the run size, the poster size, and the deadline.
          </h2>
          <Link
            to="/bulk-inquiry/form"
            className="inline-flex items-center gap-3 border-2 border-z-paper bg-z-paper text-z-ink font-mono font-bold uppercase tracking-widest text-sm px-8 py-4 shadow-[6px_6px_0px_0px_var(--color-z-shadow)] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0px_0px_var(--color-z-shadow)]"
          >
            Get bulk quote
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}