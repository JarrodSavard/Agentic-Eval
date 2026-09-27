"""Check the deterministic published fixture without changing published live data."""

import json
from pathlib import Path

published = Path("public/data/bundle.json")
bundle = json.loads(published.read_text(encoding="utf-8"))
if bundle["experiment_id"] == "scripted-rental-demonstration-v2":
    generated = Path("artifacts/regenerated")
    for path in generated.rglob("*.json"):
        checked_in = Path("public/data") / path.relative_to(generated)
        if path.read_bytes() != checked_in.read_bytes():
            raise SystemExit(f"Scripted fixture drift: {checked_in}")
    print("Scripted fixtures reproduce exactly.")
else:
    print("Published dataset is live; semantic verification handles its recorded evidence.")
