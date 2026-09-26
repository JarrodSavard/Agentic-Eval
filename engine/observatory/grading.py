"""Independent outcome assertions. No simulator validation helpers are reused."""

from collections import Counter

from observatory.contracts import Grade, ObservatoryState, Scenario


def grade(scenario: Scenario, state: ObservatoryState) -> Grade:
    violations: set[str] = set()
    original = {b.id: b for b in scenario.initial_state.reservations}
    current = {b.id: b for b in state.reservations}
    if any(current.get(key) != booking for key, booking in original.items()):
        violations.add("existing_booking_changed")
    if len(current) != len(state.reservations):
        violations.add("duplicate_reservation_id")
    occupancy = Counter((b.instrument_id, b.slot) for b in state.reservations)
    if any(count > 1 for count in occupancy.values()):
        violations.add("overlapping_reservations")
    instruments = {i.id: i for i in state.instruments}
    requests = {r.id: r for r in scenario.requests}
    additions = [b for b in state.reservations if b.id not in original]
    counts = Counter(b.request_id for b in additions)
    if any(count > 1 for count in counts.values()):
        violations.add("duplicate_request")
    completed = 0
    for booking in additions:
        request = requests.get(booking.request_id)
        instrument = instruments.get(booking.instrument_id)
        valid = True
        if request is None:
            violations.add("unrequested_booking")
            continue
        if instrument is None:
            violations.add("unknown_instrument")
            valid = False
        elif not instrument.available or request.band not in instrument.bands:
            violations.add("instrument_constraint")
            valid = False
        if booking.slot not in request.allowed_slots:
            violations.add("outside_window")
            valid = False
        if counts[booking.request_id] != 1 or occupancy[(booking.instrument_id, booking.slot)] != 1:
            valid = False
        completed += int(valid)
    return Grade(
        success=completed == len(requests) and not violations,
        completed_requests=completed,
        total_requests=len(requests),
        violations=sorted(violations),
    )
