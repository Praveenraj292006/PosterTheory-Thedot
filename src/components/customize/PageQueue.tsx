import React from 'react';
import { motion } from 'motion/react';
import { type PageItem } from '../../config/paperSizes';

interface Props {
  pages: PageItem[];
  activePageIdx: number;
  onSelectPage: (idx: number) => void;
  onClearAll: () => void;
  sizePrices?: Record<string, number>;
  layoutPrices?: Record<string, number>;
}

export default function PageQueue({ pages, activePageIdx, onSelectPage, onClearAll, sizePrices = {}, layoutPrices = {} }: Props) {
  if (pages.length === 0) return null;

  const getPrice = (page: PageItem) => {
    return layoutPrices[`${page.size}-${page.layout}`] || (sizePrices[page.size] || 0) * page.panelCount;
  };

  return (
    <div className="mt-10 pt-6 border-t-2 border-z-border">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-mono font-black uppercase tracking-[0.3em] text-z-ink/70 dark:text-z-ink/80">Pages [{pages.length}]</p>
        <button onClick={onClearAll} className="text-[12px] font-mono font-bold uppercase text-red-500 hover:underline active:scale-95 transition-transform">Clear All</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3">
        {pages.map((page, idx) => (
          <motion.div key={page.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={() => onSelectPage(idx)}
            className={`shrink-0 cursor-pointer transition-all active:scale-[0.97] ${
              activePageIdx === idx ? 'opacity-100' : 'opacity-60 hover:opacity-90'
            }`}>
            <div className="w-32 h-32 flex items-center justify-center">
              {page.previewUrl ? (
                <img src={page.previewUrl} alt="" className="max-w-full max-h-full object-contain shadow-md" />
              ) : (
                <div className="w-20 h-28 bg-white border-2 border-dashed border-z-border flex items-center justify-center">
                  <span className="text-[9px] font-mono text-z-ink/40">Empty</span>
                </div>
              )}
            </div>
            <div className={`mt-2 pt-2 text-center ${activePageIdx === idx ? 'border-t-2 border-z-ink' : 'border-t border-transparent'}`}>
              <p className="text-[10px] font-mono font-black uppercase text-z-ink">{page.size}{page.orientation[0].toUpperCase()} · {page.layout}</p>
              <p className="text-[9px] font-mono text-z-ink/50">
                {page.printStyle === 'white-margin' ? 'Margin' : 'Borderless'}
                {page.hasImage && <span> · ₹{getPrice(page)}</span>}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
