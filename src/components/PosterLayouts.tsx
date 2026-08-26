import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface PosterLayout {
  id: string;
  name: string;
  size: string;
  dimensions: string;
  orientation: "portrait" | "landscape" | "square";
  price: number;
  finish: string;
  description: string;
  image?: string;
}

const posterLayouts: PosterLayout[] = [
  {
    id: "square-4x4",
    name: "Square",
    size: '4" × 4"',
    dimensions: "4 × 4 inches",
    orientation: "square",
    price: 90,
    finish: "1 inch · Black / White Matt",
    description: "Compact square print, perfect for small wall arrangements.",
    image: "/uploads/layouts/square-4x4.jpg",
  },
  {
    id: "a6-6x4",
    name: "A6",
    size: '6" × 4"',
    dimensions: "6 × 4 inches",
    orientation: "landscape",
    price: 100,
    finish: "1 inch · Black / White Matt",
    description: "Small-format poster designed for compact displays.",
    image: "/uploads/layouts/a6.jpg",
  },
  {
    id: "standard-7x5",
    name: "Standard",
    size: '7" × 5"',
    dimensions: "7 × 5 inches",
    orientation: "landscape",
    price: 120,
    finish: "1 inch · Black / White Matt",
    description: "A versatile format for desks, shelves and gallery walls.",
    image: "/uploads/layouts/standard.jpg",
  },
  {
    id: "a4-8x12",
    name: "A4",
    size: '8" × 12"',
    dimensions: "8 × 12 inches",
    orientation: "portrait",
    price: 145,
    finish: "1 inch · Black / White Matt",
    description: "Classic poster format for everyday wall displays.",
    image: "/uploads/layouts/a4.jpg",
  },
  {
    id: "a3-12x16",
    name: "A3",
    size: '12" × 16"',
    dimensions: "12 × 16 inches",
    orientation: "portrait",
    price: 200,
    finish: "1 inch · Black / White Matt",
    description: "Large-format print designed to become a statement piece.",
    image: "/uploads/layouts/a3.jpg",
  },
];

export default function PosterLayouts() {
  return (
    <main className="min-h-screen bg-z-paper text-z-ink">

      {/* Hero */}
      <section className="px-6 py-20 sm:py-28 border-b-2 border-z-border">
        <div className="max-w-[1440px] mx-auto">

          <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-z-muted font-bold mb-4">
            Poster Theory · Print Guide
          </p>

          <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl uppercase tracking-tighter leading-[0.85] max-w-5xl">
            Choose Your
            <br />
            <span className="text-z-muted">Format.</span>
          </h1>

          <p className="font-mono text-xs sm:text-sm text-z-muted uppercase leading-relaxed max-w-xl mt-8">
            Choose the perfect poster size for your wall, desk, frame or
            gallery arrangement.
          </p>

        </div>
      </section>

      {/* Poster Sizes */}
      <section className="px-6 py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto">

          <div className="flex items-end justify-between mb-10">

            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-z-muted mb-2">
                Available Formats
              </p>

              <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tighter">
                Poster Sizes
              </h2>
            </div>

            <span className="hidden sm:block font-mono text-[10px] uppercase text-z-muted">
              {posterLayouts.length} Formats
            </span>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {posterLayouts.map((layout, index) => (

              <motion.article
                key={layout.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group border-2 border-z-border bg-z-paper overflow-hidden"
              >

                {/* Preview */}
                <div className="relative aspect-[4/3] bg-z-ink overflow-hidden flex items-center justify-center">

                  {layout.image ? (

                    <img
                      src={layout.image}
                      alt={`${layout.name} poster layout`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                  ) : (

                    <div className="flex items-center justify-center w-full h-full">

                      <div
                        className={`bg-z-paper border-2 border-z-border shadow-[8px_8px_0px_0px_rgba(255,255,255,0.15)] ${
                          layout.orientation === "portrait"
                            ? "w-32 aspect-[2/3]"
                            : layout.orientation === "landscape"
                            ? "w-40 aspect-[3/2]"
                            : "w-32 aspect-square"
                        }`}
                      />

                    </div>

                  )}

                  <div className="absolute top-4 left-4">
                    <span className="bg-z-paper text-z-ink px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-widest">
                      {layout.name}
                    </span>
                  </div>

                </div>

                {/* Details */}
                <div className="p-5">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <h3 className="font-display font-black text-2xl uppercase tracking-tighter">
                        {layout.name}
                      </h3>

                      <p className="font-mono text-[10px] uppercase text-z-muted mt-1">
                        {layout.size}
                      </p>
                    </div>

                    <p className="font-display font-black text-xl">
                      ₹{layout.price}
                    </p>

                  </div>

                  <div className="border-t border-z-border/20 mt-5 pt-4">

                    <p className="font-mono text-[10px] uppercase text-z-muted leading-relaxed">
                      {layout.finish}
                    </p>

                    <p className="font-mono text-[10px] text-z-muted leading-relaxed mt-3">
                      {layout.description}
                    </p>

                  </div>

                  <Link
                    to={`/customize?size=${layout.id}`}
                    className="mt-5 flex items-center justify-between w-full border-2 border-z-border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-z-ink hover:text-z-paper transition-colors"
                  >
                    Choose {layout.name}
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                </div>

              </motion.article>

            ))}

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 sm:pb-28">

        <div className="max-w-[1440px] mx-auto bg-z-ink text-z-paper p-8 sm:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          <div>

            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-z-paper/50 mb-3">
              Ready to print?
            </p>

            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tighter leading-[0.9]">
              Turn your image
              <br />
              into a poster.
            </h2>

          </div>

          <Link
            to="/customize"
            className="shrink-0 bg-z-paper text-z-ink px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            Start Creating →
          </Link>

        </div>

      </section>

    </main>
  );
}