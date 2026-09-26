from collections.abc import Callable
from typing import Any

from observatory.contracts import Scenario
from observatory.protocol import Agent
from observatory.providers.anthropic import AnthropicAdapter
from observatory.providers.openai import OpenAIAdapter
from observatory.providers.registry import ModelProfile

PROVIDERS: dict[str, Callable[..., Agent]] = {
    "openai": OpenAIAdapter,
    "anthropic": AnthropicAdapter,
}


def create_agent(scenario: Scenario, profile: ModelProfile, client: Any = None) -> Agent:
    if profile.provider not in PROVIDERS:
        raise ValueError(f"Unsupported provider: {profile.provider}")
    return PROVIDERS[profile.provider](scenario, profile, client=client)
