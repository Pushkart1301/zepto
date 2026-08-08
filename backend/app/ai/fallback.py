"""Fallback responses when LLM is not available."""
from app.ai.schemas import AIInput, AIOutput

def generate_fallback_output(ai_input: AIInput) -> AIOutput:
    """Generate deterministic fallback output based on input."""
    
    ticket_desc = ai_input.ticket.description
    decision = ai_input.decision
    order = ai_input.order
    precedents = ai_input.precedents
    
    # Calculate average CSAT
    avg_csat = sum(p.csat for p in precedents) / len(precedents)
    
    # Build explanation
    explanation_parts = []
    
    if decision.status == "AUTO_RESOLVE":
        explanation_parts.append(f"Backend auto-resolved this ticket with {decision.confidence:.0%} confidence.")
    else:
        explanation_parts.append(f"This ticket requires human review. Confidence: {decision.confidence:.0%}.")
    
    # Add reason code info
    if decision.reason_code == "STRONG_PRECEDENT_AGREEMENT":
        explanation_parts.append("Strong precedent agreement - similar tickets were resolved consistently.")
    elif decision.reason_code == "LOW_SIMILARITY":
        explanation_parts.append("Low similarity to historical tickets - insufficient evidence for auto-resolution.")
    elif decision.reason_code == "CONFLICTING_PRECEDENTS":
        explanation_parts.append("Precedents disagree on the best resolution.")
    elif decision.reason_code == "ORDER_CONSTRAINT_VIOLATION":
        explanation_parts.append("Order constraint prevents standard resolution.")
    
    # Add CSAT context
    explanation_parts.append(f"Average customer satisfaction from similar cases: {avg_csat:.1f}/5.")
    
    explanation = " ".join(explanation_parts)
    
    # Build customer reply
    reply_parts = []
    
    # Handle cancelled order specially
    if order.delivery_status == "cancelled":
        reply_parts.append("We sincerely apologize for the inconvenience.")
        if "missing" in ticket_desc.lower():
            reply_parts.append("We see your order was cancelled and are reviewing alternative resolution options.")
        else:
            reply_parts.append("Our support team will contact you shortly to resolve this issue.")
        reply_parts.append("We value your patronage and hope to serve you better in the future.")
    else:
        # Normal delivery cases
        if decision.action:
            action = decision.action.lower()
            if "redelivery" in action or "resend" in action:
                reply_parts.append("We apologize for the missing item. We'll resend it to you right away.")
                reply_parts.append("You can expect delivery within 24 hours.")
            elif "refund" in action:
                reply_parts.append("We apologize for the inconvenience. We'll process a refund for you.")
                reply_parts.append("Please allow 3-5 business days for the amount to reflect in your account.")
            elif "coupon" in action:
                reply_parts.append("We apologize for the delay. Here's a ₹50 coupon for your next order.")
            else:
                reply_parts.append("We apologize for the inconvenience. We're working to resolve this for you.")
        else:
            # Human review case
            reply_parts.append("We apologize for the inconvenience.")
            reply_parts.append("Our support team will contact you within 24 hours to resolve this issue.")
    
    customer_reply = " ".join(reply_parts)
    
    return AIOutput(
        explanation=explanation,
        customer_reply=customer_reply
    )