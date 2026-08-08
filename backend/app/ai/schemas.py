from pydantic import BaseModel
from typing import Optional

class TicketAnalysis(BaseModel):
    category: str
    priority: str
    suggested_resolution: str

class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    embedding: list