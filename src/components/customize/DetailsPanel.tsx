import React from 'react';
import { ShoppingBag } from 'lucide-react';
import type { PageItem } from '../../config/paperSizes';
import type { FramePriceEntry, MaterialPriceEntry } from '../../hooks/useCustomizeConfig';

interface Props {
  activePage: PageItem | null;
  filledPages: PageItem[];
  saving: boolean;
  onAddToCart: () => void;
  sizePrices: Record<string, number>;
  layoutPrices: Record<string, number>;
  withFrame: boolean;
  framePricing: FramePriceEntry[];
  materialPricing: MaterialPriceEntry[];
  selectedMaterial: string;
}

export default function DetailsPanel({ activePage, filledPages, saving, onAddToCart, sizePrices, layoutPrices, withFrame, framePricing, materialPricing, selectedMaterial }: Props) {
  const getPrice = (p: PageItem) => {
    const base = layoutPrices[`${p.size}-${p.layout}`] || (sizePrices[p.size] || 0) * p.panelCount;
    const frameEntry = framePricing.find(f => f.size_name === p.size);
    const frameCost = withFrame && frameEntry ? frameEntry.price : 0;
    const materialExtra = materialPricing.find(m => m.material === selectedMaterial)?.extra_price ?? 0;
    return base + frameCost + materialExtra;
  };
  return (
    <div className="space-y-4">
      {/* Image Details */}
      <div className="bg-z-paper border-2 border-z-border p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
        <h4 className="text-[12px] font-mono font-black uppercase tracking-widest text-z-ink mb-4 pb-2 border-b border-z-border">Image Details</h4>
        {activePage?.hasImage ? (
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-z-ink/70 dark:text-z-ink/80 block mb-1">Resolution</span>
              <span className="text-[14px] font-mono font-black text-z-ink">{activePage.imageWidth} × {activePage.imageHeight} px</span>
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-z-ink/70 dark:text-z-ink/80 block mb-1">File</span>
              <span className="text-[12px] font-mono text-z-ink truncate block">{activePage.fileName}</span>
            </div>
          </div>
        ) : (
          <p className="text-[12px] font-mono text-z-ink/50 dark:text-z-ink/60 uppercase text-center py-4">No image uploaded</p>
        )}
      </div>

      {/* Order */}
      <div className="bg-z-paper border-2 border-z-border p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
        <h4 className="text-[12px] font-mono font-black uppercase tracking-widest text-z-ink mb-4 pb-2 border-b border-z-border">Order</h4>
        {filledPages.length > 0 ? (
          <div className="space-y-2 mb-4">
            {filledPages.map((p) => (
              <div key={p.id} className="text-[12px] font-mono uppercase">
                <div className="flex justify-between">
                  <span className="text-z-ink/70 dark:text-z-ink/80">{p.size} {p.orientation.slice(0, 1)} · {p.layout}</span>
                  <span className="font-black text-z-ink">₹{getPrice(p)}</span>
                </div>
                {p.panelCount > 1 && (
                  <p className="text-[10px] text-z-ink/40 dark:text-z-ink/50 mt-0.5">{p.panelCount}× {p.size} sheets</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] font-mono text-z-ink/50 dark:text-z-ink/60 uppercase text-center py-2 mb-4">No prints ready</p>
        )}

        <div className="border-t-2 border-z-border pt-3 flex justify-between items-baseline mb-4">
          <span className="text-[12px] font-mono font-black uppercase text-z-ink/70 dark:text-z-ink/80">{filledPages.length} print{filledPages.length !== 1 ? 's' : ''}</span>
          <span className="text-xl font-display font-black text-z-ink">₹{filledPages.reduce((s, p) => s + getPrice(p), 0)}</span>
        </div>

        <button
          onClick={onAddToCart}
          disabled={saving || filledPages.length === 0}
          className="w-full sticker-btn py-3 text-[12px] bg-z-ink text-z-paper disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-2 active:scale-95"
        >
          {saving ? 'Processing...' : <><ShoppingBag className="w-4 h-4" /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}
