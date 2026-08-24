// Paper sizes and print configuration — loaded dynamically from DB

export type Orientation = 'portrait' | 'landscape';
export type PrintStyle = 'full-bleed' | 'white-margin';

export interface SizeConfig {
  id?: number;
  name: string;
  width_mm: number;
  height_mm: number;
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;
  frame_only?: boolean;
}

export interface LayoutConfig {
  id?: number;
  name: string;
  panel_count: number;
}

export interface PricingEntry {
  size_name: string;
  layout_name: string;
  price: number;
}

export interface CustomizeConfig {
  sizes: SizeConfig[];
  layouts: LayoutConfig[];
  pricing: PricingEntry[];
}

export type SplitDirection = 'vertical' | 'horizontal';

export interface PageItem {
  id: string;
  size: string;
  orientation: Orientation;
  printStyle: PrintStyle;
  layout: string;
  panelCount: number;
  splitDirection: SplitDirection;
  hasImage: boolean;
  fileName: string;
  imageDataUrl: string | null;
  previewUrl: string | null;
  imageWidth?: number;
  imageHeight?: number;
  quality?: 'excellent' | 'good' | 'fair' | 'poor';
}

// Fallback defaults (used while API loads or if it fails)
export const DEFAULT_SIZES: SizeConfig[] = [
  { name: 'A3', width_mm: 297, height_mm: 420, margin_top: 15, margin_bottom: 15, margin_left: 15, margin_right: 15 },
  { name: 'A4', width_mm: 210, height_mm: 297, margin_top: 12, margin_bottom: 12, margin_left: 12, margin_right: 12 },
  { name: 'A5', width_mm: 148, height_mm: 210, margin_top: 10, margin_bottom: 10, margin_left: 10, margin_right: 10 },
  { name: 'A6', width_mm: 105, height_mm: 148, margin_top: 8, margin_bottom: 8, margin_left: 8, margin_right: 8 },
  { name: 'Polaroid', width_mm: 75, height_mm: 90, margin_top: 5, margin_bottom: 20, margin_left: 5, margin_right: 5 },
  { name: 'Pocket', width_mm: 50, height_mm: 70, margin_top: 3, margin_bottom: 14, margin_left: 3, margin_right: 3 },
];

// ─── Derived helpers that work from SizeConfig[] ───

export function buildPaperSizes(sizes: SizeConfig[]): Record<string, [number, number]> {
  const map: Record<string, [number, number]> = {};
  for (const s of sizes) map[s.name] = [s.width_mm, s.height_mm];
  return map;
}

export function buildCustomMargins(sizes: SizeConfig[]): Record<string, { top: number; right: number; bottom: number; left: number; imageW: number; imageH: number }> {
  const map: Record<string, { top: number; right: number; bottom: number; left: number; imageW: number; imageH: number }> = {};
  for (const s of sizes) {
    map[s.name] = {
      top: s.margin_top,
      right: s.margin_right,
      bottom: s.margin_bottom,
      left: s.margin_left,
      imageW: s.width_mm - s.margin_left - s.margin_right,
      imageH: s.height_mm - s.margin_top - s.margin_bottom,
    };
  }
  return map;
}

export function buildSizePrices(pricing: PricingEntry[]): Record<string, number> {
  // Use the cheapest layout (Single) price per size for customize page
  const map: Record<string, number> = {};
  for (const p of pricing) {
    if (!map[p.size_name] || p.price < map[p.size_name]) {
      map[p.size_name] = p.price;
    }
  }
  return map;
}

export function buildLayoutPrices(pricing: PricingEntry[]): Record<string, number> {
  // Key: "sizeName-layoutName" → price
  const map: Record<string, number> = {};
  for (const p of pricing) {
    map[`${p.size_name}-${p.layout_name}`] = p.price;
  }
  return map;
}

// ─── Static exports for backward compat (fallback values) ───

export const PAPER_SIZES = buildPaperSizes(DEFAULT_SIZES);
export const CUSTOM_MARGINS = buildCustomMargins(DEFAULT_SIZES);
export const SIZE_PRICES: Record<string, number> = {
  'A3': 199, 'A4': 129, 'A5': 99, 'A6': 69, 'Polaroid': 49, 'Pocket': 39,
};

export const WHITE_MARGIN_MM = 5;
export const BLEED_MM = 3;
export const SAFE_MARGIN_MM = 10;
export const PORTRAIT_ONLY_SIZES = ['Polaroid', 'Pocket', 'Bookmark'];

export function getCanvasDims(size: string, orientation: Orientation, printStyle: PrintStyle, panelCount: number = 1, splitDirection: string = 'vertical', maxDim: number = 700, customMargins?: typeof CUSTOM_MARGINS, paperSizes?: typeof PAPER_SIZES) {
  const ps = paperSizes || PAPER_SIZES;
  const cm = customMargins || CUSTOM_MARGINS;
  const [w, h] = ps[size] || [210, 297];
  let [pw, ph] = orientation === 'portrait' ? [w, h] : [h, w];

  if (printStyle === 'white-margin') {
    if (cm[size]) {
      pw -= cm[size].left + cm[size].right;
      ph -= cm[size].top + cm[size].bottom;
    } else {
      pw -= WHITE_MARGIN_MM * 2;
      ph -= WHITE_MARGIN_MM * 2;
    }
  }

  // Scale canvas to represent the full combined poster area
  if (panelCount > 1) {
    if (panelCount === 4) {
      pw *= 2; ph *= 2;
    } else if (panelCount === 9) {
      pw *= 3; ph *= 3;
    } else {
      if (splitDirection === 'vertical') { pw *= panelCount; }
      else { ph *= panelCount; }
    }
  }

  // Use larger max dimension for multi-panel to give a bigger preview
  const effectiveMax = panelCount > 1 ? 900 : maxDim;
  const maxWidth = panelCount > 1 ? 880 : 680;

  if (pw > ph) {
    const scale = Math.min(effectiveMax / ph, maxWidth / pw);
    return { width: Math.round(pw * scale), height: Math.round(ph * scale), pxPerMm: scale };
  }

  const scale = Math.min(effectiveMax / Math.max(pw, ph), maxWidth / pw);
  return { width: Math.round(pw * scale), height: Math.round(ph * scale), pxPerMm: scale };
}

export function getPrintQuality(imageWidth: number, imageHeight: number, paperWmm: number, paperHmm: number): 'excellent' | 'good' | 'fair' | 'poor' {
  const inchesW = paperWmm / 25.4;
  const inchesH = paperHmm / 25.4;
  const dpiW = imageWidth / inchesW;
  const dpiH = imageHeight / inchesH;
  const dpi = Math.min(dpiW, dpiH);
  if (dpi >= 300) return 'excellent';
  if (dpi >= 200) return 'good';
  if (dpi >= 150) return 'fair';
  return 'poor';
}
