import { useState } from "react";
import Dashboard from "./components/Dashboard";
import TicketDetail from "./components/TicketDetail";

function App() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  return (
    <div className="app">
      {selectedTicket ? (
        <TicketDetail ticketId={selectedTicket} onBack={() => setSelectedTicket(null)} />
      ) : (
        <Dashboard onSelectTicket={setSelectedTicket} />
      )}
    </div>
  );
}

export default App;