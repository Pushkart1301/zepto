import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent / "data"

def load_resolved_tickets() -> pd.DataFrame:
    """Load resolved tickets from CSV"""
    return pd.read_csv(DATA_DIR / "resolved_tickets.csv")

def load_new_tickets() -> pd.DataFrame:
    """Load new tickets from CSV"""
    return pd.read_csv(DATA_DIR / "new_tickets.csv")

def load_orders_context() -> pd.DataFrame:
    """Load orders context from CSV"""
    return pd.read_csv(DATA_DIR / "orders_context.csv")