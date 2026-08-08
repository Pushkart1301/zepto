"""
Test Groq integration with real Person 1 data.
Run this to verify Groq is working end-to-end.
"""

import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_file = Path(__file__).parent / ".env"
load_dotenv(env_file)

# Set PYTHONPATH
os.environ['PYTHONPATH'] = str(Path(__file__).parent)

from app.ai.schemas import AIInput
from app.ai.ai_service import generate_ai_response
from app.ai.evidence import EvidencePackage


def load_real_data():
    """Load real Person 1 pipeline output"""
    data_file = Path(__file__).parent / "data" / "pipeline_output.json"
    with open(data_file) as f:
        return json.load(f)


def test_single_ticket():
    """Test Groq on a single ticket"""
    print("=" * 80)
    print("TESTING GROQ INTEGRATION WITH REAL DATA")
    print("=" * 80)
    
    data = load_real_data()
    
    # Test ticket N-005 (AUTO_RESOLVE, strong precedent)
    ticket_data = data[5]  # N-005
    ticket_id = ticket_data['ticket']['ticket_id']
    
    print(f"\n[TICKET] {ticket_id}")
    print(f"Issue: {ticket_data['ticket']['description']}")
    print(f"Decision: {ticket_data['decision']['status']} (confidence: {ticket_data['decision']['confidence']:.0%})")
    
    # Parse as AIInput
    ai_input = AIInput(**ticket_data)
    
    # Generate AI response
    print("\n[ACTION] Calling Groq to generate response...")
    output = generate_ai_response(ai_input)
    
    print("\n[INTERNAL EXPLANATION] (for support team):")
    print("-" * 80)
    print(output.explanation)
    print("-" * 80)
    
    print("\n[CUSTOMER REPLY] (what to send to customer):")
    print("-" * 80)
    print(output.customer_reply)
    print("-" * 80)
    
    return output


def test_multiple_tickets(num=5):
    """Test Groq on multiple real tickets"""
    print("\n" + "=" * 80)
    print(f"TESTING GROQ ON {num} REAL TICKETS")
    print("=" * 80)
    
    data = load_real_data()
    
    results = []
    for i, ticket_data in enumerate(data[:num]):
        ticket_id = ticket_data['ticket']['ticket_id']
        status = ticket_data['decision']['status']
        
        print(f"\n[{i+1}/{num}] Processing {ticket_id} ({status})...", end=" ", flush=True)
        
        try:
            ai_input = AIInput(**ticket_data)
            output = generate_ai_response(ai_input)
            
            # Validate
            assert len(output.explanation) >= 20
            assert len(output.customer_reply) >= 10
            
            # Check constraints
            if ticket_data['order']['delivery_status'] == 'cancelled':
                reply = output.customer_reply.lower()
                assert 'redelivery' not in reply
                assert 'resend' not in reply
            
            results.append({
                'ticket_id': ticket_id,
                'status': status,
                'explanation': output.explanation[:80],
                'reply': output.customer_reply[:80]
            })
            
            print("PASS")
        
        except Exception as e:
            print(f"FAIL: {e}")
            results.append({
                'ticket_id': ticket_id,
                'status': status,
                'error': str(e)
            })
    
    return results


if __name__ == "__main__":
    try:
        # Test single ticket first
        test_single_ticket()
        
        # Test multiple tickets
        results = test_multiple_tickets(num=5)
        
        print("\n" + "=" * 80)
        print("SUMMARY")
        print("=" * 80)
        for result in results:
            if 'error' in result:
                print(f"FAIL {result['ticket_id']}: {result['error']}")
            else:
                print(f"PASS {result['ticket_id']}: {result['status']}")
        
        print("\nALL TESTS COMPLETED")
        print("\nGroq is working! You can now:")
        print("1. Integrate with Person 1's FastAPI endpoint")
        print("2. Build the frontend to display responses")
        print("3. Deploy to production")
    
    except Exception as e:
        print(f"\nFATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
