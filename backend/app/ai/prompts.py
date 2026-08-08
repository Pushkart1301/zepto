"""
LLM Prompts for Groq integration.
These prompts guide the LLM to generate explanations and customer replies
based on Person 1's decision engine output.
"""

SYSTEM_PROMPT = """You are a customer support AI assistant for Zepto (a rapid delivery service).

Your job is to generate two things based on a ticket decision:
1. An INTERNAL EXPLANATION for the support agent (explaining the reasoning)
2. A CUSTOMER-FACING REPLY (polite, empathetic, solution-focused)

CRITICAL RULES:
- NEVER override the backend decision (the decision is already made by the decision engine)
- NEVER invent refund amounts or delivery windows not provided by the backend
- NEVER suggest redelivery or resend if the order is cancelled
- NEVER mention internal terms like "AI", "LLM", "similarity score", "confidence", "precedent"
- NEVER make up customer service policies
- Base everything on the provided evidence (precedents, CSAT scores, order data)

Your output MUST be valid JSON with exactly these fields:
{
  "explanation": "String (20+ chars) - Internal reasoning for support team",
  "customer_reply": "String (10+ chars) - What to tell the customer"
}

Remember: The backend decision is final. Your job is to explain WHY it was made, not to question it."""

def build_user_prompt(evidence: dict) -> str:
    """
    Build the user prompt from evidence dict.
    This is the actual ticket data + decision + precedents.
    """
    
    lines = [
        "=== TICKET ANALYSIS ===",
        f"Ticket ID: {evidence['ticket_id']}",
        f"Customer Issue: {evidence['ticket_description']}",
        "",
        "=== BACKEND DECISION ===",
        f"Status: {evidence['backend_status']}",
        f"Confidence: {evidence['confidence']:.0%}",
        f"Recommended Action: {evidence['selected_action'] or 'None (needs human review)'}",
        f"Reason: {evidence['reason_code']}",
        "",
        "=== ORDER CONTEXT ===",
        f"Order ID: {evidence['order_id']}",
        f"Order Value: ₹{evidence['order_value_inr']:.0f}",
        f"Delivery Status: {evidence['order_status']}",
        f"Items: {evidence.get('num_items', '?')}",
        f"Delivery Time: {evidence.get('delivery_time_min', '?')} minutes",
        "",
        "=== HISTORICAL PRECEDENTS (Similar Past Cases) ===",
    ]
    
    # Add precedent summaries
    lines.append(evidence['precedent_summary'])
    
    lines.extend([
        "",
        "=== ANALYSIS ===",
        f"Number of Similar Cases: {evidence['num_precedents']}",
        f"Average Customer Satisfaction (CSAT): {evidence['avg_csat']:.1f}/5",
    ])
    
    # Add conflict info if relevant
    if evidence['conflicting_actions']:
        lines.append(f"⚠️ Note: Previous cases used different actions → Decision requires human review")
    
    # Add cancelled order warning if relevant
    if evidence['order_cancelled']:
        lines.append(f"⚠️ WARNING: Order is CANCELLED → Cannot redeliver, must offer alternative")
    
    lines.extend([
        "",
        "=== TASK ===",
        "Generate a JSON response with:",
        "1. explanation: Why we made this decision (for support team to understand)",
        "2. customer_reply: What to tell the customer (empathetic, professional)",
        "",
        "Return ONLY valid JSON, no additional text.",
    ])
    
    return "\n".join(lines)


def build_scenario_specific_prompt(evidence: dict) -> str:
    """
    Build scenario-specific guidance for the LLM.
    Tailors instructions based on decision status and reason code.
    """
    
    prompt = build_user_prompt(evidence)
    
    # Add scenario-specific guidance
    if evidence['backend_status'] == "AUTO_RESOLVE":
        prompt += "\n\n=== SCENARIO: AUTO-RESOLVE ===\n"
        prompt += "The decision engine is confident in this resolution.\n"
        prompt += "Your explanation should highlight why past cases succeeded with this action.\n"
        prompt += "Customer reply should be reassuring and specific about next steps."
    
    elif evidence['backend_status'] == "HUMAN_REVIEW":
        prompt += "\n\n=== SCENARIO: HUMAN REVIEW NEEDED ===\n"
        if "CONFLICTING" in evidence['reason_code']:
            prompt += "Past cases suggest different actions.\n"
            prompt += "Acknowledge the issue, explain we need specialist review, and set expectations.\n"
        elif "CANCELLED" in evidence['reason_code']:
            prompt += "Order is cancelled - redelivery impossible.\n"
            prompt += "Suggest alternative: refund, credit, or replacement options.\n"
        elif "LOW_SIMILARITY" in evidence['reason_code']:
            prompt += "Low confidence due to unique case.\n"
            prompt += "Apologize, explain specialist will review, set timeline for response.\n"
        elif "POLICY" in evidence['reason_code']:
            prompt += "Action violates business policy.\n"
            prompt += "Apologize, explain we need to follow procedures, offer workaround if possible.\n"
    
    return prompt
