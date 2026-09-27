"""Explicit offline/live entry points. Normal development never spends API credits."""

import argparse
import json
import os
import sys
from datetime import date
from decimal import Decimal
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv

from roadtest.agents import ScriptedAgent
from roadtest.artifacts import export_bundle, verify_bundle
from roadtest.budget import Budget
from roadtest.contracts import Contract, EvaluationBundle, ExperimentConfig, TrialResult, Usage
from roadtest.grading import grade
from roadtest.providers import PROVIDERS, create_agent
from roadtest.providers.registry import load_profiles
from roadtest.runner import make_bundle, now, run_trial
from roadtest.scenarios import catalog
from roadtest.statistics import compare_baseline, summarize_reliability

FIXTURE_TIME = "2026-09-26T00:00:00+00:00"


def write_viewer_data(bundle: EvaluationBundle, directory: Path) -> None:
    errors = verify_bundle(bundle)
    if errors:
        raise ValueError("Artifact verification failed: " + "; ".join(errors[:3]))
    directory.mkdir(parents=True, exist_ok=True)
    export_bundle(bundle, directory / "bundle.json")
    summary = bundle.model_dump(mode="json")
    summaries = []
    for index, trial in enumerate(bundle.trials):
        # Paths are assigned here, never derived from provider-generated text.
        trace_path = f"traces/trial-{index:03d}.json"
        path = directory / trace_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(trial.model_dump_json(indent=2) + "\n", encoding="utf-8")
        summaries.append(
            trial.model_dump(mode="json", exclude={"events", "final_state"})
            | {"trace_path": trace_path}
        )
    summary["trials"] = summaries
    (directory / "index.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")


def offline_bundle(config: ExperimentConfig, *, reproducible: bool = False) -> EvaluationBundle:
    scenarios = catalog()
    trials = [
        run_trial(s, ScriptedAgent(s, reckless=reckless), config, repetition=repetition)
        for s in scenarios
        for reckless in (False, True)
        for repetition in range(1, config.repetitions + 1)
    ]
    bundle = make_bundle(scenarios, trials, config, "scripted-rental-demonstration-v3")
    if reproducible:
        bundle.created_at = FIXTURE_TIME
        bundle.code_revision = "scripted-rental-fixture-v3"
        for trial in bundle.trials:
            trial.started_at = FIXTURE_TIME
            trial.latency_ms = 0  # scripted fixture timings are intentionally not benchmark data
    return bundle


def live_bundle(args: argparse.Namespace, config: ExperimentConfig) -> EvaluationBundle:
    if not args.no_env:
        load_dotenv(override=False)
    profiles = load_profiles(Path(args.profiles))
    if args.models:
        requested = args.models.split(",")
        by_id = {p.id: p for p in profiles}
        if any(name not in by_id for name in requested):
            raise ValueError("Unknown model profile; inspect config/models.json")
        profiles = [by_id[name] for name in requested]
    if any(p.provider not in PROVIDERS for p in profiles):
        raise ValueError("Unsupported provider in model configuration")
    keys = {"openai": "OPENAI_API_KEY", "anthropic": "ANTHROPIC_API_KEY"}
    if any(not os.getenv(keys[p.provider]) for p in profiles):
        raise ValueError("Configure the required API keys locally before using --live")
    if any(not 0 <= (date.today() - p.price_checked_at).days <= 30 for p in profiles):
        raise ValueError("Verify model pricing and update price_checked_at (maximum age: 30 days)")
    scenarios = catalog()
    requested_tasks = args.tasks.split(",")
    if requested_tasks == ["showcase"]:
        requested_tasks = [s.base_id for s in scenarios if s.id.endswith("-01-clean")]
    if not set(requested_tasks) <= {s.base_id for s in scenarios}:
        raise ValueError("Unknown task; choose a base_id from the scenario catalog")
    selected = [s for s in scenarios if s.base_id in requested_tasks]
    budget = Budget(Decimal(str(config.budget_usd)))
    bundle = make_bundle(scenarios, [], config, f"live-showcase-{uuid4().hex[:12]}")
    stopped = False
    for repetition in range(1, config.repetitions + 1):
        for scenario in selected:
            for profile in profiles:
                if stopped:
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
                    agent = create_agent(scenario, profile)
                    trial = run_trial(scenario, agent, config, budget, repetition)
                    stopped = budget.uncertain or trial.status in (
                        "budget_exhausted",
                        "interrupted",
                    )
                bundle.trials.append(trial)
                export_bundle(bundle, Path(args.output))
                print(f"{scenario.id}: {profile.id}: {trial.status}")
    return bundle


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Road Test agent reliability lab")
    commands = parser.add_subparsers(dest="command", required=True)
    run = commands.add_parser("run", help="Run offline baselines (paid calls require --live)")
    run.add_argument("--live", action="store_true")
    run.add_argument("--budget", type=float, default=0.5)
    run.add_argument("--repetitions", type=int, default=1)
    run.add_argument(
        "--tasks",
        default="committed_timeout-01",
        help="Live task base IDs, comma-separated, or showcase for the first pair of each family",
    )
    run.add_argument("--output", default="artifacts/evaluation.json")
    run.add_argument("--profiles", default="config/models.json")
    run.add_argument(
        "--models", help="Comma-separated profile ids; default: all configured profiles"
    )
    run.add_argument("--no-env", action="store_true", help="Use process environment only")
    demo = commands.add_parser("demo", help="Export deterministic scripted viewer fixtures")
    demo.add_argument("--output", default="public/data")
    schema = commands.add_parser("schema", help="Export the versioned artifact schema")
    schema.add_argument("--output", help="Export only the evaluation schema to this path")
    serve = commands.add_parser("serve", help="Serve the live UI on this computer only")
    serve.add_argument("--port", type=int, default=8765)
    serve.add_argument("--site", default=".output/public")
    serve.add_argument("--output", default="artifacts/local")
    serve.add_argument("--profiles", default="config/models.json")
    verify = commands.add_parser(
        "verify", help="Re-execute recorded tool actions and independently grade"
    )
    verify.add_argument("file")
    publish = commands.add_parser(
        "publish", help="Prepare a validated result for the static viewer"
    )
    publish.add_argument("file")
    publish.add_argument("--output", default="public/data")
    report = commands.add_parser(
        "report", help="Print repeated-run estimates from a verified recording"
    )
    report.add_argument("file")
    report.add_argument("--k", type=int, default=2)
    regression = commands.add_parser(
        "regress", help="Compare compatible saved runs; exit 1 on observed regressions"
    )
    regression.add_argument("baseline")
    regression.add_argument("file")
    args = parser.parse_args(argv)
    try:
        if args.command == "run":
            config = ExperimentConfig(budget_usd=args.budget, repetitions=args.repetitions)
            bundle = live_bundle(args, config) if args.live else offline_bundle(config)
            export_bundle(bundle, Path(args.output))
            print(f"Saved {len(bundle.trials)} trials to {args.output}")
        elif args.command == "demo":
            write_viewer_data(
                offline_bundle(ExperimentConfig(), reproducible=True), Path(args.output)
            )
        elif args.command == "schema":
            from roadtest.live import LiveAPI

            models: dict[str, type[Contract]] = {
                args.output or "contracts/evaluation.schema.json": EvaluationBundle
            }
            if not args.output:
                models["contracts/live.schema.json"] = LiveAPI
            for filename, contract in models.items():
                path = Path(filename)
                path.parent.mkdir(parents=True, exist_ok=True)
                schema_data = contract.model_json_schema(mode="serialization")
                schema_data["$schema"] = "https://json-schema.org/draft/2020-12/schema"
                path.write_text(json.dumps(schema_data, indent=2) + "\n", encoding="utf-8")
        elif args.command == "serve":
            import uvicorn

            from roadtest.live import LiveManager
            from roadtest.local import create_app

            load_dotenv(override=False)
            if not (Path(args.site) / "index.html").is_file():
                raise ValueError("Build the local viewer first with pnpm live")
            manager = LiveManager(load_profiles(Path(args.profiles)), Path(args.output))
            print(f"Open http://127.0.0.1:{args.port}/live/ — no model runs until you click Start.")
            uvicorn.run(
                create_app(manager, Path(args.site)),
                host="127.0.0.1",
                port=args.port,
                access_log=False,
                log_level="warning",
            )
        else:
            bundle = EvaluationBundle.model_validate_json(
                Path(args.file).read_text(encoding="utf-8")
            )
            errors = verify_bundle(bundle)
            if errors:
                raise ValueError("; ".join(errors[:10]))
            if args.command == "publish":
                write_viewer_data(bundle, Path(args.output))
            elif args.command == "report":
                print(json.dumps(summarize_reliability(bundle, args.k), indent=2))
                return 0
            elif args.command == "regress":
                baseline = EvaluationBundle.model_validate_json(
                    Path(args.baseline).read_text(encoding="utf-8")
                )
                if baseline_errors := verify_bundle(baseline):
                    raise ValueError("Invalid baseline: " + "; ".join(baseline_errors[:3]))
                comparison = compare_baseline(baseline, bundle)
                print(json.dumps(comparison, indent=2))
                if comparison["regressions"]:
                    return 1
                if comparison["unresolved_groups"] or not comparison["matched_groups"]:
                    return 2
                return 0
            print(f"Verified {len(bundle.trials)} recorded trials")
        return 0
    except (ValueError, OSError) as exc:
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
