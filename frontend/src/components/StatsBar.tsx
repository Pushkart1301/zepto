import { Ticket } from "../types/ticket";

interface StatsBarProps {
  tickets: Ticket[];
}

export default function StatsBar({ tickets }: StatsBarProps) {
  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "pending").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-value">{stats.total}</span>
        <span className="stat-label">Total</span>
      </div>
      <div className="stat">
        <span className="stat-value">{stats.pending}</span>
        <span className="stat-label">Pending</span>
      </div>
      <div className="stat">
        <span className="stat-value">{stats.resolved}</span>
        <span className="stat-label">Resolved</span>
      </div>
    </div>
  );
}