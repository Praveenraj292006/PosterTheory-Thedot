import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Download, Package, Eye, Search } from 'lucide-react';
import JSZip from 'jszip';
import api from '../../lib/api';
import { h, useAction, Spinner } from './shared';

interface ItemTrack {
  downloaded: boolean;
  printing: boolean;
  completed: boolean;
}

export default function OrdersTab({ token }: { token: string | null }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [orderText, setOrderText] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [itemTracks, setItemTracks] = useState<Record<string, ItemTrack>>({});
  const [couriers, setCouriers] = useState<any[]>([]);
  const [shippingModal, setShippingModal] = useState<{ orderId: number } | null>(null);
  const [shipCourier, setShipCourier] = useState('');
  const [shipTrackingId, setShipTrackingId] = useState('');

  useEffect(() => {
    api.get('/api/admin/orders', h(token)).then(r => setOrders(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    api.get('/api/admin/couriers', h(token)).then(r => setCouriers(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const searchRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(o => String(o.id).includes(q) || o.user_name?.toLowerCase().includes(q));
  }, [orders, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  useEffect(() => { setPage(1); }, [search]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const results: { label: string; type: string }[] = [];
    const seen = new Set<string>();
    for (const o of orders) {
      if (String(o.id).includes(q) && !seen.has(`id_${o.id}`)) {
        seen.add(`id_${o.id}`);
        results.push({ label: `#${o.id}`, type: 'order #' });
      }
      if (o.user_name?.toLowerCase().includes(q) && !seen.has(`name_${o.user_name}`)) {
        seen.add(`name_${o.user_name}`);
        results.push({ label: o.user_name, type: 'user' });
      }
      if (results.length >= 10) break;
    }
    return results;
  }, [orders, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const statuses = ['order_placed', 'verified', 'in_production', 'printed', 'ready_to_ship', 'out_for_delivery'];
  const statusLabels: Record<string, string> = {
    order_placed: 'Order Placed',
    verified: 'Verified',
    in_production: 'In Production',
    printed: 'Printed',
    ready_to_ship: 'Ready to Ship',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  const { run } = useAction();
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const updateStatus = async (id: number, status: string, extra?: { courier_name?: string; tracking_id?: string }) => {
    // If out_for_delivery, show shipping modal instead
    if (status === 'out_for_delivery' && !extra) {
      setShippingModal({ orderId: id });
      setShipCourier('');
      setShipTrackingId('');
      return;
    }
    setUpdatingOrderId(id);
    await run(async () => {
      try {
        const body: any = { status };
        if (extra?.courier_name) body.courier_name = extra.courier_name;
        if (extra?.tracking_id) body.tracking_id = extra.tracking_id;
        const res = await api.put(`/api/admin/orders/${id}/status`, body, h(token));
        setOrders(prev => prev.map(o => o.id === id ? { ...o, ...res.data } : o));
      } catch (err: any) { alert(err.response?.data?.error || "Failed to update"); }
    });
    setUpdatingOrderId(null);
  };

  const handleShipConfirm = async () => {
    if (!shippingModal || !shipCourier || !shipTrackingId.trim()) {
      alert('Please select a courier and enter the tracking ID');
      return;
    }
    await updateStatus(shippingModal.orderId, 'delivered', { courier_name: shipCourier, tracking_id: shipTrackingId.trim() });
    setShippingModal(null);
  };

  const openOrder = async (order: any) => {
    setSelected(order);
    setLoadingDetails(true);
    try {
      const [detailsRes, trackingRes] = await Promise.all([
        api.get(`/api/orders/admin/${order.id}/download`, h(token)),
        api.get(`/api/orders/admin/${order.id}/tracking`, h(token)),
      ]);
      setSelectedItems(detailsRes.data.items || []);
      setOrderText(detailsRes.data.orderDetails || '');
      // Build tracking map from DB
      const tracks: Record<string, ItemTrack> = {};
      (trackingRes.data || []).forEach((t: any) => {
        tracks[`item_${t.item_index}`] = { downloaded: t.downloaded, printing: t.printing, completed: t.completed };
      });
      setItemTracks(tracks);
    } catch {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      setSelectedItems(items);
      setOrderText('');
      setItemTracks({});
    }
    setLoadingDetails(false);
  };

  const toggleTrack = async (idx: number, field: keyof ItemTrack) => {
    const key = `item_${idx}`;
    const current = itemTracks[key]?.[field] || false;
    const newVal = !current;
    setItemTracks(prev => ({ ...prev, [key]: { ...prev[key], [field]: newVal } }));
    if (selected) {
      try {
        await api.put(`/api/orders/admin/${selected.id}/tracking`, { item_index: idx, field, value: newVal }, h(token));
      } catch { /* revert on failure */ }
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch { alert('Download failed'); }
  };

  // Split image into panels and return as ZIP blob
  const splitImageIntoPanels = async (imageUrl: string, panelCount: number): Promise<Blob> => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = imageUrl; });

    let cols = 1, rows = 1;
    if (panelCount === 4) { cols = 2; rows = 2; }
    else if (panelCount === 9) { cols = 3; rows = 3; }
    else if (panelCount === 2) { cols = 2; rows = 1; }
    else if (panelCount === 3) { cols = 3; rows = 1; }

    const cellW = Math.floor(img.width / cols);
    const cellH = Math.floor(img.height / rows);
    const zip = new JSZip();

    // Full image
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = img.width;
    fullCanvas.height = img.height;
    fullCanvas.getContext('2d')!.drawImage(img, 0, 0);
    const fullBlob = await new Promise<Blob>(r => fullCanvas.toBlob(b => r(b!), 'image/png'));
    zip.file('full_combined.png', fullBlob);

    // Individual panels
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c + 1;
        const canvas = document.createElement('canvas');
        canvas.width = cellW;
        canvas.height = cellH;
        canvas.getContext('2d')!.drawImage(img, c * cellW, r * cellH, cellW, cellH, 0, 0, cellW, cellH);
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
        zip.file(`panel_${idx}_of_${panelCount}.png`, blob);
      }
    }

    return zip.generateAsync({ type: 'blob' });
  };

  const downloadItem = async (item: any, idx: number) => {
    if (!item.image?.startsWith('http')) return;
    const panelCount = item.customSpecs?.panelCount || 1;
    const baseName = `order${selected.id}_item${idx + 1}_${(item.title || 'print').replace(/[^a-zA-Z0-9]/g, '_')}`;

    if (panelCount <= 1) {
      // Single — download directly
      await downloadImage(item.image, `${baseName}.png`);
    } else {
      // Multi-panel — split and ZIP
      try {
        const blob = await splitImageIntoPanels(item.image, panelCount);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${baseName}_${panelCount}panels.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
      } catch { alert('Failed to split panels'); }
    }
  };

  const downloadOrderZip = async () => {
    if (!selected || selectedItems.length === 0) return;
    const zip = new JSZip();
    zip.file('order_details.txt', orderText);

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      if (!item.image?.startsWith('http')) continue;
      const panelCount = item.customSpecs?.panelCount || 1;
      const baseName = `${i + 1}_${(item.title || 'print').replace(/[^a-zA-Z0-9]/g, '_')}`;

      try {
        if (panelCount <= 1) {
          const res = await fetch(item.image);
          const blob = await res.blob();
          zip.file(`${baseName}.png`, blob);
        } else {
          // Split into panels inside a subfolder
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = item.image; });

          let cols = 1, rows = 1;
          if (panelCount === 4) { cols = 2; rows = 2; }
          else if (panelCount === 9) { cols = 3; rows = 3; }
          else if (panelCount === 2) { cols = 2; rows = 1; }
          else if (panelCount === 3) { cols = 3; rows = 1; }

          const cellW = Math.floor(img.width / cols);
          const cellH = Math.floor(img.height / rows);

          const fullCanvas = document.createElement('canvas');
          fullCanvas.width = img.width;
          fullCanvas.height = img.height;
          fullCanvas.getContext('2d')!.drawImage(img, 0, 0);
          const fullBlob = await new Promise<Blob>(r => fullCanvas.toBlob(b => r(b!), 'image/png'));
          zip.file(`${baseName}/full.png`, fullBlob);

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const pidx = r * cols + c + 1;
              const canvas = document.createElement('canvas');
              canvas.width = cellW;
              canvas.height = cellH;
              canvas.getContext('2d')!.drawImage(img, c * cellW, r * cellH, cellW, cellH, 0, 0, cellW, cellH);
              const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
              zip.file(`${baseName}/panel_${pidx}.png`, blob);
            }
          }
        }
      } catch { /* skip */ }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `order_${selected.id}_${selected.user_name || 'customer'}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-xl uppercase tracking-tighter text-z-ink">Orders <span className="text-z-orange">({filtered.length})</span></h2>
        <div className="relative" ref={searchRef}>
          <input type="text" placeholder="Order # or name" value={search}
            onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            className="bg-z-paper border-2 border-z-border/30 px-3 py-1.5 pl-8 text-[10px] font-mono font-bold uppercase tracking-widest focus:outline-none focus:border-z-orange transition-all w-48" />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-z-muted" />
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-z-paper border-2 border-z-border/30 shadow-[4px_4px_0px_0px_var(--color-z-shadow)] z-50 max-h-52 overflow-y-auto scrollbar-thin">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { setSearch(s.type === 'order #' ? s.label.slice(1) : s.label); setShowDropdown(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-mono hover:bg-z-orange/10 transition-colors">
                  <span className="font-bold text-z-ink truncate">{s.label}</span>
                  <span className="text-[8px] font-black text-z-muted uppercase shrink-0 ml-2">{s.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {paginated.map(order => {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        return (
          <div key={order.id} className="border-2 border-z-border/20 p-5 bg-z-paper shadow-[4px_4px_0px_0px_var(--color-z-shadow)]">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <p className="text-[10px] font-mono font-black text-z-ink">ORDER <span className="text-z-orange">#{order.id}</span> — {order.user_name}</p>
                <p className="text-[9px] font-mono text-z-muted">{order.email} · {order.phone}</p>
                <p className="text-[9px] font-mono text-z-muted">{order.line1}, {order.city} {order.pincode}</p>
              </div>
              <div className="text-right flex items-start gap-2">
                <button onClick={() => openOrder(order)} className="px-3 py-1.5 bg-z-ink text-z-paper text-[8px] font-mono font-black uppercase hover:opacity-80 transition-all active:scale-95 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> View
                </button>
                <div>
                  <p className="font-display font-black text-xl text-z-orange">₹{order.total?.toLocaleString()}</p>
                  <p className="text-[9px] font-mono text-z-muted">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mb-4 space-y-1">
              {items.map((item: any, i: number) => (
                <p key={i} className="text-[9px] font-mono text-z-ink">• {item.title} — {item.size} × {item.quantity || 1}</p>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              {updatingOrderId === order.id && <Spinner />}
              {order.status === 'cancelled' && <span className="px-3 py-1 text-[8px] font-mono font-black uppercase border-2 bg-red-100 text-red-700 border-red-300">Cancelled by Customer</span>}
              {order.status !== 'cancelled' && statuses.map((s, idx) => {
                const currentIdx = statuses.indexOf(order.status);
                const isDelivered = order.status === 'delivered';
                const isNext = idx === currentIdx + 1;
                const isCurrent = order.status === s;
                const isPast = idx <= currentIdx;
                const allDone = isDelivered; // delivered = all green
                const disabled = updatingOrderId === order.id || allDone || (!isCurrent && !isNext && !isPast);
                return (
                  <button key={s} onClick={() => updateStatus(order.id, s)} disabled={disabled}
                    className={`px-3 py-1 text-[8px] font-mono font-black uppercase border-2 transition-all active:scale-95 disabled:cursor-not-allowed ${
                      allDone
                        ? 'bg-green-100 text-green-700 border-green-300 opacity-80'
                        : isCurrent
                        ? 'bg-z-orange text-white border-z-orange'
                        : isPast
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : isNext
                        ? 'border-z-orange/50 text-z-orange hover:bg-z-orange hover:text-white'
                        : 'border-z-border/30 text-z-ink opacity-30'
                    }`}>
                    {allDone ? '✓ ' : ''}{statusLabels[s] || s.replace(/_/g, ' ')}
                  </button>
                );
              })}
              {order.status === 'delivered' && <span className="text-[9px] font-mono font-black text-green-600 uppercase ml-2">✓ Shipped & Complete</span>}
            </div>
          </div>
        );
      })}

      {filtered.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1 text-[10px] font-mono font-black uppercase border-2 border-z-border/30 disabled:opacity-30 hover:border-z-orange hover:text-z-orange transition-all active:scale-95">Prev</button>
          <span className="text-[10px] font-mono font-black text-z-ink">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1 text-[10px] font-mono font-black uppercase border-2 border-z-border/30 disabled:opacity-30 hover:border-z-orange hover:text-z-orange transition-all active:scale-95">Next</button>
        </div>
      )}

      {/* Order Detail Overlay */}
      {selected && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-z-paper border-2 border-z-border shadow-[8px_8px_0px_0px_var(--color-z-shadow)] p-4 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-8 h-8 bg-z-ink text-z-paper flex items-center justify-center hover:opacity-80">
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between mb-6 pb-4 border-b-2 border-z-border/30 gap-4">
              <div>
                <h3 className="text-[14px] font-mono font-black uppercase tracking-widest text-z-ink">Order <span className="text-z-orange">#{selected.id}</span></h3>
                <p className="text-[12px] font-mono text-z-muted mt-1">{selected.user_name} · {selected.phone}</p>
                <p className="text-[11px] font-mono text-z-muted">{selected.line1}{selected.line2 ? ', ' + selected.line2 : ''}, {selected.city}, {selected.state} - {selected.pincode}</p>
                {selected.courier_name && selected.tracking_id && (
                  <p className="text-[11px] font-mono text-green-700 mt-2 font-bold">Shipped via {selected.courier_name} · AWB: {selected.tracking_id}</p>
                )}
              </div>
              <button onClick={downloadOrderZip} disabled={loadingDetails}
                className="px-5 py-2.5 bg-z-orange text-white text-[11px] font-mono font-black uppercase hover:bg-z-orange-dark transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
                <Download className="w-4 h-4" /> Download All
              </button>
            </div>

            {loadingDetails ? (
              <div className="flex items-center justify-center py-12"><Spinner /> <span className="ml-2 text-[10px] font-mono text-z-muted">Loading...</span></div>
            ) : (
              <div className="space-y-4">
                {selectedItems.map((item: any, idx: number) => {
                  const panelCount = item.customSpecs?.panelCount || 1;
                  const track = itemTracks[`item_${idx}`] || { downloaded: false, printing: false, printed: false };
                  return (
                    <div key={idx} className="border-2 border-z-border/20 p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        {/* Image Preview */}
                        <div className="w-full sm:w-40 aspect-[210/297] shrink-0 bg-gray-100 dark:bg-z-ink/10 border border-z-border/30 flex items-center justify-center overflow-hidden">
                          {item.image?.startsWith('http') ? (
                            <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                          ) : (
                            <Package className="w-8 h-8 text-z-ink/20" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[13px] font-mono font-black text-z-ink uppercase">{item.title}</p>
                            <div className="mt-3 space-y-1">
                              <p className="text-[11px] font-mono text-z-muted">Size: {item.size || 'N/A'}</p>
                              <p className="text-[11px] font-mono text-z-muted">Qty: {item.quantity || 1} · Price: ₹{item.price}</p>
                              {item.customSpecs && (
                                <p className="text-[11px] font-mono text-z-muted">
                                  Layout: {item.customSpecs.layout || 'Single'}
                                  {panelCount > 1 && ` (${panelCount} panels)`}
                                  {' · '}{item.customSpecs.printStyle || 'full-bleed'}
                                  {item.customSpecs.frame && item.customSpecs.frame !== 'None' && ` · Frame: ${item.customSpecs.frame}`}
                                  {item.customSpecs.material && ` · ${item.customSpecs.material}`}
                                </p>
                              )}
                              {item.customSpecs?.material === 'METALLIC SHEET' && (
                                <p className="text-[10px] font-mono text-z-orange mt-1">Metal poster — Premium metal with sleek finish</p>
                              )}
                              {(!item.customSpecs?.material || item.customSpecs?.material === 'PAPER') && (
                                <p className="text-[10px] font-mono text-z-muted mt-1">Art poster — High-quality paper print</p>
                              )}
                            </div>
                          </div>

                          {/* Download */}
                          {item.image?.startsWith('http') && (
                            <button onClick={() => downloadItem(item, idx)}
                              className="mt-4 self-start px-4 py-2 border-2 border-z-border text-[10px] font-mono font-black uppercase hover:bg-z-ink hover:text-z-paper transition-all active:scale-95 flex items-center gap-1.5">
                              <Download className="w-3.5 h-3.5" />
                              {panelCount > 1 ? `Download ${panelCount} Panels (ZIP)` : 'Download'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Tracking Checkboxes */}
                      <div className="mt-4 pt-3 border-t border-z-border/20 flex flex-wrap gap-5">
                        {(['downloaded', 'printing', 'completed'] as const).map(field => (
                          <label key={field} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={track[field]}
                              onChange={() => toggleTrack(idx, field)}
                              className="w-4 h-4 accent-[var(--color-z-orange)]"
                            />
                            <span className={`text-[11px] font-mono font-black uppercase ${track[field] ? 'text-z-orange' : 'text-z-muted'}`}>
                              {field}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Order Text */}
            {orderText && (
              <details className="mt-6">
                <summary className="text-[9px] font-mono font-black uppercase text-z-muted cursor-pointer hover:text-z-ink">View Order Text</summary>
                <pre className="mt-2 text-[8px] font-mono text-z-ink/70 bg-gray-50 dark:bg-z-ink/5 p-3 border border-z-border/20 overflow-x-auto whitespace-pre-wrap">{orderText}</pre>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {shippingModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" onClick={() => setShippingModal(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-z-paper border-2 border-z-border shadow-[8px_8px_0px_0px_var(--color-z-shadow)] p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShippingModal(null)} className="absolute top-3 right-3 w-8 h-8 bg-z-ink text-z-paper flex items-center justify-center hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-[13px] font-mono font-black uppercase tracking-widest text-z-ink mb-6 pb-3 border-b-2 border-z-orange/30">Ship Order #{shippingModal.orderId}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-z-muted mb-1 block font-black">Courier</label>
                <select value={shipCourier} onChange={e => setShipCourier(e.target.value)}
                  className="w-full bg-z-paper border-2 border-z-border/30 px-3 py-2.5 text-[12px] font-mono text-z-ink focus:outline-none focus:border-z-orange">
                  <option value="">Select courier...</option>
                  {couriers.filter(c => c.is_active).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-z-muted mb-1 block font-black">Tracking ID (AWB)</label>
                <input value={shipTrackingId} onChange={e => setShipTrackingId(e.target.value)}
                  placeholder="Enter AWB / tracking number"
                  className="w-full bg-z-paper border-2 border-z-border/30 px-3 py-2.5 text-[12px] font-mono text-z-ink focus:outline-none focus:border-z-orange" />
              </div>
              <button onClick={handleShipConfirm}
                className="w-full bg-z-orange text-white py-3 text-[11px] font-mono font-black uppercase hover:bg-z-orange-dark transition-all active:scale-95">
                Confirm Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
