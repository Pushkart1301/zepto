import type { TicketStatus, TicketPriority, SLAStatus } from '../data/mock';

export function StatusBadge({ status }: { status: TicketStatus | string }) {
  const map: Record<string, string> = {
    'New': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Open': 'bg-purple-50 text-purple-700 border border-purple-200',
    'In Progress': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    'Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Resolved': 'bg-green-50 text-green-700 border border-green-200',
    'Closed': 'bg-gray-100 text-gray-600 border border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority | string }) {
  const map: Record<string, string> = {
    'Critical': 'bg-red-50 text-red-700 border border-red-200',
    'High': 'bg-orange-50 text-orange-700 border border-orange-200',
    'Medium': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Low': 'bg-green-50 text-green-700 border border-green-200',
  };
  const dots: Record<string, string> = {
    'Critical': 'bg-red-500',
    'High': 'bg-orange-500',
    'Medium': 'bg-amber-500',
    'Low': 'bg-green-500',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${map[priority] || 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[priority] || 'bg-gray-400'}`} />
      {priority}
    </span>
  );
}

export function SLABadge({ status, remaining }: { status: SLAStatus | string; remaining: string }) {
  if (remaining === 'Met') return <span className="text-[12px] text-green-600 font-medium">✓ Met</span>;
  if (status === 'Breached' || remaining === 'Breached') return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
      ⚠ Breached
    </span>
  );
  if (status === 'At Risk') return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
      ⏱ {remaining}
    </span>
  );
  return <span className="text-[12px] text-gray-600 font-medium font-mono">{remaining}</span>;
}

export function AgentAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-purple-600', 'bg-blue-600', 'bg-indigo-600', 'bg-teal-600', 'bg-rose-600', 'bg-amber-600'];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === 'md' ? 'w-8 h-8 text-[12px]' : 'w-6 h-6 text-[10px]';
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}
