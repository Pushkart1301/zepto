"""
data_loader.py
Loads and validates the three CSV datasets used by the pipeline.
Column schemas are derived from the ACTUAL CSVs in backend/data/.
"""

import pandas as pd
from pathlib import Path
from functools import lru_cache

DATA_DIR = Path(__file__).parent.parent.parent / "data"

# ── Actual column sets (inspected from the real CSVs) ────────────────────────
# resolved_tickets.csv
RESOLVED_COLS = {
    "ticket_id", "category", "description",
    "resolution_action", "resolution_note", "csat",
}

# new_tickets.csv  (no category column — inferred from similarity)
NEW_TICKET_COLS = {
    "ticket_id", "created_at", "order_id", "description",
}

# orders_context.csv
ORDER_COLS = {
    "order_id", "items", "value_inr",
    "delivery_time_min", "delivery_status",
}


def _validate(df: pd.DataFrame, required: set, name: str) -> None:
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"[{name}] Missing columns: {missing}")


@lru_cache(maxsize=1)
def load_resolved_tickets() -> pd.DataFrame:
    """Load resolved historical tickets. Cached so disk is hit only once."""
    path = DATA_DIR / "resolved_tickets.csv"
    df = pd.read_csv(path)
    _validate(df, RESOLVED_COLS, "resolved_tickets")
    df["csat"] = pd.to_numeric(df["csat"], errors="coerce")
    df["description"]      = df["description"].fillna("").astype(str)
    df["resolution_note"]  = df["resolution_note"].fillna("").astype(str)
    df["resolution_action"] = df["resolution_action"].fillna("unknown").astype(str)
    df["category"]         = df["category"].fillna("").astype(str)
    return df


@lru_cache(maxsize=1)
def load_new_tickets() -> pd.DataFrame:
    """Load new / incoming tickets awaiting decision."""
    path = DATA_DIR / "new_tickets.csv"
    df = pd.read_csv(path)
    _validate(df, NEW_TICKET_COLS, "new_tickets")
    df["description"] = df["description"].fillna("").astype(str)
    return df


@lru_cache(maxsize=1)
def load_orders_context() -> pd.DataFrame:
    """Load order-level context for validation."""
    path = DATA_DIR / "orders_context.csv"
    df = pd.read_csv(path)
    _validate(df, ORDER_COLS, "orders_context")
    df["value_inr"]          = pd.to_numeric(df["value_inr"], errors="coerce")
    df["delivery_time_min"]  = pd.to_numeric(df["delivery_time_min"], errors="coerce")
    return df


def get_ticket_by_id(ticket_id: str) -> pd.Series | None:
    """Return a single new ticket row or None."""
    df = load_new_tickets()
    row = df[df["ticket_id"] == ticket_id]
    return row.iloc[0] if not row.empty else None


def get_order_by_id(order_id: str) -> pd.Series | None:
    """Return a single order context row or None."""
    df = load_orders_context()
    row = df[df["order_id"] == order_id]
    return row.iloc[0] if not row.empty else None


def clear_cache() -> None:
    """Force reload from disk (useful in tests)."""
    load_resolved_tickets.cache_clear()
    load_new_tickets.cache_clear()
    load_orders_context.cache_clear()