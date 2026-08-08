import { PipelineTicket } from "../types/ticket";

// Real data from backend/data/pipeline_output.json
export const mockTickets: PipelineTicket[] = [
  {
    ticket: { ticket_id: "N-000", description: "fruits were rotten", order_id: "ORD-9900" },
    decision: { status: "HUMAN_REVIEW", confidence: 0.7969, action: "partial_refund", reason_code: "POLICY_VIOLATION: ORDER_NOT_DELIVERED: action=partial_refund requires delivery_status=delivered, got=cancelled" },
    order: { order_id: "ORD-9900", items: 1, value_inr: 999, delivery_time_min: 24, delivery_status: "cancelled" },
    precedents: [
      { ticket_id: "H-1142", similarity: 0.8737, action: "full_refund", resolution_note: "refunded order", csat: 4 },
      { ticket_id: "H-1129", similarity: 0.8737, action: "partial_refund", resolution_note: "refunded item", csat: 3 },
      { ticket_id: "H-1189", similarity: 0.8737, action: "partial_refund", resolution_note: "refunded item", csat: 5 },
    ],
    ai: { explanation: "Policy violation: order is cancelled, redelivery not possible. Historical cases with rotten fruits were refunded.", customer_reply: "We apologize for the inconvenience. Our team will review your case and arrange a refund within 24 hours." }
  },
  {
    ticket: { ticket_id: "N-001", description: "wrong brand of rice delivered", order_id: "ORD-9901" },
    decision: { status: "HUMAN_REVIEW", confidence: 0.9453, action: "redelivery", reason_code: "POLICY_VIOLATION: ORDER_NOT_DELIVERED: action=redelivery requires delivery_status=delivered, got=cancelled" },
    order: { order_id: "ORD-9901", items: 2, value_inr: 189, delivery_time_min: 28, delivery_status: "cancelled" },
    precedents: [
      { ticket_id: "H-1044", similarity: 0.9173, action: "redelivery", resolution_note: "correct item dispatched", csat: 5 },
      { ticket_id: "H-1096", similarity: 0.9173, action: "redelivery", resolution_note: "correct item dispatched", csat: 5 },
      { ticket_id: "H-1074", similarity: 0.9173, action: "redelivery", resolution_note: "correct item dispatched", csat: 4 },
    ],
    ai: { explanation: "High confidence (94%) from 3 similar cases — but order is cancelled, blocking redelivery. Needs human review.", customer_reply: "We're sorry about the wrong item. Your order was cancelled, so our team will reach out to arrange the best solution." }
  },
  {
    ticket: { ticket_id: "N-002", description: "milk packet missing from my order", order_id: "ORD-9902" },
    decision: { status: "HUMAN_REVIEW", confidence: 0.8395, action: "redelivery", reason_code: "POLICY_VIOLATION: ORDER_NOT_DELIVERED: action=redelivery requires delivery_status=delivered, got=cancelled" },
    order: { order_id: "ORD-9902", items: 5, value_inr: 999, delivery_time_min: 42, delivery_status: "cancelled" },
    precedents: [
      { ticket_id: "H-1000", similarity: 0.9323, action: "redelivery", resolution_note: "missing item re-sent", csat: 5 },
      { ticket_id: "H-1173", similarity: 0.9323, action: "redelivery", resolution_note: "missing item re-sent", csat: 4 },
      { ticket_id: "H-1163", similarity: 0.9323, action: "partial_refund", resolution_note: "refunded item value", csat: 4 },
    ],
    ai: { explanation: "Order is cancelled — cannot redeliver the missing milk packet. Historical cases support redelivery but constraint blocks it.", customer_reply: "We apologize for the missing item. Since your order was cancelled, we'll arrange a refund for the missing product." }
  },
  {
    ticket: { ticket_id: "N-003", description: "got salted butter instead of unsalted", order_id: "ORD-9903" },
    decision: { status: "HUMAN_REVIEW", confidence: 0.8392, action: "partial_refund", reason_code: "POLICY_VIOLATION: ORDER_NOT_DELIVERED: action=partial_refund requires delivery_status=delivered, got=cancelled" },
    order: { order_id: "ORD-9903", items: 3, value_inr: 999, delivery_time_min: 53, delivery_status: "cancelled" },
    precedents: [
      { ticket_id: "H-1063", similarity: 0.9317, action: "partial_refund", resolution_note: "refunded difference", csat: 4 },
      { ticket_id: "H-1083", similarity: 0.9317, action: "partial_refund", resolution_note: "refunded difference", csat: 5 },
      { ticket_id: "H-1238", similarity: 0.9317, action: "redelivery", resolution_note: "correct item dispatched", csat: 4 },
    ],
    ai: { explanation: "Wrong item substitution with cancelled order. Historical cases suggest partial refund. Human review needed due to policy constraint.", customer_reply: "We're sorry about the incorrect item. A specialist will contact you within 24 hours to resolve this." }
  },
  {
    ticket: { ticket_id: "N-004", description: "eggs broken in package", order_id: "ORD-9904" },
    decision: { status: "HUMAN_REVIEW", confidence: 0.8096, action: "full_refund", reason_code: "POLICY_VIOLATION: ORDER_NOT_DELIVERED: action=full_refund requires delivery_status=delivered, got=cancelled" },
    order: { order_id: "ORD-9904", items: 6, value_inr: 189, delivery_time_min: 14, delivery_status: "cancelled" },
    precedents: [
      { ticket_id: "H-1149", similarity: 0.8991, action: "full_refund", resolution_note: "refunded order", csat: 4 },
      { ticket_id: "H-1282", similarity: 0.8991, action: "partial_refund", resolution_note: "refunded item", csat: 5 },
      { ticket_id: "H-1198", similarity: 0.8991, action: "full_refund", resolution_note: "refunded order", csat: 3 },
    ],
    ai: { explanation: "Damaged goods in cancelled order. Full refund is the most common historical outcome for broken packaging.", customer_reply: "We sincerely apologize for the damaged eggs. Our team will process a full refund for your order shortly." }
  },
  {
    ticket: { ticket_id: "N-005", description: "milk packet missing from my order", order_id: "ORD-9905" },
    decision: { status: "AUTO_RESOLVE", confidence: 0.8395, action: "redelivery", reason_code: "STRONG_EVIDENCE" },
    order: { order_id: "ORD-9905", items: 1, value_inr: 412, delivery_time_min: 41, delivery_status: "delivered" },
    precedents: [
      { ticket_id: "H-1000", similarity: 0.9323, action: "redelivery", resolution_note: "missing item re-sent", csat: 5 },
      { ticket_id: "H-1173", similarity: 0.9323, action: "redelivery", resolution_note: "missing item re-sent", csat: 4 },
      { ticket_id: "H-1163", similarity: 0.9323, action: "partial_refund", resolution_note: "refunded item value", csat: 4 },
    ],
    ai: { explanation: "84% confidence from 3 highly similar cases (93% match). Redelivery is the most common action with avg CSAT 4.3/5.", customer_reply: "We're sorry the milk packet was missing! We'll resend it right away. Expect delivery within 24 hours." }
  },
  {
    ticket: { ticket_id: "N-006", description: "still waiting after 30 min", order_id: "ORD-9906" },
    decision: { status: "AUTO_RESOLVE", confidence: 0.8206, action: "apology_no_action", reason_code: "STRONG_EVIDENCE" },
    order: { order_id: "ORD-9906", items: 1, value_inr: 189, delivery_time_min: 35, delivery_status: "cancelled" },
    precedents: [
      { ticket_id: "H-1103", similarity: 0.9212, action: "coupon", resolution_note: "issued ₹50 coupon", csat: 5 },
      { ticket_id: "H-1145", similarity: 0.9212, action: "apology_no_action", resolution_note: "SLA breach < threshold", csat: 3 },
      { ticket_id: "H-1109", similarity: 0.9212, action: "apology_no_action", resolution_note: "SLA breach < threshold", csat: 4 },
    ],
    ai: { explanation: "Delivery delay within SLA threshold. Historical cases predominantly resolved with apology. No further action required.", customer_reply: "We apologize for the delay! Your order is on its way. Thank you for your patience." }
  },
  {
    ticket: { ticket_id: "N-007", description: "delivery way past promised time", order_id: "ORD-9907" },
    decision: { status: "AUTO_RESOLVE", confidence: 0.9203, action: "apology_no_action", reason_code: "STRONG_EVIDENCE" },
    order: { order_id: "ORD-9907", items: 4, value_inr: 412, delivery_time_min: 55, delivery_status: "cancelled" },
    precedents: [
      { ticket_id: "H-1299", similarity: 0.9206, action: "apology_no_action", resolution_note: "SLA breach < threshold", csat: 5 },
      { ticket_id: "H-1278", similarity: 0.9206, action: "apology_no_action", resolution_note: "SLA breach < threshold", csat: 4 },
      { ticket_id: "H-1076", similarity: 0.9206, action: "apology_no_action", resolution_note: "SLA breach < threshold", csat: 3 },
    ],
    ai: { explanation: "92% confidence — all 3 similar cases resolved with apology only. Delay is within policy thresholds.", customer_reply: "We sincerely apologize for the delay. We understand your frustration and are working to improve our delivery times." }
  },
  {
    ticket: { ticket_id: "N-008", description: "money not back for cancelled order", order_id: "ORD-9908" },
    decision: { status: "AUTO_RESOLVE", confidence: 0.8406, action: "refund_reissue", reason_code: "STRONG_EVIDENCE" },
    order: { order_id: "ORD-9908", items: 1, value_inr: 999, delivery_time_min: 26, delivery_status: "delivered" },
    precedents: [
      { ticket_id: "H-1090", similarity: 0.9345, action: "refund_reissue", resolution_note: "refund re-triggered", csat: 5 },
      { ticket_id: "H-1039", similarity: 0.9345, action: "refund_reissue", resolution_note: "refund re-triggered", csat: 3 },
      { ticket_id: "H-1094", similarity: 0.9345, action: "escalation", resolution_note: "sent to payments team", csat: 5 },
    ],
    ai: { explanation: "84% confidence. Two out of three similar cases were resolved via refund re-issue with high CSAT. Triggering refund reissue.", customer_reply: "We apologize for the delayed refund! We've re-triggered the refund process. You should see it in 3-5 business days." }
  },
  {
    ticket: { ticket_id: "N-009", description: "eggs broken in package", order_id: "ORD-9909" },
    decision: { status: "AUTO_RESOLVE", confidence: 0.8096, action: "full_refund", reason_code: "STRONG_EVIDENCE" },
    order: { order_id: "ORD-9909", items: 3, value_inr: 1450, delivery_time_min: 49, delivery_status: "delivered" },
    precedents: [
      { ticket_id: "H-1149", similarity: 0.8991, action: "full_refund", resolution_note: "refunded order", csat: 4 },
      { ticket_id: "H-1282", similarity: 0.8991, action: "partial_refund", resolution_note: "refunded item", csat: 5 },
      { ticket_id: "H-1198", similarity: 0.8991, action: "full_refund", resolution_note: "refunded order", csat: 3 },
    ],
    ai: { explanation: "Damaged package (broken eggs). Historical cases strongly support full refund. Order was delivered so refund is feasible.", customer_reply: "We're so sorry about the broken eggs! We've initiated a full refund for your order. It'll reflect within 3-5 days." }
  },
];
