import { Ticket } from "../types/ticket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function getTickets(): Promise<Ticket[]> {
  const res = await fetch(`${API_URL}/tickets/`);
  return res.json();
}

export async function getTicket(id: string): Promise<Ticket> {
  const res = await fetch(`${API_URL}/tickets/${id}`);
  return res.json();
}

export async function createTicket(ticket: Omit<Ticket, "id">): Promise<Ticket> {
  const res = await fetch(`${API_URL}/tickets/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ticket),
  });
  return res.json();
}