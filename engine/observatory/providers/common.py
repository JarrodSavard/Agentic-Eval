import json
from typing import Any

from observatory.contracts import Scenario, ToolResult, Usage
from observatory.protocol import ProviderError

SYSTEM_PROMPT = """You schedule observations in a fictional observatory. Use only the supplied tools.
Create exactly one valid reservation for each requested observation. Respect instrument bands,
availability and allowed slots; preserve every unrelated reservation. Tools can fail and conditions
can change. Check state or retry safely when a write's outcome is uncertain. Idempotency keys must
be stable for retries of identical operations. Finish with a brief summary. Do not invent success."""


def task_prompt(scenario: Scenario) -> str:
    return "Schedule these observation requests:\n" + json.dumps(
        [r.model_dump() for r in scenario.requests]
    )


def parse_arguments(value: str) -> dict[str, Any]:
    try:
        parsed = json.loads(value)
        if isinstance(parsed, dict):
            return parsed
    except (ValueError, TypeError):
        pass
    return {"_malformed_arguments": True, "raw": value}


def public_result(result: ToolResult) -> str:
    return result.model_dump_json(exclude={"fault"})


def usage_from(raw: Any, *, anthropic: bool = False) -> Usage | None:
    if raw is None:
        return None
    inputs, outputs = getattr(raw, "input_tokens", None), getattr(raw, "output_tokens", None)
    if type(inputs) is not int or type(outputs) is not int or inputs < 0 or outputs < 0:
        return None
    if anthropic:
        for field in ("cache_creation_input_tokens", "cache_read_input_tokens"):
            extra = getattr(raw, field, None)
            if extra is not None:
                if type(extra) is not int or extra < 0:
                    return None
                inputs += extra  # conservatively price cached reads at the normal rate
    return Usage(input_tokens=inputs, output_tokens=outputs)


def count_value(value: Any) -> int:
    if type(value) is not int or value < 0:
        raise ProviderError("Input token count unavailable")
    return value
