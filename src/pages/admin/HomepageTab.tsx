import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Upload, Image } from 'lucide-react';
import api from '../../lib/api';
import { h, useAction, Spinner } from './shared';

export default function HomepageTab({ token }: { token: string | null }) {
  const [config, setConfig] = useState<any[]>([]);
  const [dbCollections, setDbCollections] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [uploading, setUploading] = useState(false);
  const { loading: hpLoading, run: runHp } = useAction();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{ section: string; field: string; index?: number } | null>(null);

  // Section limits state
  const SECTION_KEYS = ['new_arrivals', 'trending', 'featured', 'bestseller'] as const;
  const SECTION_LABELS: Record<string, string> = { new_arrivals: 'New Arrivals', trending: 'Trending', featured: 'Featured', bestseller: 'Bestseller' };
  const [sectionLimits, setSectionLimits] = useState<Record<string, { limit: number; enabled: boolean }>>({
    new_arrivals: { limit: 8, enabled: true },
    trending: { limit: 8, enabled: true },
    featured: { limit: 8, enabled: true },
    bestseller: { limit: 8, enabled: true },
  });
  const [limitsChanged, setLimitsChanged] = useState(false);

  useEffect(() => {
    api.get('/api/admin/homepage', h(token)).then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      setConfig(data);
      // Load section limits from config
      const limits: Record<string, { limit: number; enabled: boolean }> = { ...sectionLimits };
      for (const key of SECTION_KEYS) {
        const found = data.find((c: any) => c.section === key);
        if (found?.data) limits[key] = { limit: found.data.limit ?? 8, enabled: found.data.enabled ?? true };
      }
      setSectionLimits(limits);
    }).catch(() => {});
    api.get('/api/admin/collections', h(token)).then(r => setDbCollections(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const saveSectionLimits = async () => {
    await runHp(async () => {
      for (const key of SECTION_KEYS) {
        await api.put('/api/admin/homepage', { section: key, data: sectionLimits[key] }, h(token));
      }
      setConfig(prev => {
        let updated = [...prev];
        for (const key of SECTION_KEYS) {
          const idx = updated.findIndex(c => c.section === key);
          if (idx >= 0) updated[idx] = { ...updated[idx], data: sectionLimits[key] };
          else updated.push({ section: key, data: sectionLimits[key] });
        }
        return updated;
      });
      setLimitsChanged(false);
    });
  };

  const save = async (section: string) => {
    const data = editData;
    setEditing(null);
    await runHp(async () => {
      await api.put('/api/admin/homepage', { section, data }, h(token));
      setConfig(prev => prev.map(c => c.section === section ? { ...c, data } : c));
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('section', uploadTarget.section);
      const res = await api.post('/api/admin/homepage/upload', formData, { ...h(token), headers: { ...h(token).headers, 'Content-Type': 'multipart/form-data' } });
      const url = res.data.url;

      // Update the config data with the new URL
      const sectionConfig = config.find(c => c.section === uploadTarget.section);
      if (sectionConfig) {
        const newData = { ...sectionConfig.data };
        if (uploadTarget.field === 'url') {
          newData.url = url;
        } else if (uploadTarget.field === 'images' && uploadTarget.index !== undefined) {
          newData.images[uploadTarget.index].url = url;
        } else if (uploadTarget.field === 'categories' && uploadTarget.index !== undefined) {
          newData.collections[uploadTarget.index].img = url;
        }
        await api.put('/api/admin/homepage', { section: uploadTarget.section, data: newData }, h(token));
        setConfig(prev => prev.map(c => c.section === uploadTarget.section ? { ...c, data: newData } : c));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploading(false);
    setUploadTarget(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const triggerUpload = (section: string, field: string, index?: number) => {
    setUploadTarget({ section, field, index });
    fileRef.current?.click();
  };

  const renderImageSection = (c: any) => {
    if (c.section === 'hero_images') {
      const images = c.data?.images || [];
      return (
        <div className="mt-3">
          <p className="text-[9px] font-mono text-z-muted mb-3 uppercase">These images rotate in the hero carousel on the homepage.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img: any, idx: number) => (
              <div key={idx} className="border border-z-border/30 p-2">
                <div className="aspect-[3/4] bg-gray-100 dark:bg-z-ink/10 mb-2 flex items-center justify-center overflow-hidden">
                  {img.url ? <img src={img.url} alt="" className="w-full h-full object-cover" /> : <Image className="w-6 h-6 text-z-ink/20" />}
                </div>
                <p className="text-[8px] font-mono text-z-muted truncate mb-1">{img.ref || `Slide ${idx + 1}`}</p>
                <button onClick={() => triggerUpload(c.section, 'images', idx)} disabled={uploading}
                  className="w-full px-2 py-1 bg-z-ink text-z-paper text-[8px] font-mono font-black uppercase hover:opacity-80 transition-all disabled:opacity-40 flex items-center justify-center gap-1">
                  <Upload className="w-2.5 h-2.5" /> Replace
                </button>
              </div>
            ))}
            {/* Add new slide */}
            <div className="border-2 border-dashed border-z-border/30 p-2 flex flex-col items-center justify-center cursor-pointer hover:border-z-orange transition-colors"
              onClick={async () => {
                const newImages = [...images, { url: '', ref: `Slide ${images.length + 1}` }];
                const newData = { ...c.data, images: newImages };
                await api.put('/api/admin/homepage', { section: 'hero_images', data: newData }, h(token));
                setConfig(prev => prev.map(cc => cc.section === 'hero_images' ? { ...cc, data: newData } : prev.find(x => x.section === 'hero_images') ? cc : cc).concat(prev.find(x => x.section === 'hero_images') ? [] : [{ section: 'hero_images', data: newData }]));
                setConfig(prev => {
                  const exists = prev.find(cc => cc.section === 'hero_images');
                  if (exists) return prev.map(cc => cc.section === 'hero_images' ? { ...cc, data: newData } : cc);
                  return [...prev, { section: 'hero_images', data: newData }];
                });
              }}>
              <Image className="w-6 h-6 text-z-ink/20 mb-2" />
              <span className="text-[8px] font-mono font-black text-z-muted uppercase">+ Add Slide</span>
            </div>
          </div>
        </div>
      );
    }

    if (c.section === 'collection_images') {
      const savedCats: any[] = c.data?.collections || [];
      const mergedCats = dbCollections.map(dbCat => {
        const saved = savedCats.find((s: any) => s.name === dbCat.name);
        return { name: dbCat.name, img: saved?.img || '', path: `/collection?collection=${dbCat.name}` };
      });
      return (
        <div className="mt-3">
          <p className="text-[9px] font-mono text-z-muted mb-3 uppercase">These images show in the Collections marquee on the homepage. Aspect ratio 3:4 works best.</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {mergedCats.map((cat: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-full aspect-[210/297] overflow-hidden border-2 border-z-border bg-gray-100 dark:bg-z-ink/10 flex items-center justify-center">
                  {cat.img ? <img src={cat.img} alt="" className="w-full h-full object-cover" /> : <Image className="w-6 h-6 text-z-ink/20" />}
                </div>
                <p className="text-[10px] font-mono font-bold text-z-ink mt-2 text-center truncate w-full">{cat.name}</p>
                <button onClick={() => {
                  const sectionConfig = config.find(sc => sc.section === 'collection_images');
                  const updatedData = { collections: mergedCats };
                  const saveAndUpload = () => {
                    api.put('/api/admin/homepage', { section: 'collection_images', data: updatedData }, h(token)).then(() => {
                      setConfig(prev => {
                        const exists = prev.find(cc => cc.section === 'collection_images');
                        if (exists) return prev.map(cc => cc.section === 'collection_images' ? { ...cc, data: updatedData } : cc);
                        return [...prev, { section: 'collection_images', data: updatedData }];
                      });
                      setUploadTarget({ section: 'collection_images', field: 'categories', index: idx });
                      fileRef.current?.click();
                    }).catch(() => {});
                  };
                  saveAndUpload();
                }} disabled={uploading}
                  className="mt-1 px-2 py-1 bg-z-ink text-z-paper text-[8px] font-mono font-black uppercase hover:opacity-80 transition-all disabled:opacity-40 flex items-center justify-center gap-1">
                  <Upload className="w-2.5 h-2.5" /> {cat.img ? 'Replace' : 'Upload'}
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (c.section === 'about_image') {
      return (
        <div className="mt-3">
          <p className="text-[9px] font-mono text-z-muted mb-3 uppercase">This image appears in the "About Us" section near the bottom of the homepage. Portrait ratio recommended.</p>
          <div className="flex items-center gap-4">
            <div className="w-full max-w-[10rem] aspect-[3/4] bg-gray-100 dark:bg-z-ink/10 border-2 border-z-border flex items-center justify-center overflow-hidden">
              {c.data?.url ? <img src={c.data.url} alt="" className="w-full h-full object-cover" /> : <Image className="w-6 h-6 text-z-ink/20" />}
            </div>
            <button onClick={() => triggerUpload(c.section, 'url')} disabled={uploading}
              className="px-3 py-1.5 bg-z-ink text-z-paper text-[9px] font-mono font-black uppercase hover:opacity-80 transition-all disabled:opacity-40 flex items-center gap-1">
              <Upload className="w-3 h-3" /> {c.data?.url ? 'Replace' : 'Upload'}
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <h2 className="font-display font-black text-xl uppercase tracking-tighter text-z-ink mb-6">Homepage <span className="text-z-orange">Configuration</span></h2>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      {uploading && <div className="mb-4 flex items-center gap-2 text-[11px] font-mono text-z-ink"><Spinner /> Uploading...</div>}
      <div className="space-y-4">
        {/* Section Limits */}
        <div className="border-2 border-z-border/20 p-5 bg-z-paper shadow-[4px_4px_0px_0px_var(--color-z-shadow)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[11px] font-mono font-black uppercase text-z-ink">Homepage Sections (Limits & Toggle)</h3>
            {limitsChanged && (
              <button onClick={saveSectionLimits} disabled={hpLoading} className="px-4 py-1.5 bg-z-orange text-white text-[10px] font-mono font-black active:scale-95 transition-all hover:bg-z-orange-dark disabled:opacity-50 flex items-center gap-1">
                {hpLoading ? <Spinner /> : 'Save'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {SECTION_KEYS.map(key => (
              <div key={key} className={`border-2 p-4 transition-all ${sectionLimits[key].enabled ? 'border-z-orange/50 bg-z-orange/5' : 'border-z-border/20 bg-z-paper opacity-60'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-black uppercase text-z-ink">{SECTION_LABELS[key]}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={sectionLimits[key].enabled}
                      onChange={e => { setSectionLimits(prev => ({ ...prev, [key]: { ...prev[key], enabled: e.target.checked } })); setLimitsChanged(true); }}
                      className="sr-only peer" />
                    <div className="w-8 h-4 bg-z-border/40 peer-checked:bg-z-orange rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all" />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-z-muted uppercase">Limit:</span>
                  <input type="number" min="1" max="50" value={sectionLimits[key].limit}
                    onChange={e => { setSectionLimits(prev => ({ ...prev, [key]: { ...prev[key], limit: parseInt(e.target.value) || 1 } })); setLimitsChanged(true); }}
                    className="w-16 h-8 px-2 text-[12px] font-mono font-black text-center border-2 border-z-border/30 bg-z-paper text-z-ink focus:outline-none focus:border-z-orange transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Always show collections section using DB collections */}
        {dbCollections.length > 0 && (() => {
          const catConfig = config.find(c => c.section === 'collection_images') || { section: 'collection_images', data: { collections: [] } };
          return (
            <div className="border-2 border-z-border/20 p-5 bg-z-paper shadow-[4px_4px_0px_0px_var(--color-z-shadow)]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[11px] font-mono font-black uppercase text-z-ink">Collections</h3>
              </div>
              {renderImageSection(catConfig)}
            </div>
          );
        })()}
        {config.filter(c => !['collection_images', 'featured', 'new_arrivals', 'trending', 'bestseller'].includes(c.section)).map(c => (
          <div key={c.section} className="border-2 border-z-border/20 p-5 bg-z-paper shadow-[4px_4px_0px_0px_var(--color-z-shadow)]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[11px] font-mono font-black uppercase text-z-ink">{c.section.replace(/_/g, ' ')}</h3>
              {editing === c.section ? (
                <div className="flex gap-2 items-center">
                  {hpLoading && <Spinner />}
                  <button onClick={() => save(c.section)} disabled={hpLoading} className="px-3 py-1 bg-z-orange text-white text-[9px] font-mono font-black active:scale-95 transition-all hover:bg-z-orange-dark disabled:opacity-50">Save</button>
                  <button onClick={() => setEditing(null)} className="px-3 py-1 border-2 border-z-border/30 text-[9px] font-mono font-black text-z-ink active:scale-95 transition-all hover:border-z-orange hover:text-z-orange">Cancel</button>
                </div>
              ) : (
                <button onClick={() => { setEditing(c.section); setEditData(c.data); }} className="px-3 py-1 border-2 border-z-border/30 text-[9px] font-mono font-black text-z-ink hover:bg-z-orange hover:text-white hover:border-z-orange transition-all active:scale-95">
                  <Edit2 className="w-3 h-3 inline mr-1" />Edit
                </button>
              )}
            </div>
            {/* Visual upload UI for image sections */}
            {renderImageSection(c)}
            {/* JSON editor */}
            {editing === c.section ? (
              <textarea value={JSON.stringify(editData, null, 2)} onChange={e => { try { setEditData(JSON.parse(e.target.value)); } catch {} }}
                className="w-full h-32 bg-z-paper border-2 border-z-border/30 p-3 text-[10px] font-mono text-z-ink focus:outline-none focus:border-z-orange resize-y transition-colors mt-3" />
            ) : !renderImageSection(c) ? (
              <pre className="text-[9px] font-mono text-z-muted overflow-x-auto">{JSON.stringify(c.data, null, 2)}</pre>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}


