"""
policy_engine.py
Order-level policy validation rules.

Validates whether an action is consistent with the actual order state.
Uses columns from the real orders_context.csv:
  order_id, items, value_inr, delivery_time_min, delivery_status

Rules:
  - refund_* / partial_refund / full_refund: order must be "delivered"
  - redelivery:                              order must be "delivered"
  - apology_no_action:                       always valid
  - coupon:                                  always valid
  - escalation / refund_reissue:             always valid
  - order_id not found:                      HUMAN_REVIEW
"""

from __future__ import annotations

from dataclasses import dataclass

from .data_loader import get_order_by_id


# Actions that require the order to actually have been delivered
REQUIRES_DELIVERED = {
    "partial_refund", "full_refund", "redelivery",
    "refund_reissue", "escalation",
}

# Actions always permitted regardless of order state
ALWAYS_VALID = {
    "apology_no_action", "coupon", "escalation",
    "refund_reissue",   # refund re-trigger can happen irrespective
}


@dataclass
class PolicyResult:
    is_valid: bool
    violation: str | None       # None when valid
    order_data: dict            # raw order fields for the JSON response


def validate_order_action(order_id: str, proposed_action: str) -> PolicyResult:
    """
    Check whether proposed_action is allowed given the real order state.
    Returns PolicyResult; is_valid=False → HUMAN_REVIEW in decision engine.
    """
    order = get_order_by_id(order_id)

    if order is None:
        return PolicyResult(
            is_valid=False,
            violation=f"ORDER_NOT_FOUND: {order_id} not in orders_context",
            order_data={},
        )

    order_dict = {k: (None if (v != v) else v) for k, v in order.to_dict().items()}
    status = str(order_dict.get("delivery_status", "")).lower()

    # Always-valid actions skip delivery check
    if proposed_action in ALWAYS_VALID:
        return PolicyResult(is_valid=True, violation=None, order_data=order_dict)

    # Refund / redelivery require delivered status
    if proposed_action in REQUIRES_DELIVERED and status != "delivered":
        return PolicyResult(
            is_valid=False,
            violation=(
                f"ORDER_NOT_DELIVERED: action={proposed_action} requires "
                f"delivery_status=delivered, got={status}"
            ),
            order_data=order_dict,
        )

    return PolicyResult(is_valid=True, violation=None, order_data=order_dict)
