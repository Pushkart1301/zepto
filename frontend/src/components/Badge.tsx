// Badges for decision status, actions, delivery, confidence

interface DecisionBadgeProps { status: "AUTO_RESOLVE" | "HUMAN_REVIEW" | string; }
export function DecisionBadge({ status }: DecisionBadgeProps) {
  const styles: Record<string, string> = {
    AUTO_RESOLVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    HUMAN_REVIEW: "bg-amber-100 text-amber-700 border-amberald-200",
  };
  const labels: Record<string, string> = {
    AUTO_RESOLVE: "Auto Resolve",
    HUMAN_REVIEW: "Human Review",
  };
  const style = styles[status] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {labels[status] || status}
    </span>
  );
}

interface ActionBadgeProps { action: string | null; }
export function ActionBadge({ action }: ActionBadgeProps) {
  if (!action) return <span className="text-[11px] text-gray-400">—</span>;
  const styles: Record<string, string> = {
    redelivery: "bg-blue-100 text-blue-700",
    full_refund: "bg-red-100 text-red-700",
    partial_refund: "bg-orange-100 text-orange-700",
    refund_reissue: "bg-purple-100 text-purple-700",
    apology_no_action: "bg-gray-100 text-gray-600",
    coupon: "bg-pink-100 text-pink-700",
    escalation: "bg-yellow-100 text-yellow-700",
  };
  const style = styles[action] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${style}`}>
      {action.replace(/_/g, " ")}
    </span>
  );
}

interface DeliveryBadgeProps { status: "delivered" | "cancelled" | string; }
export function DeliveryBadge({ status }: DeliveryBadgeProps) {
  const style = status === "delivered"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${style}`}>
      {status}
    </span>
  );
}

interface ConfidenceBadgeProps { value: number; }
export function ConfidenceBadge({ value }: ConfidenceBadgeProps) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? "text-emerald-600" : pct >= 70 ? "text-amber-600" : "text-red-500";
  return (
    <span className={`text-[12px] font-bold ${color}`}>{pct}%</span>
  );
}
