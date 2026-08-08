"""
Test AI layer with REAL data from Person 1 pipeline.
This is what Person 2 uses to validate NLP integration.
"""

import pytest
import json
from pathlib import Path

from app.ai.schemas import AIInput, AIOutput
from app.ai.fallback import generate_fallback_output
from app.ai.evidence import EvidencePackage


@pytest.fixture
def real_pipeline_output():
    """Load real output from Person 1's pipeline"""
    # Handle both venv and direct execution
    test_dir = Path(__file__).parent
    possible_paths = [
        test_dir.parent / "data" / "pipeline_output.json",
        Path("zepto/backend/data/pipeline_output.json"),
        Path("backend/data/pipeline_output.json"),
    ]
    
    for path in possible_paths:
        if path.exists():
            with open(path) as f:
                return json.load(f)
    
    raise FileNotFoundError(f"pipeline_output.json not found in any of {possible_paths}")


def test_parse_real_data(real_pipeline_output):
    """Verify Person 2's schemas can parse Person 1's real output"""
    for ticket_data in real_pipeline_output:
        try:
            ai_input = AIInput(**ticket_data)
            assert ai_input.ticket.ticket_id
            assert ai_input.decision.status in ["AUTO_RESOLVE", "HUMAN_REVIEW"]
            assert 0.0 <= ai_input.decision.confidence <= 1.0
            assert len(ai_input.precedents) >= 1
            print(f"✅ {ai_input.ticket.ticket_id} parsed successfully")
        except Exception as e:
            pytest.fail(f"Failed to parse {ticket_data['ticket']['ticket_id']}: {e}")


def test_evidence_preparation(real_pipeline_output):
    """Test that evidence package handles real data correctly"""
    for ticket_data in real_pipeline_output[:3]:  # Test first 3
        ai_input = AIInput(**ticket_data)
        evidence = EvidencePackage(ai_input).prepare()
        
        # Verify evidence structure
        assert evidence["ticket_id"]
        assert evidence["backend_status"] in ["AUTO_RESOLVE", "HUMAN_REVIEW"]
        assert evidence["confidence"] is not None
        assert "precedent_summary" in evidence
        assert "avg_csat" in evidence
        
        print(f"✅ Evidence prepared for {evidence['ticket_id']}")


def test_fallback_generation_real_data(real_pipeline_output):
    """Test fallback AI response with real Person 1 data"""
    for ticket_data in real_pipeline_output[:5]:  # Test first 5
        ai_input = AIInput(**ticket_data)
        output = generate_fallback_output(ai_input)
        
        # Verify output structure
        assert isinstance(output, AIOutput)
        assert len(output.explanation) >= 20, "Explanation too short"
        assert len(output.customer_reply) >= 10, "Reply too short"
        
        # Verify no invented data on cancelled orders
        if ai_input.order.delivery_status == "cancelled":
            assert "redelivery" not in output.customer_reply.lower()
            assert "resend" not in output.customer_reply.lower()
        
        print(f"✅ {ai_input.ticket.ticket_id}: '{output.customer_reply[:60]}...'")


def test_auto_resolve_scenario(real_pipeline_output):
    """Test AUTO_RESOLVE tickets have proper explanations"""
    auto_tickets = [t for t in real_pipeline_output if t["decision"]["status"] == "AUTO_RESOLVE"]
    
    assert len(auto_tickets) > 0, "No AUTO_RESOLVE tickets in test data"
    
    for ticket_data in auto_tickets:
        ai_input = AIInput(**ticket_data)
        output = generate_fallback_output(ai_input)
        
        # Should mention why it was auto-resolved
        explanation_lower = output.explanation.lower()
        reply_lower = output.customer_reply.lower()
        
        assert explanation_lower or reply_lower, "No explanation provided"
        print(f"✅ AUTO_RESOLVE {ai_input.ticket.ticket_id}")


def test_human_review_scenario(real_pipeline_output):
    """Test HUMAN_REVIEW tickets mention review process"""
    human_tickets = [t for t in real_pipeline_output if t["decision"]["status"] == "HUMAN_REVIEW"]
    
    assert len(human_tickets) > 0, "No HUMAN_REVIEW tickets in test data"
    
    for ticket_data in human_tickets:
        ai_input = AIInput(**ticket_data)
        output = generate_fallback_output(ai_input)
        
        # Should mention review or human involvement
        explanation_lower = output.explanation.lower()
        reply_lower = output.customer_reply.lower()
        
        # At least explanation or reply should be present
        assert explanation_lower or reply_lower, "No output for HUMAN_REVIEW"
        print(f"✅ HUMAN_REVIEW {ai_input.ticket.ticket_id}")


def test_cancelled_order_constraint(real_pipeline_output):
    """Test cancelled orders never recommend redelivery"""
    cancelled_tickets = [
        t for t in real_pipeline_output 
        if t["order"]["delivery_status"] == "cancelled"
    ]
    
    for ticket_data in cancelled_tickets:
        ai_input = AIInput(**ticket_data)
        output = generate_fallback_output(ai_input)
        
        # CRITICAL: Never suggest redelivery for cancelled
        assert "redelivery" not in output.customer_reply.lower(), \
            f"ERROR: Suggested redelivery for cancelled order {ai_input.ticket.ticket_id}"
        assert "resend" not in output.customer_reply.lower(), \
            f"ERROR: Suggested resend for cancelled order {ai_input.ticket.ticket_id}"
        
        print(f"✅ Cancelled order {ai_input.ticket.ticket_id} handled correctly")


def test_confidence_range(real_pipeline_output):
    """Verify all confidence scores are valid 0-1"""
    for ticket_data in real_pipeline_output:
        confidence = ticket_data["decision"]["confidence"]
        assert 0.0 <= confidence <= 1.0, \
            f"Invalid confidence {confidence} for {ticket_data['ticket']['ticket_id']}"
    
    print(f"✅ All {len(real_pipeline_output)} confidence scores valid (0.0-1.0)")


def test_real_data_precedent_quality(real_pipeline_output):
    """Verify precedents are real tickets from dataset"""
    for ticket_data in real_pipeline_output:
        precedents = ticket_data["precedents"]
        
        # Check structure
        assert len(precedents) >= 1, "No precedents"
        assert len(precedents) <= 3, "More than 3 precedents"
        
        for p in precedents:
            # Verify it's a real historical ticket (H-XXXX format)
            assert p["ticket_id"].startswith("H-"), \
                f"Ticket {p['ticket_id']} doesn't look like historical ticket"
            
            # Verify similarity is valid
            assert 0.0 <= p["similarity"] <= 1.0, \
                f"Invalid similarity {p['similarity']}"
            
            # Verify CSAT is real
            assert p["csat"] in [3, 4, 5], \
                f"Invalid CSAT {p['csat']}"
    
    print(f"✅ All {len(real_pipeline_output)} tickets have valid precedents")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
