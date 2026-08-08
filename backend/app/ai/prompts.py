SYSTEM_PROMPT = """You are a ticket resolution assistant for a support team.
Analyze incoming tickets and suggest resolutions based on similar past tickets.

OUTPUT REQUIREMENTS:
- explanation: Internal reasoning for support agent (20+ chars)
- customer_reply: Customer-facing reply (10+ chars)
- NEVER mention internal terms like "LLM", "similarity", "precedent", "confidence score"
- NEVER invent refund amounts not provided by backend
- If order is cancelled, NEVER recommend redelivery/resend
- Output valid JSON only"""

TICKET_ANALYSIS_PROMPT = """Analyze this ticket and provide:
1. Category
2. Priority
3. Suggested resolution"""

TICKET_SUMMARY_PROMPT = """Summarize this ticket in 2-3 sentences:"""

def build_user_prompt(evidence: dict) -> str:
    """Build user prompt from evidence dict."""
    lines = [
        f"Ticket ID: {evidence['ticket_id']}",
        f"Description: {evidence['ticket_description']}",
        f"",
        f"Backend Decision: {evidence['backend_status']}",
        f"Confidence: {evidence['confidence']:.0%}",
        f"Reason: {evidence['reason_code']}",
        f"Selected Action: {evidence['selected_action'] or 'None'}",
        f"",
        f"Order: {evidence['order_id']} - ₹{evidence['order_value_inr']}, {evidence['order_status']}",
        f"",
        f"Precedents:",
        evidence['precedent_summary'],
        f"",
        f"Action Consensus: {'Unanimous' if evidence['action_consensus']['unanimous'] else 'Conflicting'}",
        f"Average CSAT: {evidence['avg_csat']:.1f}/5",
    ]
    
    if evidence['order_cancelled']:
        lines.append("\n⚠️ ORDER IS CANCELLED - cannot redeliver")
    
    if evidence['conflicting_actions']:
        lines.append("\n⚠️ Precedents disagree on resolution")
    
    lines.append("\nGenerate JSON with 'explanation' and 'customer_reply' fields.")
    
    return "\n".join(lines)