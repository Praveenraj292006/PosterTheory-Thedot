import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { h, useAction, Spinner } from './shared';

export default function CustomTab({ token }: { token: string | null }) {
  const [requests, setRequests] = useState<any[]>([]);
  useEffect(() => { api.get('/api/admin/custom-requests', h(token)).then(r => setRequests(Array.isArray(r.data) ? r.data : [])).catch(() => {}); }, []);

  const { run: runCustom } = useAction();
  const [updatingReqId, setUpdatingReqId] = useState<number | null>(null);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingReqId(id);
    await runCustom(async () => {
      await api.put(`/api/admin/custom-requests/${id}`, { status }, h(token));
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    });
    setUpdatingReqId(null);
  };

  const statuses = ['pending_review', 'approved', 'rejected', 'printing', 'completed'];

  return (
    <div>
      <h2 className="font-display font-black text-xl uppercase tracking-tighter text-z-ink mb-6">Custom Requests <span className="text-z-orange">({requests.length})</span></h2>
      {requests.length === 0 ? <p className="font-mono text-[11px] text-z-muted">No requests yet</p> : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className="border-2 border-z-border/20 p-4 bg-z-paper flex gap-4 shadow-[4px_4px_0px_0px_var(--color-z-shadow)]">
              <img src={r.image} className="w-20 h-20 object-cover border-2 border-z-border/20" />
              <div className="flex-1">
                <p className="text-[10px] font-mono font-black text-z-ink">{r.user_name} — <span className="text-z-muted">{r.email}</span></p>
                <p className="text-[9px] font-mono text-z-muted">Size: {r.size_name || 'N/A'} · Qty: <span className="text-z-orange">{r.quantity}</span></p>
                <p className="text-[9px] font-mono text-z-muted">Notes: {r.notes || 'None'}</p>
                <div className="flex gap-1 mt-2 items-center">
                  {updatingReqId === r.id && <Spinner />}
                  {statuses.map(s => (
                    <button key={s} onClick={() => updateStatus(r.id, s)} disabled={updatingReqId === r.id}
                      className={`px-2 py-0.5 text-[8px] font-mono font-black uppercase border-2 transition-all active:scale-95 active:opacity-80 disabled:opacity-50 ${
                        r.status === s
                          ? 'bg-z-orange text-white border-z-orange'
                          : 'border-z-border/30 text-z-ink hover:border-z-orange hover:text-z-orange'
                      }`}>
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
