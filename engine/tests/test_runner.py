import json

import pytest
from observatory.agents import ScriptedAgent
from observatory.artifacts import export_bundle, verify_bundle
from observatory.contracts import EvaluationBundle, ExperimentConfig
from observatory.runner import make_bundle, run_trial
from observatory.scenarios import catalog


@pytest.mark.parametrize("scenario", catalog(), ids=lambda s: s.id)
def test_reference_agent_passes_every_scenario(scenario):
    result = run_trial(scenario, ScriptedAgent(scenario), ExperimentConfig())
    assert result.status == "completed"
    assert result.grade.success
    assert result.source == "scripted"
    assert result.estimated_cost_usd == 0
    assert result.tool_calls <= 12


def test_faulty_agent_fails_equipment_change_and_exposes_invalid_attempt():
    scenario = next(s for s in catalog() if s.id == "instrument_unavailable-01-fault")
    result = run_trial(scenario, ScriptedAgent(scenario, reckless=True), ExperimentConfig())
    assert not result.grade.success
    assert result.invalid_actions == 1
    assert result.grade.violations == []  # guard blocked the bad action


def test_turn_limit_preserves_trace_and_separates_incomplete_from_success():
    scenario = catalog()[0]
    result = run_trial(scenario, ScriptedAgent(scenario), ExperimentConfig(max_turns=1))
    assert result.status == "turn_limit"
    assert result.events[-1].kind == "stopped"
    assert result.events[0].tool == "inspect_observatory"


def test_tool_limit_is_applied_before_side_effects():
    scenario = catalog()[0]
    result = run_trial(scenario, ScriptedAgent(scenario), ExperimentConfig(max_tool_calls=1))
    assert result.status == "tool_limit"
    assert result.tool_calls == 1
    assert result.final_state == scenario.initial_state


def test_export_roundtrip_and_regrade(tmp_path):
    scenario = catalog()[0]
    trial = run_trial(scenario, ScriptedAgent(scenario), ExperimentConfig())
    bundle = make_bundle([scenario], [trial], ExperimentConfig(), experiment_id="test")
    path = tmp_path / "result.json"
    export_bundle(bundle, path)
    loaded = EvaluationBundle.model_validate_json(path.read_text())
    assert loaded == bundle
    assert verify_bundle(loaded) == []
    loaded.trials[0].grade.success = False
    assert "grade mismatch" in verify_bundle(loaded)[0]


def test_regrade_rejects_fabricated_state_snapshots():
    scenario = catalog()[0]
    trial = run_trial(scenario, ScriptedAgent(scenario), ExperimentConfig())
    bundle = make_bundle([scenario], [trial], ExperimentConfig(), experiment_id="test")
    bundle.trials[0].events[0].state.reservations.clear()
    assert any("state mismatch" in error for error in verify_bundle(bundle))


def test_unknown_schema_version_is_rejected():
    with pytest.raises(ValueError):
        EvaluationBundle.model_validate_json(json.dumps({"schema_version": "99"}))


@pytest.mark.parametrize(
    "field,value,expected",
    [
        ("status", "completed", "status mismatch"),
        ("tool_calls", 0, "tool count mismatch"),
        ("invalid_actions", 999, "invalid action count mismatch"),
    ],
)
def test_verifier_rejects_contradictory_trial_metadata(field, value, expected):
    scenario = catalog()[0]
    config = ExperimentConfig(max_turns=2)
    trial = run_trial(scenario, ScriptedAgent(scenario), config)
    assert trial.grade.success and trial.status == "turn_limit"
    setattr(trial, field, value)
    bundle = make_bundle([scenario], [trial], config, experiment_id="test")
    assert any(expected in error for error in verify_bundle(bundle))


def test_verifier_rejects_events_outside_configured_limits():
    scenario = catalog()[0]
    config = ExperimentConfig()
    trial = run_trial(scenario, ScriptedAgent(scenario), config)
    trial.events[0].turn = 9
    bundle = make_bundle([scenario], [trial], config, experiment_id="test")
    assert any("turn order or limit" in error for error in verify_bundle(bundle))
