import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Heart, ShoppingBag, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import ProductModal from "./ProductModal";

interface ProductProps {
  id: number;
  title: string;
  price?: number;
  image: string;
  collection?: string;
  collection_name?: string;
  description?: string;
  layout?: string;
  available_sizes?: number[];
  available_layouts?: number[];
  [key: string]: any;
}

export default function ProductCard(props: ProductProps) {
  const {
    id,
    title,
    price,
    image,
    collection_name,
    layout,
    available_sizes,
  } = props;

  const [showModal, setShowModal] = useState(false);
  const [liked, setLiked] = useState(false);

  const displayPrice = price ?? 0;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
        className="group relative flex flex-col"
      >

        {/* IMAGE */}
        <div className="relative">

          <button
            type="button"
            onClick={() => setLiked(!liked)}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 z-30 w-9 h-9 flex items-center justify-center bg-z-paper/90 border border-z-border backdrop-blur-sm hover:bg-z-ink hover:text-z-paper transition-all"
          >
            <Heart
              className={`w-4 h-4 ${
                liked ? "fill-current" : ""
              }`}
            />
          </button>

          {/* Poster */}
          <div
            className="relative aspect-[210/297] overflow-hidden border border-z-border bg-z-paper p-1 shadow-[5px_5px_0px_0px_var(--color-z-shadow)] transition-all duration-300 group-hover:shadow-[2px_2px_0px_0px_var(--color-z-shadow)] group-hover:translate-x-[3px] group-hover:translate-y-[3px]"
          >

            <div className="relative w-full h-full overflow-hidden bg-z-paper">

              <img
                src={image}
                alt={title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

              {/* Quick view */}
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="absolute left-1/2 bottom-5 -translate-x-1/2 translate-y-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-z-paper text-z-ink border border-z-border px-5 py-2.5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
              >
                <Eye className="w-3.5 h-3.5" />
                Quick View
              </button>

            </div>
          </div>

          {/* Layout badge */}
          {layout && layout !== "Single" && (
            <div className="absolute left-3 top-3 z-20 bg-z-ink text-z-paper px-2.5 py-1 text-[8px] font-mono font-bold uppercase tracking-widest">
              {layout}
            </div>
          )}

        </div>

        {/* PRODUCT INFORMATION */}
        <div className="pt-4 px-0.5">

          {/* Collection */}
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-z-muted mb-1.5">
            {collection_name || "Poster Theory"}
          </p>

          {/* Title */}
          <Link
            to={`/product/${id}`}
            className="block"
          >
            <h3 className="font-display font-bold text-sm sm:text-base uppercase tracking-tight leading-tight text-z-ink hover:text-z-muted transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>

          {/* Price + Sizes */}
          <div className="flex items-end justify-between gap-3 mt-3">

            <div>
              <p className="font-display font-black text-lg text-z-ink">
                ₹{displayPrice}
              </p>

              {available_sizes && available_sizes.length > 0 && (
                <p className="text-[8px] font-mono uppercase tracking-widest text-z-muted mt-0.5">
                  {available_sizes.length} sizes available
                </p>
              )}
            </div>

            {/* Add button */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="group/cart flex items-center justify-center gap-2 bg-z-ink text-z-paper px-3 py-2.5 font-mono text-[9px] font-bold uppercase tracking-widest hover:bg-z-muted transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                Add
              </span>
            </button>

          </div>

        </div>
      </motion.article>

      {/* PRODUCT MODAL */}
      {showModal && (
        <ProductModal
          product={props}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}


/* =========================================================
   CATEGORY CARD
========================================================= */

interface CategoryCardProps {
  title: string;
  image: string;
  path: string;
}

export function CategoryCard({
  title,
  image,
  path,
}: CategoryCardProps) {
  return (
    <Link
      to={path}
      className="group relative block"
    >

      <div className="relative aspect-[210/297] overflow-hidden border border-z-border bg-z-paper shadow-[6px_6px_0px_0px_var(--color-z-shadow)] transition-all duration-300 group-hover:shadow-[2px_2px_0px_0px_var(--color-z-shadow)] group-hover:translate-x-[4px] group-hover:translate-y-[4px]">

        {/* Image */}
        <div className="absolute inset-1 overflow-hidden">

          {image ? (
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-z-paper">
              <span className="font-mono text-[10px] text-z-muted uppercase tracking-widest">
                No Image
              </span>
            </div>
          )}

        </div>

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">

          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-white/60 mb-2">
            Collection
          </p>

          <div className="flex items-end justify-between gap-3">

            <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tighter leading-[0.9] text-white">
              {title}
            </h3>

            <div className="shrink-0 w-9 h-9 border border-white bg-white text-black flex items-center justify-center transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:border-white">
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>

          </div>

        </div>

      </div>

    </Link>
  );
}