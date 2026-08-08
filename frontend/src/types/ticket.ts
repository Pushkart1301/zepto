export interface Ticket {
  id: string;
  subject: string;
  description: string;
  customer_id?: string;
  status: string;
  decision?: string;
  created_at?: string;
  precedents?: Precedent[];
}

export interface Precedent {
  id: string;
  subject: string;
  resolution: string;
  similarity: number;
}