import json
from pathlib import Path

import pytest
from roadtest.agents import ScriptedAgent
from roadtest.contracts import ExperimentConfig
from roadtest.runner import make_bundle, run_trial
from roadtest.scenarios import catalog


def test_python_and_browser_share_hand_calculated_examples():
    from roadtest.statistics import pass_estimates

    rows = json.loads(Path("contracts/reliability-examples.json").read_text(encoding="utf-8"))
    for row in rows:
        at_least, every = pass_estimates(row["n"], row["c"], row["k"])
        assert at_least == row["atLeast"]
        assert every == row["every"]


def sample(successes=2, total=3):
    task = catalog()[0]
    config = ExperimentConfig(repetitions=total)
    template = run_trial(task, ScriptedAgent(task), config)
    trials = []
    for i in range(total):
        trial = template.model_copy(deep=True)
        trial.id = f"trial-{i}"
        trial.repetition = i + 1
        trial.grade.success = i < successes
        trials.append(trial)
    return make_bundle([task], trials, config, "statistics-test")


def test_reliability_distinguishes_at_least_one_from_every_attempt():
    from roadtest.statistics import summarize_reliability

    row = summarize_reliability(sample(), 2)[0]
    assert row["attempts"] == 3 and row["successes"] == 2
    assert row["pass_at_k"] == 1
    assert row["pass_all_k"] == pytest.approx(1 / 3)


def test_insufficient_trials_produce_unknown_not_perfect_reliability():
    from roadtest.statistics import summarize_reliability

    row = summarize_reliability(sample(1, 1), 2)[0]
    assert row["pass_at_k"] is None and row["pass_all_k"] is None


def test_incomplete_trials_stay_in_attempt_denominator_and_not_run_is_explicit():
    from roadtest.statistics import summarize_reliability

    bundle = sample(3, 3)
    bundle.trials[1].status = "provider_error"
    bundle.trials[2].status = "not_run"
    row = summarize_reliability(bundle, 2)[0]
    assert row["attempts"] == 3 and row["successes"] == 1 and row["incomplete"] == 2
    assert row["not_run"] == 1 and row["pass_all_k"] == 0


def test_unknown_returned_model_withholds_estimates_for_the_requested_configuration():
    from roadtest.statistics import summarize_reliability

    bundle = sample(3, 3)
    for trial in bundle.trials:
        trial.source = "live"
        trial.returned_model = "confirmed-snapshot"
    bundle.trials[-1].returned_model = None
    bundle.trials[-1].status = "budget_exhausted"
    rows = summarize_reliability(bundle, 2)
    assert rows[0]["attempts"] == 2
    assert rows[0]["unresolved_attempts"] == 1
    assert all(row["pass_all_k"] is None and row["pass_at_k"] is None for row in rows)


def test_settings_source_and_returned_model_cannot_be_silently_pooled():
    from roadtest.statistics import summarize_reliability

    bundle = sample(3, 3)
    bundle.trials[1].settings = {"temperature": 0.8}
    bundle.trials[2].returned_model = "a-new-snapshot"
    assert len(summarize_reliability(bundle, 2)) == 3
    bundle.trials[1].settings = bundle.trials[0].settings
    bundle.trials[1].source = "live"
    assert len(summarize_reliability(bundle, 2)) == 3


def test_empty_data_and_invalid_k_are_explicit():
    from roadtest.statistics import summarize_reliability

    bundle = sample()
    bundle.trials = []
    assert summarize_reliability(bundle, 2) == []
    with pytest.raises(ValueError):
        summarize_reliability(bundle, 0)


def test_baseline_comparison_detects_outcome_and_safety_regressions():
    from roadtest.statistics import compare_baseline

    before = sample(3, 3)
    after = before.model_copy(deep=True)
    after.trials[0].grade.success = False
    next(c for c in after.trials[1].assessment.checks if c.id == "safety").verdict = "fail"
    changes = compare_baseline(before, after)
    assert changes["matched_groups"] == 1
    assert len(changes["regressions"]) == 2


def test_baselines_with_different_tasks_prompts_or_limits_are_not_compared():
    from roadtest.statistics import compare_baseline

    before = sample()
    for field in ("prompt", "limits", "scenario"):
        after = before.model_copy(deep=True)
        if field == "prompt":
            after.prompt_version = "2.0"
        elif field == "limits":
            after.config.max_turns = 7
        else:
            after.scenarios[0].requests[0].allowed_days = ["2026-10-30"]
        assert compare_baseline(before, after)["matched_groups"] == 0


@pytest.mark.parametrize("unresolved_side", ["before", "after"])
def test_early_provider_failure_cannot_produce_a_clean_regression_exit(
    tmp_path, capsys, unresolved_side
):
    from roadtest.artifacts import export_bundle, verify_bundle
    from roadtest.assessment import assess_trial
    from roadtest.cli import main
    from roadtest.contracts import TraceEvent
    from roadtest.grading import grade
    from roadtest.statistics import compare_baseline

    before = sample(3, 3)
    for trial in before.trials:
        trial.source = "live"  # Offline fixture for a provider transcript.
        trial.returned_model = "confirmed-snapshot"
    after = before.model_copy(deep=True)
    partial = before if unresolved_side == "before" else after
    trial = partial.trials[-1]
    task = partial.scenarios[0]
    trial.returned_model = None
    trial.status = "provider_error"
    trial.final_state = task.initial_state.model_copy(deep=True)
    trial.tool_calls = trial.invalid_actions = 0
    trial.grade = grade(task, trial.final_state)
    trial.events = [
        TraceEvent(
            sequence=0, turn=1, kind="stopped", text="provider_error", state=trial.final_state
        )
    ]
    trial.assessment = assess_trial(task, trial, partial.config, require_receipt=True)
    # A second, unaffected group must not hide the unresolved comparison either.
    for bundle in (before, after):
        stable = bundle.trials[0].model_copy(deep=True)
        stable.id = "separate-configuration"
        stable.settings = {"cohort": "separate"}
        bundle.trials.append(stable)
    assert verify_bundle(before) == verify_bundle(after) == []
    comparison = compare_baseline(before, after)
    assert comparison["unresolved_groups"] == 1
    assert comparison["matched_groups"] == 1
    for name, bundle in (("before", before), ("after", after)):
        export_bundle(bundle, tmp_path / f"{name}.json")
    assert main(["regress", str(tmp_path / "before.json"), str(tmp_path / "after.json")]) == 2
    assert '"unresolved_groups": 1' in capsys.readouterr().out
