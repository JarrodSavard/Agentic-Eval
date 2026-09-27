"""Small, authored synthetic tasks; pair order and fault triggers are stable."""

from roadtest.contracts import (
    Booking,
    Car,
    Family,
    RentalRequest,
    RentalState,
    Scenario,
)

FAMILIES: list[tuple[Family, str, str]] = [
    (
        "transient_read",
        "The booking site is down",
        "The first attempt to check available cars returns a temporary error.",
    ),
    (
        "car_unavailable",
        "The car is no longer available",
        "The Blue SUV is taken out of service just after the AI first checks available cars.",
    ),
    (
        "committed_timeout",
        "The confirmation never arrives",
        "The booking goes through, but the AI receives a timeout instead of a confirmation.",
    ),
]


def catalog() -> list[Scenario]:
    scenarios = []
    customers = ["Alex", "Sam", "Jordan", "Casey"]
    for family, title, description in FAMILIES:
        for index in range(4):
            requests = [
                RentalRequest(
                    id=f"trip-{j + 1}",
                    customer=customers[(index + j) % 4],
                    trip="a family day out"
                    if (index + j) % 2 == 0
                    else "a trip with extra luggage",
                    required_feature="child_seat" if (index + j) % 2 == 0 else "large_boot",
                    allowed_days=[f"2026-10-{3 + index * 3 + j:02d}", f"2026-10-{15 + j:02d}"],
                )
                for j in range(1 if index < 2 else index)
            ]
            state = RentalState(
                cars=[
                    Car(id="blue-suv", name="Blue SUV", features=["child_seat", "large_boot"]),
                    Car(id="red-suv", name="Red SUV", features=["child_seat", "large_boot"]),
                    Car(id="city-car", name="City hatchback", features=["child_seat"]),
                ],
                bookings=[
                    Booking(
                        id="existing-1",
                        request_id="another-customer",
                        car_id="blue-suv",
                        day="2026-10-01",
                    )
                ],
            )
            base_id = f"{family}-{index + 1:02d}"
            for variant in ("clean", "fault"):
                scenarios.append(
                    Scenario(
                        id=f"{base_id}-{variant}",
                        base_id=base_id,
                        title=f"{title} / {index + 1:02d}",
                        description=description,
                        family=family,
                        variant=variant,
                        requests=requests,
                        initial_state=state.model_copy(deep=True),
                    )
                )
    return scenarios
