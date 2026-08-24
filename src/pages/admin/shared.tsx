import React, { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

// Mini loading spinner (orange in admin context)
export const Spinner = () => <Loader2 className="w-3.5 h-3.5 animate-spin text-z-orange" />;

// Hook for CRUD operations with loading state
export function useAction() {
  const [loading, setLoading] = useState(false);
  const run = useCallback(async (fn: () => Promise<any>) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  }, []);
  return { loading, run };
}

// Auth header helper
export const h = (t: string | null) => ({ headers: { Authorization: `Bearer ${t}` } });

// Shared UI components
export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    order_placed: 'Order Placed',
    verified: 'Verified',
    in_production: 'In Production',
    printed: 'Printed',
    ready_to_ship: 'Ready to Ship',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return <span className="px-2 py-0.5 text-[8px] font-mono font-black uppercase bg-z-ink text-z-paper">{labels[status] || status.replace(/_/g, ' ')}</span>;
}

export function MicroBadge({ children, red }: { children: React.ReactNode; red?: boolean }) {
  return <span className={`px-1.5 py-0.5 text-[7px] font-mono font-black uppercase ${red ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-z-orange/10 text-z-orange'}`}>{children}</span>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-z-muted mb-1 block font-black">{children}</label>;
}

export function Input({ label, value, onChange, required, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full bg-z-paper border-2 border-z-border/30 px-3 py-2.5 text-[12px] sm:text-[13px] font-mono text-z-ink focus:outline-none focus:border-z-orange transition-colors" />
    </div>
  );
}
