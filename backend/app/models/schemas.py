from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Ticket(BaseModel):
    subject: str
    description: str
    customer_id: Optional[str] = None

class TicketResponse(BaseModel):
    id: str
    subject: str
    description: str
    customer_id: Optional[str] = None
    status: str
    decision: Optional[str] = None
    created_at: Optional[datetime] = None