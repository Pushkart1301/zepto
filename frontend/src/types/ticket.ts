// Matches Person 1's pipeline_output.json exactly

export interface TicketData {
  ticket_id: string;
  description: string;
  order_id: string;
}

export interface DecisionData {
  status: "AUTO_RESOLVE" | "HUMAN_REVIEW";
  confidence: number;
  action: string | null;
  reason_code: string;
}

export interface OrderData {
  order_id: string;
  items: number;
  value_inr: number;
  delivery_time_min: number;
  delivery_status: "delivered" | "cancelled";
}

export interface PrecedentData {
  ticket_id: string;
  similarity: number;
  action: string;
  resolution_note: string;
  csat: number;
}

export interface AIOutput {
  explanation: string;
  customer_reply: string;
}

export interface PipelineTicket {
  ticket: TicketData;
  decision: DecisionData;
  order: OrderData;
  precedents: PrecedentData[];
  ai?: AIOutput;
}

// Dashboard stats derived from PipelineTicket[]
export interface DashboardStats {
  total: number;
  autoResolve: number;
  humanReview: number;
  delivered: number;
  cancelled: number;
  avgConfidence: number;
  actionBreakdown: { action: string; count: number }[];
  statusBreakdown: { name: string; value: number; color: string }[];
  confidenceDistribution: { range: string; count: number }[];
  orderValueBreakdown: { name: string; value: number; color: string }[];
}
