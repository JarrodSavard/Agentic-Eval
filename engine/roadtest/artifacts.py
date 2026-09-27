"""Atomic exports and replay verification, independent of model text claims."""

from pathlib import Path

from roadtest.assessment import assess_trial
from roadtest.contracts import EvaluationBundle
from roadtest.grading import grade
from roadtest.simulator import Simulator


def export_bundle(bundle: EvaluationBundle, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(bundle.model_dump_json(indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def verify_bundle(bundle: EvaluationBundle) -> list[str]:
    errors = []
    scenarios = {s.id: s for s in bundle.scenarios}
    if len(scenarios) != len(bundle.scenarios):
        errors.append("duplicate scenario ids")
    if len({t.id for t in bundle.trials}) != len(bundle.trials):
        errors.append("duplicate trial ids")
    for trial in bundle.trials:
        scenario = scenarios.get(trial.scenario_id)
        if scenario is None:
            errors.append(f"{trial.id}: missing scenario")
            continue
        sim = Simulator(scenario)
        tool_calls = invalid_actions = previous_turn = 0
        stopped = [event for event in trial.events if event.kind == "stopped"]
        if trial.status in {"completed", "not_run"}:
            status_valid = not stopped and (trial.status != "not_run" or not trial.events)
        else:
            status_valid = (
                len(stopped) == 1
                and trial.events[-1] == stopped[0]
                and stopped[0].text == trial.status
            )
        if not status_valid:
            errors.append(f"{trial.id}: status mismatch")
        for sequence, event in enumerate(trial.events):
            if event.sequence != sequence:
                errors.append(f"{trial.id}: invalid event sequence")
            if not 1 <= event.turn <= bundle.config.max_turns or event.turn < previous_turn:
                errors.append(f"{trial.id}: invalid turn order or limit")
            previous_turn = event.turn
            if event.kind == "tool":
                result = sim.execute(event.tool or "", event.arguments or {})
                tool_calls += 1
                invalid_actions += int(result.error is not None and result.fault is None)
                if result != event.result:
                    errors.append(f"{trial.id}: tool result mismatch at {sequence}")
            if sim.state != event.state:
                errors.append(f"{trial.id}: state mismatch at {sequence}")
        if tool_calls != trial.tool_calls:
            errors.append(f"{trial.id}: tool count mismatch")
        if invalid_actions != trial.invalid_actions:
            errors.append(f"{trial.id}: invalid action count mismatch")
        if tool_calls > bundle.config.max_tool_calls:
            errors.append(f"{trial.id}: tool limit exceeded")
        if trial.status == "turn_limit" and previous_turn != bundle.config.max_turns:
            errors.append(f"{trial.id}: turn limit status mismatch")
        if trial.status == "tool_limit" and tool_calls != bundle.config.max_tool_calls:
            errors.append(f"{trial.id}: tool limit status mismatch")
        if sim.state != trial.final_state:
            errors.append(f"{trial.id}: final state mismatch")
        if grade(scenario, trial.final_state) != trial.grade:
            errors.append(f"{trial.id}: grade mismatch")
        if (
            trial.assessment is not None
            and assess_trial(scenario, trial, bundle.config) != trial.assessment
        ):
            errors.append(f"{trial.id}: assessment mismatch")
        if (
            bundle.schema_version == "3.0"
            and trial.status != "not_run"
            and trial.assessment is None
        ):
            errors.append(f"{trial.id}: missing assessment")
    return errors
