"""
Production AI Service integrating with Groq LLM.
Generates explanations and customer replies based on Person 1's decision engine output.
"""

import os
import json
import logging
from typing import Optional

from app.ai.schemas import AIInput, AIOutput
from app.ai.evidence import EvidencePackage
from app.ai.prompts import SYSTEM_PROMPT, build_scenario_specific_prompt
from app.ai.fallback import generate_fallback_output

logger = logging.getLogger(__name__)

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logger.warning("Groq not installed. Will use fallback only.")


class AIService:
    """
    Production AI service for generating support responses.
    Uses Groq Mixtral model for explanation + customer reply generation.
    Falls back to deterministic output if Groq is unavailable.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.client = None
        
        if GROQ_AVAILABLE and self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
                logger.info("✅ Groq client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
                logger.info("Will use fallback for responses")
        else:
            if not GROQ_AVAILABLE:
                logger.warning("Groq package not installed")
            if not self.api_key:
                logger.warning("GROQ_API_KEY not set in environment")
            logger.info("Using fallback response generator")
        
        self._cache = {}  # Simple in-memory cache for repeated requests
    
    def generate_ai_response(self, ai_input: AIInput) -> AIOutput:
        """
        Generate AI response (explanation + customer reply) from Person 1's decision.
        
        Args:
            ai_input: Decision engine output from Person 1 (ticket, decision, order, precedents)
        
        Returns:
            AIOutput: explanation (for agent) + customer_reply (for customer)
        
        Raises:
            ValueError: If output validation fails
        """
        
        ticket_id = ai_input.ticket.ticket_id
        
        # Check cache first
        if ticket_id in self._cache:
            logger.debug(f"Cache hit: {ticket_id}")
            return self._cache[ticket_id]
        
        try:
            # Prepare evidence (no invented data)
            evidence = EvidencePackage(ai_input).prepare()
            
            # Try Groq first, fallback if unavailable
            if self.client:
                logger.debug(f"Calling Groq for {ticket_id}")
                output = self._call_groq(evidence, ai_input)
            else:
                logger.debug(f"Using fallback for {ticket_id}")
                output = generate_fallback_output(ai_input)
            
            # Validate output
            self._validate_output(output, ai_input)
            
            # Cache result
            self._cache[ticket_id] = output
            
            logger.info(f"✅ Generated response for {ticket_id}")
            return output
        
        except Exception as e:
            logger.error(f"Error generating AI response for {ticket_id}: {e}")
            # Always fall back gracefully
            return generate_fallback_output(ai_input)
    
    def _call_groq(self, evidence: dict, ai_input: AIInput) -> AIOutput:
        """
        Call Groq Mixtral model to generate explanation + customer reply.
        
        Args:
            evidence: Prepared evidence dict (from EvidencePackage)
            ai_input: Original input for validation
        
        Returns:
            AIOutput: Parsed and validated response
        
        Raises:
            ValueError: If response parsing or validation fails
        """
        
        try:
            # Build prompts
            system_prompt = SYSTEM_PROMPT
            user_prompt = build_scenario_specific_prompt(evidence)
            
            # Call Groq with latest available model
            logger.debug("Sending request to Groq API...")
            message = self.client.chat.completions.create(
                model="llama2-70b-4096",  # Latest available model
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,  # Low temperature = consistent, professional tone
                max_tokens=600,    # Enough for explanation + reply
                timeout=10.0       # 10 second timeout
            )
            
            # Extract response text
            response_text = message.choices[0].message.content.strip()
            logger.debug(f"Groq response (first 100 chars): {response_text[:100]}")
            
            # Parse JSON from response
            try:
                data = json.loads(response_text)
            except json.JSONDecodeError:
                # Try to extract JSON if wrapped in other text
                logger.warning("Response is not valid JSON, attempting to extract...")
                if "{" in response_text and "}" in response_text:
                    start = response_text.index("{")
                    end = response_text.rindex("}") + 1
                    data = json.loads(response_text[start:end])
                    logger.info("✅ Successfully extracted JSON from response")
                else:
                    raise ValueError("Could not extract JSON from Groq response")
            
            # Create AIOutput
            output = AIOutput(
                explanation=data.get("explanation", ""),
                customer_reply=data.get("customer_reply", "")
            )
            
            logger.debug(f"Parsed output - explanation length: {len(output.explanation)}, reply length: {len(output.customer_reply)}")
            return output
        
        except Exception as e:
            logger.error(f"Groq call failed: {e}")
            raise
    
    def _validate_output(self, output: AIOutput, ai_input: AIInput) -> None:
        """
        Validate AI output against constraints.
        
        CRITICAL: Ensures no invented data, no redelivery on cancelled orders, etc.
        
        Args:
            output: Generated AIOutput
            ai_input: Original input (for validation rules)
        
        Raises:
            ValueError: If validation fails
        """
        
        # Check field lengths
        if not output.explanation or len(output.explanation) < 20:
            raise ValueError("Explanation too short (minimum 20 chars)")
        if not output.customer_reply or len(output.customer_reply) < 10:
            raise ValueError("Customer reply too short (minimum 10 chars)")
        
        # CRITICAL: Never suggest redelivery on cancelled orders
        if ai_input.order.delivery_status == "cancelled":
            reply_lower = output.customer_reply.lower()
            if "redelivery" in reply_lower or "resend" in reply_lower or "redeliver" in reply_lower:
                raise ValueError("ERROR: Cannot suggest redelivery on cancelled order")
        
        # Warn if invented refund amounts (but don't fail - allow if backend provided amount)
        import re
        refund_pattern = r'₹\s*\d+'
        if re.search(refund_pattern, output.customer_reply):
            # Only flag as warning if backend didn't provide action
            if ai_input.decision.action is None:
                logger.warning(f"Output contains refund amount (₹) but backend provided no action")
        
        # Check for internal reasoning exposure (warn only)
        forbidden_terms = ["similarity score", "tf-idf", "precedent", "llm", "ai model", "confidence score"]
        for term in forbidden_terms:
            if term in output.customer_reply.lower():
                logger.warning(f"Output contains internal term: '{term}'")


# Global singleton instance
_service = None


def get_ai_service() -> AIService:
    """Get or create the global AI service instance."""
    global _service
    if _service is None:
        _service = AIService()
    return _service


def generate_ai_response(ai_input: AIInput) -> AIOutput:
    """
    Convenience function to generate AI response.
    
    Usage:
        from app.ai.ai_service import generate_ai_response
        from app.ai.schemas import AIInput
        
        # Assuming ai_input comes from Person 1's decision engine
        output = generate_ai_response(ai_input)
        print(output.explanation)
        print(output.customer_reply)
    """
    return get_ai_service().generate_ai_response(ai_input)
