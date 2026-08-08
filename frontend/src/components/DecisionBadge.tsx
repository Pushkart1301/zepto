interface DecisionBadgeProps {
  decision: string;
}

export default function DecisionBadge({ decision }: DecisionBadgeProps) {
  const colors: Record<string, string> = {
    approve: "green",
    reject: "red",
    escalate: "yellow",
  };

  return (
    <span className="decision-badge" style={{ backgroundColor: colors[decision] || "gray" }}>
      {decision.toUpperCase()}
    </span>
  );
}