import json
import csv
from pathlib import Path
from fastapi import APIRouter, HTTPException
from typing import List

router = APIRouter()

DATA_DIR = Path(__file__).parent.parent.parent / "data"
PIPELINE_OUTPUT = DATA_DIR / "pipeline_output.json"
NEW_TICKETS_CSV = DATA_DIR / "new_tickets.csv"


def load_new_tickets_meta() -> dict:
    """Load created_at from new_tickets.csv keyed by ticket_id."""
    meta = {}
    if not NEW_TICKETS_CSV.exists():
        return meta
    with open(NEW_TICKETS_CSV, newline="") as f:
        for row in csv.DictReader(f):
            meta[row["ticket_id"]] = row.get("created_at", "")
    return meta


def load_pipeline_data() -> List[dict]:
    """Load pipeline output and enrich with created_at from CSV."""
    if not PIPELINE_OUTPUT.exists():
        return []
    with open(PIPELINE_OUTPUT, "r") as f:
        data = json.load(f)
    meta = load_new_tickets_meta()
    for entry in data:
        tid = entry.get("ticket", {}).get("ticket_id", "")
        entry["ticket"]["created_at"] = meta.get(tid, "")
    return data


@router.get("/tickets", response_model=List[dict])
async def get_tickets():
    """Get all processed tickets from pipeline output."""
    return load_pipeline_data()


@router.get("/tickets/{ticket_id}", response_model=dict)
async def get_ticket(ticket_id: str):
    """Get a specific ticket by ID."""
    for t in load_pipeline_data():
        if t.get("ticket", {}).get("ticket_id") == ticket_id:
            return t
    raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")


@router.post("/tickets")
async def create_ticket(ticket: dict):
    """Create a new ticket (placeholder)."""
    return {"message": "Ticket received", "ticket": ticket}
