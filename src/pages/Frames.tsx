import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, LayoutGrid } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';

const FRAME_SIZES = [
  { label: '4" × 4"',     sub: 'Square',    price: 90,  w: 4,  h: 4  },
  { label: '6" × 4"',     sub: 'A6',        price: 100, w: 6,  h: 4  },
  { label: '7" × 5"',     sub: 'Standard',  price: 120, w: 7,  h: 5  },
  { label: '8" × 12"',    sub: 'A4',        price: 145, w: 8,  h: 12 },
  { label: '12" × 16"',   sub: 'A3',        price: 200, w: 12, h: 16 },
];

// Sample images from existing uploads for frame mockups
const SAMPLE_IMAGES = [
  '/uploads/minimal/simplify.jpg',
  '/uploads/photography/Lion.jpg',
  '/uploads/anime/07d7f323de49b16123cf7c16a2aeccac.jpg.jpeg',
  '/uploads/music/%23billieeilish.jpg',
  '/uploads/abstract/-2.jpg',
];

// Scale all sizes relative to the largest (12×16) for visual comparison
const MAX_H = 16;
const PREVIEW_MAX_H_PX = 140; // px height for the largest frame

function FrameCard({ size, index, frameColor }: { size: typeof FRAME_SIZES[0]; index: number; frameColor: 'black' | 'white' }) {
  const scale = PREVIEW_MAX_H_PX / MAX_H;
  const frameW = Math.round(size.w * scale);
  const frameH = Math.round(size.h * scale);
  const BORDER = 10;
  const imgW = frameW - BORDER * 2;
  const imgH = frameH - BORDER * 2;
  const isBlack = frameColor === 'black';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Frame mockup */}
      <div className="flex items-end justify-center" style={{ height: PREVIEW_MAX_H_PX + 20 }}>
        <div
          className="relative flex items-center justify-center transition-colors duration-300"
          style={{
            width: frameW,
            height: frameH,
            padding: BORDER,
            backgroundColor: isBlack ? '#1a1a1a' : '#f0ede8',
            boxShadow: isBlack
              ? '4px 4px 0px 0px rgba(0,0,0,0.5)'
              : '4px 4px 0px 0px rgba(0,0,0,0.15)',
          }}
        >
          {/* Inner mat line */}
          <div
            className="absolute inset-[6px] transition-colors duration-300"
            style={{ border: `1px solid ${isBlack ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}` }}
          />
          <img
            src={SAMPLE_IMAGES[index % SAMPLE_IMAGES.length]}
            alt={size.label}
            className="w-full h-full object-cover"
            style={{ width: imgW, height: imgH }}
          />
        </div>
      </div>

      {/* Size info */}
      <div className="text-center">
        <p className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-z-ink leading-none">
          {size.label}
        </p>
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-z-muted mt-0.5">
          {size.sub}
        </p>
        <p className="font-display font-black text-2xl sm:text-3xl text-z-ink mt-2">
          &#8377;{size.price}
        </p>
        <p className="text-[9px] font-mono text-z-muted uppercase tracking-wider mt-0.5">
          incl. frame + print
        </p>
      </div>
    </div>
  );
}

export default function Frames() {
  const navigate = useNavigate();
  const [frameColor, setFrameColor] = useState<'black' | 'white'>('black');
  const [view, setView] = useState<'none' | 'collection'>('none');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (view === 'collection' && products.length === 0) {
      setLoading(true);
      Promise.all([
        api.get('/api/products'),
        api.get('/api/products/customize-config'),
      ]).then(([prodRes, cfgRes]) => {
        const all = Array.isArray(prodRes.data) ? prodRes.data : [];
        const sizes: any[] = Array.isArray(cfgRes.data?.sizes) ? cfgRes.data.sizes : [];
        const bookmarkSize = sizes.find((s: any) => s.name === 'Bookmark');
        setProducts(bookmarkSize
          ? all.filter((p: any) => Array.isArray(p.available_sizes) && p.available_sizes.includes(bookmarkSize.id))
          : []
        );
      }).catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }
  }, [view]);

  return (
    <div className="pt-24 sm:pt-40 pb-16 sm:pb-32 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

        {/* ── Header ── */}
        <header className="mb-12 sm:mb-20 border-b-4 border-z-border pb-6 sm:pb-12">
          <p className="text-[11px] sm:text-[13px] font-mono uppercase tracking-[0.3em] sm:tracking-[0.5em] text-z-ink font-black mb-2 sm:mb-4">
            Premium_Frames_
          </p>
          <h1 className="font-display font-black text-5xl sm:text-8xl lg:text-9xl uppercase tracking-tighter leading-none italic">
            <span className="text-outline">Frames</span>
          </h1>
          <p className="text-[13px] sm:text-[18px] font-mono text-z-muted uppercase mt-3 tracking-widest">
            1 inch · Matt finish · Black &amp; White — price includes frame + print
          </p>
        </header>

        {/* ── Finish / Colour toggle ── */}
        <div className="flex flex-wrap gap-4 mb-12 sm:mb-20">
          {([
            { key: 'black', label: 'Black Matt', bg: '#1a1a1a', text: 'text-white' },
            { key: 'white', label: 'White Matt', bg: '#f0ede8', text: 'text-z-ink' },
          ] as const).map(c => {
            const active = frameColor === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setFrameColor(c.key)}
                className={`flex items-center gap-3 px-5 py-3 border-2 transition-all active:scale-[0.97] ${
                  active
                    ? 'shadow-none translate-x-[2px] translate-y-[2px]'
                    : 'shadow-[4px_4px_0px_0px_var(--color-z-shadow)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
                style={{
                  backgroundColor: c.bg,
                  borderColor: active ? (c.key === 'black' ? '#1a1a1a' : '#999') : 'var(--color-z-border)',
                  outline: active ? `2px solid ${c.key === 'black' ? '#1a1a1a' : '#aaa'}` : 'none',
                  outlineOffset: '2px',
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: c.bg, borderColor: c.key === 'black' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }}
                />
                <div>
                  <p className={`text-[11px] font-mono font-black uppercase tracking-widest leading-none ${c.text}`}>
                    {c.label}
                  </p>
                  <p className={`text-[9px] font-mono uppercase tracking-wider opacity-60 mt-0.5 ${c.text}`}>
                    1 inch · Matt finish
                  </p>
                </div>
                {active && (
                  <span className={`ml-1 text-[9px] font-mono font-black uppercase tracking-widest ${c.text} opacity-70`}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Size + Sample Images ── */}
        <section className="mb-16 sm:mb-24">
          <p className="text-[11px] font-mono font-black uppercase tracking-[0.4em] text-z-muted mb-8 sm:mb-12">
            Available_Sizes_&amp;_Pricing_
          </p>

          {/* Visual size comparison row */}
          <div className="overflow-x-auto pb-4">
            <div className="flex items-end gap-8 sm:gap-12 lg:gap-16 min-w-max px-2 pb-2">
              {FRAME_SIZES.map((size, i) => (
                <FrameCard key={size.label} size={size} index={i} frameColor={frameColor} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-z-border mt-12 sm:mt-16" />
        </section>

        {/* ── Specs table ── */}
        <section className="mb-16 sm:mb-24">
          <p className="text-[11px] font-mono font-black uppercase tracking-[0.4em] text-z-muted mb-6">
            Full_Specs_
          </p>
          <div className="border-2 border-z-border overflow-hidden shadow-[4px_4px_0px_0px_var(--color-z-shadow)]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-z-ink text-z-paper">
                  <th className="px-4 py-3 text-[10px] font-mono font-black uppercase tracking-widest">Size</th>
                  <th className="px-4 py-3 text-[10px] font-mono font-black uppercase tracking-widest">Equivalent</th>
                  <th className="px-4 py-3 text-[10px] font-mono font-black uppercase tracking-widest">Frame</th>
                  <th className="px-4 py-3 text-[10px] font-mono font-black uppercase tracking-widest text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {FRAME_SIZES.map((s, i) => (
                  <tr key={s.label} className={`border-t border-z-border/30 ${i % 2 === 0 ? '' : 'bg-z-ink/[0.03]'}`}>
                    <td className="px-4 py-3 font-display font-black text-sm uppercase tracking-tight">{s.label}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-z-muted uppercase">{s.sub}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-z-muted uppercase">1 inch · Black / White Matt</td>
                    <td className="px-4 py-3 font-display font-black text-base text-right">&#8377;{s.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] font-mono text-z-muted uppercase tracking-widest mt-3">
            * All prices include the frame + high-quality print. No hidden charges.
          </p>
        </section>

        {/* ── Collection Grid (toggled) ── */}
        {view === 'collection' && (
          <section className="mb-16 sm:mb-24">
            <div className="flex items-center justify-between mb-6 border-b-2 border-z-border pb-4">
              <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tighter italic">
                Framed Collection
              </h2>
              {!loading && (
                <span className="text-[11px] font-mono font-bold text-z-muted uppercase">
                  {products.length} item{products.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-z-border/10 border-2 border-z-border mb-4" />
                    <div className="h-3 bg-z-border/10 border border-z-border w-2/3 mb-2" />
                    <div className="h-3 bg-z-border/10 border border-z-border w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
                {products.map((p: any) => <ProductCard key={p.id} {...p} />)}
              </div>
            ) : (
              <div className="py-24 text-center border-4 border-dashed border-z-border">
                <p className="font-display font-black text-3xl text-z-muted uppercase italic">No framed products yet.</p>
                <p className="font-mono text-[12px] font-bold text-z-muted mt-3 uppercase tracking-[0.3em]">
                  Assign the Bookmark size to products in the admin panel.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── CTA Buttons — centered at bottom ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-8 border-t-4 border-z-border">
          <button
            onClick={() => setView(v => v === 'collection' ? 'none' : 'collection')}
            className={`flex items-center gap-3 px-8 py-4 border-2 text-[12px] font-mono font-black uppercase tracking-widest transition-all shadow-[6px_6px_0px_0px_var(--color-z-shadow)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:scale-[0.98] ${
              view === 'collection'
                ? 'bg-z-ink text-z-paper border-z-ink'
                : 'bg-z-paper text-z-ink border-z-border hover:bg-z-ink hover:text-z-paper hover:border-z-ink'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            {view === 'collection' ? 'Hide Collection' : 'Browse Collection'}
          </button>

          <button
            onClick={() => navigate('/customize?size=Bookmark')}
            className="flex items-center gap-3 px-8 py-4 border-2 border-z-border bg-z-paper text-z-ink text-[12px] font-mono font-black uppercase tracking-widest transition-all shadow-[6px_6px_0px_0px_var(--color-z-shadow)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-z-ink hover:text-z-paper hover:border-z-ink active:scale-[0.98]"
          >
            <Pencil className="w-4 h-4" />
            Customize Your Frame
          </button>
        </div>

      </div>
    </div>
  );
}
