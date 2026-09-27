"""One locally initiated experiment, observed without restarting paid work."""

import os
from collections.abc import Callable
from datetime import date
from decimal import Decimal
from itertools import product
from pathlib import Path
from threading import Event, RLock, Thread
from typing import Literal
from uuid import uuid4

from pydantic import Field

from roadtest.artifacts import export_bundle
from roadtest.budget import Budget
from roadtest.contracts import (
    Contract,
    EvaluationBundle,
    ExperimentConfig,
    Scenario,
    TraceEvent,
    TrialResult,
    Usage,
)
from roadtest.grading import grade
from roadtest.protocol import Agent
from roadtest.providers import create_agent
from roadtest.providers.registry import ModelProfile
from roadtest.runner import make_bundle, now, run_trial
from roadtest.scenarios import catalog

KEY_NAMES = {"openai": "OPENAI_API_KEY", "anthropic": "ANTHROPIC_API_KEY"}


class StartRun(Contract):
    profile_ids: list[str] = Field(min_length=1, max_length=8)
    base_id: str
    budget_usd: float = Field(default=0.5, gt=0, le=1)
    repetitions: int = Field(default=1, ge=1, le=10)


class LiveSnapshot(Contract):
    run_id: str
    status: Literal["running", "completed", "failed"] = "running"
    active_scenario_id: str | None = None
    active_agent: str | None = None
    active_repetition: int = 1
    events: list[TraceEvent] = Field(default_factory=list)
    bundle: EvaluationBundle
    recording_saved: bool = False
    cancel_requested: bool = False
    error: str | None = None


class RunConflict(ValueError):
    pass


class LiveProfile(Contract):
    id: str
    label: str
    model: str
    ready: bool
    reason: str | None


class LiveBootstrap(Contract):
    token: str
    latest_run_id: str | None
    profiles: list[LiveProfile]
    scenarios: list[Scenario]


class LiveAPI(Contract):
    """Schema collection for generated browser types, not an HTTP envelope."""

    bootstrap: LiveBootstrap
    snapshot: LiveSnapshot
    request: StartRun


def readiness(profile: ModelProfile) -> str | None:
    key = KEY_NAMES.get(profile.provider)
    if key is None:
        return "Unsupported provider"
    if not os.getenv(key):
        return f"Add {key} to your local .env file"
    if not 0 <= (date.today() - profile.price_checked_at).days <= 30:
        return "Verify and update the dated model prices before running"
    return None


class LiveManager:
    def __init__(
        self,
        profiles: list[ModelProfile],
        output: Path,
        factory: Callable[[Scenario, ModelProfile], Agent] = create_agent,
    ):
        self.profiles = profiles
        self.output = output
        self.factory = factory
        self.lock = RLock()
        self.runs: dict[str, LiveSnapshot] = {}
        self.latest_run_id: str | None = None
        self.worker: Thread | None = None
        self.cancel = Event()

    def start(self, request: StartRun) -> LiveSnapshot:
        by_id = {p.id: p for p in self.profiles}
        if len(set(request.profile_ids)) != len(request.profile_ids):
            raise ValueError("Choose each model only once")
        if any(key not in by_id for key in request.profile_ids):
            raise ValueError("Unknown model profile")
        selected = [by_id[key] for key in request.profile_ids]
        for profile in selected:
            if error := readiness(profile):
                raise ValueError(error)
        scenarios = [s for s in catalog() if s.base_id == request.base_id]
        if len(scenarios) != 2:
            raise ValueError("Choose a task from the scenario catalog")
        config = ExperimentConfig(budget_usd=request.budget_usd, repetitions=request.repetitions)
        with self.lock:
            if self.worker and self.worker.is_alive():
                raise RunConflict("An experiment is already running; wait or stop it first")
            self.cancel = Event()
            run_id = f"live-{uuid4().hex}"
            snapshot = LiveSnapshot(
                run_id=run_id,
                bundle=make_bundle(catalog(), [], config, run_id),
            )
            self.output.mkdir(parents=True, exist_ok=True)
            self.runs[run_id] = snapshot
            self.latest_run_id = run_id
            # Keep a bounded in-memory history; portable artifacts remain on disk.
            while len(self.runs) > 25:
                del self.runs[next(iter(self.runs))]
            self.worker = Thread(
                target=self._execute, args=(run_id, scenarios, selected), daemon=True
            )
            self.worker.start()
            return snapshot.model_copy(deep=True)

    def snapshot(self, run_id: str) -> LiveSnapshot:
        with self.lock:
            return self.runs[run_id].model_copy(deep=True)

    def stop(self, run_id: str) -> LiveSnapshot:
        with self.lock:
            current = self.runs[run_id]
            if current.status == "running":
                current.cancel_requested = True
                self.cancel.set()
            return current.model_copy(deep=True)

    def close(self) -> None:
        self.cancel.set()
        if self.worker:
            self.worker.join(timeout=35)

    def _checkpoint(self, snapshot: LiveSnapshot) -> None:
        path = self.output / f"{snapshot.run_id}.progress.json"
        temporary = path.with_suffix(".tmp")
        try:
            temporary.write_text(snapshot.model_dump_json(indent=2) + "\n", encoding="utf-8")
            temporary.replace(path)
        except OSError:
            snapshot.error = "Could not save progress locally. Download the available evidence before closing the server."
            self.cancel.set()

    def _execute(
        self, run_id: str, scenarios: list[Scenario], profiles: list[ModelProfile]
    ) -> None:
        snapshot = self.runs[run_id]
        config = snapshot.bundle.config
        budget = Budget(Decimal(str(config.budget_usd)))
        stopped = False
        try:
            for repetition, scenario in product(range(1, config.repetitions + 1), scenarios):
                for profile in profiles:
                    with self.lock:
                        snapshot.active_scenario_id = scenario.id
                        snapshot.active_agent = profile.label
                        snapshot.active_repetition = repetition
                        snapshot.events = []
                        snapshot.recording_saved = False
                    if stopped or self.cancel.is_set():
                        trial = TrialResult(
                            id=f"{scenario.id}--{profile.model}--{repetition}",
                            scenario_id=scenario.id,
                            agent=profile.label,
                            provider=profile.provider,
                            model=profile.model,
                            source="live",
                            repetition=repetition,
                            status="not_run",
                            started_at=now(),
                            latency_ms=0,
                            tool_calls=0,
                            invalid_actions=0,
                            usage=Usage(),
                            estimated_cost_usd=0,
                            settings=profile.model_dump(mode="json"),
                            grade=grade(scenario, scenario.initial_state),
                            final_state=scenario.initial_state.model_copy(deep=True),
                            events=[],
                        )
                    else:

                        def emit(event: TraceEvent) -> None:
                            with self.lock:
                                snapshot.events.append(event)
                                self._checkpoint(snapshot)

                        trial = run_trial(
                            scenario,
                            self.factory(scenario, profile),
                            config,
                            budget,
                            repetition,
                            on_event=emit,
                            should_stop=self.cancel.is_set,
                        )
                        if trial.status == "interrupted" and not self.cancel.is_set():
                            snapshot.error = "The local run stopped unexpectedly; the partial trial was preserved. No automatic retry was made."
                        stopped = budget.uncertain or trial.status in {
                            "interrupted",
                            "budget_exhausted",
                        }
                    with self.lock:
                        snapshot.bundle.trials.append(trial)
                        export_bundle(snapshot.bundle, self.output / f"{run_id}.json")
                        snapshot.recording_saved = True
            with self.lock:
                snapshot.status = "failed" if snapshot.error else "completed"
                self._checkpoint(snapshot)
        except Exception:
            # SDK exceptions can contain request headers; never send or log raw exceptions.
            with self.lock:
                snapshot.status = "failed"
                snapshot.error = "The local run stopped unexpectedly. Check local configuration and saved progress; no automatic retry was made."
                self._checkpoint(snapshot)
