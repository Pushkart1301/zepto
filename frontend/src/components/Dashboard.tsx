import { useState, useEffect } from "react";
import { getTickets } from "../services/api";
import TicketCard from "./TicketCard";
import StatsBar from "./StatsBar";
import { Ticket } from "../types/ticket";

interface DashboardProps {
  onSelectTicket: (ticketId: string) => void;
}

export default function Dashboard({ onSelectTicket }: DashboardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    getTickets().then(setTickets);
  }, []);

  return (
    <div className="dashboard">
      <h1>Zepto Support Dashboard</h1>
      <StatsBar tickets={tickets} />
      <div className="ticket-list">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} onClick={() => onSelectTicket(ticket.id)} />
        ))}
      </div>
    </div>
  );
}