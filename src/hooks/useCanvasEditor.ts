import { useState, useRef, useEffect } from 'react';
import { Canvas as FabricCanvas, FabricImage, Rect as FabricRect } from 'fabric';
import JSZip from 'jszip';
import {
  PAPER_SIZES, SIZE_PRICES, CUSTOM_MARGINS, WHITE_MARGIN_MM,
  PORTRAIT_ONLY_SIZES, getCanvasDims, getPrintQuality,
  type Orientation, type PrintStyle, type PageItem
} from '../config/paperSizes';


export function useCanvasEditor() {
  const [pages, setPages] = useState<PageItem[]>(() => {
    try {
      const saved = localStorage.getItem('customize_pages');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activePageIdx, setActivePageIdx] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('customize_activeIdx');
      return saved ? parseInt(saved) : 0;
    } catch { return 0; }
  });
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [imageDims, setImageDims] = useState<{ placedW: string; placedH: string; rotation: number } | null>(null);

  const canvasRef = useRef<FabricCanvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist pages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('customize_pages', JSON.stringify(pages));
      localStorage.setItem('customize_activeIdx', String(activePageIdx));
    } catch { /* localStorage full — ignore */ }
  }, [pages, activePageIdx]);

  const activePage = pages[activePageIdx] || null;
  const dims = activePage ? getCanvasDims(activePage.size, activePage.orientation, activePage.printStyle, activePage.panelCount, activePage.splitDirection) : { width: 400, height: 460, pxPerMm: 1 };

  const paperMm = activePage ? (() => {
    const ps = PAPER_SIZES[activePage.size] || [210, 297];
    return activePage.orientation === 'portrait'
      ? { w: ps[0], h: ps[1] }
      : { w: ps[1], h: ps[0] };
  })() : { w: 0, h: 0 };

  const filledPages = pages.filter(p => p.hasImage);

  // Canvas initialization
  useEffect(() => {
    if (!canvasElRef.current || !activePage) return;

    if (canvasRef.current) {
      canvasRef.current.dispose();
      canvasRef.current = null;
    }

    const canvas = new FabricCanvas(canvasElRef.current, {
      width: dims.width,
      height: dims.height,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      controlsAboveOverlay: true,
    });

    const updateDims = () => {
      const obj = canvas.getActiveObject();
      if (obj && obj.type === 'image') {
        setImageDims({
          placedW: (((obj.width || 0) * (obj.scaleX || 1)) / dims.pxPerMm).toFixed(1),
          placedH: (((obj.height || 0) * (obj.scaleY || 1)) / dims.pxPerMm).toFixed(1),
          rotation: Math.round(obj.angle || 0),
        });
      }
    };

    const savePreview = () => {
      if (canvasRef.current !== canvas) return; // canvas was disposed/replaced
      try {
        const panelLines = canvas.getObjects().filter(o => o.type === 'rect' && !o.selectable);
        panelLines.forEach(o => o.set('visible', false));
        canvas.renderAll();
        const url = canvas.toDataURL({ format: 'png', multiplier: 1, quality: 1, enableRetinaScaling: false });
        panelLines.forEach(o => o.set('visible', true));
        canvas.renderAll();
        setPages(prev => prev.map((p, i) => i === activePageIdx ? { ...p, previewUrl: url } : p));
      } catch { /* canvas disposed mid-operation */ }
    };

    canvas.on('object:scaling', updateDims);
    canvas.on('object:rotating', updateDims);
    canvas.on('object:moving', updateDims);
    canvas.on('object:modified', () => { updateDims(); savePreview(); });
    canvas.on('selection:created', updateDims);
    canvas.on('selection:updated', updateDims);
    canvas.on('selection:cleared', () => setImageDims(null));

    canvasRef.current = canvas;
    setImageDims(null);

    if (activePage.imageDataUrl) {
      setTimeout(() => {
        if (canvasRef.current !== canvas) return; // canvas was replaced
        placeImageOnCanvas(canvas, activePage.imageDataUrl!, activePage.printStyle);
        setTimeout(() => {
          if (canvasRef.current !== canvas) return; // canvas was replaced
          drawPanelLines(canvas, activePage.panelCount, dims.width, dims.height, activePage.splitDirection);
          savePreview();
        }, 80);
      }, 50);
    } else {
      drawPanelLines(canvas, activePage.panelCount, dims.width, dims.height, activePage.splitDirection);
    }

    return () => { canvas.dispose(); canvasRef.current = null; };
  }, [activePage?.id, activePage?.size, activePage?.orientation, activePage?.printStyle, activePage?.panelCount, activePage?.splitDirection]);

  const drawPanelLines = (canvas: FabricCanvas, panelCount: number, canvasW: number, canvasH: number, splitDirection: string) => {
    if (panelCount <= 1) return;

    let cols: number, rows: number;
    if (panelCount === 4) {
      cols = 2; rows = 2;
    } else if (panelCount === 9) {
      cols = 3; rows = 3;
    } else {
      if (splitDirection === 'vertical') { cols = panelCount; rows = 1; }
      else { cols = 1; rows = panelCount; }
    }

    // Vertical split lines
    const colGap = canvasW / cols;
    for (let i = 1; i < cols; i++) {
      canvas.add(new FabricRect({
        left: Math.round(colGap * i) - 1,
        top: 0,
        width: 2,
        height: canvasH,
        fill: 'rgba(255,80,80,0.8)',
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false,
        strokeWidth: 0,
      }));
    }

    // Horizontal split lines
    const rowGap = canvasH / rows;
    for (let i = 1; i < rows; i++) {
      canvas.add(new FabricRect({
        left: 0,
        top: Math.round(rowGap * i) - 1,
        width: canvasW,
        height: 2,
        fill: 'rgba(255,80,80,0.8)',
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false,
        strokeWidth: 0,
      }));
    }

    canvas.renderAll();
  };

  const placeImageOnCanvas = async (canvas: FabricCanvas, dataUrl: string, printStyle: PrintStyle) => {
    const img = await FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' });
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const scaleW = canvasWidth / (img.width || 1);
    const scaleH = canvasHeight / (img.height || 1);
    // Always fill the canvas
    const scale = Math.max(scaleW, scaleH);

    img.set({
      scaleX: scale, scaleY: scale,
      left: canvasWidth / 2, top: canvasHeight / 2,
      originX: 'center', originY: 'center',
      cornerColor: '#000000', cornerStrokeColor: '#000000',
      cornerSize: 10, cornerStyle: 'circle',
      transparentCorners: false, borderColor: '#000000', borderScaleFactor: 1.5,
    });

    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.renderAll();

    setTimeout(() => {
      if (canvasRef.current !== canvas) return; // canvas was replaced
      try {
        const panelLines = canvas.getObjects().filter(o => o.type === 'rect' && !o.selectable);
        panelLines.forEach(o => o.set('visible', false));
        canvas.renderAll();
        const url = canvas.toDataURL({ format: 'png', multiplier: 1, quality: 1, enableRetinaScaling: false });
        panelLines.forEach(o => o.set('visible', true));
        canvas.renderAll();
        setPages(prev => prev.map((p, i) => i === activePageIdx ? { ...p, previewUrl: url } : p));
      } catch { /* canvas disposed */ }
    }, 100);
  };

  // Actions
  const addPage = (size: string = 'A4', orientation: Orientation = 'portrait') => {
    const page: PageItem = {
      id: `page-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      size, orientation, printStyle: 'full-bleed', layout: 'Single', panelCount: 1, splitDirection: 'vertical',
      hasImage: false, fileName: '', imageDataUrl: null, previewUrl: null,
    };
    setPages(prev => [...prev, page]);
    setActivePageIdx(pages.length);
  };

  const removePage = (idx: number) => {
    setPages(prev => prev.filter((_, i) => i !== idx));
    if (activePageIdx >= pages.length - 1) setActivePageIdx(Math.max(0, pages.length - 2));
  };

  const handleImageUpload = (file: File) => {
    if (!canvasRef.current || !activePage) return;
    // Validate file type before reading
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      // Validate data URL is a safe image format before assigning to img.src
      if (!dataUrl || !/^data:image\/(jpeg|png|webp|gif);base64,/.test(dataUrl)) return;
      const canvas = canvasRef.current!;
      const tempImg = new Image();
      tempImg.onload = async () => {
        const quality = getPrintQuality(tempImg.width, tempImg.height, paperMm.w, paperMm.h);
        canvas.getObjects().forEach(obj => { if (obj.type === 'image') canvas.remove(obj); });
        await placeImageOnCanvas(canvas, dataUrl, activePage.printStyle);
        setPages(prev => prev.map((p, i) => i === activePageIdx ? {
          ...p, hasImage: true, fileName: file.name, imageDataUrl: dataUrl,
          imageWidth: tempImg.width, imageHeight: tempImg.height, quality,
        } : p));
      };
      tempImg.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const updatePrintStyle = (style: PrintStyle) => {
    if (!activePage) return;
    setPages(prev => prev.map((p, i) => i === activePageIdx ? { ...p, printStyle: style } : p));
  };

  const toggleOrientation = () => {
    if (!activePage || activePage.size === 'Polaroid' || activePage.size === 'Pocket') return;
    const newOr: Orientation = activePage.orientation === 'portrait' ? 'landscape' : 'portrait';
    let quality = activePage.quality;
    if (activePage.imageWidth && activePage.imageHeight) {
      const [w, h] = PAPER_SIZES[activePage.size];
      const [pw, ph] = newOr === 'portrait' ? [w, h] : [h, w];
      quality = getPrintQuality(activePage.imageWidth, activePage.imageHeight, pw, ph);
    }
    setPages(prev => prev.map((p, i) => i === activePageIdx ? { ...p, orientation: newOr, quality } : p));
  };

  const changeSize = (size: string, dynamicPaperSizes?: Record<string, [number, number]>) => {
    if (!activePage) return;
    const orientation = PORTRAIT_ONLY_SIZES.includes(size) ? 'portrait' : activePage.orientation;
    const isSingleOnly = PORTRAIT_ONLY_SIZES.includes(size);
    let quality = activePage.quality;
    if (activePage.imageWidth && activePage.imageHeight) {
      const ps = dynamicPaperSizes || PAPER_SIZES;
      const dims = ps[size];
      if (dims) {
        const [w, h] = dims;
        const [pw, ph] = orientation === 'portrait' ? [w, h] : [h, w];
        quality = getPrintQuality(activePage.imageWidth, activePage.imageHeight, pw, ph);
      }
    }
    setPages(prev => prev.map((p, i) => i === activePageIdx ? {
      ...p, size, orientation, quality,
      ...(isSingleOnly ? { layout: 'Single', panelCount: 1, printStyle: 'white-margin' as PrintStyle } : {})
    } : p));
  };

  const changeLayout = (layoutName: string, panelCount: number) => {
    if (!activePage) return;
    if (activePage.size === 'Polaroid' || activePage.size === 'Pocket') return;
    // Multi-panel always uses full-bleed (no margin)
    const printStyle = panelCount > 1 ? 'full-bleed' as PrintStyle : activePage.printStyle;
    setPages(prev => prev.map((p, i) => i === activePageIdx ? { ...p, layout: layoutName, panelCount, printStyle } : p));
  };

  const changeSplitDirection = (dir: 'vertical' | 'horizontal') => {
    if (!activePage) return;
    setPages(prev => prev.map((p, i) => i === activePageIdx ? { ...p, splitDirection: dir } : p));
  };

  const getImageObject = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    // Try active object first, otherwise find the image
    const active = canvas.getActiveObject();
    if (active && active.type === 'image') return active;
    const images = canvas.getObjects().filter(o => o.type === 'image');
    if (images.length > 0) {
      canvas.setActiveObject(images[0]);
      canvas.renderAll();
      return images[0];
    }
    return null;
  };

  const fitImage = () => {
    const obj = getImageObject();
    if (!obj || !obj.width || !obj.height) return;
    const canvas = canvasRef.current!;
    const scale = Math.min(canvas.getWidth() / obj.width, canvas.getHeight() / obj.height);
    obj.scaleX = scale; obj.scaleY = scale;
    obj.left = canvas.getWidth() / 2; obj.top = canvas.getHeight() / 2;
    obj.angle = 0; obj.setCoords();
    canvas.renderAll();
    savePreview();
  };

  const fillImage = () => {
    const obj = getImageObject();
    if (!obj || !obj.width || !obj.height) return;
    const canvas = canvasRef.current!;
    const scale = Math.max(canvas.getWidth() / obj.width, canvas.getHeight() / obj.height);
    obj.scaleX = scale; obj.scaleY = scale;
    obj.left = canvas.getWidth() / 2; obj.top = canvas.getHeight() / 2;
    obj.angle = 0; obj.setCoords();
    canvas.renderAll();
    savePreview();
  };

  const centerImage = () => {
    const obj = getImageObject();
    if (!obj) return;
    const canvas = canvasRef.current!;
    obj.left = canvas.getWidth() / 2; obj.top = canvas.getHeight() / 2;
    obj.setCoords(); canvas.renderAll();
    savePreview();
  };

  const savePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const panelLines = canvas.getObjects().filter(o => o.type === 'rect' && !o.selectable);
      panelLines.forEach(o => o.set('visible', false));
      canvas.renderAll();
      const url = canvas.toDataURL({ format: 'png', multiplier: 1, quality: 1, enableRetinaScaling: false });
      panelLines.forEach(o => o.set('visible', true));
      canvas.renderAll();
      setPages(prev => prev.map((p, i) => i === activePageIdx ? { ...p, previewUrl: url } : p));
    } catch { /* canvas may have been disposed */ }
  };

  const rotateCW = () => { const o = getImageObject(); if (o) { o.rotate((o.angle || 0) + 90); canvasRef.current?.renderAll(); savePreview(); } };
  const rotateCCW = () => { const o = getImageObject(); if (o) { o.rotate((o.angle || 0) - 90); canvasRef.current?.renderAll(); savePreview(); } };
  const zoomIn = () => { const o = getImageObject(); if (o) { o.scaleX = (o.scaleX || 1) * 1.15; o.scaleY = (o.scaleY || 1) * 1.15; canvasRef.current?.renderAll(); savePreview(); } };
  const zoomOut = () => { const o = getImageObject(); if (o) { o.scaleX = (o.scaleX || 1) * 0.85; o.scaleY = (o.scaleY || 1) * 0.85; canvasRef.current?.renderAll(); savePreview(); } };

  const exportPreview = async (_token: string | null) => {
    if (!canvasRef.current || !activePage) return;

    const canvas = canvasRef.current;
    const [pw, ph] = PAPER_SIZES[activePage.size];
    const [sheetW, sheetH] = activePage.orientation === 'portrait' ? [pw, ph] : [ph, pw];
    let totalW = sheetW, totalH = sheetH;
    let cols = 1, rows = 1;
    if (activePage.panelCount === 4) { totalW = sheetW * 2; totalH = sheetH * 2; cols = 2; rows = 2; }
    else if (activePage.panelCount === 9) { totalW = sheetW * 3; totalH = sheetH * 3; cols = 3; rows = 3; }
    else if (activePage.panelCount > 1) {
      if (activePage.splitDirection === 'vertical') { totalW = sheetW * activePage.panelCount; cols = activePage.panelCount; }
      else { totalH = sheetH * activePage.panelCount; rows = activePage.panelCount; }
    }

    const printWidthPx = Math.round((totalW / 25.4) * 300);
    const multiplier = printWidthPx / dims.width;

    // Hide red panel lines before export
    const panelLines = canvas.getObjects().filter(o => o.type === 'rect' && !o.selectable);
    panelLines.forEach(o => o.set('visible', false));
    canvas.renderAll();

    const dataUrl = canvas.toDataURL({ format: 'png', multiplier, quality: 1, enableRetinaScaling: false });

    // Restore red lines
    panelLines.forEach(o => o.set('visible', true));
    canvas.renderAll();

    const sanitized = (activePage.fileName || 'print').replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\.\./g, '').trim().slice(0, 80) || 'print';
    const safeSize = (activePage.size || '').replace(/[^a-zA-Z0-9]/g, '');
    const safeOrientation = (activePage.orientation || '').replace(/[^a-zA-Z]/g, '');

    // Single panel — direct PNG download
    if (activePage.panelCount <= 1) {
      const link = document.createElement('a');
      link.download = `${sanitized}_${safeSize}_${safeOrientation}_300dpi.png`;
      link.href = dataUrl;
      link.click();
      return;
    }

    // Multi-panel — ZIP with full clean image + individual cut panels
    const sheetWPx = Math.round((sheetW / 25.4) * 300);
    const sheetHPx = Math.round((sheetH / 25.4) * 300);
    const printHeightPx = Math.round((totalH / 25.4) * 300);

    const fullImg = new Image();
    fullImg.src = dataUrl;
    await new Promise<void>((resolve) => { fullImg.onload = () => resolve(); });

    const zip = new JSZip();

    // Full combined image (no red lines)
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = printWidthPx;
    fullCanvas.height = printHeightPx;
    const fullCtx = fullCanvas.getContext('2d')!;
    fullCtx.drawImage(fullImg, 0, 0, printWidthPx, printHeightPx);
    const fullBlob = await new Promise<Blob>((resolve) => fullCanvas.toBlob((b) => resolve(b!), 'image/png'));
    zip.file('full_combined.png', fullBlob);

    // Cut individual panels at exact sheet dimensions
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c + 1;
        const panelCanvas = document.createElement('canvas');
        panelCanvas.width = sheetWPx;
        panelCanvas.height = sheetHPx;
        const pCtx = panelCanvas.getContext('2d')!;
        pCtx.drawImage(fullImg, c * sheetWPx, r * sheetHPx, sheetWPx, sheetHPx, 0, 0, sheetWPx, sheetHPx);
        const panelBlob = await new Promise<Blob>((resolve) => panelCanvas.toBlob((b) => resolve(b!), 'image/png'));
        zip.file(`panel_${idx}_of_${activePage.panelCount}.png`, panelBlob);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.download = `${sanitized}_${safeSize}_${safeOrientation}_${activePage.panelCount}panel_300dpi.zip`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    // State
    pages, activePageIdx, activePage, saving, setSaving, previewMode, setPreviewMode,
    imageDims, dims, paperMm, filledPages, canvasElRef, fileInputRef,
    // Actions
    addPage, removePage, handleImageUpload, updatePrintStyle,
    toggleOrientation, changeSize, changeLayout, changeSplitDirection, setActivePageIdx, setPages,
    fitImage, fillImage, centerImage, rotateCW, rotateCCW, zoomIn, zoomOut,
    exportPreview,
  };
}
