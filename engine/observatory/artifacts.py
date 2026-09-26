"""Atomic exports and replay verification, independent of model text claims."""

from pathlib import Path

from observatory.contracts import EvaluationBundle
from observatory.grading import grade
from observatory.simulator import Simulator


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
        for sequence, event in enumerate(trial.events):
            if event.sequence != sequence:
                errors.append(f"{trial.id}: invalid event sequence")
            if event.kind == "tool":
                result = sim.execute(event.tool or "", event.arguments or {})
                if result != event.result:
                    errors.append(f"{trial.id}: tool result mismatch at {sequence}")
            if sim.state != event.state:
                errors.append(f"{trial.id}: state mismatch at {sequence}")
        if sim.state != trial.final_state:
            errors.append(f"{trial.id}: final state mismatch")
        if grade(scenario, trial.final_state) != trial.grade:
            errors.append(f"{trial.id}: grade mismatch")
    return errors
