import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { PipelineTicket } from '../types/ticket';

// ── Field derivation ──────────────────────────────────────────────────────────

type DisplayStatus   = 'Open' | 'In Progress' | 'Resolved' | 'Needs Review';
type DisplayPriority = 'Critical' | 'High' | 'Medium' | 'Low';
type DisplaySLA      = 'On Track' | 'At Risk' | 'Breached' | 'Met';

interface DisplayTicket {
  id: string;
  subject: string;
  orderId: string;
  category: string;
  priority: DisplayPriority;
  status: DisplayStatus;
  slaStatus: DisplaySLA;
  slaRemaining: string;
  deliveryStatus: string;
  confidence: number;
  action: string | null;
  createdAt: string;
}

function actionToCategory(action: string | null): string {
  const map: Record<string, string> = {
    full_refund: 'Refund', partial_refund: 'Refund', refund_reissue: 'Refund',
    redelivery: 'Delivery', apology_no_action: 'Complaint',
    coupon: 'Promotion', escalation: 'Escalation',
  };
  return action ? (map[action] ?? 'General') : 'General';
}

function derivePriority(t: PipelineTicket): DisplayPriority {
  if (t.decision.status === 'HUMAN_REVIEW') {
    if (t.decision.confidence >= 0.9) return 'Critical';
    if (t.decision.confidence >= 0.8) return 'High';
    return 'Medium';
  }
  if (t.decision.confidence >= 0.9) return 'High';
  if (t.decision.confidence >= 0.8) return 'Medium';
  return 'Low';
}

function deriveSLA(t: PipelineTicket): { status: DisplaySLA; remaining: string } {
  if (t.decision.status === 'AUTO_RESOLVE') return { status: 'Met', remaining: 'Met' };
  if (t.order.delivery_status === 'cancelled') return { status: 'Breached', remaining: 'Breached' };
  if (t.decision.confidence >= 0.9) return { status: 'At Risk', remaining: '18 min' };
  if (t.decision.confidence >= 0.8) return { status: 'At Risk', remaining: '42 min' };
  return { status: 'On Track', remaining: '2h 30m' };
}

function deriveStatus(t: PipelineTicket): DisplayStatus {
  if (t.decision.status === 'AUTO_RESOLVE') return 'Resolved';
  if (t.order.delivery_status === 'cancelled') return 'Needs Review';
  if (t.decision.confidence >= 0.9) return 'In Progress';
  return 'Open';
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

function mapToDisplay(t: PipelineTicket): DisplayTicket {
  const sla = deriveSLA(t);
  return {
    id:             t.ticket.ticket_id,
    subject:        t.ticket.description,
    orderId:        t.ticket.order_id,
    category:       actionToCategory(t.decision.action),
    priority:       derivePriority(t),
    status:         deriveStatus(t),
    slaStatus:      sla.status,
    slaRemaining:   sla.remaining,
    deliveryStatus: t.order.delivery_status,
    confidence:     t.decision.confidence,
    action:         t.decision.action,
    createdAt:      formatDate((t.ticket as any).created_at ?? ''),
  };
}

// ── Badges ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DisplayStatus }) {
  const map: Record<DisplayStatus, string> = {
    'Open':         'bg-purple-50 text-purple-700 border border-purple-200',
    'In Progress':  'bg-indigo-50 text-indigo-700 border border-indigo-200',
    'Resolved':     'bg-green-50 text-green-700 border border-green-200',
    'Needs Review': 'bg-amber-50 text-amber-700 border border-amber-200',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${map[status]}`}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: DisplayPriority }) {
  const map:  Record<DisplayPriority, string> = { Critical: 'bg-red-50 text-red-700 border border-red-200', High: 'bg-orange-50 text-orange-700 border border-orange-200', Medium: 'bg-amber-50 text-amber-700 border border-amber-200', Low: 'bg-green-50 text-green-700 border border-green-200' };
  const dots: Record<DisplayPriority, string> = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-amber-500', Low: 'bg-green-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${map[priority]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[priority]}`} />{priority}
    </span>
  );
}

function SLABadge({ status, remaining }: { status: DisplaySLA; remaining: string }) {
  if (remaining === 'Met')      return <span className="text-[12px] text-green-600 font-medium">✓ Met</span>;
  if (status === 'Breached')    return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">⚠ Breached</span>;
  if (status === 'At Risk')     return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">⏱ {remaining}</span>;
  return <span className="text-[12px] text-gray-600 font-medium font-mono">{remaining}</span>;
}

// ── Tab definitions (driven by ?filter= URL param) ────────────────────────────

// Maps URL ?filter= values to tab ids
const FILTER_TO_TAB: Record<string, string> = {
  HUMAN_REVIEW:  'review',
  AUTO_RESOLVE:  'resolved',
  delivered:     'delivered',
  cancelled:     'breached',
  // action filters
  redelivery:        'action_redelivery',
  full_refund:       'action_full_refund',
  partial_refund:    'action_partial_refund',
  refund_reissue:    'action_refund_reissue',
  apology_no_action: 'action_apology',
  escalation:        'action_escalation',
  // priority filters (from analytics)
  critical:  'priority_critical',
  high:      'priority_high',
  medium:    'priority_medium',
  low:       'priority_low',
  // confidence filters (from analytics)
  'conf_90': 'conf_90',
  'conf_80': 'conf_80',
  'conf_70': 'conf_70',
  'conf_lo': 'conf_lo',
  // category filters (from analytics)
  refund:    'cat_refund',
  delivery:  'cat_delivery',
  complaint: 'cat_complaint',
  promotion: 'cat_promotion',
  escalation_cat: 'cat_escalation',
};

// ── Page ──────────────────────────────────────────────────────────────────────

interface MyTicketsProps {
  tickets: PipelineTicket[];
}

export default function MyTickets({ tickets }: MyTicketsProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const display = useMemo(() => tickets.map(mapToDisplay), [tickets]);

  // Read ?filter= on mount / URL change and map to a tab
  const urlFilter = searchParams.get('filter') ?? '';
  const initialTab = FILTER_TO_TAB[urlFilter] ?? 'all';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Keep tab in sync with URL param when it changes (e.g. clicking KPI cards)
  useEffect(() => {
    const mapped = FILTER_TO_TAB[urlFilter] ?? 'all';
    setActiveTab(mapped);
  }, [urlFilter]);

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    // Remove filter param when switching manually so URL stays clean
    setSearchParams({});
  };

  const tabs = useMemo(() => [
    { id: 'all',      label: 'All Tickets',    count: display.length },
    { id: 'review',   label: 'Needs Review',   count: display.filter(t => t.status === 'Needs Review' || t.status === 'In Progress' || t.status === 'Open').length },
    { id: 'breached', label: 'SLA Breached',   count: display.filter(t => t.slaStatus === 'Breached').length },
    { id: 'risk',     label: 'At Risk',        count: display.filter(t => t.slaStatus === 'At Risk').length },
    { id: 'resolved', label: 'Auto Resolved',  count: display.filter(t => t.status === 'Resolved').length },
    { id: 'delivered',label: 'Delivered',      count: display.filter(t => t.deliveryStatus === 'delivered').length },
  ], [display]);

  const filtered = useMemo(() => {
    // Inline action filter from URL when not mapped to a named tab
    if (urlFilter && !FILTER_TO_TAB[urlFilter] && activeTab === 'all') {
      return display.filter(t => t.action === urlFilter);
    }
    switch (activeTab) {
      case 'review':    return display.filter(t => t.status === 'Needs Review' || t.status === 'In Progress' || t.status === 'Open');
      case 'breached':  return display.filter(t => t.slaStatus === 'Breached');
      case 'risk':      return display.filter(t => t.slaStatus === 'At Risk');
      case 'resolved':  return display.filter(t => t.status === 'Resolved');
      case 'delivered': return display.filter(t => t.deliveryStatus === 'delivered');
      // action tabs
      case 'action_redelivery':     return display.filter(t => t.action === 'redelivery');
      case 'action_full_refund':    return display.filter(t => t.action === 'full_refund');
      case 'action_partial_refund': return display.filter(t => t.action === 'partial_refund');
      case 'action_refund_reissue': return display.filter(t => t.action === 'refund_reissue');
      case 'action_apology':        return display.filter(t => t.action === 'apology_no_action');
      case 'action_escalation':     return display.filter(t => t.action === 'escalation');
      // priority tabs
      case 'priority_critical': return display.filter(t => t.priority === 'Critical');
      case 'priority_high':     return display.filter(t => t.priority === 'High');
      case 'priority_medium':   return display.filter(t => t.priority === 'Medium');
      case 'priority_low':      return display.filter(t => t.priority === 'Low');
      // confidence tabs
      case 'conf_90': return display.filter(t => t.confidence >= 0.9);
      case 'conf_80': return display.filter(t => t.confidence >= 0.8 && t.confidence < 0.9);
      case 'conf_70': return display.filter(t => t.confidence >= 0.7 && t.confidence < 0.8);
      case 'conf_lo': return display.filter(t => t.confidence < 0.7);
      // category tabs
      case 'cat_refund':     return display.filter(t => t.category === 'Refund');
      case 'cat_delivery':   return display.filter(t => t.category === 'Delivery');
      case 'cat_complaint':  return display.filter(t => t.category === 'Complaint');
      case 'cat_promotion':  return display.filter(t => t.category === 'Promotion');
      case 'cat_escalation': return display.filter(t => t.category === 'Escalation');
      default: return display;
    }
  }, [display, activeTab, urlFilter]);

  const kpis = useMemo(() => [
    { label: 'Total Tickets',  value: display.length,                                                            icon: AlertTriangle, color: '#7C3AED' },
    { label: 'SLA Breached',   value: display.filter(t => t.slaStatus === 'Breached').length,                    icon: Clock,         color: '#DC2626' },
    { label: 'Auto Resolved',  value: display.filter(t => t.status === 'Resolved').length,                       icon: CheckCircle,   color: '#059669' },
    { label: 'Avg Confidence', value: display.length ? `${Math.round(display.reduce((s, t) => s + t.confidence, 0) / display.length * 100)}%` : '—', icon: TrendingUp, color: '#D97706' },
  ], [display]);

  // Active tab label for display
  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label
    ?? (urlFilter ? urlFilter.replace(/_/g, ' ') : 'All Tickets');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Ticket Queue</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          {display.length} tickets · showing <span className="font-medium text-gray-700">{activeTabLabel}</span>
          {filtered.length !== display.length && ` (${filtered.length} matched)`}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${k.color}18` }}>
                  <Icon size={14} style={{ color: k.color }} />
                </div>
              </div>
              <div className="text-[24px] font-bold text-gray-900">{k.value}</div>
              <div className="text-[12px] text-gray-500 mt-0.5">{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-4 overflow-x-auto scroll-hidden">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all -mb-px whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Ticket ID', 'Description', 'Order', 'Category', 'Priority', 'Status', 'SLA', 'Action', 'Created'].map(col => (
                <th key={col} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-[13px] text-gray-400">No tickets in this category.</td></tr>
            ) : filtered.map((t, i) => (
              <tr
                key={t.id}
                onClick={() => navigate(`/tickets/${t.id}`)}
                className={`border-b border-gray-50 hover:bg-purple-50/20 cursor-pointer transition-all ${i % 2 !== 0 ? 'bg-gray-50/20' : ''}`}
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-[12px] font-semibold text-purple-700">{t.id}</span>
                  <div className="text-[10px] text-gray-400">{t.orderId}</div>
                </td>
                <td className="px-4 py-3 max-w-[220px]">
                  <span className="text-[13px] text-gray-800 truncate block">{t.subject}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${t.deliveryStatus === 'delivered' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {t.deliveryStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{t.category}</span>
                </td>
                <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3"><SLABadge status={t.slaStatus} remaining={t.slaRemaining} /></td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {t.action?.replace(/_/g, ' ') ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] text-gray-400">{t.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
