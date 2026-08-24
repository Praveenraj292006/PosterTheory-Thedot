import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductModal from './ProductModal';

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
  const { id, title, image, collection_name, layout } = props;
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative flex flex-col cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="relative">
          <div className="polaroid relative aspect-[210/297] overflow-hidden border-[1px] border-z-border p-1 bg-z-paper shadow-[4px_4px_0px_0px_var(--color-z-shadow)] transition-all duration-300 group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px]">
            <div className="tape -top-2 left-1/2 -translate-x-1/2 w-16 h-4 opacity-30 group-hover:opacity-100 transition-opacity z-10" />
            <div className="w-full h-full overflow-hidden bg-z-paper relative">
              <img
                src={image}
                alt={title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {layout && layout !== 'Single' && (
            <div className="absolute top-4 right-2 z-20 bg-z-ink text-white px-2 py-0.5 text-[8px] font-mono font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_var(--color-z-shadow)] rotate-2">
              {layout}_SYS
            </div>
          )}
        </div>

        <div className="mt-4 px-1">
          <h3 className="text-base font-display font-bold text-z-ink tracking-tighter uppercase leading-none">{title}</h3>
          <p className="text-[10px] font-mono text-z-muted uppercase mt-1">{collection_name || 'Poster'}</p>
        </div>
      </motion.div>

      {showModal && (
        <ProductModal product={props} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

export function CategoryCard({ title, image, path }: { title: string; image: string; path: string }) {
  return (
    <Link to={path} className="group relative aspect-[210/297] overflow-hidden border-2 border-z-border shadow-[8px_8px_0px_0px_var(--color-z-shadow)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all bg-z-white flex items-center justify-center p-3">
      <div className="relative w-full h-full overflow-hidden border border-z-border flex items-center justify-center bg-[#f8f8f8]">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[10px] font-mono text-z-ink/30 uppercase">No image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-z-ink/5 group-hover:opacity-0 transition-opacity" />

        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-z-ink/90 to-transparent">
          <p className="text-[11px] text-z-accent uppercase font-mono mb-2 font-bold tracking-widest opacity-80">DISCOVERY//001</p>
          <div className="flex justify-between items-end text-white">
            <h3 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tighter uppercase leading-[0.8]">{title}</h3>
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white flex items-center justify-center bg-z-accent shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] group-hover:shadow-none transition-all ml-4">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

