import { PipelineTicket } from "../types/ticket";

// Fallback: empty array
// The frontend fetches all 30 tickets from the live Render backend API
// If the API is unreachable, this empty array triggers the fallback warning in App.tsx
export const mockTickets: PipelineTicket[] = [];
