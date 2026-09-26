"""Small, authored synthetic tasks; pair order and fault triggers are stable."""

from observatory.contracts import (
    Family,
    Instrument,
    ObservationRequest,
    ObservatoryState,
    Reservation,
    Scenario,
)

FAMILIES: list[tuple[Family, str, str]] = [
    (
        "transient_read",
        "Lost signal",
        "The first observatory inspection returns a temporary error.",
    ),
    (
        "instrument_unavailable",
        "Change of plans",
        "Aurora becomes unavailable immediately after the first successful inspection.",
    ),
    (
        "committed_timeout",
        "An uncertain success",
        "The first successful reservation commits, then its response times out.",
    ),
]


def catalog() -> list[Scenario]:
    scenarios = []
    targets = ["Vela drift", "Orion filament", "Lyra field", "Cygnus arc"]
    for family, title, description in FAMILIES:
        for index in range(4):
            requests = [
                ObservationRequest(
                    id=f"observation-{j + 1}",
                    target=targets[(index + j) % 4],
                    band="visible" if (index + j) % 2 == 0 else "infrared",
                    allowed_slots=[2 + index * 3 + j, 14 + j],
                )
                for j in range(1 if index < 2 else index)
            ]
            state = ObservatoryState(
                instruments=[
                    Instrument(id="aurora", name="Aurora / 01", bands=["visible", "infrared"]),
                    Instrument(id="meridian", name="Meridian / 02", bands=["visible", "infrared"]),
                    Instrument(id="cinder", name="Cinder / 03", bands=["visible"]),
                ],
                reservations=[
                    Reservation(
                        id="existing-1",
                        request_id="unrelated-program",
                        instrument_id="aurora",
                        slot=0,
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
