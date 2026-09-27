from typing import Any, Literal

from anthropic import Anthropic

from roadtest.budget import Pricing
from roadtest.contracts import Scenario, ToolResult
from roadtest.protocol import AgentTurn, ProviderError, ToolCall
from roadtest.providers.common import (
    SYSTEM_PROMPT,
    count_value,
    public_result,
    task_prompt,
    usage_from,
)
from roadtest.providers.registry import ModelProfile
from roadtest.simulator import tool_definitions


class AnthropicAdapter:
    source: Literal["scripted", "live"] = "live"
    provider = "anthropic"

    def __init__(self, scenario: Scenario, profile: ModelProfile, client: Any = None):
        self.name, self.model = profile.label, profile.model
        self.settings = profile.model_dump(mode="json")
        self.pricing: Pricing | None = profile.pricing()
        self.client: Any = (client or Anthropic()).with_options(max_retries=0, timeout=30.0)
        self.messages: list[dict[str, Any]] = [{"role": "user", "content": task_prompt(scenario)}]
        self.tools = [
            {
                "name": tool["name"],
                "description": tool["description"],
                "input_schema": tool["parameters"],
            }
            for tool in tool_definitions()
        ]

    def _payload(self) -> dict[str, Any]:
        return dict(
            model=self.model,
            system=SYSTEM_PROMPT,
            messages=self.messages,
            tools=self.tools,
            thinking={"type": "disabled"},
            tool_choice={"type": "auto", "disable_parallel_tool_use": True},
        )

    def count_input(self) -> int:
        try:
            return count_value(self.client.messages.count_tokens(**self._payload()).input_tokens)
        except Exception as exc:
            raise ProviderError("Anthropic token counting failed") from exc

    def next(self, max_output_tokens: int) -> AgentTurn:
        try:
            response = self.client.messages.create(**self._payload(), max_tokens=max_output_tokens)
            self.messages.append(
                {
                    "role": "assistant",
                    "content": [b.model_dump(exclude_none=True) for b in response.content],
                }
            )
            calls, texts = [], []
            for block in response.content:
                if block.type == "tool_use":
                    args = (
                        block.input
                        if isinstance(block.input, dict)
                        else {"_malformed_arguments": True}
                    )
                    calls.append(ToolCall(block.id, block.name, args))
                elif block.type == "text":
                    texts.append(block.text)
            if response.stop_reason not in (
                "end_turn",
                "tool_use",
                "max_tokens",
                "stop_sequence",
                "refusal",
            ):
                raise ProviderError("Unsupported Anthropic stop reason")
            return AgentTurn(
                calls=calls,
                text="\n".join(texts),
                usage=usage_from(response.usage, anthropic=True),
                truncated=response.stop_reason == "max_tokens",
                model=response.model,
            )
        except Exception as exc:
            raise ProviderError("Anthropic generation failed") from exc

    def observe(self, call: ToolCall, result: ToolResult) -> None:
        block = {
            "type": "tool_result",
            "tool_use_id": call.id,
            "content": public_result(result),
            "is_error": result.error is not None,
        }
        if self.messages[-1]["role"] == "user" and isinstance(self.messages[-1]["content"], list):
            self.messages[-1]["content"].append(block)
        else:
            self.messages.append({"role": "user", "content": [block]})
