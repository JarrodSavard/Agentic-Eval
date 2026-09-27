import time
from datetime import date
from pathlib import Path
from threading import Event

import pytest
from fastapi.testclient import TestClient
from roadtest.agents import ScriptedAgent
from roadtest.artifacts import verify_bundle
from roadtest.contracts import EvaluationBundle
from roadtest.live import LiveManager
from roadtest.local import create_app
from roadtest.providers.registry import load_profiles


@pytest.fixture
def setup(tmp_path, monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "test-only-not-a-real-key")
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    profiles = [
        p.model_copy(update={"price_checked_at": date.today()})
        for p in load_profiles(Path("config/models.json"))
    ]
    manager = LiveManager(profiles, tmp_path / "runs", factory=lambda s, p: ScriptedAgent(s))
    app = create_app(manager, tmp_path / "site")
    with TestClient(app, base_url="http://127.0.0.1:8765") as client:
        token = client.get("/api/live/bootstrap").json()["token"]
        yield manager, client, {"X-Roadtest-Token": token, "Origin": "http://127.0.0.1:8765"}


def request():
    return {
        "profile_ids": ["openai-luna"],
        "base_id": "car_unavailable-01",
        "budget_usd": 0.5,
    }


def completed(client, run_id):
    deadline = time.monotonic() + 3
    while time.monotonic() < deadline:
        result = client.get(f"/api/live/runs/{run_id}").json()
        if result["status"] != "running":
            return result
        Event().wait(0.01)
    pytest.fail("Local run did not finish")


def test_local_run_exports_both_conditions_and_all_scenarios(setup):
    manager, client, headers = setup
    response = client.post("/api/live/runs", json=request(), headers=headers)
    assert response.status_code == 201
    run_id = response.json()["run_id"]
    result = completed(client, run_id)
    assert result["status"] == "completed"
    bundle = EvaluationBundle.model_validate(result["bundle"])
    assert len(bundle.trials) == 2 and len(bundle.scenarios) == 48
    assert all(t.grade.success for t in bundle.trials)
    assert verify_bundle(bundle) == []
    saved = EvaluationBundle.model_validate_json((manager.output / f"{run_id}.json").read_text())
    assert saved == bundle
    assert client.get(f"/api/live/runs/{run_id}/download").status_code == 200
    assert client.get("/api/live/bootstrap").json()["latest_run_id"] == run_id


def test_local_repetitions_keep_every_attempt_with_unique_ids(setup):
    _, client, headers = setup
    response = client.post("/api/live/runs", json=request() | {"repetitions": 3}, headers=headers)
    assert response.status_code == 201
    bundle = EvaluationBundle.model_validate(completed(client, response.json()["run_id"])["bundle"])
    assert len(bundle.trials) == 6
    assert {t.repetition for t in bundle.trials} == {1, 2, 3}
    assert len({t.id for t in bundle.trials}) == 6
    assert bundle.config.repetitions == 3 and bundle.config.budget_usd == 0.5


def test_repetitions_share_one_budget_and_preserve_not_run_entries(setup):
    from decimal import Decimal

    from roadtest.budget import Pricing
    from roadtest.contracts import Usage

    class MeteredAgent(ScriptedAgent):
        source = "live"
        pricing = Pricing(Decimal("10000"), Decimal("0"))

        def count_input(self):
            return 1

        def next(self, limit):
            response = super().next(limit)
            response.usage = Usage(input_tokens=1, output_tokens=0)
            return response

    manager, client, headers = setup
    manager.factory = lambda s, p: MeteredAgent(s)
    response = client.post(
        "/api/live/runs", json=request() | {"repetitions": 3, "budget_usd": 0.05}, headers=headers
    )
    bundle = EvaluationBundle.model_validate(completed(client, response.json()["run_id"])["bundle"])
    assert len(bundle.trials) == 6
    assert sum(t.estimated_cost_usd for t in bundle.trials) == pytest.approx(0.04)
    assert sum(t.status == "not_run" for t in bundle.trials) == 4
    assert any(t.status == "budget_exhausted" for t in bundle.trials)


def test_local_service_rejects_foreign_origins_hosts_and_missing_token(setup):
    _, client, headers = setup
    assert client.post("/api/live/runs", json=request()).status_code == 403
    assert (
        client.post(
            "/api/live/runs", json=request(), headers=headers | {"Origin": "https://evil.example"}
        ).status_code
        == 403
    )
    assert client.get("/api/live/bootstrap", headers={"Host": "evil.example"}).status_code == 400
    assert (
        client.get("/api/live/bootstrap", headers={"Sec-Fetch-Site": "cross-site"}).status_code
        == 403
    )


def test_preflight_refuses_missing_keys_unknown_models_and_over_budget(setup):
    _, client, headers = setup
    assert (
        client.post(
            "/api/live/runs", json=request() | {"profile_ids": ["claude-haiku"]}, headers=headers
        ).status_code
        == 400
    )
    assert (
        client.post(
            "/api/live/runs", json=request() | {"profile_ids": ["unknown"]}, headers=headers
        ).status_code
        == 400
    )
    assert (
        client.post(
            "/api/live/runs", json=request() | {"budget_usd": 2}, headers=headers
        ).status_code
        == 422
    )
    config = client.get("/api/live/bootstrap").json()
    assert config["profiles"][0]["ready"] is True
    assert config["profiles"][1]["ready"] is False
    assert "test-only-not-a-real-key" not in str(config)


def test_progress_is_observable_and_duplicate_runs_are_blocked_until_stop(setup):
    manager, client, headers = setup
    waiting, release = Event(), Event()

    class PausedAgent(ScriptedAgent):
        def next(self, limit):
            if self.snapshot is not None:
                waiting.set()
                assert release.wait(3)
            return super().next(limit)

    manager.factory = lambda s, p: PausedAgent(s)
    response = client.post("/api/live/runs", json=request(), headers=headers)
    run_id = response.json()["run_id"]
    try:
        assert waiting.wait(2)
        progress = client.get(f"/api/live/runs/{run_id}").json()
        assert progress["status"] == "running"
        assert progress["events"][0]["tool"] == "check_cars"
        assert client.post("/api/live/runs", json=request(), headers=headers).status_code == 409
        assert client.post(f"/api/live/runs/{run_id}/stop", headers=headers).status_code == 200
    finally:
        release.set()
    result = completed(client, run_id)
    trials = result["bundle"]["trials"]
    assert [t["status"] for t in trials] == ["interrupted", "not_run"]
    assert trials[0]["tool_calls"] == 1
    assert verify_bundle(EvaluationBundle.model_validate(result["bundle"])) == []


def test_unexpected_worker_failure_is_sanitized_and_releases_admission(setup):
    manager, client, headers = setup

    def broken(s, p):
        raise RuntimeError("secret-that-must-not-reach-browser")

    manager.factory = broken
    run_id = client.post("/api/live/runs", json=request(), headers=headers).json()["run_id"]
    result = completed(client, run_id)
    assert result["status"] == "failed"
    assert "secret-that-must-not-reach-browser" not in str(result)
    assert client.post("/api/live/runs", json=request(), headers=headers).status_code == 201


def test_failure_after_an_action_preserves_the_trial_and_terminal_checkpoint(setup):
    manager, client, headers = setup

    class BrokenObserver(ScriptedAgent):
        def observe(self, call, result):
            raise RuntimeError("private-debug-context")

    manager.factory = lambda s, p: BrokenObserver(s)
    run_id = client.post("/api/live/runs", json=request(), headers=headers).json()["run_id"]
    result = completed(client, run_id)
    assert result["status"] == "failed"
    assert len(result["bundle"]["trials"]) == 2
    trial = result["bundle"]["trials"][0]
    assert trial["status"] == "interrupted" and trial["tool_calls"] == 1
    assert trial["events"][-1]["kind"] == "stopped"
    assert verify_bundle(EvaluationBundle.model_validate(result["bundle"])) == []
    assert '"status": "failed"' in (manager.output / f"{run_id}.progress.json").read_text()
    assert (manager.output / f"{run_id}.json").is_file()


def test_both_luna_versions_can_run_the_same_pair(setup):
    manager, client, headers = setup

    def factory(scenario, profile):
        agent = ScriptedAgent(scenario)
        agent.model = profile.model
        agent.name = profile.label
        return agent

    manager.factory = factory
    selected = ["openai-luna", "openai-5.6-luna"]
    response = client.post(
        "/api/live/runs", json=request() | {"profile_ids": selected}, headers=headers
    )
    assert response.status_code == 201
    result = completed(client, response.json()["run_id"])
    assert len(result["bundle"]["trials"]) == 4
    assert verify_bundle(EvaluationBundle.model_validate(result["bundle"])) == []
