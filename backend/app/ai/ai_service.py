import os
import json
import logging
from typing import Optional

from app.ai.schemas import AIInput, AIOutput
from app.ai.evidence import EvidencePackage
from app.ai.prompts import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger(__name__)

# You'll install: pip install groq
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logger.warning("Groq not installed. Will use fallback only.")

class AIService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.client = None
        if GROQ_AVAILABLE and self.api_key:
            self.client = Groq(api_key=self.api_key)
        self._cache = {}

    async def generate_ai_response(self, ai_input: AIInput) -> AIOutput:
        """Main entry point: Person 1's decision → explanation + customer reply"""
        ticket_id = ai_input.ticket.ticket_id
        if ticket_id in self._cache:
            logger.info(f"Cache hit: {ticket_id}")
            return self._cache[ticket_id]

        try:
            evidence = EvidencePackage(ai_input).prepare()
            system_prompt = SYSTEM_PROMPT
            user_prompt = build_user_prompt(evidence)

            if self.client:
                output = await self._call_groq(system_prompt, user_prompt, ai_input)
            else:
                from app.ai.fallback import generate_fallback_output
                output = generate_fallback_output(ai_input)

            self._cache[ticket_id] = output
            return output
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            from app.ai.fallback import generate_fallback_output
            return generate_fallback_output(ai_input)

    async def _call_groq(self, system_prompt: str, user_prompt: str, ai_input: AIInput) -> AIOutput:
        try:
            message = self.client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            response_text = message.choices[0].message.content.strip()

            try:
                data = json.loads(response_text)
            except json.JSONDecodeError:
                if "{" in response_text and "}" in response_text:
                    start = response_text.index("{")
                    end = response_text.rindex("}") + 1
                    data = json.loads(response_text[start:end])
                else:
                    raise ValueError("Could not extract JSON from response")

            output = AIOutput(
                explanation=data.get("explanation", ""),
                customer_reply=data.get("customer_reply", "")
            )
            self._validate_output(output, ai_input)
            return output
        except Exception as e:
            logger.error(f"Groq call failed: {e}")
            raise

    def _validate_output(self, output: AIOutput, ai_input: AIInput) -> None:
        if not output.explanation or len(output.explanation) < 20:
            raise ValueError("Explanation too short")
        if not output.customer_reply or len(output.customer_reply) < 10:
            raise ValueError("Customer reply too short")
        
        if ai_input.order.delivery_status == "cancelled":
            if "redelivery" in output.customer_reply.lower() or "resend" in output.customer_reply.lower():
                raise ValueError("Output recommends redelivery on cancelled order")


# Global service instance
_service = None

def get_ai_service() -> AIService:
    global _service
    if _service is None:
        _service = AIService()
    return _service

async def generate_ai_response(ai_input: AIInput) -> AIOutput:
    """Convenience function."""
    return await get_ai_service().generate_ai_response(ai_input)