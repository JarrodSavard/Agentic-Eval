"""Conservative invocation-level cost accounting; holds survive unknown billing."""

from dataclasses import dataclass
from decimal import Decimal


class BudgetExceeded(Exception):
    pass


@dataclass(frozen=True)
class Pricing:
    input_per_million: Decimal
    output_per_million: Decimal

    def __post_init__(self) -> None:
        for rate in (self.input_per_million, self.output_per_million):
            if not rate.is_finite() or rate < 0:
                raise ValueError("Pricing must be finite and nonnegative")

    def cost(self, inputs: int, outputs: int) -> Decimal:
        if inputs < 0 or outputs < 0:
            raise ValueError("Token usage must be nonnegative")
        return (inputs * self.input_per_million + outputs * self.output_per_million) / Decimal(1_000_000)


class Budget:
    def __init__(self, ceiling: Decimal):
        if not ceiling.is_finite() or not Decimal(0) < ceiling <= Decimal(1):
            raise ValueError("Budget must be greater than $0 and no more than $1")
        self.ceiling = ceiling
        self.spent = Decimal(0)
        self.reserved = Decimal(0)
        self.uncertain = False

    @property
    def remaining(self) -> Decimal:
        return self.ceiling - self.spent - self.reserved

    def reserve(self, inputs: int, max_outputs: int, pricing: Pricing) -> Decimal:
        hold = pricing.cost(inputs, max_outputs) * Decimal("1.20")
        if self.uncertain or hold > self.remaining:
            raise BudgetExceeded("Insufficient confirmed budget for another request")
        self.reserved += hold
        return hold

    def settle(self, hold: Decimal, inputs: int, outputs: int, pricing: Pricing) -> None:
        cost = pricing.cost(inputs, outputs)
        self.reserved -= hold
        self.spent += cost
        if cost > hold:
            self.uncertain = True

    def mark_uncertain(self) -> None:
        self.uncertain = True
