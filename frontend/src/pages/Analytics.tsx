import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { useTickets } from '../context/TicketsContext';
import { PipelineTicket } from '../types/ticket';

// ── colour maps ───────────────────────────────────────────────────────────────
const ACTION_COLORS: Record<string, string> = {
  redelivery:        '#2563EB',
  full_refund:       '#DC2626',
  partial_refund:    '#D97706',
  refund_reissue:    '#7C3AED',
  apology_no_action: '#6B7280',
  coupon:            '#EC4899',
  escalation:        '#F59E0B',
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#DC2626',
  High:     '#F97316',
  Medium:   '#F59E0B',
  Low:      '#22C55E',
};

// ── helpers ───────────────────────────────────────────────────────────────────

function derivePriority(t: PipelineTicket): string {
  if (t.decision.status === 'HUMAN_REVIEW') {
    if (t.decision.confidence >= 0.9) return 'Critical';
    if (t.decision.confidence >= 0.8) return 'High';
    return 'Medium';
  }
  if (t.decision.confidence >= 0.9) return 'High';
  if (t.decision.confidence >= 0.8) return 'Medium';
  return 'Low';
}

function actionLabel(a: string | null) {
  return (a ?? 'none').replace(/_/g, ' ');
}

// ── component ─────────────────────────────────────────────────────────────────

export default function Analytics() {
  const navigate  = useNavigate();
  const tickets   = useTickets();
  const [_range, setRange] = useState('Today');

  const stats = useMemo(() => {
    const total      = tickets.length;
    const autoResolve = tickets.filter(t => t.decision.status === 'AUTO_RESOLVE').length;
    const humanReview = tickets.filter(t => t.decision.status === 'HUMAN_REVIEW').length;
    const delivered  = tickets.filter(t => t.order.delivery_status === 'delivered').length;
    const cancelled  = tickets.filter(t => t.order.delivery_status === 'cancelled').length;
    const avgConf    = total ? tickets.reduce((s, t) => s + t.decision.confidence, 0) / total : 0;

    // Hourly volume (intraday — all tickets same day)
    const hourBuckets: Record<string, { hour: string; created: number; resolved: number }> = {};
    tickets.forEach(t => {
      const iso = (t.ticket as any).created_at as string | undefined;
      const hr  = iso ? `${iso.slice(11, 13)}:00` : '??:00';
      if (!hourBuckets[hr]) hourBuckets[hr] = { hour: hr, created: 0, resolved: 0 };
      hourBuckets[hr].created++;
      if (t.decision.status === 'AUTO_RESOLVE') hourBuckets[hr].resolved++;
    });
    const volumeData = Object.values(hourBuckets).sort((a, b) => a.hour.localeCompare(b.hour));

    // Action breakdown
    const actionMap: Record<string, number> = {};
    tickets.forEach(t => {
      const a = t.decision.action ?? 'none';
      actionMap[a] = (actionMap[a] || 0) + 1;
    });
    const actionData = Object.entries(actionMap)
      .map(([action, count]) => ({ action, label: actionLabel(action), count, color: ACTION_COLORS[action] ?? '#6B7280' }))
      .sort((a, b) => b.count - a.count);

    // Category = derived from action
    const catLabels: Record<string, string> = {
      full_refund: 'Refund', partial_refund: 'Refund', refund_reissue: 'Refund',
      redelivery: 'Delivery', apology_no_action: 'Complaint',
      coupon: 'Promotion', escalation: 'Escalation', none: 'General',
    };
    const catMap: Record<string, number> = {};
    tickets.forEach(t => {
      const cat = catLabels[t.decision.action ?? 'none'] ?? 'General';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const categoryData = Object.entries(catMap)
      .map(([name, count]) => ({ name, count, pct: Math.round(count / total * 100) }))
      .sort((a, b) => b.count - a.count);

    // Priority breakdown
    const prioMap: Record<string, number> = {};
    tickets.forEach(t => {
      const p = derivePriority(t);
      prioMap[p] = (prioMap[p] || 0) + 1;
    });
    const priorityData = Object.entries(prioMap)
      .map(([priority, count]) => ({ priority, count, color: PRIORITY_COLORS[priority] ?? '#6B7280' }));

    // Confidence distribution (buckets) — keys match FILTER_TO_TAB in MyTickets
    const confBuckets = [
      { range: '90-100%', count: tickets.filter(t => t.decision.confidence >= 0.9).length,                                          filterKey: 'conf_90' },
      { range: '80-89%',  count: tickets.filter(t => t.decision.confidence >= 0.8 && t.decision.confidence < 0.9).length,           filterKey: 'conf_80' },
      { range: '70-79%',  count: tickets.filter(t => t.decision.confidence >= 0.7 && t.decision.confidence < 0.8).length,           filterKey: 'conf_70' },
      { range: '<70%',    count: tickets.filter(t => t.decision.confidence < 0.7).length,                                            filterKey: 'conf_lo' },
    ];

    // Order value buckets
    const valueBuckets = [
      { range: '₹0-200',   count: tickets.filter(t => t.order.value_inr <= 200).length,                                        color: '#2563EB' },
      { range: '₹201-500', count: tickets.filter(t => t.order.value_inr > 200 && t.order.value_inr <= 500).length,             color: '#7C3AED' },
      { range: '₹500+',    count: tickets.filter(t => t.order.value_inr > 500).length,                                         color: '#DC2626' },
    ];

    // Delivery status breakdown
    const deliveryData = [
      { name: 'Delivered', value: delivered, color: '#059669' },
      { name: 'Cancelled', value: cancelled,  color: '#DC2626' },
    ];

    // Resolution rate = AUTO_RESOLVE %
    const resolutionRate = total ? Math.round(autoResolve / total * 100) : 0;
    // SLA compliance = non-breached = delivered orders %
    const slaCompliance  = total ? Math.round(delivered / total * 100) : 0;

    return {
      total, autoResolve, humanReview, delivered, cancelled, avgConf,
      volumeData, actionData, categoryData, priorityData,
      confBuckets, valueBuckets, deliveryData,
      resolutionRate, slaCompliance,
    };
  }, [tickets]);

  const kpis = [
    { label: 'Auto Resolve Rate', value: `${stats.resolutionRate}%`,       sub: `${stats.autoResolve} of ${stats.total} tickets`, color: '#059669', filter: 'AUTO_RESOLVE' },
    { label: 'Human Review Rate', value: `${100 - stats.resolutionRate}%`, sub: `${stats.humanReview} tickets need review`,        color: '#D97706', filter: 'HUMAN_REVIEW' },
    { label: 'Avg Confidence',    value: `${Math.round(stats.avgConf * 100)}%`, sub: 'AI decision confidence',                    color: '#7C3AED', filter: 'conf_80' },
    { label: 'Delivery Success',  value: `${stats.slaCompliance}%`,        sub: `${stats.delivered} of ${stats.total} delivered`,  color: '#2563EB', filter: 'delivered' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Analytics</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Support performance and insights — {stats.total} tickets
          </p>
        </div>
        <div className="flex gap-1">
          {['Today', '7 Days', '30 Days'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-[12px] px-3 py-1.5 rounded-md font-medium transition-all ${
                _range === r
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100 border border-gray-200 bg-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {kpis.map(k => (
          <button
            key={k.label}
            onClick={() => navigate(`/tickets?filter=${k.filter}`)}
            className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-md hover:border-purple-300 transition-all"
          >
            <div className="text-[22px] font-bold" style={{ color: k.color }}>{k.value}</div>
            <div className="text-[12px] text-gray-600 mt-0.5 font-medium">{k.label}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{k.sub}</div>
          </button>
        ))}
      </div>

      {/* Row 1: Volume + Category */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-[14px] font-semibold text-gray-800 mb-1">Ticket Volume by Hour</h2>
          <p className="text-[11px] text-gray-400 mb-3">Created vs auto-resolved intraday · click legend to filter</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.volumeData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 6 }} />
              <Area type="monotone" dataKey="created"  stroke="#7C3AED" fill="url(#gc)" strokeWidth={2} name="Created" dot={false} />
              <Area type="monotone" dataKey="resolved" stroke="#059669" fill="none"      strokeWidth={2} name="Resolved" dot={false} />
              <Legend
                wrapperStyle={{ fontSize: 11, cursor: 'pointer' }}
                onClick={(e: any) => {
                  if (e.value === 'Resolved') navigate('/tickets?filter=AUTO_RESOLVE');
                  else navigate('/tickets');
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-[14px] font-semibold text-gray-800 mb-1">Tickets by Category</h2>
          <p className="text-[11px] text-gray-400 mb-3">Click to open filtered ticket list</p>
          <div className="space-y-2.5">
            {stats.categoryData.map(c => (
              <button
                key={c.name}
                onClick={() => navigate(`/tickets?filter=${c.name.toLowerCase()}`)}
                className="w-full flex items-center gap-2 group"
              >
                <span className="text-[12px] text-gray-600 w-20 text-left truncate group-hover:text-purple-700 transition-colors">{c.name}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all group-hover:bg-purple-600" style={{ width: `${c.pct}%` }} />
                </div>
                <span className="text-[11px] font-semibold text-gray-500 w-6 text-right">{c.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Action breakdown + Confidence distribution */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-[14px] font-semibold text-gray-800 mb-1">Resolution Actions</h2>
          <p className="text-[11px] text-gray-400 mb-3">Click a bar to filter tickets by action</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.actionData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
                tickFormatter={v => v.substring(0, 9)} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 6 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Tickets" cursor="pointer"
                onClick={(d: any) => d?.action && navigate(`/tickets?filter=${d.action}`)}>
                {stats.actionData.map(entry => (
                  <Cell key={entry.action} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-[14px] font-semibold text-gray-800 mb-1">Confidence Distribution</h2>
          <p className="text-[11px] text-gray-400 mb-3">Click a bar to filter tickets by confidence range</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.confBuckets} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 6 }} />
              <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Tickets" cursor="pointer"
                onClick={(d: any) => d?.filterKey && navigate(`/tickets?filter=${d.filterKey}`)} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Decision status donut + Order value + Delivery */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-[14px] font-semibold text-gray-800 mb-1">Decision Status</h2>
          <p className="text-[11px] text-gray-400 mb-2">Auto Resolve vs Human Review</p>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Auto Resolve', value: stats.autoResolve, color: '#059669' },
                  { name: 'Human Review', value: stats.humanReview, color: '#D97706' },
                ]}
                cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                paddingAngle={3} dataKey="value"
                onClick={(d: any) => navigate(`/tickets?filter=${d.name === 'Auto Resolve' ? 'AUTO_RESOLVE' : 'HUMAN_REVIEW'}`)}
                style={{ cursor: 'pointer' }}
              >
                {[{ color: '#059669' }, { color: '#D97706' }].map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #E5E7EB', borderRadius: 6 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-[14px] font-semibold text-gray-800 mb-1">Priority Breakdown</h2>
          <p className="text-[11px] text-gray-400 mb-2">Click to filter tickets by priority</p>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={stats.priorityData}
                cx="50%" cy="50%" outerRadius={70}
                paddingAngle={2} dataKey="count"
                onClick={(d: any) => navigate(`/tickets?filter=${d.priority?.toLowerCase()}`)}
                style={{ cursor: 'pointer' }}
              >
                {stats.priorityData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 11, border: '1px solid #E5E7EB', borderRadius: 6 }}
                formatter={(value, _name, props) => [value, props.payload.priority]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(_value, entry: any) => entry.payload.priority}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-[14px] font-semibold text-gray-800 mb-3">Order Value & Delivery</h2>

          {/* Order value bars */}
          <div className="space-y-2 mb-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Order Value</div>
            {stats.valueBuckets.map(v => (
              <div key={v.range} className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 w-16">{v.range}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${stats.total ? (v.count / stats.total) * 100 : 0}%`,
                    backgroundColor: v.color,
                  }} />
                </div>
                <span className="text-[11px] font-semibold text-gray-600 w-5 text-right">{v.count}</span>
              </div>
            ))}
          </div>

          {/* Delivery split */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Delivery Status</div>
            {stats.deliveryData.map(d => (
              <button
                key={d.name}
                onClick={() => navigate(`/tickets?filter=${d.name.toLowerCase()}`)}
                className="w-full flex items-center gap-2 group"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[12px] text-gray-600 flex-1 text-left group-hover:text-purple-700 transition-colors">{d.name}</span>
                <span className="text-[11px] font-semibold text-gray-700">{d.value}</span>
                <span className="text-[10px] text-gray-400">
                  {stats.total ? `${Math.round(d.value / stats.total * 100)}%` : '0%'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
