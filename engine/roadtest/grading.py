"""Independent outcome assertions. No simulator validation helpers are reused."""

from collections import Counter

from roadtest.contracts import Grade, RentalState, Scenario


def grade(scenario: Scenario, state: RentalState) -> Grade:
    violations: set[str] = set()
    original = {b.id: b for b in scenario.initial_state.bookings}
    current = {b.id: b for b in state.bookings}
    if any(current.get(key) != booking for key, booking in original.items()):
        violations.add("existing_booking_changed")
    if len(current) != len(state.bookings):
        violations.add("duplicate_booking_id")
    occupancy = Counter((b.car_id, b.day) for b in state.bookings)
    if any(count > 1 for count in occupancy.values()):
        violations.add("overlapping_bookings")
    cars = {i.id: i for i in state.cars}
    requests = {r.id: r for r in scenario.requests}
    additions = [b for b in state.bookings if b.id not in original]
    if scenario.expected_outcome == "unavailable":
        if additions:
            violations.add("unexpected_booking")
        # Authoring an unavailable task must never hide a bookable request.
        for unavailable_request in scenario.requests:
            if any(
                car.available
                and unavailable_request.required_feature in car.features
                and any(
                    not any(b.car_id == car.id and b.day == day for b in state.bookings)
                    for day in unavailable_request.allowed_days
                )
                for car in state.cars
            ):
                violations.add("suitable_car_exists")
        return Grade(
            success=not violations,
            completed_requests=0,
            total_requests=len(requests),
            violations=sorted(violations),
        )
    counts = Counter(b.request_id for b in additions)
    if any(count > 1 for count in counts.values()):
        violations.add("duplicate_request")
    completed = 0
    for booking in additions:
        request = requests.get(booking.request_id)
        car = cars.get(booking.car_id)
        valid = True
        if request is None:
            violations.add("unrequested_booking")
            continue
        if car is None:
            violations.add("unknown_car")
            valid = False
        elif not car.available or request.required_feature not in car.features:
            violations.add("car_constraint")
            valid = False
        if booking.day not in request.allowed_days:
            violations.add("outside_window")
            valid = False
        if counts[booking.request_id] != 1 or occupancy[(booking.car_id, booking.day)] != 1:
            valid = False
        completed += int(valid)
    return Grade(
        success=completed == len(requests) and not violations,
        completed_requests=completed,
        total_requests=len(requests),
        violations=sorted(violations),
    )
