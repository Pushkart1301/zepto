import { PipelineTicket, AIOutput } from "../types/ticket";

const API_URL = import.meta.env.VITE_API_URL || "https://zepto-0d5q.onrender.com/api";

// Fetch all processed tickets from pipeline output
export async function getTickets(): Promise<PipelineTicket[]> {
  const res = await fetch(`${API_URL}/tickets/`);
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

// Fetch single ticket by ID
export async function getTicket(ticketId: string): Promise<PipelineTicket> {
  const res = await fetch(`${API_URL}/tickets/${ticketId}`);
  if (!res.ok) throw new Error(`Ticket ${ticketId} not found`);
  return res.json();
}

// Get AI response for a ticket (explanation + customer reply)
export async function getAIResponse(ticketId: string): Promise<AIOutput> {
  const res = await fetch(`${API_URL}/tickets/${ticketId}/ai`);
  if (!res.ok) throw new Error("Failed to get AI response");
  return res.json();
}

// Dashboard stats endpoint
export async function getDashboardStats() {
  const res = await fetch(`${API_URL}/dashboard/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
