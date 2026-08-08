"""
confidence.py
Calculates a simple, explainable confidence score from precedent evidence.

Score components (all between 0–1, linearly combined):
  1. avg_similarity  – mean cosine similarity of top-3 precedents (weight 0.50)
  2. action_consensus– fraction of precedents agreeing on same action (weight 0.30)
  3. avg_csat        – normalized mean CSAT of top-3 precedents (weight 0.20)

Final score is clamped to [0.0, 1.0].
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from typing import List

from .similarity import Precedent

# ── Thresholds ────────────────────────────────────────────────────────────────
MIN_AUTO_RESOLVE_CONFIDENCE = 0.60   # below this → HUMAN_REVIEW
MIN_SIMILARITY_FOR_ANY_EVIDENCE = 0.08  # below this → "weak similarity"

# Weights must sum to 1.0
W_SIMILARITY = 0.50
W_CONSENSUS  = 0.30
W_CSAT       = 0.20

CSAT_MAX = 5.0   # rating scale is 1–5


@dataclass
class ConfidenceResult:
    score: float                # 0.0 – 1.0
    avg_similarity: float
    action_consensus: float
    avg_csat: float | None
    dominant_action: str | None
    reason_code: str


def calculate_confidence(precedents: List[Precedent]) -> ConfidenceResult:
    """
    Derive confidence from real precedents only.
    Returns a ConfidenceResult with an explicit reason_code string.
    """
    if not precedents:
        return ConfidenceResult(
            score=0.0,
            avg_similarity=0.0,
            action_consensus=0.0,
            avg_csat=None,
            dominant_action=None,
            reason_code="NO_PRECEDENTS_FOUND",
        )

    n = len(precedents)

    # 1. Average similarity
    avg_sim = sum(p.similarity for p in precedents) / n

    # 2. Action consensus (what fraction agree on the top action?)
    action_counts = Counter(p.action for p in precedents)
    dominant_action, dominant_count = action_counts.most_common(1)[0]
    consensus = dominant_count / n

    # 3. Average CSAT (only from precedents that have a rating)
    csat_vals = [p.csat for p in precedents if p.csat is not None]
    avg_csat_raw = sum(csat_vals) / len(csat_vals) if csat_vals else None
    csat_norm = (avg_csat_raw / CSAT_MAX) if avg_csat_raw is not None else 0.5

    # Weighted score
    score = (
        W_SIMILARITY * avg_sim +
        W_CONSENSUS  * consensus +
        W_CSAT       * csat_norm
    )
    score = round(min(max(score, 0.0), 1.0), 4)

    # Reason code
    if avg_sim < MIN_SIMILARITY_FOR_ANY_EVIDENCE:
        reason_code = "WEAK_SIMILARITY"
    elif consensus < 0.5:
        reason_code = "CONFLICTING_ACTIONS"
    elif score >= MIN_AUTO_RESOLVE_CONFIDENCE:
        reason_code = "STRONG_EVIDENCE"
    else:
        reason_code = "MODERATE_EVIDENCE"

    return ConfidenceResult(
        score=score,
        avg_similarity=round(avg_sim, 4),
        action_consensus=round(consensus, 4),
        avg_csat=round(avg_csat_raw, 2) if avg_csat_raw is not None else None,
        dominant_action=dominant_action,
        reason_code=reason_code,
    )
