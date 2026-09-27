"""Scripted baselines for testing the harness, never labeled as model evidence."""

from typing import Any, Literal

from roadtest.budget import Pricing
from roadtest.contracts import Scenario, ToolResult
from roadtest.protocol import AgentTurn, ToolCall


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
        self.reported = False

    def count_input(self) -> int:
        return 0

    def next(self, max_output_tokens: int) -> AgentTurn:
        self.calls += 1
        if self.stopped:
            return AgentTurn(text="The scripted policy stopped after a tool error.")
        if self.snapshot is None:
            return AgentTurn(calls=[ToolCall(str(self.calls), "check_cars", {})])
        if self.reported:
            return AgentTurn(
                text="The receipt records the booked cars and any trips with no suitable car."
            )
        booked = {b["request_id"] for b in self.snapshot["bookings"]}
        if not self.reckless:
            remaining = [r for r in self.requests if r.id not in booked]
            occupied = {(b["car_id"], b["day"]) for b in self.snapshot["bookings"]}
            cars = self.snapshot["cars"]

            def allocate(
                index: int, used: set[tuple[str, str]]
            ) -> list[tuple[str, str, str]] | None:
                if index == len(remaining):
                    return []
                request = remaining[index]
                for car in cars:
                    if not car["available"] or request.required_feature not in car["features"]:
                        continue
                    for day in request.allowed_days:
                        if (car["id"], day) in used:
                            continue
                        rest = allocate(index + 1, used | {(car["id"], day)})
                        if rest is not None:
                            return [(request.id, car["id"], day)] + rest
                return None

            plan = allocate(0, occupied)
            if plan:
                request_id, car_id, day = plan[0]
                return AgentTurn(
                    calls=[
                        ToolCall(
                            str(self.calls),
                            "book_car",
                            {
                                "request_id": request_id,
                                "car_id": car_id,
                                "day": day,
                                "idempotency_key": f"{request_id}-{car_id}-{day}",
                            },
                        )
                    ]
                )
            return self._report(booked)
        for request in self.requests:
            if request.id in booked or request.id in self.attempted:
                continue
            for car in self.snapshot["cars"]:
                if not car["available"] or request.required_feature not in car["features"]:
                    continue
                for day in request.allowed_days:
                    if any(
                        b["car_id"] == car["id"] and b["day"] == day
                        for b in self.snapshot["bookings"]
                    ):
                        continue
                    return AgentTurn(
                        calls=[
                            ToolCall(
                                str(self.calls),
                                "book_car",
                                {
                                    "request_id": request.id,
                                    "car_id": car["id"],
                                    "day": day,
                                    "idempotency_key": f"{request.id}-{car['id']}-{day}",
                                },
                            )
                        ]
                    )
        return self._report(booked)

    def _report(self, booked: set[str]) -> AgentTurn:
        assert self.snapshot is not None
        wanted = {r.id for r in self.requests}
        return AgentTurn(
            calls=[
                ToolCall(
                    str(self.calls),
                    "report_result",
                    {
                        "bookings": [
                            {k: b[k] for k in ("request_id", "car_id", "day")}
                            for b in self.snapshot["bookings"]
                            if b["request_id"] in wanted
                        ],
                        "unavailable_request_ids": sorted(wanted - booked),
                    },
                )
            ]
        )

    def observe(self, call: ToolCall, result: ToolResult) -> None:
        if result.error:
            if self.reckless:
                if call.name == "book_car":
                    self.attempted.add(call.arguments["request_id"])
                else:
                    self.stopped = True
            else:
                self.snapshot = None
            return
        if call.name == "check_cars":
            self.snapshot = result.data
        elif call.name == "book_car" and self.snapshot is not None:
            self.snapshot["bookings"].append(result.data["reservation"])
        elif call.name == "report_result":
            self.reported = True
