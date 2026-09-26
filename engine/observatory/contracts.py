"""Versioned public artifacts. Exported schemas are the TypeScript source of truth."""

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

Family = Literal["transient_read", "instrument_unavailable", "committed_timeout"]


class Contract(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Instrument(Contract):
    id: str
    name: str
    bands: list[str]
    available: bool = True


class ObservationRequest(Contract):
    id: str
    target: str
    band: str
    allowed_slots: list[int]


class Reservation(Contract):
    id: str
    request_id: str
    instrument_id: str
    slot: int


class ObservatoryState(Contract):
    instruments: list[Instrument]
    reservations: list[Reservation]


class Scenario(Contract):
    id: str
    base_id: str
    version: Literal["1.0"] = "1.0"
    title: str
    description: str
    family: Family
    variant: Literal["clean", "fault"]
    requests: list[ObservationRequest]
    initial_state: ObservatoryState


class ToolResult(Contract):
    data: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None
    fault: Family | None = None


class Grade(Contract):
    success: bool
    completed_requests: int
    total_requests: int
    violations: list[str]


class ExperimentConfig(Contract):
    budget_usd: float = Field(default=0.5, gt=0, le=1)
    max_turns: int = Field(default=8, ge=1, le=8)
    max_tool_calls: int = Field(default=12, ge=1, le=12)
    max_output_tokens: int = Field(default=512, ge=1, le=512)
    max_input_tokens: int = Field(default=6000, ge=1, le=6000)
    repetitions: int = Field(default=1, ge=1, le=10)


class Usage(Contract):
    input_tokens: int = Field(default=0, ge=0)
    output_tokens: int = Field(default=0, ge=0)


class TraceEvent(Contract):
    sequence: int
    kind: Literal["tool", "message", "stopped"]
    turn: int
    tool: str | None = None
    arguments: dict[str, Any] | None = None
    result: ToolResult | None = None
    text: str | None = None
    state: ObservatoryState


TrialStatus = Literal[
    "completed",
    "turn_limit",
    "tool_limit",
    "provider_error",
    "budget_exhausted",
    "input_limit",
    "output_truncated",
    "interrupted",
    "not_run",
]


class TrialResult(Contract):
    id: str
    scenario_id: str
    agent: str
    provider: str
    model: str
    returned_model: str | None = None
    source: Literal["scripted", "live"]
    repetition: int = 1
    status: TrialStatus
    started_at: str
    latency_ms: float = Field(ge=0)
    tool_calls: int = Field(ge=0)
    invalid_actions: int = Field(ge=0)
    usage: Usage
    estimated_cost_usd: float = Field(ge=0)
    reserved_cost_usd: float = Field(default=0, ge=0)
    usage_complete: bool = True
    settings: dict[str, Any] = Field(default_factory=dict)
    grade: Grade
    final_state: ObservatoryState
    events: list[TraceEvent]


class EvaluationBundle(Contract):
    schema_version: Literal["1.0"] = "1.0"
    experiment_id: str
    created_at: str
    code_revision: str
    prompt_version: Literal["1.0"] = "1.0"
    config: ExperimentConfig
    scenarios: list[Scenario]
    trials: list[TrialResult]
