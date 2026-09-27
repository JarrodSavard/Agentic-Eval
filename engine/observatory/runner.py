"""One bounded loop for both scripted policies and live provider adapters."""

import subprocess
from collections.abc import Callable
from datetime import UTC, datetime
from decimal import Decimal
from time import perf_counter

from observatory.budget import Budget, BudgetExceeded
from observatory.contracts import (
    EvaluationBundle,
    ExperimentConfig,
    Scenario,
    TraceEvent,
    TrialResult,
    TrialStatus,
    Usage,
)
from observatory.grading import grade
from observatory.protocol import Agent, ProviderError
from observatory.simulator import Simulator


def now() -> str:
    return datetime.now(UTC).isoformat()


def run_trial(
    scenario: Scenario,
    agent: Agent,
    config: ExperimentConfig,
    budget: Budget | None = None,
    repetition: int = 1,
    *,
    on_event: Callable[[TraceEvent], None] | None = None,
    should_stop: Callable[[], bool] | None = None,
) -> TrialResult:
    budget = budget or Budget(Decimal(str(config.budget_usd)))
    sim = Simulator(scenario)
    events: list[TraceEvent] = []

    observer_failed = False

    def record(event: TraceEvent) -> None:
        nonlocal observer_failed
        events.append(event)
        if on_event is not None and not observer_failed:
            try:
                on_event(event.model_copy(deep=True))
            except Exception:
                observer_failed = True
                raise

    usage = Usage()
    status: TrialStatus = "turn_limit"
    tool_calls = invalid_actions = 0
    started_at = now()
    started = perf_counter()
    initial_spent, initial_reserved = budget.spent, budget.reserved
    returned_model = None
    turn_number = 0
    usage_complete = True
    for turn_number in range(1, config.max_turns + 1):
        hold = Decimal(0)
        try:
            if should_stop is not None and should_stop():
                status = "interrupted"
                break
            if agent.source == "live":
                if agent.pricing is None:
                    raise ProviderError("Pricing unavailable")
                if budget.uncertain:
                    raise BudgetExceeded("Previous request usage is unknown")
                tokens = agent.count_input()
                if not isinstance(tokens, int) or tokens < 0:
                    raise ProviderError("Input token count unavailable")
                if tokens > config.max_input_tokens:
                    status = "input_limit"
                    break
                if should_stop is not None and should_stop():
                    status = "interrupted"
                    break
                hold = budget.reserve(tokens, config.max_output_tokens, agent.pricing)
            response = agent.next(config.max_output_tokens)
            returned_model = response.model or returned_model
            if agent.source == "live":
                if response.usage is None:
                    budget.mark_uncertain()
                    usage_complete = False
                    status = "provider_error"
                    break
                assert agent.pricing is not None
                budget.settle(
                    hold, response.usage.input_tokens, response.usage.output_tokens, agent.pricing
                )
                hold = Decimal(0)
                usage.input_tokens += response.usage.input_tokens
                usage.output_tokens += response.usage.output_tokens
                if budget.uncertain:
                    usage_complete = False
                    status = "provider_error"
                    break
            if response.truncated:
                status = "output_truncated"
                break
            if response.text:
                record(
                    TraceEvent(
                        sequence=len(events),
                        kind="message",
                        turn=turn_number,
                        text=response.text,
                        state=sim.state.model_copy(deep=True),
                    )
                )
            if not response.calls:
                status = "completed"
                break
            for call in response.calls:
                if should_stop is not None and should_stop():
                    status = "interrupted"
                    break
                if tool_calls >= config.max_tool_calls:
                    status = "tool_limit"
                    break
                result = sim.execute(call.name, call.arguments)
                tool_calls += 1
                invalid_actions += int(result.error is not None and result.fault is None)
                record(
                    TraceEvent(
                        sequence=len(events),
                        kind="tool",
                        turn=turn_number,
                        tool=call.name,
                        arguments=call.arguments,
                        result=result.model_copy(deep=True),
                        state=sim.state.model_copy(deep=True),
                    )
                )
                agent.observe(call, result)
            if status in {"tool_limit", "interrupted"}:
                break
        except BudgetExceeded:
            status = "budget_exhausted"
            break
        except KeyboardInterrupt:
            if hold:
                budget.mark_uncertain()
                usage_complete = False
            status = "interrupted"
            break
        except ProviderError:
            if hold:
                budget.mark_uncertain()
                usage_complete = False
            status = "provider_error"
            break
        except Exception:
            if hold:
                budget.mark_uncertain()
                usage_complete = False
            status = "interrupted"
            break
    if status != "completed":
        record(
            TraceEvent(
                sequence=len(events),
                kind="stopped",
                turn=turn_number,
                text=status,
                state=sim.state.model_copy(deep=True),
            )
        )
    return TrialResult(
        id=f"{scenario.id}--{agent.model}--{repetition}",
        scenario_id=scenario.id,
        agent=agent.name,
        provider=agent.provider,
        model=agent.model,
        returned_model=returned_model,
        source=agent.source,
        repetition=repetition,
        status=status,
        started_at=started_at,
        latency_ms=round((perf_counter() - started) * 1000, 3),
        tool_calls=tool_calls,
        invalid_actions=invalid_actions,
        usage=usage,
        estimated_cost_usd=float(budget.spent - initial_spent),
        reserved_cost_usd=float(budget.reserved - initial_reserved),
        usage_complete=usage_complete,
        settings=agent.settings,
        grade=grade(scenario, sim.state),
        final_state=sim.state,
        events=events,
    )


def make_bundle(
    scenarios: list[Scenario],
    trials: list[TrialResult],
    config: ExperimentConfig,
    experiment_id: str,
) -> EvaluationBundle:
    try:
        revision = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], stderr=subprocess.DEVNULL, text=True
        ).strip()
        if subprocess.check_output(["git", "status", "--porcelain"], text=True).strip():
            revision += "-dirty"
    except (subprocess.SubprocessError, FileNotFoundError):
        revision = "uncommitted"
    return EvaluationBundle(
        experiment_id=experiment_id,
        created_at=now(),
        code_revision=revision,
        config=config,
        scenarios=scenarios,
        trials=trials,
    )
