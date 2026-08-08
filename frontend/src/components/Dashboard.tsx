import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { PipelineTicket, DashboardStats } from "../types/ticket";
import { DecisionBadge, ActionBadge, DeliveryBadge, ConfidenceBadge } from "./Badge";

interface DashboardProps {
  tickets: PipelineTicket[];
}

const ACTION_COLORS: Record<string, string> = {
  redelivery:        "#2563EB",
  full_refund:       "#DC2626",
  partial_refund:    "#D97706",
  refund_reissue:    "#7C3AED",
  apology_no_action: "#6B7280",
  coupon:            "#EC4899",
  escalation:        "#F59E0B",
};

const STATUS_COLORS = {
  AUTO_RESOLVE: "#059669",
  HUMAN_REVIEW: "#D97706",
};

function computeStats(tickets: PipelineTicket[]): DashboardStats {
  const total = tickets.length;
  const autoResolve = tickets.filter(t => t.decision.status === "AUTO_RESOLVE").length;
  const humanReview = tickets.filter(t => t.decision.status === "HUMAN_REVIEW").length;
  const delivered   = tickets.filter(t => t.order.delivery_status === "delivered").length;
  const cancelled   = tickets.filter(t => t.order.delivery_status === "cancelled").length;
  const avgConfidence = total > 0
    ? tickets.reduce((s, t) => s + t.decision.confidence, 0) / total : 0;

  const actionMap: Record<string, number> = {};
  tickets.forEach(t => {
    const a = t.decision.action || "none";
    actionMap[a] = (actionMap[a] || 0) + 1;
  });
  const actionBreakdown = Object.entries(actionMap)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count);

  const statusBreakdown = [
    { name: "Auto Resolve", value: autoResolve, color: STATUS_COLORS.AUTO_RESOLVE },
    { name: "Human Review", value: humanReview, color: STATUS_COLORS.HUMAN_REVIEW },
  ];

  const confidenceDistribution = [
    { range: "90-100%", count: tickets.filter(t => t.decision.confidence >= 0.9).length },
    { range: "80-89%",  count: tickets.filter(t => t.decision.confidence >= 0.8 && t.decision.confidence < 0.9).length },
    { range: "70-79%",  count: tickets.filter(t => t.decision.confidence >= 0.7 && t.decision.confidence < 0.8).length },
    { range: "<70%",    count: tickets.filter(t => t.decision.confidence < 0.7).length },
  ];

  const orderValueBreakdown = [
    { name: "₹0-200",   value: tickets.filter(t => t.order.value_inr <= 200).length,                                           color: "#2563EB" },
    { name: "₹201-500", value: tickets.filter(t => t.order.value_inr > 200 && t.order.value_inr <= 500).length,                color: "#7C3AED" },
    { name: "₹500+",    value: tickets.filter(t => t.order.value_inr > 500).length,                                            color: "#DC2626" },
  ];

  return { total, autoResolve, humanReview, delivered, cancelled, avgConfidence, actionBreakdown, statusBreakdown, confidenceDistribution, orderValueBreakdown };
}

export default function Dashboard({ tickets }: DashboardProps) {
  const navigate = useNavigate();
  const [filter, setFilter]               = useState<"ALL" | "AUTO_RESOLVE" | "HUMAN_REVIEW">("ALL");
  const [deliveryFilter, setDeliveryFilter] = useState<"ALL" | "delivered" | "cancelled">("ALL");
  const [search, setSearch]               = useState("");

  const stats = useMemo(() => computeStats(tickets), [tickets]);

  const filtered = useMemo(() => tickets.filter(t => {
    const matchStatus   = filter === "ALL"         || t.decision.status         === filter;
    const matchDelivery = deliveryFilter === "ALL" || t.order.delivery_status   === deliveryFilter;
    const matchSearch   = !search
      || t.ticket.ticket_id.toLowerCase().includes(search.toLowerCase())
      || t.ticket.description.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchDelivery && matchSearch;
  }), [tickets, filter, deliveryFilter, search]);

  // KPI cards — each navigates to /tickets with a ?filter= param
  const kpiCards = [
    { label: "Total Tickets",  value: stats.total,       color: "#7C3AED", sub: "processed",       filterParam: "" },
    { label: "Auto Resolve",   value: stats.autoResolve, color: "#059669", sub: `${stats.total > 0 ? Math.round(stats.autoResolve / stats.total * 100) : 0}% of total`, filterParam: "AUTO_RESOLVE" },
    { label: "Human Review",   value: stats.humanReview, color: "#D97706", sub: `${stats.total > 0 ? Math.round(stats.humanReview / stats.total * 100) : 0}% of total`, filterParam: "HUMAN_REVIEW" },
    { label: "Delivered",      value: stats.delivered,   color: "#2563EB", sub: "orders delivered", filterParam: "delivered" },
    { label: "Cancelled",      value: stats.cancelled,   color: "#DC2626", sub: "orders cancelled", filterParam: "cancelled" },
    { label: "Avg Confidence", value: `${Math.round(stats.avgConfidence * 100)}%`, color: "#7C3AED", sub: "AI confidence", filterParam: "" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Zepto Support Intelligence</h1>
            <p className="text-sm text-gray-500 mt-0.5">AI-powered ticket resolution dashboard — {stats.total} tickets processed</p>
          </div>
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-52 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto p-6 space-y-5">

        {/* KPI Cards — clickable, navigate to /tickets with filter */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpiCards.map(kpi => (
            <button
              key={kpi.label}
              onClick={() => kpi.filterParam
                ? navigate(`/tickets?filter=${kpi.filterParam}`)
                : navigate("/tickets")
              }
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-purple-300 transition-all text-left group cursor-pointer"
            >
              <div className="text-2xl font-bold group-hover:scale-105 transition-transform" style={{ color: kpi.color }}>{kpi.value}</div>
              <div className="text-sm font-medium text-gray-700 mt-0.5">{kpi.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{kpi.sub}</div>
            </button>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4">

          {/* Decision Status Donut — slices are clickable */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Decision Status</h2>
            <p className="text-xs text-gray-400 mb-3">AUTO_RESOLVE vs HUMAN_REVIEW</p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={stats.statusBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                  paddingAngle={3} dataKey="value"
                  onClick={(entry) => {
                    const f = entry.name === "Auto Resolve" ? "AUTO_RESOLVE" : "HUMAN_REVIEW";
                    navigate(`/tickets?filter=${f}`);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {stats.statusBreakdown.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-1">
              {stats.statusBreakdown.map(s => (
                <button
                  key={s.name}
                  onClick={() => navigate(`/tickets?filter=${s.name === "Auto Resolve" ? "AUTO_RESOLVE" : "HUMAN_REVIEW"}`)}
                  className="w-full flex items-center justify-between hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-gray-600">{s.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{s.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Breakdown Bar — bars clickable */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Resolution Actions</h2>
            <p className="text-xs text-gray-400 mb-3">Click a bar to filter tickets</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.actionBreakdown} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="action" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false}
                  tickFormatter={v => v.replace(/_/g, " ").substring(0, 8)} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #E5E7EB" }}
                  formatter={(value) => [value, "tickets"]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} style={{ cursor: "pointer" }}
                  onClick={(data: any) => data?.action && navigate(`/tickets?filter=${data.action}`)}>
                  {stats.actionBreakdown.map(entry => (
                    <Cell key={entry.action} fill={ACTION_COLORS[entry.action] || "#6B7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Confidence Distribution */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Confidence Distribution</h2>
            <p className="text-xs text-gray-400 mb-3">AI decision confidence ranges</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={stats.confidenceDistribution} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #E5E7EB" }} />
                <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">Order Value Breakdown</div>
              <div className="space-y-1.5">
                {stats.orderValueBreakdown.map(v => (
                  <div key={v.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} />
                    <span className="text-xs text-gray-600 w-16">{v.name}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${stats.total > 0 ? (v.value / stats.total) * 100 : 0}%`, backgroundColor: v.color }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-4">{v.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Table */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Ticket Queue</h2>
              <p className="text-xs text-gray-400">Showing {filtered.length} of {tickets.length} tickets</p>
            </div>
            <div className="flex items-center gap-2">
              {(["ALL", "AUTO_RESOLVE", "HUMAN_REVIEW"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${filter === f ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {f === "ALL" ? "All" : f === "AUTO_RESOLVE" ? "Auto" : "Human"}
                </button>
              ))}
              <div className="w-px h-5 bg-gray-200" />
              {(["ALL", "delivered", "cancelled"] as const).map(f => (
                <button key={f} onClick={() => setDeliveryFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${deliveryFilter === f ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {f === "ALL" ? "All Orders" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  {["Ticket", "Issue", "Order", "Delivery", "Decision", "Confidence", "Action", "Reason", "Precedents"].map(col => (
                    <th key={col} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5 first:pl-5">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-sm text-gray-400">No tickets match your filters</td></tr>
                ) : filtered.map((t, i) => (
                  <tr
                    key={t.ticket.ticket_id}
                    onClick={() => navigate(`/tickets/${t.ticket.ticket_id}`)}
                    className={`border-b border-gray-50 hover:bg-purple-50/40 cursor-pointer transition-colors ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}
                  >
                    <td className="px-5 py-3">
                      <span className="font-mono text-[12px] font-bold text-purple-700">{t.ticket.ticket_id}</span>
                      <div className="text-[10px] text-gray-400">{t.order.order_id}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <span className="text-[13px] text-gray-800 font-medium block truncate">{t.ticket.description}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[12px] font-semibold text-gray-700">₹{t.order.value_inr}</div>
                      <div className="text-[10px] text-gray-400">{t.order.items} item{t.order.items > 1 ? "s" : ""} · {t.order.delivery_time_min}min</div>
                    </td>
                    <td className="px-4 py-3"><DeliveryBadge status={t.order.delivery_status} /></td>
                    <td className="px-4 py-3"><DecisionBadge status={t.decision.status} /></td>
                    <td className="px-4 py-3"><ConfidenceBadge value={t.decision.confidence} /></td>
                    <td className="px-4 py-3"><ActionBadge action={t.decision.action} /></td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <span className="text-[11px] text-gray-400 line-clamp-2">{t.decision.reason_code.split(":")[0]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {t.precedents.slice(0, 3).map(p => (
                          <div key={p.ticket_id} title={`${p.ticket_id}: ${p.action} (CSAT ${p.csat})`}
                            className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[8px] font-bold text-purple-700 cursor-help">
                            {Math.round(p.similarity * 100)}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
