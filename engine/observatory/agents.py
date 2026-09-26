"""Scripted baselines for testing the harness, never labeled as model evidence."""

from typing import Any, Literal

from observatory.budget import Pricing
from observatory.contracts import Scenario, ToolResult
from observatory.protocol import AgentTurn, ToolCall


class ScriptedAgent:
    source: Literal["scripted", "live"] = "scripted"
    provider = "scripted"
    pricing: Pricing | None = None

    def __init__(self, scenario: Scenario, reckless: bool = False):
        self.name = "Optimistic baseline" if reckless else "Recovery reference"
        self.model = "scripted-optimistic-v1" if reckless else "scripted-recovery-v1"
        self.settings: dict[str, Any] = {"policy": self.model}
        self.requests = scenario.requests
        self.reckless = reckless
        self.snapshot: dict[str, Any] | None = None
        self.attempted: set[str] = set()
        self.stopped = False
        self.calls = 0

    def count_input(self) -> int:
        return 0

    def next(self, max_output_tokens: int) -> AgentTurn:
        self.calls += 1
        if self.stopped:
            return AgentTurn(text="The scripted policy stopped after a tool error.")
        if self.snapshot is None:
            return AgentTurn(calls=[ToolCall(str(self.calls), "inspect_observatory", {})])
        booked = {b["request_id"] for b in self.snapshot["reservations"]}
        for request in self.requests:
            if request.id in booked or request.id in self.attempted:
                continue
            for instrument in self.snapshot["instruments"]:
                if not instrument["available"] or request.band not in instrument["bands"]:
                    continue
                for slot in request.allowed_slots:
                    if any(
                        b["instrument_id"] == instrument["id"] and b["slot"] == slot
                        for b in self.snapshot["reservations"]
                    ):
                        continue
                    return AgentTurn(
                        calls=[
                            ToolCall(
                                str(self.calls),
                                "reserve_observation",
                                {
                                    "request_id": request.id,
                                    "instrument_id": instrument["id"],
                                    "slot": slot,
                                    "idempotency_key": f"{request.id}-{instrument['id']}-{slot}",
                                },
                            )
                        ]
                    )
        return AgentTurn(
            text="Scheduling complete. Check the recorded environment for the outcome."
        )

    def observe(self, call: ToolCall, result: ToolResult) -> None:
        if result.error:
            if self.reckless:
                if call.name == "reserve_observation":
                    self.attempted.add(call.arguments["request_id"])
                else:
                    self.stopped = True
            else:
                self.snapshot = None
            return
        if call.name == "inspect_observatory":
            self.snapshot = result.data
        elif call.name == "reserve_observation" and self.snapshot is not None:
            self.snapshot["reservations"].append(result.data["reservation"])
