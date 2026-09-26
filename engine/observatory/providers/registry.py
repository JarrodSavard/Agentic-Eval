"""A model is configuration; a provider is an adapter registered in __init__."""

from datetime import date
from decimal import Decimal
from pathlib import Path
from typing import Literal

from pydantic import Field, TypeAdapter

from observatory.budget import Pricing
from observatory.contracts import Contract


class ModelProfile(Contract):
    id: str
    label: str
    provider: str
    model: str
    input_per_million: Decimal = Field(ge=0, allow_inf_nan=False)
    output_per_million: Decimal = Field(ge=0, allow_inf_nan=False)
    price_checked_at: date
    reasoning: Literal["none"] = "none"

    def pricing(self) -> Pricing:
        return Pricing(self.input_per_million, self.output_per_million)


def load_profiles(path: Path) -> list[ModelProfile]:
    profiles = TypeAdapter(list[ModelProfile]).validate_json(path.read_text(encoding="utf-8"))
    if not profiles or len({p.id for p in profiles}) != len(profiles):
        raise ValueError("Model profile ids must be nonempty and unique")
    return profiles
