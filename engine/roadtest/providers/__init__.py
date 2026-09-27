from collections.abc import Callable
from typing import Any

from roadtest.contracts import Scenario
from roadtest.protocol import Agent
from roadtest.providers.anthropic import AnthropicAdapter
from roadtest.providers.openai import OpenAIAdapter
from roadtest.providers.registry import ModelProfile

PROVIDERS: dict[str, Callable[..., Agent]] = {
    "openai": OpenAIAdapter,
    "anthropic": AnthropicAdapter,
}


def create_agent(scenario: Scenario, profile: ModelProfile, client: Any = None) -> Agent:
    if profile.provider not in PROVIDERS:
        raise ValueError(f"Unsupported provider: {profile.provider}")
    return PROVIDERS[profile.provider](scenario, profile, client=client)
