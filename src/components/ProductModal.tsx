import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useCustomizeConfig } from '../hooks/useCustomizeConfig';

interface Props {
  product: any;
  onClose: () => void;
}

const SINGLE_ONLY_SIZES = ['Polaroid', 'Pocket'];
const BOOKMARK_SIZES = ['Bookmark'];
const NO_FRAME_SIZES = [...SINGLE_ONLY_SIZES, ...BOOKMARK_SIZES];

export default function ProductModal({ product, onClose }: Props) {
  const { addToCart } = useCart();
  const { sizes, layouts, sizePrices, layoutPrices, portraitOnly, framePricing, materialPricing } = useCustomizeConfig();

  const [selectedSize, setSelectedSize] = useState('A4');
  const [selectedLayout, setSelectedLayout] = useState('Single');
  const [printStyle, setPrintStyle] = useState<'full-bleed' | 'white-margin'>('full-bleed');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    product.orientation === 'landscape' ? 'landscape' : 'portrait'
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState('PAPER');
  const [withFrame, setWithFrame] = useState(false);
  const [frameColor, setFrameColor] = useState<'Black' | 'White'>('Black');

  const images: string[] = useMemo(() => {
    const imgs = Array.isArray(product.images) ? product.images.filter((u: string) => u?.startsWith('http')) : [];
    if (imgs.length === 0 && product.image) return [product.image];
    return imgs;
  }, [product]);

  const productOrientation: string = product.orientation || 'both';
  const canChooseOrientation = productOrientation === 'both' && !portraitOnly.includes(selectedSize) && !BOOKMARK_SIZES.includes(selectedSize);
  const isBookmark = BOOKMARK_SIZES.includes(selectedSize);
  const isNoFrame = NO_FRAME_SIZES.includes(selectedSize);

  const selectedLayoutObj = layouts.find(l => l.name === selectedLayout);
  const panelCount = selectedLayoutObj?.panel_count || 1;
  const isSingleOnly = [...SINGLE_ONLY_SIZES, ...BOOKMARK_SIZES].includes(selectedSize);

  const productSizeIds: number[] = Array.isArray(product.available_sizes) ? product.available_sizes : [];
  const productLayoutIds: number[] = Array.isArray(product.available_layouts) ? product.available_layouts : [];

  const availableSizes = useMemo(() => {
    if (productSizeIds.length === 0) return [];
    return sizes.filter(s => s.id != null && productSizeIds.includes(s.id));
  }, [sizes, productSizeIds]);

  // Filter sizes based on frame choice:
  // Without Frame: hide frame_only sizes
  // With Frame: hide sizes that have no frame_pricing entry
  const visibleSizes = useMemo(() => {
    if (withFrame) return availableSizes.filter(s => framePricing.some(f => f.size_name === s.name));
    return availableSizes.filter(s => !s.frame_only);
  }, [availableSizes, withFrame, framePricing]);

  const availableLayouts = useMemo(() => {
    if (productLayoutIds.length === 0) return [];
    let filtered = layouts.filter(l => l.id != null && productLayoutIds.includes(l.id));
    if (isSingleOnly) filtered = filtered.filter(l => l.panel_count === 1);
    return filtered;
  }, [layouts, productLayoutIds, isSingleOnly]);

  useEffect(() => {
    if (availableSizes.length > 0 && !visibleSizes.find(s => s.name === selectedSize)) {
      setSelectedSize(visibleSizes[0]?.name ?? availableSizes[0].name);
    }
  }, [visibleSizes]);

  // Auto-enable frame when a frame-only size is selected
  useEffect(() => {
    const sizeObj = availableSizes.find(s => s.name === selectedSize);
    if (sizeObj?.frame_only && !withFrame) setWithFrame(true);
  }, [selectedSize, availableSizes]);

  useEffect(() => {
    if (availableLayouts.length > 0 && !availableLayouts.find(l => l.name === selectedLayout)) {
      setSelectedLayout(availableLayouts[0].name);
    }
  }, [availableLayouts]);

  useEffect(() => {
    if (panelCount > 1) setPrintStyle('full-bleed');
    else if (SINGLE_ONLY_SIZES.includes(selectedSize)) setPrintStyle('white-margin');
  }, [panelCount, selectedSize]);

  useEffect(() => {
    if (portraitOnly.includes(selectedSize) || BOOKMARK_SIZES.includes(selectedSize)) setOrientation('portrait');
    else if (productOrientation === 'portrait') setOrientation('portrait');
    else if (productOrientation === 'landscape') setOrientation('landscape');
  }, [selectedSize, portraitOnly, productOrientation]);

  // Reset frame when size changes and frame not available
  const frameEntry = framePricing.find(f => f.size_name === selectedSize);
  const frameAvailable = !!frameEntry;
  useEffect(() => { if (!frameAvailable) setWithFrame(false); }, [frameAvailable]);

  const materialExtra = materialPricing.find(m => m.material === selectedMaterial)?.extra_price ?? 0;

  // Price = (size base price + frame + material) × panel count
  const sizeBasePrice = sizePrices[selectedSize] || 0;
  const frameCost = !isNoFrame && withFrame && frameEntry ? frameEntry.price : 0;
  const pricePerSheet = sizeBasePrice + (isNoFrame ? 0 : frameCost) + (isNoFrame ? 0 : materialExtra);
  const price = pricePerSheet * panelCount;

  const nextImg = () => setCurrentImg(prev => (prev + 1) % images.length);
  const prevImg = () => setCurrentImg(prev => (prev - 1 + images.length) % images.length);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price,
      image: images[0],
      collection: product.collection_name || '',
      size: `${selectedSize} ${orientation} - ${selectedLayout}`,
      quantity,
      customSpecs: {
        size: selectedSize,
        orientation,
        layout: selectedLayout,
        panelCount,
        printStyle,
        unitCount: quantity,
        material: selectedMaterial,
        frame: withFrame ? frameColor : 'None',
      }
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-z-paper border-t-2 sm:border-2 border-z-border sm:shadow-[8px_8px_0px_0px_var(--color-z-shadow)] w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-none"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-20 w-8 h-8 bg-z-ink text-z-paper flex items-center justify-center hover:opacity-80">
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left - Image */}
          <div className="p-4 sm:p-6 bg-gray-50 dark:bg-z-ink/5 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[400px] border-b md:border-b-0 md:border-r border-z-border/30 relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImg}
                src={images[currentImg]}
                alt={product.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="max-h-[250px] sm:max-h-[380px] max-w-full object-contain"
              />
            </AnimatePresence>
            {images.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-z-paper border border-z-border flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-z-paper border border-z-border flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="flex gap-2 mt-4">
                  {images.map((img, idx) => (
                    <button key={idx} onClick={() => setCurrentImg(idx)}
                      className={`w-12 h-12 border-2 overflow-hidden transition-all ${currentImg === idx ? 'border-z-ink' : 'border-z-border/30 opacity-60 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right - Options */}
          <div className="p-4 sm:p-6 flex flex-col">
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tighter text-z-ink mb-1">{product.title}</h2>
            <p className="text-[10px] font-mono text-z-muted uppercase mb-3">{product.collection_name || 'Poster'}</p>

            {/* 1. Frame / No Frame — hidden for Bookmark/Polaroid/Pocket */}
            {!isNoFrame && (
              <div className="mb-4">
                <label className="text-[9px] font-mono font-black uppercase tracking-widest text-z-muted mb-2 block">Frame</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setWithFrame(false)}
                    className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${
                      !withFrame ? 'bg-z-ink text-z-paper border-z-ink' : 'border-z-border hover:border-z-ink text-z-ink'
                    }`}>Without Frame</button>
                  <button onClick={() => setWithFrame(true)}
                    className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${
                      withFrame ? 'bg-z-ink text-z-paper border-z-ink' : 'border-z-border hover:border-z-ink text-z-ink'
                    }`}>With Frame</button>
                </div>
              </div>
            )}

            {/* 2. Size — filtered by frame choice */}
            {availableSizes.length > 0 && (
              <div className="mb-4">
                <label className="text-[9px] font-mono font-black uppercase tracking-widest text-z-muted mb-2 block">Size</label>
                <div className="flex flex-wrap gap-2">
                  {visibleSizes.map(s => (
                    <button key={s.name} onClick={() => setSelectedSize(s.name)}
                      className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${
                        selectedSize === s.name ? 'bg-z-ink text-z-paper border-z-ink' : 'border-z-border hover:border-z-ink text-z-ink'
                      }`}>
                      {s.name}
                    </button>
                  ))}
                  {visibleSizes.length === 0 && <p className="text-[10px] font-mono text-z-muted italic">No sizes available for this option</p>}
                </div>
              </div>
            )}

            {/* 3. Frame color + material — only when With Frame and not a no-frame size */}
            {!isNoFrame && withFrame && (
              <>
                {frameEntry && (
                  <div className="mb-4">
                    <label className="text-[9px] font-mono font-black uppercase tracking-widest text-z-muted mb-2 block">Frame Color</label>
                    <div className="flex gap-2">
                      {(['Black', 'White'] as const).map(color => (
                        <button key={color} onClick={() => setFrameColor(color)}
                          className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${
                            frameColor === color ? 'bg-z-ink text-z-paper border-z-ink' : 'border-z-border hover:border-z-ink text-z-ink'
                          }`}>
                          {color} Matt
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] font-mono text-z-muted mt-1">1 inch frame · Matt finish · +&#8377;{frameEntry.price}</p>
                  </div>
                )}
                {!frameEntry && <p className="text-[10px] font-mono text-z-muted mb-4 italic">Frame not available for selected size</p>}
                {materialPricing.length > 0 && (
                  <div className="mb-4">
                    <label className="text-[9px] font-mono font-black uppercase tracking-widest text-z-muted mb-2 block">Material</label>
                    <div className="flex flex-wrap gap-2">
                      {materialPricing.map(m => (
                        <button key={m.material} onClick={() => setSelectedMaterial(m.material)}
                          className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${
                            selectedMaterial === m.material ? 'bg-z-ink text-z-paper border-z-ink' : 'border-z-border hover:border-z-ink text-z-ink'
                          }`}>
                          {m.material}{m.extra_price > 0 && <span className="ml-1 opacity-70">+&#8377;{m.extra_price}</span>}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] font-mono text-z-muted mt-1.5 leading-relaxed">
                      {selectedMaterial === 'METALLIC SHEET'
                        ? 'Metal poster — Premium metal posters with a sleek finish and long-lasting durability'
                        : 'Art poster — High-quality paper prints with vibrant colors and sharp details'}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Orientation — hidden for Bookmark */}
            {canChooseOrientation && (
              <div className="mb-4">
                <label className="text-[9px] font-mono font-black uppercase tracking-widest text-z-muted mb-2 block">Orientation</label>
                <div className="flex gap-2">
                  {(['portrait', 'landscape'] as const).map(o => (
                    <button key={o} onClick={() => setOrientation(o)}
                      className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${
                        orientation === o ? 'bg-z-ink text-z-paper border-z-ink' : 'border-z-border hover:border-z-ink text-z-ink'
                      }`}>{o}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Layout — hidden for Bookmark (single only) */}
            {availableLayouts.length > 0 && !isBookmark && (
              <div className="mb-4">
                <label className="text-[9px] font-mono font-black uppercase tracking-widest text-z-muted mb-2 block">Layout</label>
                <div className="flex flex-wrap gap-2">
                  {availableLayouts.map(l => (
                    <button key={l.name} onClick={() => setSelectedLayout(l.name)}
                      className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${
                        selectedLayout === l.name ? 'bg-z-ink text-z-paper border-z-ink' : 'border-z-border hover:border-z-ink text-z-ink'
                      }`}>
                      {l.name} {l.panel_count > 1 && `(${l.panel_count})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Print Style */}
            {panelCount <= 1 && !SINGLE_ONLY_SIZES.includes(selectedSize) && !isBookmark && (
              <div className="mb-4">
                <label className="text-[9px] font-mono font-black uppercase tracking-widest text-z-muted mb-2 block">Print Style</label>
                <div className="flex gap-2">
                  <button onClick={() => setPrintStyle('full-bleed')}
                    className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${
                      printStyle === 'full-bleed' ? 'bg-z-ink text-z-paper border-z-ink' : 'border-z-border hover:border-z-ink text-z-ink'
                    }`}>Borderless</button>
                  <button onClick={() => setPrintStyle('white-margin')}
                    className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${
                      printStyle === 'white-margin' ? 'bg-z-ink text-z-paper border-z-ink' : 'border-z-border hover:border-z-ink text-z-ink'
                    }`}>White Margin</button>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-5">
              <label className="text-[9px] font-mono font-black uppercase tracking-widest text-z-muted mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 border-2 border-z-border flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all active:scale-95">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-[14px] font-mono font-black text-z-ink w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 border-2 border-z-border flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all active:scale-95">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Price breakdown + Add to Cart */}
            <div className="mt-auto pt-4 border-t border-z-border/30">
              <div className="mb-3 space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-z-muted uppercase">
                  <span>Size ({selectedSize})</span><span>&#8377;{sizeBasePrice}</span>
                </div>
                {!isNoFrame && frameCost > 0 && (
                  <div className="flex justify-between text-[9px] font-mono text-z-muted uppercase">
                    <span>Frame ({frameColor} Matt)</span><span>+&#8377;{frameCost}</span>
                  </div>
                )}
                {!isNoFrame && materialExtra > 0 && (
                  <div className="flex justify-between text-[9px] font-mono text-z-muted uppercase">
                    <span>Material ({selectedMaterial})</span><span>+&#8377;{materialExtra}</span>
                  </div>
                )}
                {panelCount > 1 && (
                  <div className="flex justify-between text-[9px] font-mono text-z-muted uppercase">
                    <span>× {panelCount} panels</span><span>= &#8377;{price}</span>
                  </div>
                )}
                <div className="flex justify-between text-[9px] font-mono text-z-muted uppercase border-t border-z-border/20 pt-1">
                  <span>× {quantity} qty</span>
                  <span className="text-[14px] font-display font-black text-z-ink">&#8377;{price * quantity}</span>
                </div>
              </div>
              <button onClick={handleAddToCart}
                className={`w-full py-3 text-[11px] font-mono font-black uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[4px_4px_0px_0px_var(--color-z-shadow)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
                  added ? 'bg-green-500 text-white' : 'bg-z-ink text-z-paper'
                }`}>
                <ShoppingBag className="w-4 h-4" /> {added ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
