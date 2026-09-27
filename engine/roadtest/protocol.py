"""Small provider-neutral interface. SDK conversation details stay in adapters."""

from dataclasses import dataclass, field
from typing import Any, Literal, Protocol

from roadtest.budget import Pricing
from roadtest.contracts import ToolResult, Usage


@dataclass
class ToolCall:
    id: str
    name: str
    arguments: dict[str, Any]


@dataclass
class AgentTurn:
    calls: list[ToolCall] = field(default_factory=list)
    text: str = ""
    usage: Usage | None = None
    truncated: bool = False
    model: str | None = None


class ProviderError(Exception):
    """Adapter failure with a safe, non-secret description."""


class Agent(Protocol):
    name: str
    provider: str
    model: str
    source: Literal["scripted", "live"]
    settings: dict[str, Any]
    pricing: Pricing | None

    def count_input(self) -> int: ...
    def next(self, max_output_tokens: int) -> AgentTurn: ...
    def observe(self, call: ToolCall, result: ToolResult) -> None: ...
