"""Finite-sample estimates and compatible-case regression comparisons."""

import json
from collections import defaultdict
from math import comb
from typing import Any

from roadtest.contracts import EvaluationBundle, TrialResult


def pass_estimates(attempts: int, successes: int, k: int) -> tuple[float | None, float | None]:
    if k < 1 or attempts < 0 or not 0 <= successes <= attempts:
        raise ValueError("Expected k >= 1 and 0 <= successes <= attempts")
    if attempts < k:
        return None, None
    denominator = comb(attempts, k)
    return 1 - comb(attempts - successes, k) / denominator, comb(successes, k) / denominator


def _groups(bundle: EvaluationBundle) -> dict[str, list[TrialResult]]:
    scenarios = {s.id: s.model_dump(mode="json") for s in bundle.scenarios}
    groups: dict[str, list[TrialResult]] = defaultdict(list)
    for trial in bundle.trials:
        # Code revision deliberately differs in a before/after regression comparison.
        key = json.dumps(
            {
                "scenario": scenarios[trial.scenario_id],
                "provider": trial.provider,
                "model": trial.model,
                "returned_model": trial.returned_model,
                "settings": trial.settings,
                "source": trial.source,
                "prompt_version": bundle.prompt_version,
                "limits": bundle.config.model_dump(exclude={"repetitions"}),
            },
            sort_keys=True,
            separators=(",", ":"),
        )
        groups[key].append(trial)
    return dict(groups)


def _requested_key(key: str) -> str:
    value = json.loads(key)
    value.pop("returned_model")
    return json.dumps(value, sort_keys=True)


def _unresolved_attempts(groups: dict[str, list[TrialResult]]) -> dict[str, int]:
    unresolved: dict[str, int] = defaultdict(int)
    for key, trials in groups.items():
        unresolved[_requested_key(key)] += sum(
            t.source == "live" and t.returned_model is None for t in trials
        )
    return unresolved


def summarize_reliability(bundle: EvaluationBundle, k: int = 2) -> list[dict[str, Any]]:
    if k < 1:
        raise ValueError("k must be at least 1")
    rows = []
    groups = _groups(bundle)
    unresolved = _unresolved_attempts(groups)
    for key, trials in groups.items():
        successes = sum(t.status == "completed" and t.grade.success for t in trials)
        at_least, every = pass_estimates(len(trials), successes, k)
        unknown = unresolved[_requested_key(key)]
        if unknown:
            at_least = every = None
        rows.append(
            {
                "group_key": key,
                "scenario_id": trials[0].scenario_id,
                "model": trials[0].model,
                "returned_model": trials[0].returned_model,
                "source": trials[0].source,
                "attempts": len(trials),
                "successes": successes,
                "incomplete": sum(t.status != "completed" for t in trials),
                "not_run": sum(t.status == "not_run" for t in trials),
                "unresolved_attempts": unknown,
                "k": k,
                "pass_at_k": at_least,
                "pass_all_k": every,
            }
        )
    return rows


def compare_baseline(before: EvaluationBundle, after: EvaluationBundle) -> dict[str, Any]:
    old, new = _groups(before), _groups(after)
    unresolved = {
        key for groups in (old, new) for key, count in _unresolved_attempts(groups).items() if count
    }
    matched = {key for key in old.keys() & new.keys() if _requested_key(key) not in unresolved}
    regressions = []
    for key in sorted(matched):
        previous, current = old[key], new[key]
        before_rate = sum(t.status == "completed" and t.grade.success for t in previous) / len(
            previous
        )
        after_rate = sum(t.status == "completed" and t.grade.success for t in current) / len(
            current
        )
        if after_rate < before_rate:
            regressions.append(
                {
                    "scenario_id": current[0].scenario_id,
                    "model": current[0].model,
                    "check": "outcome",
                    "before": before_rate,
                    "after": after_rate,
                }
            )

        def rates(trials: list[TrialResult]) -> dict[tuple[str, str], float]:
            values: dict[tuple[str, str], list[bool]] = defaultdict(list)
            for trial in trials:
                if trial.assessment:
                    for check in trial.assessment.checks:
                        if check.id != "outcome" and check.verdict in {"pass", "fail"}:
                            values[(trial.assessment.grader_version, check.id)].append(
                                check.verdict == "pass"
                            )
            return {id: sum(scores) / len(scores) for id, scores in values.items()}

        old_checks, new_checks = rates(previous), rates(current)
        for check in sorted(old_checks.keys() & new_checks.keys()):
            if new_checks[check] < old_checks[check]:
                regressions.append(
                    {
                        "scenario_id": current[0].scenario_id,
                        "model": current[0].model,
                        "check": check[1],
                        "before": old_checks[check],
                        "after": new_checks[check],
                    }
                )
    return {
        "matched_groups": len(matched),
        "unmatched_before": len(old) - len(matched),
        "unmatched_after": len(new) - len(matched),
        "unresolved_groups": len(unresolved),
        "regressions": regressions,
        "note": "Observed differences, not statistical significance. Incomplete attempts count as unsuccessful. Unassessed checks are not passes. Configurations with unknown returned models are unresolved, never a clean comparison.",
    }
