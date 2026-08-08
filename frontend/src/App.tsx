import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import TicketDetail from "./components/TicketDetail";
import MyTickets from "./pages/MyTickets";
import Analytics from "./pages/Analytics";
import { PipelineTicket } from "./types/ticket";
import { mockTickets } from "./data/mockTickets";
import { getTickets } from "./services/api";
import { TicketsContext } from "./context/TicketsContext";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-300 mb-2">{title}</div>
        <div className="text-sm text-gray-400">Coming soon</div>
      </div>
    </div>
  );
}

function TicketDetailPage({ tickets }: { tickets: PipelineTicket[] }) {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const ticket = tickets.find(t => t.ticket.ticket_id === ticketId) ?? null;
  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Ticket "{ticketId}" not found.
      </div>
    );
  }
  return <TicketDetail ticket={ticket} onBack={() => navigate(-1)} />;
}

export default function App() {
  const [tickets, setTickets] = useState<PipelineTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTickets()
      .then(data => { setTickets(data); setLoading(false); })
      .catch(() => { setTickets(mockTickets); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <TicketsContext.Provider value={tickets}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard tickets={tickets} />} />
            <Route path="tickets" element={<MyTickets tickets={tickets} />} />
            <Route path="tickets/:ticketId" element={<TicketDetailPage tickets={tickets} />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TicketsContext.Provider>
  );
}
