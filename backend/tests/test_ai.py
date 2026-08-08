# backend/tests/test_ai.py

import pytest
import asyncio
from app.ai.schemas import MockDataGenerator, AIOutput
from app.ai.ai_service import generate_ai_response
from app.ai.fallback import generate_fallback_output

@pytest.mark.asyncio
async def test_scenario_a_strong_precedent():
    """Scenario A: Strong precedent should generate explanation + reply"""
    mock_gen = MockDataGenerator()
    ai_input = mock_gen.scenario_a_strong_precedent()
    
    # Test with fallback (don't depend on Groq for CI)
    output = generate_fallback_output(ai_input)
    
    assert isinstance(output, AIOutput)
    assert len(output.explanation) > 20
    assert len(output.customer_reply) > 10
    assert "redelivery" in output.customer_reply.lower() or "resolv" in output.explanation.lower()

@pytest.mark.asyncio
async def test_scenario_b_low_similarity():
    """Scenario B: Low similarity should mention human review"""
    mock_gen = MockDataGenerator()
    ai_input = mock_gen.scenario_b_low_similarity()
    
    output = generate_fallback_output(ai_input)
    
    assert isinstance(output, AIOutput)
    assert "human review" in output.explanation.lower() or "individual" in output.explanation.lower()
    assert output.customer_reply  # Has polite reply

@pytest.mark.asyncio
async def test_scenario_c_conflicting_precedents():
    """Scenario C: Conflicting precedents should mention conflict"""
    mock_gen = MockDataGenerator()
    ai_input = mock_gen.scenario_c_conflicting_precedents()
    
    output = generate_fallback_output(ai_input)
    
    assert isinstance(output, AIOutput)
    assert "conflict" in output.explanation.lower() or "disagree" in output.explanation.lower()

@pytest.mark.asyncio
async def test_scenario_d_cancelled_order():
    """Scenario D: Cancelled order should never recommend redelivery"""
    mock_gen = MockDataGenerator()
    ai_input = mock_gen.scenario_d_cancelled_order()
    
    output = generate_fallback_output(ai_input)
    
    assert isinstance(output, AIOutput)
    assert "redelivery" not in output.customer_reply.lower()
    assert "resend" not in output.customer_reply.lower()
    assert "cancelled" in output.explanation.lower() or "cancelled" in output.customer_reply.lower()

def test_output_validation():
    """Validate no empty fields"""
    mock_gen = MockDataGenerator()
    ai_input = mock_gen.scenario_a_strong_precedent()
    output = generate_fallback_output(ai_input)
    
    assert output.explanation, "Explanation cannot be empty"
    assert output.customer_reply, "Customer reply cannot be empty"
    assert len(output.explanation) >= 20
    assert len(output.customer_reply) >= 10

if __name__ == "__main__":
    pytest.main([__file__, "-v"])