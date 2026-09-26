"""Tool boundary and deterministic faults. Never performs I/O or sleeps."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, ValidationError

from observatory.contracts import Reservation, Scenario, ToolResult


class Arguments(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class ReserveArguments(Arguments):
    request_id: str = Field(min_length=1, max_length=100)
    instrument_id: str = Field(min_length=1, max_length=100)
    slot: int
    idempotency_key: str = Field(min_length=1, max_length=100)


class CancelArguments(Arguments):
    reservation_id: str


TOOL_MODELS: dict[str, type[Arguments]] = {
    "inspect_observatory": Arguments,
    "reserve_observation": ReserveArguments,
    "cancel_reservation": CancelArguments,
}


def tool_definitions() -> list[dict[str, Any]]:
    descriptions = {
        "inspect_observatory": "Read current instruments, availability, and all reservations. Read again after uncertain writes or changing conditions.",
        "reserve_observation": "Reserve one slot for a requested observation. Reusing the same idempotency_key with identical arguments safely returns the original reservation, even if its response timed out. Different arguments require a new key.",
        "cancel_reservation": "Cancel a reservation created for this task. Existing unrelated reservations are protected.",
    }
    return [
        {"name": name, "description": descriptions[name], "parameters": model.model_json_schema()}
        for name, model in TOOL_MODELS.items()
    ]


class Simulator:
    def __init__(self, scenario: Scenario):
        self.scenario = scenario
        self.state = scenario.initial_state.model_copy(deep=True)
        self._fault_used = False
        self._receipts: dict[str, tuple[ReserveArguments, Reservation]] = {}
        self._next_id = 1

    def execute(self, name: str, arguments: dict[str, Any]) -> ToolResult:
        if name not in TOOL_MODELS:
            return ToolResult(error="unknown_tool")
        try:
            parsed = TOOL_MODELS[name].model_validate(arguments)
        except ValidationError:
            return ToolResult(error="invalid_arguments")
        if name == "inspect_observatory":
            if self._fault("transient_read"):
                return ToolResult(error="temporary_unavailable", fault="transient_read")
            visible = self.state.model_dump()
            if self._fault("instrument_unavailable"):
                self.state.instruments[0].available = False
                return ToolResult(data=visible, fault="instrument_unavailable")
            return ToolResult(data=visible)
        if isinstance(parsed, ReserveArguments):
            return self._reserve(parsed)
        assert isinstance(parsed, CancelArguments)
        if parsed.reservation_id in {b.id for b in self.scenario.initial_state.reservations}:
            return ToolResult(error="protected_booking")
        booking = next((b for b in self.state.reservations if b.id == parsed.reservation_id), None)
        if booking is None:
            return ToolResult(error="unknown_reservation")
        self.state.reservations.remove(booking)
        return ToolResult(data={"cancelled": booking.id})

    def _fault(self, family: str) -> bool:
        if (
            self.scenario.variant == "fault"
            and self.scenario.family == family
            and not self._fault_used
        ):
            self._fault_used = True
            return True
        return False

    def _reserve(self, args: ReserveArguments) -> ToolResult:
        if args.idempotency_key in self._receipts:
            previous, booking = self._receipts[args.idempotency_key]
            if previous != args:
                return ToolResult(error="idempotency_conflict")
            return ToolResult(data={"reservation": booking.model_dump(), "idempotent_replay": True})
        request = next((r for r in self.scenario.requests if r.id == args.request_id), None)
        instrument = next((i for i in self.state.instruments if i.id == args.instrument_id), None)
        error = None
        if request is None:
            error = "unknown_request"
        elif instrument is None:
            error = "unknown_instrument"
        elif not instrument.available:
            error = "instrument_unavailable"
        elif request.band not in instrument.bands:
            error = "unsupported_band"
        elif args.slot not in request.allowed_slots:
            error = "outside_window"
        elif any(b.request_id == args.request_id for b in self.state.reservations):
            error = "request_already_reserved"
        elif any(
            b.instrument_id == args.instrument_id and b.slot == args.slot
            for b in self.state.reservations
        ):
            error = "slot_occupied"
        if error:
            return ToolResult(error=error)
        booking = Reservation(
            id=f"reservation-{self._next_id}",
            request_id=args.request_id,
            instrument_id=args.instrument_id,
            slot=args.slot,
        )
        self._next_id += 1
        self.state.reservations.append(booking)
        self._receipts[args.idempotency_key] = (args, booking.model_copy(deep=True))
        if self._fault("committed_timeout"):
            return ToolResult(error="response_timeout", fault="committed_timeout")
        return ToolResult(data={"reservation": booking.model_dump(), "idempotent_replay": False})
