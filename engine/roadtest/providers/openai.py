from typing import Any, Literal

from openai import OpenAI

from roadtest.budget import Pricing
from roadtest.contracts import Scenario, ToolResult
from roadtest.protocol import AgentTurn, ProviderError, ToolCall
from roadtest.providers.common import (
    SYSTEM_PROMPT,
    count_value,
    parse_arguments,
    public_result,
    task_prompt,
    usage_from,
)
from roadtest.providers.registry import ModelProfile
from roadtest.simulator import tool_definitions


class OpenAIAdapter:
    source: Literal["scripted", "live"] = "live"
    provider = "openai"

    def __init__(self, scenario: Scenario, profile: ModelProfile, client: Any = None):
        self.name, self.model = profile.label, profile.model
        self.settings = profile.model_dump(mode="json")
        self.pricing: Pricing | None = profile.pricing()
        self.client: Any = (client or OpenAI()).with_options(max_retries=0, timeout=30.0)
        self.items: list[dict[str, Any]] = [{"role": "user", "content": task_prompt(scenario)}]
        self.tools = [{"type": "function", **tool, "strict": True} for tool in tool_definitions()]

    def _payload(self) -> dict[str, Any]:
        return dict(
            model=self.model,
            instructions=SYSTEM_PROMPT,
            input=self.items,
            tools=self.tools,
            reasoning={"effort": "none"},
            parallel_tool_calls=False,
            truncation="disabled",
        )

    def count_input(self) -> int:
        try:
            return count_value(
                self.client.responses.input_tokens.count(**self._payload()).input_tokens
            )
        except Exception as exc:
            raise ProviderError("OpenAI token counting failed") from exc

    def next(self, max_output_tokens: int) -> AgentTurn:
        try:
            response = self.client.responses.create(
                **self._payload(), max_output_tokens=max_output_tokens, store=False
            )
            calls: list[ToolCall] = []
            texts: list[str] = []
            for item in response.output:
                self.items.append(item.model_dump(exclude_none=True))
                if item.type == "function_call":
                    calls.append(ToolCall(item.call_id, item.name, parse_arguments(item.arguments)))
                elif item.type == "message":
                    texts.extend(part.text for part in item.content if part.type == "output_text")
            if response.status not in ("completed", "incomplete"):
                raise ProviderError("OpenAI response did not complete")
            return AgentTurn(
                calls=calls,
                text="\n".join(texts),
                usage=usage_from(response.usage),
                truncated=response.status == "incomplete",
                model=response.model,
            )
        except Exception as exc:
            raise ProviderError("OpenAI generation failed") from exc

    def observe(self, call: ToolCall, result: ToolResult) -> None:
        self.items.append(
            {"type": "function_call_output", "call_id": call.id, "output": public_result(result)}
        )
