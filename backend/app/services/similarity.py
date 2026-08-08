import numpy as np
from typing import List, Tuple

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate cosine similarity between two vectors"""
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    return dot_product / (norm_a * norm_b)

def find_similar_tickets(query_vector: np.ndarray, ticket_vectors: List[np.ndarray], top_k: int = 5) -> List[Tuple[int, float]]:
    """Find most similar tickets to the query vector"""
    similarities = []
    for i, vector in enumerate(ticket_vectors):
        sim = cosine_similarity(query_vector, vector)
        similarities.append((i, sim))
    return sorted(similarities, key=lambda x: x[1], reverse=True)[:top_k]