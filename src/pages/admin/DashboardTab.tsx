import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { h, StatusBadge } from './shared';

export default function DashboardTab({ token }: { token: string | null }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api.get('/api/admin/dashboard', h(token)).then(r => setData(r.data)).catch(() => {}); }, []);

  if (!data) return <p className="font-mono text-[11px] text-z-muted uppercase animate-pulse">Loading dashboard...</p>;

  const stats = [
    { label: 'Total Orders', value: data.totalOrders },
    { label: 'Revenue', value: `₹${data.totalRevenue?.toLocaleString()}` },
    { label: 'This Month', value: data.ordersThisMonth },
    { label: 'Pending', value: data.pendingOrders },
    { label: 'Delivered', value: data.completedOrders },
    { label: 'Cancelled', value: data.cancelledOrders },
    { label: 'Custom Prints', value: data.customRequests },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
        {stats.map((s, i) => (
          <div key={s.label} className="bg-z-paper border-2 border-z-border/20 p-4 shadow-[4px_4px_0px_0px_var(--color-z-shadow)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <p className="text-[9px] font-mono uppercase tracking-widest text-z-muted font-black">{s.label}</p>
            <p className={`font-display font-black text-2xl mt-1 ${
              s.label === 'Revenue' ? 'text-z-orange' :
              s.label === 'Cancelled' ? 'text-red-500' :
              s.label === 'Delivered' ? 'text-green-600' :
              'text-z-ink'
            }`}>{s.value}</p>
          </div>
        ))}
      </div>

      <h3 className="font-display font-black text-lg uppercase tracking-tighter text-z-ink mb-4">Recent Orders</h3>
      <div className="border-2 border-z-border/20 overflow-x-auto">
        <table className="w-full text-[13px] font-mono">
          <thead><tr className="bg-z-ink text-z-paper">
            <th className="px-3 py-2 text-left uppercase">ID</th>
            <th className="px-3 py-2 text-left uppercase">Customer</th>
            <th className="px-3 py-2 text-left uppercase">Total</th>
            <th className="px-3 py-2 text-left uppercase">Status</th>
            <th className="px-3 py-2 text-left uppercase">Date</th>
          </tr></thead>
          <tbody>
            {(data.recentOrders || []).map((o: any) => (
              <tr key={o.id} className="border-t border-z-border/10 hover:bg-z-orange/5 transition-colors">
                <td className="px-3 py-2 font-black text-z-orange">#{o.id}</td>
                <td className="px-3 py-2 text-z-ink">{o.user_name}</td>
                <td className="px-3 py-2 text-z-ink">₹{o.total}</td>
                <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
                <td className="px-3 py-2 text-z-muted">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
