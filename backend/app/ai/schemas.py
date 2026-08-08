from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from enum import Enum


# PHASE 1: PYDANTIC INPUT CONTRACT

class TicketData(BaseModel):
    """Person 1 provides this."""
    ticket_id: str = Field(..., min_length=1, description="Unique ticket identifier")
    description: str = Field(..., min_length=3, description="Customer's issue description")
    order_id: str = Field(..., min_length=1, description="Associated order ID")


class DecisionData(BaseModel):
    """Person 1's decision engine output."""
    status: str = Field(..., description="AUTO_RESOLVE or HUMAN_REVIEW")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence 0-1")
    action: Optional[str] = Field(None, description="Resolution action (may be None for HUMAN_REVIEW)")
    reason_code: str = Field(..., description="Code explaining the decision")

    @validator("status")
    def validate_status(cls, v):
        if v not in ["AUTO_RESOLVE", "HUMAN_REVIEW"]:
            raise ValueError("Status must be AUTO_RESOLVE or HUMAN_REVIEW")
        return v


class OrderData(BaseModel):
    """Order context from orders_context.csv"""
    order_id: str = Field(..., min_length=1)
    value_inr: float = Field(..., ge=0, description="Order value in rupees")
    delivery_status: str = Field(..., description="delivered or cancelled")
    items: int = Field(..., ge=1)
    delivery_time_min: int = Field(..., ge=0)

    @validator("delivery_status")
    def validate_delivery_status(cls, v):
        if v not in ["delivered", "cancelled"]:
            raise ValueError("Delivery status must be 'delivered' or 'cancelled'")
        return v


class PrecedentData(BaseModel):
    """Top-3 historical similar ticket."""
    ticket_id: str = Field(..., min_length=1)
    similarity: float = Field(..., ge=0.0, le=1.0, description="Similarity score 0-1")
    action: str = Field(..., description="Historical resolution action")
    resolution_note: str = Field(..., description="How it was resolved")
    csat: int = Field(..., ge=3, le=5, description="Customer satisfaction 3/4/5")


class AIInput(BaseModel):
    """Complete input from Person 1 to Person 2."""
    ticket: TicketData
    decision: DecisionData
    order: OrderData
    precedents: List[PrecedentData] = Field(..., min_items=1, max_items=3)

    @validator("precedents")
    def validate_precedents(cls, v):
        if len(v) == 0:
            raise ValueError("Must have at least 1 precedent")
        if len(v) > 3:
            raise ValueError("Maximum 3 precedents")
        return v


# PHASE 1: PYDANTIC OUTPUT CONTRACT

class AIOutput(BaseModel):
    """Person 2's output to Person 3 (frontend)."""
    explanation: str = Field(..., min_length=20, description="Internal reasoning for support agent")
    customer_reply: str = Field(..., min_length=10, description="Customer-facing reply")


# PHASE 4a: MOCK DATA FOR INDEPENDENT DEVELOPMENT

class MockDataGenerator:
    """Generate realistic mock Person 1 outputs for testing."""

    @staticmethod
    def scenario_a_strong_precedent() -> AIInput:
        """Scenario A: Strong precedent, auto-resolve, all actions agree."""
        return AIInput(
            ticket=TicketData(
                ticket_id="N-005",
                description="milk packet missing from my order",
                order_id="ORD-9905"
            ),
            decision=DecisionData(
                status="AUTO_RESOLVE",
                confidence=0.92,
                action="redelivery",
                reason_code="STRONG_PRECEDENT_AGREEMENT"
            ),
            order=OrderData(
                order_id="ORD-9905",
                value_inr=412.0,
                delivery_status="delivered",
                items=1,
                delivery_time_min=41
            ),
            precedents=[
                PrecedentData(
                    ticket_id="H-1000",
                    similarity=0.99,
                    action="redelivery",
                    resolution_note="missing item re-sent",
                    csat=5
                ),
                PrecedentData(
                    ticket_id="H-1007",
                    similarity=0.99,
                    action="redelivery",
                    resolution_note="missing item re-sent",
                    csat=4
                ),
                PrecedentData(
                    ticket_id="H-1017",
                    similarity=0.93,
                    action="partial_refund",
                    resolution_note="refunded item value",
                    csat=4
                ),
            ]
        )

    @staticmethod
    def scenario_b_low_similarity() -> AIInput:
        """Scenario B: Low similarity, human review, insufficient evidence."""
        return AIInput(
            ticket=TicketData(
                ticket_id="N-006",
                description="still waiting after 30 min",
                order_id="ORD-9906"
            ),
            decision=DecisionData(
                status="HUMAN_REVIEW",
                confidence=0.62,
                action=None,
                reason_code="LOW_SIMILARITY"
            ),
            order=OrderData(
                order_id="ORD-9906",
                value_inr=189.0,
                delivery_status="delivered",
                items=1,
                delivery_time_min=35
            ),
            precedents=[
                PrecedentData(
                    ticket_id="H-100",
                    similarity=0.68,
                    action="apology_no_action",
                    resolution_note="clarified delivery window",
                    csat=3
                ),
                PrecedentData(
                    ticket_id="H-101",
                    similarity=0.65,
                    action="coupon",
                    resolution_note="issued ₹50 coupon",
                    csat=4
                ),
                PrecedentData(
                    ticket_id="H-102",
                    similarity=0.61,
                    action="escalation",
                    resolution_note="sent to operations",
                    csat=3
                ),
            ]
        )

    @staticmethod
    def scenario_c_conflicting_precedents() -> AIInput:
        """Scenario C: Conflicting precedents, human review."""
        return AIInput(
            ticket=TicketData(
                ticket_id="N-001",
                description="wrong brand of rice delivered",
                order_id="ORD-9901"
            ),
            decision=DecisionData(
                status="HUMAN_REVIEW",
                confidence=0.78,
                action=None,
                reason_code="CONFLICTING_PRECEDENTS"
            ),
            order=OrderData(
                order_id="ORD-9901",
                value_inr=189.0,
                delivery_status="delivered",
                items=2,
                delivery_time_min=28
            ),
            precedents=[
                PrecedentData(
                    ticket_id="H-1005",
                    similarity=0.97,
                    action="redelivery",
                    resolution_note="correct item dispatched",
                    csat=5
                ),
                PrecedentData(
                    ticket_id="H-1013",
                    similarity=0.96,
                    action="partial_refund",
                    resolution_note="refunded difference",
                    csat=3
                ),
                PrecedentData(
                    ticket_id="H-1009",
                    similarity=0.94,
                    action="redelivery",
                    resolution_note="correct item dispatched",
                    csat=4
                ),
            ]
        )

    @staticmethod
    def scenario_d_cancelled_order() -> AIInput:
        """Scenario D: Cancelled order, order constraint blocks redelivery."""
        return AIInput(
            ticket=TicketData(
                ticket_id="N-002",
                description="milk packet missing from my order",
                order_id="ORD-9902"
            ),
            decision=DecisionData(
                status="HUMAN_REVIEW",
                confidence=0.94,
                action=None,
                reason_code="ORDER_CONSTRAINT_VIOLATION"
            ),
            order=OrderData(
                order_id="ORD-9902",
                value_inr=999.0,
                delivery_status="cancelled",
                items=5,
                delivery_time_min=42
            ),
            precedents=[
                PrecedentData(
                    ticket_id="H-1000",
                    similarity=0.99,
                    action="redelivery",
                    resolution_note="missing item re-sent",
                    csat=5
                ),
                PrecedentData(
                    ticket_id="H-1007",
                    similarity=0.99,
                    action="redelivery",
                    resolution_note="missing item re-sent",
                    csat=4
                ),
                PrecedentData(
                    ticket_id="H-1012",
                    similarity=0.98,
                    action="redelivery",
                    resolution_note="missing item re-sent",
                    csat=4
                ),
            ]
        )