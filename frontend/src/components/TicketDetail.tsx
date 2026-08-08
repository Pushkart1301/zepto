import { useState, useEffect } from "react";
import { getTicket } from "../services/api";
import PrecedentCard from "./PrecedentCard";
import DecisionBadge from "./DecisionBadge";
import { Ticket } from "../types/ticket";

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}

export default function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    getTicket(ticketId).then(setTicket);
  }, [ticketId]);

  if (!ticket) return <div>Loading...</div>;

  return (
    <div className="ticket-detail">
      <button onClick={onBack}>← Back</button>
      <div className="detail-header">
        <h1>{ticket.subject}</h1>
        {ticket.decision && <DecisionBadge decision={ticket.decision} />}
      </div>
      <p className="detail-description">{ticket.description}</p>
      {ticket.precedents && ticket.precedents.length > 0 && (
        <div className="precedents">
          <h2>Similar Past Tickets</h2>
          {ticket.precedents.map((p) => (
            <PrecedentCard key={p.id} precedent={p} />
          ))}
        </div>
      )}
    </div>
  );
}