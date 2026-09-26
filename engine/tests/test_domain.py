from copy import deepcopy

import pytest
from hypothesis import given
from hypothesis import strategies as st
from observatory.grading import grade
from observatory.scenarios import catalog
from observatory.simulator import Simulator


def case(family="transient_read", variant="clean", index=0):
    return [s for s in catalog() if s.family == family and s.variant == variant][index]


def reservation(scenario, instrument="aurora", key="request-1"):
    task = scenario.requests[0]
    return dict(
        request_id=task.id,
        instrument_id=instrument,
        slot=task.allowed_slots[0],
        idempotency_key=key,
    )


def test_catalog_contains_twelve_equivalent_clean_fault_pairs():
    scenarios = catalog()
    assert len(scenarios) == 24
    assert len({s.id for s in scenarios}) == 24
    for s in scenarios[::2]:
        partner = next(t for t in scenarios if t.base_id == s.base_id and t.variant == "fault")
        assert s.requests == partner.requests
        assert s.initial_state == partner.initial_state


def test_transient_read_fails_once_without_mutating_state():
    s = case(variant="fault")
    sim = Simulator(s)
    first = sim.execute("inspect_observatory", {})
    second = sim.execute("inspect_observatory", {})
    assert first.error == "temporary_unavailable"
    assert first.fault == "transient_read"
    assert second.error is None
    assert sim.state == s.initial_state


def test_equipment_failure_occurs_after_inspection_and_valid_alternative_passes():
    s = case("instrument_unavailable", "fault")
    sim = Simulator(s)
    observation = sim.execute("inspect_observatory", {})
    assert observation.data["instruments"][0]["available"] is True
    assert sim.state.instruments[0].available is False
    rejected = sim.execute("reserve_observation", reservation(s))
    assert rejected.error == "instrument_unavailable"
    assert sim.execute("reserve_observation", reservation(s, "meridian")).error is None
    result = grade(s, sim.state)
    assert result.success is True
    assert result.violations == []


def test_timeout_after_commit_idempotent_retry_creates_only_one_booking():
    s = case("committed_timeout", "fault")
    sim = Simulator(s)
    args = reservation(s)
    first = sim.execute("reserve_observation", args)
    assert first.error == "response_timeout"
    assert len(sim.state.reservations) == len(s.initial_state.reservations) + 1
    retry = sim.execute("reserve_observation", args)
    assert retry.error is None
    assert grade(s, sim.state).success
    assert len(sim.state.reservations) == len(s.initial_state.reservations) + 1


def test_reusing_an_idempotency_key_with_different_arguments_is_rejected():
    s = case()
    sim = Simulator(s)
    sim.execute("reserve_observation", reservation(s))
    args = reservation(s, "meridian")
    assert sim.execute("reserve_observation", args).error == "idempotency_conflict"


@pytest.mark.parametrize(
    "patch,error",
    [
        ({"instrument_id": "missing"}, "unknown_instrument"),
        ({"slot": 99}, "outside_window"),
        ({"slot": "night"}, "invalid_arguments"),
        ({"request_id": "missing"}, "unknown_request"),
    ],
)
def test_invalid_reservations_cannot_change_state(patch, error):
    s = case()
    sim = Simulator(s)
    args = reservation(s) | patch
    before = deepcopy(sim.state)
    assert sim.execute("reserve_observation", args).error == error
    assert sim.state == before


def test_unknown_tool_and_malformed_arguments_are_results_not_crashes():
    sim = Simulator(case())
    assert sim.execute("launch_rocket", {}).error == "unknown_tool"
    assert sim.execute("reserve_observation", {}).error == "invalid_arguments"


def test_cannot_cancel_existing_unrelated_reservations():
    s = case()
    sim = Simulator(s)
    original = s.initial_state.reservations[0]
    assert (
        sim.execute("cancel_reservation", {"reservation_id": original.id}).error
        == "protected_booking"
    )


def test_independent_grader_rejects_corrupted_state():
    s = case()
    sim = Simulator(s)
    sim.execute("reserve_observation", reservation(s))
    valid = sim.state.model_copy(deep=True)
    assert grade(s, valid).success
    invalid = valid.model_copy(deep=True)
    invalid.reservations[-1].slot = 99
    assert "outside_window" in grade(s, invalid).violations
    invalid = valid.model_copy(deep=True)
    invalid.reservations.append(invalid.reservations[-1].model_copy(update={"id": "duplicate"}))
    assert "duplicate_request" in grade(s, invalid).violations
    invalid = valid.model_copy(deep=True)
    invalid.reservations.pop(0)
    assert "existing_booking_changed" in grade(s, invalid).violations


@given(st.lists(st.integers(min_value=-5, max_value=30), max_size=25))
def test_arbitrary_reservation_attempts_preserve_existing_bookings_and_never_overlap(slots):
    s = case()
    sim = Simulator(s)
    for i, slot in enumerate(slots):
        sim.execute("reserve_observation", reservation(s, key=f"attempt-{i}") | {"slot": slot})
    bookings = sim.state.reservations
    assert bookings[0] == s.initial_state.reservations[0]
    assert len({(b.instrument_id, b.slot) for b in bookings}) == len(bookings)
    assert len([b for b in bookings if b.request_id == s.requests[0].id]) <= 1
