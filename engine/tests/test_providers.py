import json
from decimal import Decimal

import httpx
import pytest
from anthropic import Anthropic
from openai import OpenAI
from roadtest.budget import Budget
from roadtest.contracts import ExperimentConfig, ToolResult
from roadtest.providers import create_agent
from roadtest.providers.registry import ModelProfile
from roadtest.runner import run_trial
from roadtest.scenarios import catalog


def profile(provider):
    return ModelProfile(
        id=provider,
        label=provider,
        provider=provider,
        model="test-model",
        input_per_million="1",
        output_per_million="5",
        price_checked_at="2026-09-26",
        reasoning="none",
    )


def provider_response(provider, *, tools=True, truncated=False, usage=True):
    if provider == "openai":
        return {
            "id": "resp_test",
            "object": "response",
            "created_at": 1780000000,
            "model": "test-model",
            "status": "incomplete" if truncated else "completed",
            "incomplete_details": {"reason": "max_output_tokens"} if truncated else None,
            "output": [
                {
                    "type": "function_call",
                    "id": "fc_1",
                    "call_id": "call_1",
                    "name": "check_cars",
                    "arguments": "{}",
                    "status": "completed",
                }
            ]
            if tools
            else [],
            "usage": {
                "input_tokens": 100,
                "output_tokens": 20,
                "total_tokens": 120,
                "input_tokens_details": {"cached_tokens": 0},
                "output_tokens_details": {"reasoning_tokens": 0},
            }
            if usage
            else None,
        }
    return {
        "id": "msg_test",
        "type": "message",
        "role": "assistant",
        "model": "test-model",
        "content": [{"type": "tool_use", "id": "call_1", "name": "check_cars", "input": {}}]
        if tools
        else [{"type": "text", "text": "Done"}],
        "stop_reason": "max_tokens" if truncated else ("tool_use" if tools else "end_turn"),
        "stop_sequence": None,
        "usage": {"input_tokens": 100, "output_tokens": 20} if usage else None,
    }


def adapter(provider, handler):
    client = httpx.Client(transport=httpx.MockTransport(handler))
    sdk = (
        OpenAI(api_key="test", http_client=client, max_retries=0)
        if provider == "openai"
        else Anthropic(api_key="test", http_client=client, max_retries=0)
    )
    return create_agent(catalog()[0], profile(provider), client=sdk)


@pytest.mark.parametrize("provider", ["openai", "anthropic"])
def test_adapter_counts_exact_conversation_and_roundtrips_tool_results(provider):
    bodies = []

    def handler(request):
        body = json.loads(request.content)
        bodies.append((request.url.path, body))
        if request.url.path.endswith(("input_tokens", "count_tokens")):
            return httpx.Response(
                200, json={"input_tokens": 100, "object": "response.input_tokens"}
            )
        return httpx.Response(200, json=provider_response(provider, tools=len(bodies) < 4))

    agent = adapter(provider, handler)
    assert agent.count_input() == 100
    turn = agent.next(512)
    assert turn.calls[0].name == "check_cars"
    assert turn.usage.input_tokens == 100
    agent.observe(turn.calls[0], ToolResult(error="temporary_unavailable", fault="transient_read"))
    assert agent.count_input() == 100
    agent.next(512)
    sent = json.dumps(bodies[-1][1])
    assert "temporary_unavailable" in sent
    assert '"fault"' not in sent  # evaluator's hidden metadata stays out of model observations
    if provider == "openai":
        assert bodies[0][1]["input"] == bodies[1][1]["input"]
        assert bodies[1][1]["parallel_tool_calls"] is False
        assert bodies[1][1]["reasoning"] == {"effort": "none"}
        assert bodies[1][1]["store"] is False
        assert bodies[-1][1]["input"][-1]["call_id"] == "call_1"
    else:
        assert bodies[0][1]["messages"] == bodies[1][1]["messages"]
        assert bodies[1][1]["thinking"] == {"type": "disabled"}
        assert bodies[-1][1]["messages"][-1]["content"][0]["is_error"] is True


@pytest.mark.parametrize("provider", ["openai", "anthropic"])
def test_http_errors_are_not_retried_or_exposed_in_artifacts(provider):
    requests = []

    def handler(request):
        requests.append(request.url.path)
        if request.url.path.endswith(("input_tokens", "count_tokens")):
            return httpx.Response(
                200, json={"input_tokens": 100, "object": "response.input_tokens"}
            )
        return httpx.Response(
            500, json={"error": {"type": "api_error", "message": "private-server-details"}}
        )

    agent = adapter(provider, handler)
    budget = Budget(Decimal("0.5"))
    trial = run_trial(catalog()[0], agent, ExperimentConfig(), budget)
    assert trial.status == "provider_error"
    assert len(requests) == 2
    assert budget.uncertain
    assert trial.reserved_cost_usd > 0
    assert "private-server-details" not in trial.model_dump_json()


@pytest.mark.parametrize("provider", ["openai", "anthropic"])
@pytest.mark.parametrize(
    "issue,status",
    [
        ("truncated", "output_truncated"),
        ("usage", "provider_error"),
        ("input", "input_limit"),
        ("timeout", "provider_error"),
    ],
)
def test_runner_preserves_partial_results_on_provider_boundary_failures(provider, issue, status):
    def handler(request):
        if request.url.path.endswith(("input_tokens", "count_tokens")):
            return httpx.Response(
                200,
                json={
                    "input_tokens": 6001 if issue == "input" else 100,
                    "object": "response.input_tokens",
                },
            )
        if issue == "timeout":
            raise httpx.ReadTimeout("uncertain completion", request=request)
        return httpx.Response(
            200,
            json=provider_response(
                provider, truncated=issue == "truncated", usage=issue != "usage"
            ),
        )

    trial = run_trial(catalog()[0], adapter(provider, handler), ExperimentConfig())
    assert trial.status == status
    assert trial.tool_calls == 0
    assert trial.events[-1].kind == "stopped"


def test_budget_exhaustion_happens_before_generation():
    paths = []

    def handler(request):
        paths.append(request.url.path)
        return httpx.Response(200, json={"input_tokens": 100, "object": "response.input_tokens"})

    result = run_trial(
        catalog()[0], adapter("openai", handler), ExperimentConfig(budget_usd=0.00001)
    )
    assert result.status == "budget_exhausted"
    assert paths == ["/v1/responses/input_tokens"]
