"""
run_pipeline.py
Standalone test runner - processes the first 10 new tickets and prints JSON.

Usage:
    cd backend
    python run_pipeline.py

No FastAPI, no Docker, no LLM - just pure pipeline.
"""

import json
import sys
import io
from pathlib import Path

# Force UTF-8 stdout so box-drawing / emoji chars don't crash on Windows cp1252
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Make sure 'app' package is on the path when running from backend/
sys.path.insert(0, str(Path(__file__).parent))

from app.services.decision_engine import process_ticket
from app.services.data_loader import load_new_tickets


def main():
    new_tickets = load_new_tickets()
    # Test on first 10 real tickets
    ticket_ids = new_tickets["ticket_id"].tolist()[:10]

    print("=" * 70)
    print(f"ZEPTO TICKET INTELLIGENCE PIPELINE  —  {len(ticket_ids)} tickets")
    print("=" * 70)

    results = []
    auto_count  = 0
    human_count = 0

    for tid in ticket_ids:
        result = process_ticket(tid)
        results.append(result)

        dec = result["decision"]
        if dec["status"] == "AUTO_RESOLVE":
            auto_count += 1
        else:
            human_count += 1

        print(f"\n{'─'*60}")
        print(f"Ticket : {tid}  |  {dec['status']}  |  conf={dec['confidence']}")
        print(f"  desc : {result['ticket']['description']}")
        print(f"  action     : {dec['action']}")
        print(f"  reason_code: {dec['reason_code']}")
        if result["precedents"]:
            print(f"  top precedents:")
            for p in result["precedents"]:
                print(f"    [{p['ticket_id']}] sim={p['similarity']:.4f} "
                      f"action={p['action']}  csat={p['csat']}")

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}")
    print(f"  AUTO_RESOLVE : {auto_count}")
    print(f"  HUMAN_REVIEW : {human_count}")
    print(f"  TOTAL        : {len(ticket_ids)}")

    # ── Save full JSON output ─────────────────────────────────────────────────
    out_path = Path(__file__).parent / "data" / "pipeline_output.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\n  Full JSON saved → {out_path}")

    # ── Print 3 sample tickets for Person 2 ──────────────────────────────────
    print(f"\n{'='*70}")
    print("SAMPLE JSON (first 3 tickets) — ready for Person 2 integration")
    print(f"{'='*70}")
    print(json.dumps(results[:3], indent=2, default=str))


if __name__ == "__main__":
    main()
