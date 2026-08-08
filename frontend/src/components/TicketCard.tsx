import { Ticket } from "../types/ticket";
import DecisionBadge from "./DecisionBadge";

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
  return (
    <div className="ticket-card" onClick={onClick}>
      <div className="ticket-header">
        <span className="ticket-id">#{ticket.id}</span>
        {ticket.decision && <DecisionBadge decision={ticket.decision} />}
      </div>
      <h3>{ticket.subject}</h3>
      <p className="ticket-description">{ticket.description}</p>
      <span className="ticket-status">{ticket.status}</span>
    </div>
  );
}