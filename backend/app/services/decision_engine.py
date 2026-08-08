"""
decision_engine.py
Orchestrates the full pipeline and exposes process_ticket(ticket_id) → dict.

Pipeline:
  CSV → TF-IDF → Top-3 similar resolved tickets
      → Confidence → Policy validation
      → AUTO_RESOLVE / HUMAN_REVIEW
      → JSON result

Note on schema: new_tickets has no 'category' column.
Category is inferred from the top precedent's category after similarity search.
"""

from __future__ import annotations

from enum import Enum

from .data_loader import get_ticket_by_id
from .similarity import find_similar_tickets
from .confidence import calculate_confidence, MIN_AUTO_RESOLVE_CONFIDENCE
from .policy_engine import validate_order_action


class DecisionStatus(str, Enum):
    AUTO_RESOLVE  = "AUTO_RESOLVE"
    HUMAN_REVIEW  = "HUMAN_REVIEW"


# ── Decision rules (in priority order) ───────────────────────────────────────
#
#  1. Ticket not found                    → HUMAN_REVIEW / TICKET_NOT_FOUND
#  2. No meaningful precedents            → HUMAN_REVIEW / NO_PRECEDENTS_FOUND
#  3. Weak similarity                     → HUMAN_REVIEW / WEAK_SIMILARITY
#  4. Conflicting actions in precedents   → HUMAN_REVIEW / CONFLICTING_ACTIONS
#  5. Order policy violation              → HUMAN_REVIEW / POLICY_VIOLATION
#  6. Confidence below threshold          → HUMAN_REVIEW / LOW_CONFIDENCE
#  7. All checks pass                     → AUTO_RESOLVE  / STRONG_EVIDENCE
#


def process_ticket(ticket_id: str) -> dict:
    """
    Full pipeline for a single new ticket.

    Returns a JSON-serialisable dict:
    {
      "ticket":    { ticket_id, description, order_id },
      "decision":  { status, confidence, action, reason_code },
      "order":     { ...order fields or {} },
      "precedents":[{ ticket_id, similarity, action, resolution_note, csat }, ...]
    }
    """

    # ── Step 1: Load ticket ───────────────────────────────────────────────────
    ticket = get_ticket_by_id(ticket_id)
    if ticket is None:
        return _build_result(
            ticket_payload={"ticket_id": ticket_id, "description": "", "order_id": ""},
            status=DecisionStatus.HUMAN_REVIEW,
            confidence=0.0,
            action=None,
            reason_code="TICKET_NOT_FOUND",
            order_data={},
            precedents=[],
        )

    ticket_payload = {
        "ticket_id":   str(ticket["ticket_id"]),
        "description": str(ticket["description"]),
        "order_id":    str(ticket["order_id"]),
    }
    description = ticket_payload["description"]
    order_id    = ticket_payload["order_id"]

    # ── Step 2: Find similar resolved tickets (TF-IDF) ───────────────────────
    # No 'category' in new_tickets — pass empty string; TF-IDF still works on desc
    precedents = find_similar_tickets(description, category="", top_k=3)

    # ── Step 3: Calculate confidence ─────────────────────────────────────────
    conf_result = calculate_confidence(precedents)

    # ── Step 4: Decision rules ────────────────────────────────────────────────
    # Rule: no usable precedents
    if not precedents:
        return _build_result(
            ticket_payload=ticket_payload,
            status=DecisionStatus.HUMAN_REVIEW,
            confidence=conf_result.score,
            action=None,
            reason_code="NO_PRECEDENTS_FOUND",
            order_data={},
            precedents=[],
        )

    # Rule: weak similarity
    if conf_result.reason_code == "WEAK_SIMILARITY":
        return _build_result(
            ticket_payload=ticket_payload,
            status=DecisionStatus.HUMAN_REVIEW,
            confidence=conf_result.score,
            action=conf_result.dominant_action,
            reason_code="WEAK_SIMILARITY",
            order_data={},
            precedents=_serialize_precedents(precedents),
        )

    # Rule: conflicting actions
    if conf_result.reason_code == "CONFLICTING_ACTIONS":
        return _build_result(
            ticket_payload=ticket_payload,
            status=DecisionStatus.HUMAN_REVIEW,
            confidence=conf_result.score,
            action=conf_result.dominant_action,
            reason_code="CONFLICTING_ACTIONS",
            order_data={},
            precedents=_serialize_precedents(precedents),
        )

    # Rule: policy / order validation
    proposed_action = conf_result.dominant_action or "unknown"
    policy = validate_order_action(order_id, proposed_action)
    if not policy.is_valid:
        return _build_result(
            ticket_payload=ticket_payload,
            status=DecisionStatus.HUMAN_REVIEW,
            confidence=conf_result.score,
            action=proposed_action,
            reason_code=f"POLICY_VIOLATION: {policy.violation}",
            order_data=policy.order_data,
            precedents=_serialize_precedents(precedents),
        )

    # Rule: confidence too low
    if conf_result.score < MIN_AUTO_RESOLVE_CONFIDENCE:
        return _build_result(
            ticket_payload=ticket_payload,
            status=DecisionStatus.HUMAN_REVIEW,
            confidence=conf_result.score,
            action=proposed_action,
            reason_code="LOW_CONFIDENCE",
            order_data=policy.order_data,
            precedents=_serialize_precedents(precedents),
        )

    # ── All checks passed → AUTO_RESOLVE ─────────────────────────────────────
    # Build an explainable reason from the confidence components
    top_sim   = max(p.similarity for p in precedents)
    avg_sim   = round(sum(p.similarity for p in precedents) / len(precedents), 4)
    actions   = [p.action for p in precedents]
    consensus = round(actions.count(proposed_action) / len(actions), 2)
    csat_vals = [p.csat for p in precedents if p.csat is not None]
    avg_csat  = round(sum(csat_vals) / len(csat_vals), 1) if csat_vals else None

    reason_code = (
        f"STRONG_EVIDENCE: "
        f"{len(precedents)} similar cases matched "
        f"(top similarity {round(top_sim * 100)}%, avg {round(avg_sim * 100)}%), "
        f"action consensus {round(consensus * 100)}% on '{proposed_action}'"
        + (f", avg CSAT {avg_csat}/5" if avg_csat else "")
    )

    return _build_result(
        ticket_payload=ticket_payload,
        status=DecisionStatus.AUTO_RESOLVE,
        confidence=conf_result.score,
        action=proposed_action,
        reason_code=reason_code,
        order_data=policy.order_data,
        precedents=_serialize_precedents(precedents),
    )


# ── Helpers ───────────────────────────────────────────────────────────────────

def _serialize_precedents(precedents) -> list[dict]:
    return [
        {
            "ticket_id":       p.ticket_id,
            "similarity":      p.similarity,
            "action":          p.action,
            "resolution_note": p.resolution_note,
            "csat":            p.csat,
        }
        for p in precedents
    ]


def _build_result(
    ticket_payload: dict,
    status: DecisionStatus,
    confidence: float,
    action: str | None,
    reason_code: str,
    order_data: dict,
    precedents: list,
) -> dict:
    # Sanitise order_data: convert NaN/numpy types to JSON-safe Python types
    clean_order = {}
    for k, v in order_data.items():
        if v is None:
            clean_order[k] = None
        else:
            try:
                # Detect NaN
                import math
                if isinstance(v, float) and math.isnan(v):
                    clean_order[k] = None
                elif hasattr(v, "item"):       # numpy scalar
                    clean_order[k] = v.item()
                else:
                    clean_order[k] = v
            except (TypeError, ValueError):
                clean_order[k] = str(v)

    return {
        "ticket":     ticket_payload,
        "decision": {
            "status":      status.value,
            "confidence":  round(float(confidence), 4),
            "action":      action,
            "reason_code": reason_code,
        },
        "order":      clean_order,
        "precedents": precedents,
    }