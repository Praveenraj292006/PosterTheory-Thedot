import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search } from 'lucide-react';
import api from '../../lib/api';
import { h } from './shared';

export default function CustomersTab({ token }: { token: string | null }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => { api.get('/api/admin/customers', h(token)).then(r => setCustomers(Array.isArray(r.data) ? r.data : [])).catch(() => {}); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q));
  }, [customers, search]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const results: { label: string; type: string }[] = [];
    const seen = new Set<string>();
    for (const c of customers) {
      if (c.name?.toLowerCase().includes(q) && !seen.has(`n_${c.name}`)) {
        seen.add(`n_${c.name}`);
        results.push({ label: c.name, type: 'name' });
      }
      if (c.email?.toLowerCase().includes(q) && !seen.has(`e_${c.email}`)) {
        seen.add(`e_${c.email}`);
        results.push({ label: c.email, type: 'email' });
      }
      if (c.phone?.includes(q) && !seen.has(`p_${c.phone}`)) {
        seen.add(`p_${c.phone}`);
        results.push({ label: c.phone, type: 'phone' });
      }
      if (results.length >= 10) break;
    }
    return results;
  }, [customers, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  useEffect(() => { setPage(1); }, [search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-black text-xl uppercase tracking-tighter text-z-ink">Customers <span className="text-z-orange">({filtered.length})</span></h2>
        <div className="relative" ref={searchRef}>
          <input type="text" placeholder="Name, email or phone" value={search}
            onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            className="bg-z-paper border-2 border-z-border/30 px-3 py-1.5 pl-8 text-[10px] font-mono font-bold uppercase tracking-widest focus:outline-none focus:border-z-orange transition-all w-48" />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-z-muted" />
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-z-paper border-2 border-z-border/30 shadow-[4px_4px_0px_0px_var(--color-z-shadow)] z-50 max-h-52 overflow-y-auto scrollbar-thin">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { setSearch(s.label); setShowDropdown(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-mono hover:bg-z-orange/10 transition-colors">
                  <span className="font-bold text-z-ink truncate">{s.label}</span>
                  <span className="text-[8px] font-black text-z-muted uppercase shrink-0 ml-2">{s.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-2 border-z-border/20 overflow-x-auto shadow-[4px_4px_0px_0px_var(--color-z-shadow)]">
        <table className="w-full text-[10px] font-mono">
          <thead><tr className="bg-z-ink text-z-paper dark:bg-z-orange dark:text-white">
            <th className="px-3 py-2 text-left uppercase">Name</th>
            <th className="px-3 py-2 text-left uppercase">Email</th>
            <th className="px-3 py-2 text-left uppercase">Phone</th>
            <th className="px-3 py-2 text-center uppercase">Orders</th>
            <th className="px-3 py-2 text-center uppercase">Spent</th>
            <th className="px-3 py-2 text-left uppercase">Last Order</th>
          </tr></thead>
          <tbody>
            {paginated.map(c => (
              <tr key={c.id} className="border-t border-z-border/10 hover:bg-z-orange/5 transition-colors">
                <td className="px-3 py-2 font-black text-z-ink">{c.name}</td>
                <td className="px-3 py-2 text-z-ink">{c.email}</td>
                <td className="px-3 py-2 text-z-muted">{c.phone || '—'}</td>
                <td className="px-3 py-2 text-center text-z-orange font-black">{c.total_orders}</td>
                <td className="px-3 py-2 text-center text-z-ink font-black">₹{parseInt(c.total_spend).toLocaleString()}</td>
                <td className="px-3 py-2 text-z-muted">{c.last_order ? new Date(c.last_order).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1 text-[10px] font-mono font-black uppercase border-2 border-z-border/30 disabled:opacity-30 hover:border-z-orange hover:text-z-orange transition-all active:scale-95">Prev</button>
          <span className="text-[10px] font-mono font-black text-z-ink">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1 text-[10px] font-mono font-black uppercase border-2 border-z-border/30 disabled:opacity-30 hover:border-z-orange hover:text-z-orange transition-all active:scale-95">Next</button>
        </div>
      )}
    </div>
  );
}
