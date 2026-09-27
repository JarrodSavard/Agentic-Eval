from decimal import Decimal

import pytest
from roadtest.budget import Budget, BudgetExceeded, Pricing


def rates():
    return Pricing(input_per_million=Decimal("1"), output_per_million=Decimal("5"))


def test_reservation_covers_full_output_and_twenty_percent_margin():
    budget = Budget(Decimal("0.50"))
    hold = budget.reserve(6000, 512, rates())
    assert hold == Decimal("0.010272")
    assert budget.remaining == Decimal("0.489728")
    budget.settle(hold, 2000, 100, rates())
    assert budget.spent == Decimal("0.0025")
    assert budget.remaining == Decimal("0.4975")


def test_ceiling_is_checked_before_requests_and_unknown_cost_is_retained():
    budget = Budget(Decimal("0.01"))
    with pytest.raises(BudgetExceeded):
        budget.reserve(6000, 512, rates())
    assert budget.remaining == Decimal("0.01")
    hold = budget.reserve(1000, 512, rates())
    budget.mark_uncertain()
    assert budget.reserved == hold
    with pytest.raises(BudgetExceeded):
        budget.reserve(1, 1, rates())


@pytest.mark.parametrize("amount", ["0", "-1", "1.01", "NaN", "Infinity"])
def test_invalid_or_excessive_budget_is_rejected(amount):
    with pytest.raises(ValueError):
        Budget(Decimal(amount))
