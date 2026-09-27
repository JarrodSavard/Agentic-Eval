import json

from roadtest.cli import main
from roadtest.contracts import EvaluationBundle


def test_offline_cli_exports_all_reference_and_optimistic_trials(tmp_path):
    output = tmp_path / "offline.json"
    assert main(["run", "--output", str(output)]) == 0
    bundle = EvaluationBundle.model_validate_json(output.read_text())
    assert len(bundle.scenarios) == 48
    assert len(bundle.trials) == 96
    assert all(t.source == "scripted" for t in bundle.trials)
    assert main(["verify", str(output)]) == 0


def test_demo_export_is_reproducible_and_summary_excludes_trace_bodies(tmp_path):
    directory = tmp_path / "demo"
    assert main(["demo", "--output", str(directory)]) == 0
    before = {str(p.relative_to(directory)): p.read_bytes() for p in directory.rglob("*.json")}
    assert main(["demo", "--output", str(directory)]) == 0
    assert before == {
        str(p.relative_to(directory)): p.read_bytes() for p in directory.rglob("*.json")
    }
    summary = json.loads((directory / "index.json").read_text())
    assert len(summary["trials"]) == 96
    assert all("events" not in t for t in summary["trials"])


def test_live_requires_both_keys_before_any_generation(tmp_path, monkeypatch, capsys):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assert main(["run", "--live", "--output", str(tmp_path / "live.json"), "--no-env"]) == 2
    assert "API keys" in capsys.readouterr().err


def test_live_rejects_more_than_one_dollar(tmp_path, capsys):
    assert (
        main(
            [
                "run",
                "--live",
                "--budget",
                "1.01",
                "--no-env",
                "--output",
                str(tmp_path / "live.json"),
            ]
        )
        == 2
    )
    assert "budget_usd" in capsys.readouterr().err
