import React from 'react';
import { Upload, Minimize, Maximize, AlignCenter, ZoomIn, ZoomOut, RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import type { PrintStyle, LayoutConfig } from '../../config/paperSizes';
import type { FramePriceEntry, MaterialPriceEntry } from '../../hooks/useCustomizeConfig';

interface Props {
  activePage: { size: string; orientation: string; printStyle: PrintStyle; layout: string; panelCount: number; splitDirection: string; hasImage: boolean };
  paperSizes: Record<string, [number, number]>;
  layouts: LayoutConfig[];
  portraitOnly: string[];
  framePricing: FramePriceEntry[];
  materialPricing: MaterialPriceEntry[];
  withFrame: boolean;
  frameColor: 'Black' | 'White';
  selectedMaterial: string;
  frameOnly: boolean;
  onChangeSize: (size: string) => void;
  onToggleOrientation: () => void;
  onUpdatePrintStyle: (style: PrintStyle) => void;
  onChangeLayout: (name: string, panelCount: number) => void;
  onChangeSplitDirection: (dir: 'vertical' | 'horizontal') => void;
  onSetWithFrame: (v: boolean) => void;
  onSetFrameColor: (c: 'Black' | 'White') => void;
  onSetMaterial: (m: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFit: () => void;
  onFill: () => void;
  onCenter: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onRemovePage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function SettingsPanel({ activePage, paperSizes, layouts, portraitOnly, framePricing, materialPricing, withFrame, frameColor, selectedMaterial, frameOnly, onChangeSize, onToggleOrientation, onUpdatePrintStyle, onChangeLayout, onChangeSplitDirection, onSetWithFrame, onSetFrameColor, onSetMaterial, onUpload, onFit, onFill, onCenter, onZoomIn, onZoomOut, onRotateCW, onRotateCCW, onRemovePage, fileInputRef }: Props) {
  const isPortraitOnly = portraitOnly.includes(activePage.size);
  const isBookmark = activePage.size === 'Bookmark';
  const frameEntry = framePricing.find(f => f.size_name === activePage.size);

  return (
    <div className="bg-z-paper border-2 border-z-border p-3 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
      <h4 className="text-[12px] font-mono font-black uppercase tracking-widest text-z-ink dark:text-z-ink mb-4 pb-2 border-b border-z-border">Settings</h4>

      {/* Frame */}
      {!isBookmark && <div className="mb-5">
        <label className="text-[11px] font-mono font-black uppercase tracking-wider text-z-ink/70 dark:text-z-ink/80 block mb-2">Frame</label>
        {frameOnly ? (
          <div className="py-2 text-[10px] font-mono font-black uppercase border-2 bg-z-ink text-z-paper border-z-ink text-center">With Frame</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onSetWithFrame(false)}
              className={`py-2 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${!withFrame ? 'bg-z-ink text-z-paper border-z-ink' : 'bg-z-paper text-z-ink border-z-border hover:border-z-ink'}`}>
              No Frame
            </button>
            <button onClick={() => onSetWithFrame(true)}
              className={`py-2 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${withFrame ? 'bg-z-ink text-z-paper border-z-ink' : 'bg-z-paper text-z-ink border-z-border hover:border-z-ink'}`}>
              With Frame
            </button>
          </div>
        )}
        {withFrame && frameEntry && (
          <>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(['Black', 'White'] as const).map(c => (
                <button key={c} onClick={() => onSetFrameColor(c)}
                  className={`py-2 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${frameColor === c ? 'bg-z-ink text-z-paper border-z-ink' : 'bg-z-paper text-z-ink border-z-border hover:border-z-ink'}`}>
                  {c} Matt
                </button>
              ))}
            </div>
            <p className="text-[9px] font-mono text-z-muted mt-1">1 inch · Matt finish · +&#8377;{frameEntry.price}</p>
          </>
        )}
        {withFrame && !frameEntry && <p className="text-[9px] font-mono text-z-muted mt-1">Frame not available for this size</p>}
      </div>}

      {/* Material */}
      {!isBookmark && materialPricing.length > 0 && (
        <div className="mb-5">
          <label className="text-[11px] font-mono font-black uppercase tracking-wider text-z-ink/70 dark:text-z-ink/80 block mb-2">Material</label>
          <div className="grid grid-cols-1 gap-2">
            {materialPricing.map(m => (
              <button key={m.material} onClick={() => onSetMaterial(m.material)}
                className={`py-2 text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 ${selectedMaterial === m.material ? 'bg-z-ink text-z-paper border-z-ink' : 'bg-z-paper text-z-ink border-z-border hover:border-z-ink'}`}>
                {m.material}{m.extra_price > 0 && <span className="ml-1 opacity-70">+&#8377;{m.extra_price}</span>}
              </button>
            ))}
          </div>
          <p className="text-[9px] font-mono text-z-muted mt-2 leading-relaxed">
            {selectedMaterial === 'METALLIC SHEET'
              ? 'Metal poster — Premium metal posters with a sleek finish and long-lasting durability'
              : 'Art poster — High-quality paper prints with vibrant colors and sharp details'}
          </p>
        </div>
      )}

      {/* Paper Size — hidden for frame-only sizes */}
      {!frameOnly && !isBookmark && <div className="mb-5">
        <label className="text-[11px] font-mono font-black uppercase tracking-wider text-z-ink/70 dark:text-z-ink/80 block mb-2">Paper Size</label>
        <select value={activePage.size} onChange={(e) => onChangeSize(e.target.value)}
          className="w-full h-10 px-3 text-[12px] font-mono font-black uppercase border-2 border-z-border bg-z-paper text-z-ink cursor-pointer">
          {Object.keys(paperSizes).map(s => <option key={s} value={s}>{s} ({paperSizes[s][0]}×{paperSizes[s][1]}mm)</option>)}
        </select>
      </div>}

      <div className="mb-5">
        <label className="text-[11px] font-mono font-black uppercase tracking-wider text-z-ink/70 dark:text-z-ink/80 block mb-2">Orientation</label>
        {isPortraitOnly ? (
          <div className="py-2.5 text-[12px] font-mono font-black uppercase border-2 border-z-border bg-z-paper text-z-ink text-center">Portrait Only</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { if (activePage.orientation !== 'portrait') onToggleOrientation(); }}
              className={`py-2.5 text-[10px] sm:text-[12px] font-mono font-black uppercase border-2 transition-all active:scale-95 truncate ${activePage.orientation === 'portrait' ? 'bg-z-ink text-z-paper border-z-ink' : 'bg-z-paper text-z-ink border-z-border hover:border-z-ink'}`}>
              Portrait
            </button>
            <button onClick={() => { if (activePage.orientation !== 'landscape') onToggleOrientation(); }}
              className={`py-2.5 text-[10px] sm:text-[12px] font-mono font-black uppercase border-2 transition-all active:scale-95 truncate ${activePage.orientation === 'landscape' ? 'bg-z-ink text-z-paper border-z-ink' : 'bg-z-paper text-z-ink border-z-border hover:border-z-ink'}`}>
              Landscape
            </button>
          </div>
        )}
      </div>

      <div className="mb-5">
        <label className="text-[11px] font-mono font-black uppercase tracking-wider text-z-ink/70 dark:text-z-ink/80 block mb-2">Print Style</label>
        {frameOnly || withFrame || activePage.panelCount > 1 ? (
          <div className="py-2.5 text-[12px] font-mono font-black uppercase border-2 border-z-border bg-z-paper text-z-muted text-center">
            Without Margin{frameOnly || withFrame ? ' (Frame)' : ' (multi-panel)'}
          </div>
        ) : (isBookmark || activePage.size === 'Polaroid' || activePage.size === 'Pocket') ? (
          <div className="py-2.5 text-[12px] font-mono font-black uppercase border-2 border-z-border bg-z-paper text-z-muted text-center">With Margin Only</div>
        ) : (
          <select value={activePage.printStyle} onChange={(e) => onUpdatePrintStyle(e.target.value as PrintStyle)}
            className="w-full h-10 px-3 text-[12px] font-mono font-black uppercase border-2 border-z-border bg-z-paper text-z-ink cursor-pointer">
            <option value="full-bleed">Without Margin</option>
            <option value="white-margin">With Margin</option>
          </select>
        )}
      </div>

      {/* Layout — hidden for frame-only sizes */}
      {!frameOnly && !isBookmark && activePage.size !== 'Polaroid' && activePage.size !== 'Pocket' && (
      <div className="mb-5">
        <label className="text-[11px] font-mono font-black uppercase tracking-wider text-z-ink/70 dark:text-z-ink/80 block mb-2">Layout (Split)</label>
        <div className="grid grid-cols-2 gap-2">
          {layouts.map(l => {
            const desc = l.panel_count === 1 ? '□' : l.panel_count === 2 ? '▌▐' : l.panel_count === 3 ? '▍▍▍' : l.panel_count === 4 ? '⊞' : l.panel_count === 9 ? '▦' : `${l.panel_count}P`;
            return (
              <button key={l.name} onClick={() => onChangeLayout(l.name, l.panel_count)}
                className={`py-2.5 text-[9px] sm:text-[11px] font-mono font-black uppercase border-2 transition-all active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5 min-w-0 overflow-hidden ${activePage.layout === l.name ? 'bg-z-ink text-z-paper border-z-ink' : 'bg-z-paper text-z-ink border-z-border hover:border-z-ink'}`}>
                <span className="text-[12px] sm:text-[14px] shrink-0">{desc}</span> <span className="truncate">{l.name}</span>
              </button>
            );
          })}
        </div>
        {activePage.panelCount > 1 && activePage.panelCount < 4 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button onClick={() => onChangeSplitDirection('vertical')}
              className={`py-2 text-[9px] sm:text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 flex items-center justify-center gap-1 min-w-0 overflow-hidden ${activePage.splitDirection === 'vertical' ? 'bg-z-ink text-z-paper border-z-ink' : 'bg-z-paper text-z-ink border-z-border hover:border-z-ink'}`}>
              <span className="text-[13px] shrink-0">│</span> <span className="truncate">Vertical</span>
            </button>
            <button onClick={() => onChangeSplitDirection('horizontal')}
              className={`py-2 text-[9px] sm:text-[10px] font-mono font-black uppercase border-2 transition-all active:scale-95 flex items-center justify-center gap-1 min-w-0 overflow-hidden ${activePage.splitDirection === 'horizontal' ? 'bg-z-ink text-z-paper border-z-ink' : 'bg-z-paper text-z-ink border-z-border hover:border-z-ink'}`}>
              <span className="text-[13px] shrink-0">─</span> <span className="truncate">Horizontal</span>
            </button>
          </div>
        )}
        {activePage.panelCount > 1 && (
          <p className="text-[10px] font-mono text-z-ink/50 dark:text-z-ink/60 mt-2 uppercase">
            {activePage.panelCount === 4 ? '2×2 grid' : activePage.panelCount === 9 ? '3×3 grid' : activePage.splitDirection === 'vertical' ? `${activePage.panelCount} side-by-side` : `${activePage.panelCount} stacked`} — {activePage.panelCount}× {activePage.size} prints
          </p>
        )}
      </div>
      )}

      <label className="w-full h-11 bg-z-ink text-z-paper text-[10px] sm:text-[12px] font-mono font-black uppercase border-2 border-z-ink cursor-pointer flex items-center justify-center gap-2 hover:opacity-80 transition-opacity active:scale-95 overflow-hidden">
        <Upload className="w-4 h-4 shrink-0" /> <span className="truncate">{activePage.hasImage ? 'Replace Image' : 'Upload or Drag & Drop'}</span>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
      </label>

      <div className="mt-5 pt-4 border-t border-z-border">
        <label className="text-[11px] font-mono font-black uppercase tracking-wider text-z-ink/70 dark:text-z-ink/80 block mb-3">Controls</label>
        <div className="grid grid-cols-4 gap-1.5">
          <button onClick={onFit} className="h-9 bg-z-paper border-2 border-z-border flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all active:scale-95" title="Fit"><Minimize className="w-4 h-4" /></button>
          <button onClick={onFill} className="h-9 bg-z-paper border-2 border-z-border flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all active:scale-95" title="Fill"><Maximize className="w-4 h-4" /></button>
          <button onClick={onCenter} className="h-9 bg-z-paper border-2 border-z-border flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all active:scale-95" title="Center"><AlignCenter className="w-4 h-4" /></button>
          <button onClick={onZoomIn} className="h-9 bg-z-paper border-2 border-z-border flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all active:scale-95"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={onZoomOut} className="h-9 bg-z-paper border-2 border-z-border flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all active:scale-95"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={onRotateCCW} className="h-9 bg-z-paper border-2 border-z-border flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all active:scale-95"><RotateCcw className="w-4 h-4" /></button>
          <button onClick={onRotateCW} className="h-9 bg-z-paper border-2 border-z-border flex items-center justify-center hover:bg-z-ink hover:text-z-paper transition-all active:scale-95"><RotateCw className="w-4 h-4" /></button>
          <button onClick={onRemovePage} className="h-9 bg-red-500 text-white border-2 border-red-600 flex items-center justify-center hover:bg-red-600 transition-all active:scale-95"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
