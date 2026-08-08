// Types
export type TicketStatus = 'New' | 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed';
export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type SLAStatus = 'On Track' | 'At Risk' | 'Breached';

export interface SupportTicket {
  id: string;
  subject: string;
  customer: string;
  customerId: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  slaStatus: SLAStatus;
  slaRemaining: string;
  agentId: string;
  agentName: string;
  created: string;
  updated: string;
  orderId?: string;
  description: string;
}

export const tickets: SupportTicket[] = [
  { id: 'ZPT-10482', subject: 'Payment deducted but order failed', customer: 'Rahul Sharma', customerId: 'c1', category: 'Payment', priority: 'Critical', status: 'Open', slaStatus: 'Breached', slaRemaining: 'Breached', agentId: 'a1', agentName: 'Aarav Mehta', created: 'Jan 8, 2026, 9:12 AM', updated: '10 min ago', orderId: 'ORD-9900', description: 'Customer was charged ₹999 but order shows as failed in the app.' },
  { id: 'ZPT-10481', subject: 'App crash on checkout for iOS 17', customer: 'Sneha Patel', customerId: 'c2', category: 'Technical', priority: 'Critical', status: 'In Progress', slaStatus: 'At Risk', slaRemaining: '18 min', agentId: 'a1', agentName: 'Aarav Mehta', created: 'Jan 8, 2026, 9:45 AM', updated: '5 min ago', description: 'App crashes when tapping Place Order on iOS 17.2.' },
  { id: 'ZPT-10480', subject: 'Wrong items delivered in grocery order', customer: 'Vikram Nair', customerId: 'c3', category: 'Delivery', priority: 'High', status: 'In Progress', slaStatus: 'At Risk', slaRemaining: '42 min', agentId: 'a1', agentName: 'Aarav Mehta', created: 'Jan 8, 2026, 10:02 AM', updated: '2 min ago', orderId: 'ORD-9901', description: 'Received salted butter instead of unsalted. Requested replacement.' },
  { id: 'ZPT-10479', subject: 'Refund not processed after 5 days', customer: 'Priya Joshi', customerId: 'c4', category: 'Refund', priority: 'High', status: 'Pending', slaStatus: 'At Risk', slaRemaining: '1h 10m', agentId: 'a1', agentName: 'Aarav Mehta', created: 'Jan 3, 2026, 3:20 PM', updated: '1 hr ago', orderId: 'ORD-9902', description: 'Refund of ₹412 for cancelled order not received after 5 business days.' },
  { id: 'ZPT-10478', subject: 'Eggs broken in delivery packaging', customer: 'Ananya Singh', customerId: 'c5', category: 'Delivery', priority: 'Medium', status: 'Open', slaStatus: 'On Track', slaRemaining: '3h 20m', agentId: 'a1', agentName: 'Aarav Mehta', created: 'Jan 8, 2026, 11:30 AM', updated: '30 min ago', orderId: 'ORD-9903', description: '6 out of 12 eggs were broken. Requesting partial refund.' },
  { id: 'ZPT-10477', subject: 'Delivery partner rude behaviour complaint', customer: 'Karan Mehta', customerId: 'c6', category: 'Complaint', priority: 'Medium', status: 'Open', slaStatus: 'On Track', slaRemaining: '4h 05m', agentId: 'a1', agentName: 'Aarav Mehta', created: 'Jan 8, 2026, 12:00 PM', updated: '1 hr ago', description: 'Delivery agent was rude and refused to wait at gate.' },
  { id: 'ZPT-10476', subject: 'Coupon code not applying at checkout', customer: 'Divya Reddy', customerId: 'c7', category: 'Technical', priority: 'Low', status: 'New', slaStatus: 'On Track', slaRemaining: '6h 00m', agentId: 'a1', agentName: 'Aarav Mehta', created: 'Jan 8, 2026, 1:15 PM', updated: 'Just now', description: 'ZEPTO20 coupon showing invalid error even though it is active.' },
  { id: 'ZPT-10475', subject: 'Missing milk packet from order', customer: 'Arjun Kapoor', customerId: 'c8', category: 'Delivery', priority: 'Medium', status: 'Resolved', slaStatus: 'On Track', slaRemaining: 'Met', agentId: 'a1', agentName: 'Aarav Mehta', created: 'Jan 7, 2026, 2:00 PM', updated: '2 hr ago', orderId: 'ORD-9905', description: 'Amul milk 1L was missing from the delivered order.' },
  { id: 'ZPT-10474', subject: 'Delayed delivery beyond 30 minutes', customer: 'Meera Iyer', customerId: 'c9', category: 'Delivery', priority: 'Low', status: 'Resolved', slaStatus: 'On Track', slaRemaining: 'Met', agentId: 'a1', agentName: 'Aarav Mehta', created: 'Jan 7, 2026, 4:30 PM', updated: '4 hr ago', description: 'Order took 52 minutes. Expected in 10 minutes as per app.' },
  { id: 'ZPT-10473', subject: 'Subscription plan not activated', customer: 'Rohit Gupta', customerId: 'c10', category: 'Account', priority: 'High', status: 'Resolved', slaStatus: 'On Track', slaRemaining: 'Met', agentId: 'a1', agentName: 'Aarav Mehta', created: 'Jan 6, 2026, 10:00 AM', updated: 'Yesterday', description: 'Paid for Zepto Pass but benefits not reflecting in app.' },
  { id: 'ZPT-10472', subject: 'Fruits were rotten on arrival', customer: 'Sunita Rao', customerId: 'c11', category: 'Quality', priority: 'High', status: 'Resolved', slaStatus: 'On Track', slaRemaining: 'Met', agentId: 'a1', agentName: 'Aarav Mehta', created: 'Jan 5, 2026, 9:00 AM', updated: '2 days ago', orderId: 'ORD-9904', description: 'Mangoes and grapes received were completely rotten.' },
  { id: 'ZPT-10471', subject: 'Double charge for single order', customer: 'Nikhil Verma', customerId: 'c12', category: 'Payment', priority: 'Critical', status: 'Closed', slaStatus: 'On Track', slaRemaining: 'Met', agentId: 'a1', agentName: 'Aarav Mehta', created: 'Jan 4, 2026, 5:00 PM', updated: '3 days ago', description: 'Bank shows two debits of ₹189 for a single order.' },
  { id: 'ZPT-10470', subject: 'Order cancelled without notification', customer: 'Pooja Sharma', customerId: 'c13', category: 'Delivery', priority: 'Medium', status: 'Closed', slaStatus: 'On Track', slaRemaining: 'Met', agentId: 'a2', agentName: 'Priya Singh', created: 'Jan 4, 2026, 3:00 PM', updated: '3 days ago', description: 'Order was silently cancelled. No SMS or email received.' },
  { id: 'ZPT-10469', subject: 'Wrong brand of rice delivered', customer: 'Amit Kumar', customerId: 'c14', category: 'Delivery', priority: 'Medium', status: 'In Progress', slaStatus: 'On Track', slaRemaining: '2h 30m', agentId: 'a2', agentName: 'Priya Singh', created: 'Jan 8, 2026, 8:00 AM', updated: '3 hr ago', orderId: 'ORD-9906', description: 'Ordered India Gate Classic, received Fortune brand instead.' },
  { id: 'ZPT-10468', subject: 'Money not refunded for cancelled order', customer: 'Neha Jain', customerId: 'c15', category: 'Refund', priority: 'High', status: 'Open', slaStatus: 'On Track', slaRemaining: '5h 00m', agentId: 'a2', agentName: 'Priya Singh', created: 'Jan 8, 2026, 7:30 AM', updated: '4 hr ago', description: 'Cancelled ORD-9907 two days ago, refund of ₹999 still pending.' },
];

export interface Notification {
  id: string;
  type: 'breach' | 'assign' | 'reply' | 'resolve' | 'alert';
  message: string;
  time: string;
  ticketId: string;
  read: boolean;
}

// Mock notifications
export const notifications: Notification[] = [
  { id: '1', type: 'breach', message: 'SLA breached on ZPT-10482 — Payment deducted but order failed', time: '2 min ago', ticketId: 'ZPT-10482', read: false },
  { id: '2', type: 'assign', message: 'ZPT-10480 assigned to you by Priya Singh', time: '15 min ago', ticketId: 'ZPT-10480', read: false },
  { id: '3', type: 'reply', message: 'Customer replied on ZPT-10479 — Refund not processed', time: '32 min ago', ticketId: 'ZPT-10479', read: false },
  { id: '4', type: 'resolve', message: 'ZPT-10475 resolved by Rohan Verma', time: '1 hr ago', ticketId: 'ZPT-10475', read: true },
  { id: '5', type: 'alert', message: 'High ticket volume alert — 23 new tickets in last hour', time: '1.5 hr ago', ticketId: '', read: true },
];
