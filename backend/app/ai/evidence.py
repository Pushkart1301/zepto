# backend/app/ai/evidence.py

from typing import Dict, Any, List
from app.ai.schemas import AIInput

class EvidencePackage:
    """
    Converts Person 1's AIInput into formatted evidence for LLM.
    CRITICAL: Does NOT invent data. Only formats what Person 1 gives.
    """
    
    def __init__(self, ai_input: AIInput):
        self.ai_input = ai_input
    
    def prepare(self) -> Dict[str, Any]:
        """
        Convert structured input into evidence dict for LLM.
        """
        precedent_actions = [p.action for p in self.ai_input.precedents]
        action_consensus = self._check_action_consensus(precedent_actions)
        
        return {
            # Ticket info
            "ticket_id": self.ai_input.ticket.ticket_id,
            "ticket_description": self.ai_input.ticket.description,
            
            # Backend decision (TRUST THIS, NEVER OVERRIDE)
            "backend_status": self.ai_input.decision.status,
            "confidence": self.ai_input.decision.confidence,
            "reason_code": self.ai_input.decision.reason_code,
            "selected_action": self.ai_input.decision.action,
            
            # Order context
            "order_id": self.ai_input.order.order_id,
            "order_value_inr": self.ai_input.order.value_inr,
            "order_status": self.ai_input.order.delivery_status,
            "order_cancelled": self.ai_input.order.delivery_status == "cancelled",
            
            # Precedent analysis
            "num_precedents": len(self.ai_input.precedents),
            "precedent_summary": self._summarize_precedents(),
            "action_consensus": action_consensus,
            "actions_in_precedents": list(action_consensus["actions"]),
            "conflicting_actions": action_consensus["conflicting"],
            "avg_csat": sum(p.csat for p in self.ai_input.precedents) / len(self.ai_input.precedents),
        }
    
    def _check_action_consensus(self, actions: List[str]) -> Dict:
        """Check if all precedent actions agree."""
        unique_actions = set(actions)
        return {
            "actions": unique_actions,
            "conflicting": len(unique_actions) > 1,
            "unanimous": len(unique_actions) == 1,
        }
    
    def _summarize_precedents(self) -> str:
        """Create natural language summary of precedents."""
        summaries = []
        for p in self.ai_input.precedents:
            sim_pct = int(p.similarity * 100)
            summaries.append(
                f"Ticket {p.ticket_id} ({sim_pct}% similar): "
                f"resolved via {p.action} (CSAT {p.csat})"
            )
        return " | ".join(summaries)