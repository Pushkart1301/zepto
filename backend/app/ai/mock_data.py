# backend/app/ai/mock_data.py

# SCENARIO A: Strong Precedent (should AUTO_RESOLVE)
MOCK_SCENARIO_A = {
    "ticket": {
        "ticket_id": "N-005",
        "description": "milk packet missing from my order",
        "order_id": "ORD-9905"
    },
    "decision": {
        "status": "AUTO_RESOLVE",
        "confidence": 0.92,
        "action": "redelivery",
        "reason_code": "STRONG_PRECEDENT_AGREEMENT"
    },
    "order": {
        "order_id": "ORD-9905",
        "value_inr": 412.0,
        "delivery_status": "delivered",
        "items": 1,
        "delivery_time_min": 41
    },
    "precedents": [
        {
            "ticket_id": "H-1000",
            "similarity": 0.99,
            "action": "redelivery",
            "resolution_note": "missing item re-sent",
            "csat": 5
        },
        {
            "ticket_id": "H-1007",
            "similarity": 0.99,
            "action": "redelivery",
            "resolution_note": "missing item re-sent",
            "csat": 4
        },
        {
            "ticket_id": "H-1017",
            "similarity": 0.93,
            "action": "partial_refund",
            "resolution_note": "refunded item value",
            "csat": 4
        }
    ]
}

# SCENARIO B: Low Similarity (should HUMAN_REVIEW)
MOCK_SCENARIO_B = {
    "ticket": {
        "ticket_id": "N-006",
        "description": "still waiting after 30 min",
        "order_id": "ORD-9906"
    },
    "decision": {
        "status": "HUMAN_REVIEW",
        "confidence": 0.62,
        "action": None,
        "reason_code": "LOW_SIMILARITY"
    },
    "order": {
        "order_id": "ORD-9906",
        "value_inr": 189.0,
        "delivery_status": "delivered",
        "items": 1,
        "delivery_time_min": 35
    },
    "precedents": [
        {
            "ticket_id": "H-100",
            "similarity": 0.68,
            "action": "apology_no_action",
            "resolution_note": "clarified delivery window",
            "csat": 3
        },
        {
            "ticket_id": "H-101",
            "similarity": 0.65,
            "action": "coupon",
            "resolution_note": "issued coupon",
            "csat": 4
        },
        {
            "ticket_id": "H-102",
            "similarity": 0.61,
            "action": "escalation",
            "resolution_note": "sent to operations",
            "csat": 3
        }
    ]
}

# SCENARIO C: Conflicting Precedents (should HUMAN_REVIEW)
MOCK_SCENARIO_C = {
    "ticket": {
        "ticket_id": "N-001",
        "description": "wrong brand of rice delivered",
        "order_id": "ORD-9901"
    },
    "decision": {
        "status": "HUMAN_REVIEW",
        "confidence": 0.78,
        "action": None,
        "reason_code": "CONFLICTING_PRECEDENTS"
    },
    "order": {
        "order_id": "ORD-9901",
        "value_inr": 189.0,
        "delivery_status": "delivered",
        "items": 2,
        "delivery_time_min": 28
    },
    "precedents": [
        {
            "ticket_id": "H-1005",
            "similarity": 0.97,
            "action": "redelivery",
            "resolution_note": "correct item dispatched",
            "csat": 5
        },
        {
            "ticket_id": "H-1013",
            "similarity": 0.96,
            "action": "partial_refund",
            "resolution_note": "refunded difference",
            "csat": 3
        },
        {
            "ticket_id": "H-1009",
            "similarity": 0.94,
            "action": "redelivery",
            "resolution_note": "correct item dispatched",
            "csat": 4
        }
    ]
}

# SCENARIO D: Cancelled Order (should HUMAN_REVIEW, never redelivery)
MOCK_SCENARIO_D = {
    "ticket": {
        "ticket_id": "N-002",
        "description": "milk packet missing from my order",
        "order_id": "ORD-9902"
    },
    "decision": {
        "status": "HUMAN_REVIEW",
        "confidence": 0.94,
        "action": None,
        "reason_code": "ORDER_CONSTRAINT_VIOLATION"
    },
    "order": {
        "order_id": "ORD-9902",
        "value_inr": 999.0,
        "delivery_status": "cancelled",
        "items": 5,
        "delivery_time_min": 42
    },
    "precedents": [
        {
            "ticket_id": "H-1000",
            "similarity": 0.99,
            "action": "redelivery",
            "resolution_note": "missing item re-sent",
            "csat": 5
        },
        {
            "ticket_id": "H-1007",
            "similarity": 0.99,
            "action": "redelivery",
            "resolution_note": "missing item re-sent",
            "csat": 4
        },
        {
            "ticket_id": "H-1012",
            "similarity": 0.98,
            "action": "redelivery",
            "resolution_note": "missing item re-sent",
            "csat": 4
        }
    ]
}

# Helper to get scenario by name
def get_mock_scenario(name: str):
    scenarios = {
        "A": MOCK_SCENARIO_A,
        "B": MOCK_SCENARIO_B,
        "C": MOCK_SCENARIO_C,
        "D": MOCK_SCENARIO_D,
    }
    return scenarios.get(name)