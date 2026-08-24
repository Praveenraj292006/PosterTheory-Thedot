import React, { useState, useEffect } from 'react';
import { Plus, Eye, Download, X, ChevronRight, ImagePlus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import SettingsPanel from '../components/customize/SettingsPanel';
import DetailsPanel from '../components/customize/DetailsPanel';
import PageQueue from '../components/customize/PageQueue';
import { useCanvasEditor } from '../hooks/useCanvasEditor';
import { useCustomizeConfig } from '../hooks/useCustomizeConfig';

const TUTORIAL_STEPS = [
  { title: 'Add Image', desc: 'Click "ADD IMAGE" to create a new page for your print.' },
  { title: 'Choose Settings', desc: 'Select paper size, orientation, and print style from the left panel.' },
  { title: 'Upload & Adjust', desc: 'Upload your image, then drag/zoom/rotate it on the canvas.' },
  { title: 'Preview & Cart', desc: 'Preview your design, then add to cart when ready.' },
];

export default function Customize() {
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetSize = searchParams.get('size');
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const { sizes, paperSizes, customMargins, sizePrices, layoutPrices, layouts, portraitOnly, framePricing, materialPricing, loading: configLoading } = useCustomizeConfig();

  const [withFrame, setWithFrame] = useState(false);
  const [frameColor, setFrameColor] = useState<'Black' | 'White'>('Black');
  const [selectedMaterial, setSelectedMaterial] = useState('PAPER');

  useEffect(() => {
    const seen = localStorage.getItem('customize_tutorial_seen');
    if (!seen) setShowTutorial(true);
  }, []);

  const editor = useCanvasEditor();
  const { activePage, pages, activePageIdx, dims, paperMm, filledPages, saving, previewMode, imageDims, canvasElRef, fileInputRef } = editor;

  // Calculate scale for mobile
  const [canvasScale, setCanvasScale] = useState(1);
  useEffect(() => {
    const updateScale = () => {
      const available = Math.min(window.innerWidth - 32, 1200);
      const needed = dims.width + 40;
      setCanvasScale(needed > available ? available / needed : 1);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [dims.width]);

  const scaledWidth = (dims.width) * canvasScale;
  const scaledHeight = (dims.height) * canvasScale;

  const frameOnly = activePage ? (sizes.find(s => s.name === activePage.size)?.frame_only ?? false) : false;

  useEffect(() => {
    if (frameOnly) {
      setWithFrame(true);
      editor.updatePrintStyle('full-bleed');
    }
  }, [frameOnly]);

  const handleSetWithFrame = (v: boolean) => {
    setWithFrame(v);
    if (v) editor.updatePrintStyle('full-bleed');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) editor.handleImageUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getPagePrice = (page: typeof activePage) => {
    if (!page) return 0;
    const base = layoutPrices[`${page.size}-${page.layout}`] || (sizePrices[page.size] || 0) * page.panelCount;
    const frameEntry = framePricing.find(f => f.size_name === page.size);
    const frameCost = withFrame && frameEntry ? frameEntry.price : 0;
    const materialExtra = materialPricing.find(m => m.material === selectedMaterial)?.extra_price ?? 0;
    return base + frameCost + materialExtra;
  };

  const doAddToCart = () => {
    for (let i = 0; i < filledPages.length; i++) {
      const page = filledPages[i];
      addToCart({
        id: Date.now() + i,
        title: `${page.size} ${page.orientation} ${page.layout} Print`,
        price: getPagePrice(page),
        image: page.previewUrl || '',
        collection: 'CUSTOM',
        size: `${page.size} ${page.orientation}`,
        designId: 'custom-' + page.id,
        isCustom: true,
        customSpecs: { size: page.size, unitCount: page.panelCount, layout: page.layout, panelCount: page.panelCount, printStyle: page.printStyle, material: selectedMaterial, frame: withFrame ? frameColor : 'None', fileNames: [`${page.fileName} (${page.size} ${page.orientation} ${page.printStyle} ${page.layout})`] }
      });
    }
    localStorage.removeItem('customize_pages');
    localStorage.removeItem('customize_activeIdx');
    navigate('/cart');
  };

  const handleAddToCart = () => {
    if (filledPages.length === 0) { alert("ADD_IMAGES_FIRST"); return; }
    if (!user) {
      sessionStorage.setItem('customize_pending_cart', '1');
      navigate('/login?redirect=/customize');
      return;
    }
    doAddToCart();
  };

  // Auto add to cart after login if pages are ready and config is loaded
  useEffect(() => {
    if (user && !configLoading && filledPages.length > 0) {
      const pending = sessionStorage.getItem('customize_pending_cart');
      if (pending === '1') {
        sessionStorage.removeItem('customize_pending_cart');
        doAddToCart();
      }
    }
  }, [user, configLoading, filledPages.length]);

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('customize_tutorial_seen', '1');
  };

  return (
    <div className="pt-24 sm:pt-40 pb-32 min-h-screen px-4 sm:px-6">
      {/* Mobile Notice */}
      <div className="lg:hidden mb-4 bg-amber-50 border-2 border-amber-300 p-3 text-center">
        <p className="text-[11px] font-mono font-bold text-amber-800 uppercase">Switch to desktop for a better editing experience</p>
      </div>
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-z-paper border-2 border-z-border p-8 max-w-md w-full shadow-[8px_8px_0px_0px_var(--color-z-shadow)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-black text-xl uppercase tracking-tight">Quick Guide</h3>
              <button onClick={dismissTutorial} className="p-1 hover:bg-z-ink hover:text-z-paper transition-all"><X className="w-4 h-4" /></button>
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-z-ink text-z-paper w-6 h-6 flex items-center justify-center text-[10px] font-mono font-black">{tutorialStep + 1}</span>
                <span className="font-display font-black text-sm uppercase">{TUTORIAL_STEPS[tutorialStep].title}</span>
              </div>
              <p className="text-[12px] font-mono text-z-muted leading-relaxed">{TUTORIAL_STEPS[tutorialStep].desc}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {TUTORIAL_STEPS.map((_, i) => (
                  <div key={i} className={`w-2 h-2 border border-z-border ${i === tutorialStep ? 'bg-z-ink' : 'bg-z-paper'}`} />
                ))}
              </div>
              {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                <button onClick={() => setTutorialStep(s => s + 1)} className="sticker-btn text-[10px] px-4 py-2 flex items-center gap-1">
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              ) : (
                <button onClick={dismissTutorial} className="sticker-btn text-[10px] px-4 py-2">Got it!</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="mb-6 sm:mb-12 border-b-4 border-z-border pb-6 sm:pb-10 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <p className="text-[11px] sm:text-[13px] font-mono uppercase tracking-[0.3em] sm:tracking-[0.5em] text-z-ink font-black mb-2 sm:mb-4">Custom_Print_Studio</p>
            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-8xl uppercase tracking-tighter leading-none italic">
              <span className="text-outline">Design</span>_Lab
            </h1>
          </div>
          <Logo size="md" className="mt-4 md:mt-0 hidden sm:block" />
        </header>

        {/* Preview Floating Window */}
        {previewMode && activePage?.previewUrl && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => editor.setPreviewMode(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-gray-500 border-2 border-gray-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.4)] p-6 max-w-[92vw] max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
              {/* Close */}
              <button onClick={() => editor.setPreviewMode(false)} className="absolute top-3 right-3 z-20 w-8 h-8 bg-z-paper text-z-ink flex items-center justify-center hover:opacity-80 transition-all">
                <X className="w-4 h-4" />
              </button>

              <p className="text-[11px] font-mono font-black uppercase tracking-widest text-white mb-4 pr-10">
                Preview &mdash; {activePage.size} {activePage.orientation}
                {activePage.panelCount > 1 && <span> &middot; {activePage.layout} ({activePage.panelCount} sheets)</span>}
              </p>

              <div className="flex-1 flex items-center justify-center min-h-0 overflow-auto">
                {activePage.printStyle === 'white-margin' && activePage.panelCount <= 1 ? (() => {
                  const m = customMargins[activePage.size];
                  if (!m) return null;
                  const previewH = Math.min(400, window.innerHeight * 0.5);
                  const [pw, ph] = paperSizes[activePage.size] || [210, 297];
                  const [paperW, paperH] = activePage.orientation === 'portrait' ? [pw, ph] : [ph, pw];
                  const pxPerMm = previewH / paperH;
                  const padTop = Math.round(m.top * pxPerMm);
                  const padRight = Math.round(m.right * pxPerMm);
                  const padBottom = Math.round(m.bottom * pxPerMm);
                  const padLeft = Math.round(m.left * pxPerMm);
                  const imgW = Math.round((paperW - m.left - m.right) * pxPerMm);
                  const imgH = Math.round((paperH - m.top - m.bottom) * pxPerMm);
                  return (
                    <div className="bg-z-paper shadow-2xl flex items-center justify-center border border-z-border"
                      style={{ width: Math.round(paperW * pxPerMm), height: previewH, padding: `${padTop}px ${padRight}px ${padBottom}px ${padLeft}px` }}>
                      <img src={activePage.previewUrl} alt="Preview"
                        style={{ width: imgW, height: imgH, objectFit: 'cover' }} />
                    </div>
                  );
                })() : activePage.panelCount > 1 ? (() => {
                  let cols: number, rows: number;
                  if (activePage.panelCount === 4) { cols = 2; rows = 2; }
                  else if (activePage.panelCount === 9) { cols = 3; rows = 3; }
                  else if (activePage.splitDirection === 'vertical') { cols = activePage.panelCount; rows = 1; }
                  else { cols = 1; rows = activePage.panelCount; }

                  const sheetW = paperMm.w;
                  const sheetH = paperMm.h;
                  const totalW = sheetW * cols;
                  const totalH = sheetH * rows;
                  const maxW = window.innerWidth * 0.75;
                  const maxH = window.innerHeight * 0.6;
                  const scale = Math.min(maxW / totalW, maxH / totalH);
                  const cellW = Math.round(sheetW * scale);
                  const cellH = Math.round(sheetH * scale);

                  return (
                    <div className="flex flex-col items-center">
                      <p className="text-[9px] font-mono text-white uppercase tracking-widest text-center mb-2">
                        {activePage.layout} &mdash; {cols * rows} sheets &middot; {sheetW}&times;{sheetH}mm each
                      </p>
                      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, ${cellW}px)` }}>
                        {Array.from({ length: rows * cols }).map((_, idx) => {
                          const row = Math.floor(idx / cols);
                          const col = idx % cols;
                          const bgX = cols > 1 ? (col / (cols - 1)) * 100 : 50;
                          const bgY = rows > 1 ? (row / (rows - 1)) * 100 : 50;
                          return (
                            <div key={idx} className="relative border border-dashed border-red-400"
                              style={{
                                width: cellW, height: cellH,
                                backgroundImage: `url(${activePage.previewUrl})`,
                                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                                backgroundPosition: `${bgX}% ${bgY}%`,
                              }}>
                              <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[7px] font-mono font-black px-1 py-0.5">
                                {idx + 1}/{cols * rows}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })() : (
                  <div className="shadow-2xl">
                    <img src={activePage.previewUrl} alt="Preview"
                      className={`h-auto object-contain max-h-[60vh] ${activePage.orientation === 'portrait' ? 'max-w-[40vw]' : 'max-w-[70vw]'}`} />
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-400">
                <p className="text-[10px] font-mono text-white uppercase tracking-wider">
                  {paperMm.w}&times;{paperMm.h} mm per sheet
                  {activePage.printStyle === 'white-margin' && customMargins[activePage.size]
                    ? ` | Margin: ${customMargins[activePage.size].top}/${customMargins[activePage.size].right}/${customMargins[activePage.size].bottom}/${customMargins[activePage.size].left} mm`
                    : ' | No margin'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* New Page Bar */}
        <div className="bg-z-paper border-2 border-z-border p-3 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] sm:text-[13px] font-display font-black uppercase tracking-tight text-z-ink">Upload your image & customize</p>
              <p className="text-[9px] sm:text-[11px] font-mono text-z-ink/60 dark:text-z-ink/70 uppercase tracking-wider mt-1">Choose size, orientation & style after adding a page</p>
            </div>
            <button onClick={() => editor.addPage(presetSize || undefined)} className="sticker-btn bg-z-ink text-z-paper text-[10px] sm:text-[11px] px-4 sm:px-5 py-2 sm:py-2.5 inline-flex items-center gap-2 active:scale-95 w-full sm:w-auto justify-center">
              <ImagePlus className="w-4 h-4" /> ADD IMAGE
            </button>
          </div>
        </div>

        {/* Page Tabs */}
        {pages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4 sm:mb-6">
            {pages.map((page, idx) => (
              <button key={page.id} onClick={() => editor.setActivePageIdx(idx)}
                className={`px-4 py-2 text-[11px] font-mono font-black uppercase border-2 transition-all flex items-center gap-2 active:scale-95 ${
                  activePageIdx === idx ? 'bg-z-ink text-z-paper border-z-ink' : 'bg-z-paper text-z-ink border-z-border hover:border-z-ink'
                }`}>
                P{idx + 1} &middot; {page.size}{page.orientation[0].toUpperCase()} &middot; {page.layout}
                {page.hasImage && <div className="w-2 h-2 rounded-full bg-green-400" />}
              </button>
            ))}
          </div>
        )}

        {/* Main Layout */}
        {activePage ? (
          activePage.panelCount > 1 ? (
            /* Multi-panel: settings left | canvas center (big) | details right (compact) - same row */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* LEFT - Settings */}
              <div className="lg:col-span-2">
                <SettingsPanel
                  activePage={activePage}
                  paperSizes={paperSizes}
                  layouts={layouts}
                  portraitOnly={portraitOnly}
                  framePricing={framePricing}
                  materialPricing={materialPricing}
                  withFrame={withFrame}
                  frameColor={frameColor}
                  selectedMaterial={selectedMaterial}
                  frameOnly={frameOnly}
                  onChangeSize={(s) => editor.changeSize(s, paperSizes)}
                  onToggleOrientation={editor.toggleOrientation}
                  onUpdatePrintStyle={editor.updatePrintStyle}
                  onChangeLayout={editor.changeLayout}
                  onChangeSplitDirection={editor.changeSplitDirection}
                  onSetWithFrame={handleSetWithFrame}
                  onSetFrameColor={setFrameColor}
                  onSetMaterial={setSelectedMaterial}
                  onUpload={handleFileInput}
                  onFit={editor.fitImage}
                  onFill={editor.fillImage}
                  onCenter={editor.centerImage}
                  onZoomIn={editor.zoomIn}
                  onZoomOut={editor.zoomOut}
                  onRotateCW={editor.rotateCW}
                  onRotateCCW={editor.rotateCCW}
                  onRemovePage={() => editor.removePage(activePageIdx)}
                  fileInputRef={fileInputRef}
                />
              </div>

              {/* CENTER - Canvas */}
              <div className="lg:col-span-8 flex flex-col items-center">
                <div className="text-[10px] sm:text-[12px] font-mono font-black uppercase tracking-widest text-z-ink mb-3 truncate max-w-full">
                  {activePage.size} {activePage.orientation}
                  {` \u00b7 ${activePage.layout} (${activePage.panelCount} sheets)`}
                  {' \u2014 '}
                  {paperMm.w * (activePage.panelCount === 4 ? 2 : activePage.splitDirection === 'vertical' ? activePage.panelCount : 1)}
                  {' \u00d7 '}
                  {paperMm.h * (activePage.panelCount === 4 ? 2 : activePage.splitDirection === 'horizontal' ? activePage.panelCount : 1)}
                  {' mm (combined) \u00b7 '}
                  {paperMm.w}&times;{paperMm.h} mm per sheet
                </div>

                <div className="bg-gray-200 flex items-center justify-center p-2 sm:p-5 transition-all relative overflow-hidden"
                  style={{ maxWidth: '100%', minHeight: scaledHeight + 16 }}
                  onDragOver={(e) => {
                    if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); e.stopPropagation(); }
                  }}
                  onDrop={(e) => {
                    if (!e.dataTransfer.files.length) return;
                    e.preventDefault(); e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) editor.handleImageUpload(file);
                  }}>
                  <div style={{ width: scaledWidth, height: scaledHeight, overflow: 'hidden' }}>
                    <div className="shadow-[0_2px_16px_rgba(0,0,0,0.12)]" style={{ transform: `scale(${canvasScale})`, transformOrigin: 'top left' }}>
                      <canvas ref={canvasElRef} />
                    </div>
                  </div>
                </div>

                <div className="w-full mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between px-1 gap-2">
                  {imageDims ? (
                    <span className="text-[11px] font-mono font-bold uppercase text-z-ink/70 dark:text-z-ink/80">
                      Placed: {imageDims.placedW} &times; {imageDims.placedH} mm{imageDims.rotation !== 0 && ` \u00b7 ${imageDims.rotation}\u00b0`}
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-z-ink/50 dark:text-z-ink/60 uppercase">Upload an image to begin</span>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => editor.setPreviewMode(true)} disabled={!activePage.hasImage}
                      className="text-[11px] font-mono font-black uppercase border-2 border-z-border px-3 py-1.5 hover:bg-z-ink hover:text-z-paper transition-all disabled:opacity-30 flex items-center gap-1.5 active:scale-95">
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    {user?.is_admin && (
                      <button onClick={() => editor.exportPreview(token)} disabled={!activePage.hasImage}
                        className="text-[11px] font-mono font-black uppercase border-2 border-z-border px-3 py-1.5 hover:bg-z-ink hover:text-z-paper transition-all disabled:opacity-30 flex items-center gap-1.5 active:scale-95">
                        <Download className="w-3.5 h-3.5" /> Save 300DPI
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT - Details (compact) */}
              <div className="lg:col-span-2">
                <DetailsPanel activePage={activePage} filledPages={filledPages} saving={saving} onAddToCart={handleAddToCart} sizePrices={sizePrices} layoutPrices={layoutPrices} withFrame={withFrame} framePricing={framePricing} materialPricing={materialPricing} selectedMaterial={selectedMaterial} />
              </div>
            </div>
          ) : (
            /* Single panel: standard 3-column layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT */}
              <div className="lg:col-span-3">
                <SettingsPanel
                  activePage={activePage}
                  paperSizes={paperSizes}
                  layouts={layouts}
                  portraitOnly={portraitOnly}
                  framePricing={framePricing}
                  materialPricing={materialPricing}
                  withFrame={withFrame}
                  frameColor={frameColor}
                  selectedMaterial={selectedMaterial}
                  frameOnly={frameOnly}
                  onChangeSize={(s) => editor.changeSize(s, paperSizes)}
                  onToggleOrientation={editor.toggleOrientation}
                  onUpdatePrintStyle={editor.updatePrintStyle}
                  onChangeLayout={editor.changeLayout}
                  onChangeSplitDirection={editor.changeSplitDirection}
                  onSetWithFrame={handleSetWithFrame}
                  onSetFrameColor={setFrameColor}
                  onSetMaterial={setSelectedMaterial}
                  onUpload={handleFileInput}
                  onFit={editor.fitImage}
                  onFill={editor.fillImage}
                  onCenter={editor.centerImage}
                  onZoomIn={editor.zoomIn}
                  onZoomOut={editor.zoomOut}
                  onRotateCW={editor.rotateCW}
                  onRotateCCW={editor.rotateCCW}
                  onRemovePage={() => editor.removePage(activePageIdx)}
                  fileInputRef={fileInputRef}
                />
              </div>

              {/* CENTER */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="text-[10px] sm:text-[12px] font-mono font-black uppercase tracking-widest text-z-ink mb-3 truncate max-w-full">
                  {activePage.size} {activePage.orientation}
                  {' \u2014 '}
                  {paperMm.w} &times; {paperMm.h} mm
                  {activePage.printStyle === 'white-margin' && (
                    <span className="text-z-ink/50 dark:text-z-ink/60 ml-2">
                      (image: {paperMm.w - (activePage.size.startsWith('A') ? 10 : (customMargins[activePage.size]?.left || 5) + (customMargins[activePage.size]?.right || 5))}&times;{paperMm.h - (activePage.size.startsWith('A') ? 10 : (customMargins[activePage.size]?.top || 5) + (customMargins[activePage.size]?.bottom || 5))}mm + border on export)
                    </span>
                  )}
                </div>

                <div className="bg-gray-200 flex items-center justify-center p-2 sm:p-5 transition-all relative overflow-hidden"
                  style={{ maxWidth: '100%', minHeight: scaledHeight + 16 }}
                  onDragOver={(e) => {
                    if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); e.stopPropagation(); }
                  }}
                  onDrop={(e) => {
                    if (!e.dataTransfer.files.length) return;
                    e.preventDefault(); e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) editor.handleImageUpload(file);
                  }}>
                  <div style={{ width: scaledWidth, height: scaledHeight, overflow: 'hidden' }}>
                    <div className="shadow-[0_2px_16px_rgba(0,0,0,0.12)]" style={{ transform: `scale(${canvasScale})`, transformOrigin: 'top left' }}>
                      <canvas ref={canvasElRef} />
                    </div>
                  </div>
                </div>

                <div className="w-full mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between px-1 gap-2">
                  {imageDims ? (
                    <span className="text-[11px] font-mono font-bold uppercase text-z-ink/70 dark:text-z-ink/80">
                      Placed: {imageDims.placedW} &times; {imageDims.placedH} mm{imageDims.rotation !== 0 && ` \u00b7 ${imageDims.rotation}\u00b0`}
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-z-ink/50 dark:text-z-ink/60 uppercase">Upload an image to begin</span>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => editor.setPreviewMode(true)} disabled={!activePage.hasImage}
                      className="text-[11px] font-mono font-black uppercase border-2 border-z-border px-3 py-1.5 hover:bg-z-ink hover:text-z-paper transition-all disabled:opacity-30 flex items-center gap-1.5 active:scale-95">
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    {user?.is_admin && (
                      <button onClick={() => editor.exportPreview(token)} disabled={!activePage.hasImage}
                        className="text-[11px] font-mono font-black uppercase border-2 border-z-border px-3 py-1.5 hover:bg-z-ink hover:text-z-paper transition-all disabled:opacity-30 flex items-center gap-1.5 active:scale-95">
                        <Download className="w-3.5 h-3.5" /> Save 300DPI
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="lg:col-span-3">
                <DetailsPanel activePage={activePage} filledPages={filledPages} saving={saving} onAddToCart={handleAddToCart} sizePrices={sizePrices} layoutPrices={layoutPrices} withFrame={withFrame} framePricing={framePricing} materialPricing={materialPricing} selectedMaterial={selectedMaterial} />
              </div>
            </div>
          )
        ) : (
          <div className="border-4 border-dashed border-z-border py-24 flex flex-col items-center justify-center">
            <Plus className="w-10 h-10 text-z-ink/30 dark:text-z-ink/40 mb-4" />
            <p className="font-display font-black text-3xl uppercase tracking-tighter text-z-ink/60 dark:text-z-ink/70 italic">Create a page to start</p>
            <p className="font-mono text-[12px] uppercase tracking-widest text-z-ink/40 dark:text-z-ink/50 mt-2">Click ADD IMAGE above to begin</p>
          </div>
        )}

        {/* Queue */}
        <PageQueue pages={pages} activePageIdx={activePageIdx} onSelectPage={editor.setActivePageIdx} onClearAll={() => { editor.setPages([]); editor.setActivePageIdx(0); }} sizePrices={sizePrices} layoutPrices={layoutPrices} />
      </div>
    </div>
  );
}


