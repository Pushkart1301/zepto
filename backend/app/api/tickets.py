from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import Ticket, TicketResponse

router = APIRouter()

@router.get("/", response_model=List[TicketResponse])
async def get_tickets():
    """Get all tickets"""
    pass

@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: str):
    """Get a specific ticket"""
    pass

@router.post("/")
async def create_ticket(ticket: Ticket):
    """Create a new ticket"""
    pass