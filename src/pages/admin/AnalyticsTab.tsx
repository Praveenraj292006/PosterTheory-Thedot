import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { h, Spinner } from './shared';
import { TrendingUp, Eye, ShoppingBag, Users, DollarSign, BarChart3, Calendar } from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    byDay: { date: string; revenue: number; orders: number }[];
    byMonth: { month: string; revenue: number; orders: number }[];
    averageOrderValue: number;
  };
  orders: {
    total: number;
    byStatus: { status: string; count: string }[];
  };
  visits: {
    total: number;
    today: number;
    uniqueLast30Days: number;
    byPage: { page: string; views: string; unique_views: string }[];
    byDay: { date: string; views: string; unique_views: string }[];
  };
  products: {
    topSelling: { id: number; title: string; image: string; collection_name: string; units_sold: string; revenue: string }[];
    byCollection: { collection: string; units_sold: string; revenue: string }[];
    bySize: { size: string; units_sold: string; revenue: string }[];
    byLayout: { layout: string; units_sold: string; revenue: string }[];
  };
  customers: {
    total: number;
    newThisMonth: number;
  };
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonthLabel(monthStr: string) {
  const [year, month] = (monthStr || '').split('-');
  if (!year || !month) return monthStr;
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
}

function fillDays(data: { date: string; revenue: number; orders: number }[], start: string, end: string) {
  if (!start && !end && data.length <= 1) return data;
  const startD = start ? new Date(start) : data.length > 0 ? new Date(data[0].date) : new Date();
  const endD = end ? new Date(end) : data.length > 0 ? new Date(data[data.length - 1].date) : new Date();
  const map = new Map(data.map(d => [d.date.slice(0, 10), d]));
  const filled: { date: string; revenue: number; orders: number }[] = [];
  const cur = new Date(startD);
  while (cur <= endD) {
    const key = cur.toISOString().slice(0, 10);
    filled.push(map.get(key) || { date: key, revenue: 0, orders: 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return filled;
}

// Responsive SVG Line Chart with hover tooltip
function LineChart({ data, xLabel }: { data: { x: string; y: number }[]; xLabel: (d: { x: string }) => string }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) return <p className="text-[10px] font-mono text-z-muted text-center py-8">No data</p>;

  const maxY = Math.max(...data.map(d => d.y), 1);
  const w = 800;
  const h = 220;
  const padL = 55;
  const padR = 20;
  const padT = 30;
  const padB = 45;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const points = data.map((d, i) => ({
    x: padL + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2),
    y: padT + chartH - (d.y / maxY) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`;

  // Y axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
    value: Math.round(maxY * pct),
    y: padT + chartH - pct * chartH,
  }));

  // X axis labels (show max 8)
  const step = Math.max(1, Math.floor(data.length / 8));

  // Calculate % change for hovered point
  const getChange = (idx: number) => {
    const curr = data[idx].y;
    const prev = idx > 0 ? data[idx - 1].y : null;
    const next = idx < data.length - 1 ? data[idx + 1].y : null;

    const calcPct = (from: number, to: number) => {
      if (from === 0 && to === 0) return 0;
      if (from === 0) return 100;
      return ((to - from) / from) * 100;
    };

    return {
      // How much current is up/down compared to prev
      prevPct: prev !== null ? calcPct(prev, curr) : null,
      // How much current is up/down compared to next
      nextPct: next !== null ? calcPct(next, curr) : null,
    };
  };

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-52 sm:h-60" preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHovered(null)}>
        {/* Grid lines */}
        {yTicks.map(t => (
          <line key={t.value} x1={padL} x2={w - padR} y1={t.y} y2={t.y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
        ))}
        {/* Y labels */}
        {yTicks.map(t => (
          <text key={t.value} x={padL - 8} y={t.y + 4} textAnchor="end" className="text-[10px] font-mono fill-current opacity-40">
            {t.value > 999 ? `${(t.value / 1000).toFixed(1)}k` : t.value}
          </text>
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="url(#lineGradient)" opacity="0.3" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Hover zones + dots */}
        {points.map((p, i) => (
          <g key={i}>
            {/* Invisible wider hit area */}
            <rect
              x={padL + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2) - (chartW / data.length / 2)}
              y={padT} width={chartW / data.length} height={chartH}
              fill="transparent"
              onMouseEnter={() => setHovered(i)} />
            {/* Dot */}
            <circle cx={p.x} cy={p.y} r={hovered === i ? 5 : 3}
              fill={hovered === i ? '#F97316' : '#F97316'}
              stroke="var(--color-z-paper)" strokeWidth="2"
              className="transition-all duration-100" />
            {/* Vertical guide line on hover */}
            {hovered === i && (
              <line x1={p.x} x2={p.x} y1={padT} y2={padT + chartH} stroke="#F97316" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="4 3" />
            )}
          </g>
        ))}
        {/* X labels */}
        {data.map((d, i) => (
          (i % step === 0 || i === data.length - 1) ? (
            <text key={i} x={points[i].x} y={h - 10} textAnchor="middle" className="text-[9px] font-mono fill-current opacity-40">{xLabel(d)}</text>
          ) : null
        ))}
        {/* Gradient def */}
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {/* Tooltip */}
      {hovered !== null && (
        <div className="absolute top-2 right-2 bg-z-ink text-z-paper px-3 py-2 border border-z-border/20 shadow-lg text-[10px] font-mono z-20 pointer-events-none">
          <p className="font-black">{xLabel(data[hovered])}</p>
          <p className="text-z-orange font-bold mt-1">{`\u20b9`}{data[hovered].y.toLocaleString()}</p>
          {(() => {
            const { prevPct, nextPct } = getChange(hovered);
            return (
              <div className="flex items-center gap-3 mt-1.5">
                {prevPct !== null ? (
                  <span className={`font-black ${prevPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {prevPct >= 0 ? '\u25B2' : '\u25BC'} {Math.abs(prevPct).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-z-muted">\u2014</span>
                )}
                {nextPct !== null ? (
                  <span className={`font-black ${nextPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {nextPct >= 0 ? '\u25B2' : '\u25BC'} {Math.abs(nextPct).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-z-muted">\u2014</span>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Responsive SVG Pie Chart with hover
function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <p className="text-[10px] font-mono text-z-muted text-center py-8">No data</p>;

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 75;
  const hoverR = 82;

  let currentAngle = -Math.PI / 2;
  const slices = data.map((d, idx) => {
    const angle = (d.value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const isHovered = hovered === idx;
    const radius = isHovered ? hoverR : r;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    return {
      ...d,
      idx,
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      pct: ((d.value / total) * 100).toFixed(1),
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-44 h-44 sm:w-52 sm:h-52"
          onMouseLeave={() => setHovered(null)}>
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} stroke="var(--color-z-paper)" strokeWidth="2"
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHovered(i)} />
          ))}
          {/* Center label on hover */}
          {hovered !== null && (
            <>
              <text x={cx} y={cy - 6} textAnchor="middle" className="text-[11px] font-mono font-bold fill-current">{slices[hovered].pct}%</text>
              <text x={cx} y={cy + 10} textAnchor="middle" className="text-[8px] font-mono fill-current opacity-60">{slices[hovered].value} views</text>
            </>
          )}
        </svg>
      </div>
      <div className="space-y-2 flex-1 w-full">
        {slices.map((s, i) => (
          <div key={i}
            className={`flex items-center gap-2 text-[10px] font-mono px-2 py-1.5 rounded-sm transition-all cursor-pointer ${hovered === i ? 'bg-z-orange/10 scale-[1.02]' : ''}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}>
            <div className="w-3 h-3 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-z-ink font-bold truncate max-w-[160px]">{s.label}</span>
            <span className="text-z-muted ml-auto whitespace-nowrap">{s.value} ({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PIE_COLORS = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4', '#EF4444', '#6366F1', '#14B8A6'];

export default function AnalyticsTab({ token }: { token: string | null }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = (start?: string, end?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    const qs = params.toString() ? `?${params.toString()}` : '';
    api.get(`/api/admin/analytics${qs}`, h(token))
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const applyRange = () => fetchData(startDate, endDate);
  const clearRange = () => { setStartDate(''); setEndDate(''); fetchData(); };

  if (loading && !data) return <div className="flex items-center gap-2 py-8"><Spinner /> <span className="font-mono text-[11px] text-z-muted uppercase">Loading analytics...</span></div>;
  if (!data) return <p className="font-mono text-[11px] text-red-500">Failed to load analytics</p>;

  const revenueByDay = data.revenue?.byDay || [];
  const revenueByMonth = data.revenue?.byMonth || [];
  const filledDays = fillDays(revenueByDay, startDate, endDate);
  const useDaily = filledDays.length > 0;
  const revenueData = useDaily ? filledDays : revenueByMonth;
  const visitsData = data.visits?.byDay || [];
  const collectionData = data.products?.byCollection || [];

  const maxCollectionRevenue = Math.max(...collectionData.map(d => Number(d.revenue)), 1);
  const hasDateFilter = startDate || endDate;

  const statusLabels: Record<string, string> = {
    order_placed: 'New', verified: 'Verified', in_production: 'In Production',
    printed: 'Printed', ready_to_ship: 'Ready to Ship', out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered', cancelled: 'Cancelled',
  };

  // Prepare line chart data
  const lineData = revenueData.map(d => ({
    x: useDaily ? (d as any).date : (d as any).month,
    y: Number(d.revenue),
  }));

  // Prepare pie chart data for page visits
  const pageVisits = (data.visits?.byPage || []).slice(0, 8).map((p, i) => ({
    label: p.page,
    value: parseInt(p.views),
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <div className="space-y-8">
      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-2 border-z-border/20 bg-z-paper shadow-[4px_4px_0px_0px_var(--color-z-shadow)]">
        <Calendar className="w-4 h-4 text-z-orange" />
        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-z-muted">Date Range:</span>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="bg-z-paper border-2 border-z-border/30 px-3 py-1.5 text-[11px] font-mono text-z-ink focus:outline-none focus:border-z-orange" />
        <span className="text-[10px] font-mono text-z-muted">to</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          className="bg-z-paper border-2 border-z-border/30 px-3 py-1.5 text-[11px] font-mono text-z-ink focus:outline-none focus:border-z-orange" />
        <button onClick={applyRange}
          className="px-3 py-1.5 text-[9px] font-mono font-black uppercase border-2 border-z-orange text-z-orange hover:bg-z-orange hover:text-white transition-all">
          Apply
        </button>
        {hasDateFilter && (
          <button onClick={clearRange}
            className="px-3 py-1.5 text-[9px] font-mono font-black uppercase border-2 border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition-all">
            Clear
          </button>
        )}
        {hasDateFilter && <span className="text-[9px] font-mono text-z-orange font-black uppercase ml-auto">Filtered</span>}
        {loading && <Spinner />}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Revenue', value: `\u20b9${(data.revenue?.total || 0).toLocaleString()}`, icon: <DollarSign className="w-3.5 h-3.5" />, highlight: true },
          { label: 'Avg Order Value', value: `\u20b9${(data.revenue?.averageOrderValue || 0).toLocaleString()}`, icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { label: 'Total Orders', value: data.orders?.total || 0, icon: <ShoppingBag className="w-3.5 h-3.5" /> },
          { label: 'Page Views', value: (data.visits?.total || 0).toLocaleString(), icon: <Eye className="w-3.5 h-3.5" /> },
          { label: 'Views Today', value: data.visits?.today || 0, icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { label: 'Customers', value: `${data.customers?.total || 0} (+${data.customers?.newThisMonth || 0})`, icon: <Users className="w-3.5 h-3.5" /> },
        ].map(s => (
          <div key={s.label} className="bg-z-paper border-2 border-z-border/20 p-4 shadow-[4px_4px_0px_0px_var(--color-z-shadow)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-z-orange">{s.icon}</span>
              <p className="text-[9px] font-mono uppercase tracking-widest text-z-muted font-black">{s.label}</p>
            </div>
            <p className={`font-display font-black text-xl ${s.highlight ? 'text-z-orange' : 'text-z-ink'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Line Chart */}
      <section>
        <h3 className="font-display font-black text-lg uppercase tracking-tighter text-z-ink mb-3">Revenue</h3>
        <div className="border-2 border-z-border/20 p-4 overflow-x-auto">
          <LineChart
            data={lineData}
            xLabel={(d) => useDaily
              ? new Date(d.x).toLocaleDateString('en', { day: 'numeric', month: 'short' })
              : formatMonthLabel(d.x)}
          />
        </div>
      </section>

      {/* Page Visits Pie Chart */}
      <section>
        <h3 className="font-display font-black text-lg uppercase tracking-tighter text-z-ink mb-3">
          Page Visits <span className="text-z-muted text-sm">({data.visits?.uniqueLast30Days || 0} unique)</span>
        </h3>
        <div className="border-2 border-z-border/20 p-6">
          <PieChart data={pageVisits} />
        </div>
      </section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h3 className="font-display font-black text-lg uppercase tracking-tighter text-z-ink mb-3">Top Pages</h3>
          <div className="border-2 border-z-border/20 overflow-hidden">
            <table className="w-full text-[12px] font-mono">
              <thead><tr className="bg-z-ink text-z-paper">
                <th className="px-3 py-2 text-left uppercase">Page</th>
                <th className="px-3 py-2 text-right uppercase">Views</th>
                <th className="px-3 py-2 text-right uppercase">Unique</th>
              </tr></thead>
              <tbody>
                {(data.visits?.byPage || []).slice(0, 10).map(p => (
                  <tr key={p.page} className="border-t border-z-border/10 hover:bg-z-orange/5">
                    <td className="px-3 py-2 text-z-ink truncate max-w-[200px]">{p.page}</td>
                    <td className="px-3 py-2 text-right font-black text-z-orange">{p.views}</td>
                    <td className="px-3 py-2 text-right text-z-muted">{p.unique_views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="font-display font-black text-lg uppercase tracking-tighter text-z-ink mb-3">Order Status Breakdown</h3>
          <div className="border-2 border-z-border/20 p-4 space-y-2">
            {(data.orders?.byStatus || []).map(s => {
              const pct = data.orders.total ? (parseInt(s.count) / data.orders.total) * 100 : 0;
              return (
                <div key={s.status}>
                  <div className="flex justify-between text-[10px] font-mono font-black uppercase mb-1">
                    <span className="text-z-ink">{statusLabels[s.status] || s.status}</span>
                    <span className="text-z-muted">{s.count} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-3 bg-z-border/10 w-full"><div className="h-full bg-z-orange/80" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Revenue by Collection */}
      <section>
        <h3 className="font-display font-black text-lg uppercase tracking-tighter text-z-ink mb-3">Revenue by Collection (Genre)</h3>
        <div className="border-2 border-z-border/20 p-4 space-y-3">
          {collectionData.map(c => (
            <div key={c.collection}>
              <div className="flex justify-between text-[11px] font-mono font-black uppercase mb-1">
                <span className="text-z-ink">{c.collection}</span>
                <span className="text-z-orange">{'\u20b9'}{Number(c.revenue).toLocaleString()} <span className="text-z-muted font-normal">({c.units_sold} sold)</span></span>
              </div>
              <div className="h-4 bg-z-border/10 w-full rounded-sm overflow-hidden">
                <div className="h-full bg-gradient-to-r from-z-orange/80 to-z-orange" style={{ width: `${(Number(c.revenue) / maxCollectionRevenue) * 100}%` }} />
              </div>
            </div>
          ))}
          {collectionData.length === 0 && <p className="text-[11px] font-mono text-z-muted">No sales data yet</p>}
        </div>
      </section>

      {/* Size & Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h3 className="font-display font-black text-lg uppercase tracking-tighter text-z-ink mb-3">Sales by Size</h3>
          <div className="border-2 border-z-border/20 overflow-hidden">
            <table className="w-full text-[12px] font-mono">
              <thead><tr className="bg-z-ink text-z-paper">
                <th className="px-3 py-2 text-left uppercase">Size</th>
                <th className="px-3 py-2 text-right uppercase">Sold</th>
                <th className="px-3 py-2 text-right uppercase">Revenue</th>
              </tr></thead>
              <tbody>
                {(data.products?.bySize || []).map(s => (
                  <tr key={s.size} className="border-t border-z-border/10 hover:bg-z-orange/5">
                    <td className="px-3 py-2 font-black text-z-ink">{s.size || '\u2014'}</td>
                    <td className="px-3 py-2 text-right text-z-muted">{s.units_sold}</td>
                    <td className="px-3 py-2 text-right font-black text-z-orange">{'\u20b9'}{Number(s.revenue).toLocaleString()}</td>
                  </tr>
                ))}
                {(data.products?.bySize || []).length === 0 && <tr><td colSpan={3} className="px-3 py-4 text-center text-z-muted">No data</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="font-display font-black text-lg uppercase tracking-tighter text-z-ink mb-3">Sales by Layout</h3>
          <div className="border-2 border-z-border/20 overflow-hidden">
            <table className="w-full text-[12px] font-mono">
              <thead><tr className="bg-z-ink text-z-paper">
                <th className="px-3 py-2 text-left uppercase">Layout</th>
                <th className="px-3 py-2 text-right uppercase">Sold</th>
                <th className="px-3 py-2 text-right uppercase">Revenue</th>
              </tr></thead>
              <tbody>
                {(data.products?.byLayout || []).map(l => (
                  <tr key={l.layout} className="border-t border-z-border/10 hover:bg-z-orange/5">
                    <td className="px-3 py-2 font-black text-z-ink">{l.layout || '\u2014'}</td>
                    <td className="px-3 py-2 text-right text-z-muted">{l.units_sold}</td>
                    <td className="px-3 py-2 text-right font-black text-z-orange">{'\u20b9'}{Number(l.revenue).toLocaleString()}</td>
                  </tr>
                ))}
                {(data.products?.byLayout || []).length === 0 && <tr><td colSpan={3} className="px-3 py-4 text-center text-z-muted">No data</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Top Selling Products */}
      <section>
        <h3 className="font-display font-black text-lg uppercase tracking-tighter text-z-ink mb-3">Top Selling Posters</h3>
        <div className="border-2 border-z-border/20 overflow-x-auto">
          <table className="w-full text-[12px] font-mono">
            <thead><tr className="bg-z-ink text-z-paper">
              <th className="px-3 py-2 text-left uppercase">#</th>
              <th className="px-3 py-2 text-left uppercase">Poster</th>
              <th className="px-3 py-2 text-left uppercase">Collection</th>
              <th className="px-3 py-2 text-right uppercase">Sold</th>
              <th className="px-3 py-2 text-right uppercase">Revenue</th>
            </tr></thead>
            <tbody>
              {(data.products?.topSelling || []).map((p, i) => (
                <tr key={p.id} className="border-t border-z-border/10 hover:bg-z-orange/5">
                  <td className="px-3 py-2 font-black text-z-muted">{i + 1}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {p.image && <img src={p.image} className="w-8 h-8 object-cover border border-z-border/20" />}
                      <span className="text-z-ink font-black truncate max-w-[200px]">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-z-muted">{p.collection_name || '\u2014'}</td>
                  <td className="px-3 py-2 text-right font-black">{p.units_sold}</td>
                  <td className="px-3 py-2 text-right font-black text-z-orange">{'\u20b9'}{Number(p.revenue).toLocaleString()}</td>
                </tr>
              ))}
              {(data.products?.topSelling || []).length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-center text-z-muted">No sales data yet</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
