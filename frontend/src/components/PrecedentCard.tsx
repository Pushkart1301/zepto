interface PrecedentCardProps {
  precedent: {
    id: string;
    subject: string;
    resolution: string;
    similarity: number;
  };
}

export default function PrecedentCard({ precedent }: PrecedentCardProps) {
  return (
    <div className="precedent-card">
      <div className="precedent-header">
        <span className="precedent-id">#{precedent.id}</span>
        <span className="similarity">{Math.round(precedent.similarity * 100)}% match</span>
      </div>
      <h4>{precedent.subject}</h4>
      <p className="resolution">{precedent.resolution}</p>
    </div>
  );
}