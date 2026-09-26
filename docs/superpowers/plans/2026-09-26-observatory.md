# Observatory Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ship the approved observatory reliability lab with an offline reproducible demonstration and optional tightly bounded live evaluations.

**Architecture:** Pure simulator and independent grader feed a provider-neutral runner. Pydantic JSON artifacts connect Python to a static Nuxt viewer. No runtime server is required.

**Tech Stack:** Python 3.12+, uv, Pydantic, pytest, Hypothesis, official SDKs; Nuxt 4, TypeScript, pnpm, Vitest, Playwright.

**Spec:** ../specs/2026-09-26-observatory-design.md

## Global constraints
- 24 scenarios, three failure families, paired clean/failure tasks.
- $0.50 default and $1 maximum; 8 turns, 12 tool calls, 512 output and 6,000 input tokens; 20% cost reservation margin; no automatic SDK retries.
- Offline CI; honest scripted/live provenance; preserve interrupted attempts; public copyright reserved.
- Source data and SDK credentials never enter the client bundle.

## Review focus
- Malformed imports and unsupported schema versions must fail clearly before display.
- Unknown usage and interrupted requests must retain reserved cost and stop the invocation.
- Timeout-after-commit must allow idempotent recovery without creating duplicate reservations.
- Existing reservations and capability/window constraints must be independently graded.
- Nested static hosting must preserve links, lazy trace loading and refresh behavior.

## Task 1: simulator and independent graders
Files: engine/observatory/{contracts,scenarios,simulator,grading}.py; engine/tests/test_domain.py.
Interfaces: catalog() -> list[Scenario]; Simulator.execute(name, arguments) -> ToolResult; grade(scenario, state) -> Grade.
- [ ] Write tests for faults, constraints, idempotency, preservation, alternative valid outcomes and property invariants; run pytest and see missing-behavior failures.
- [ ] Implement typed state, scenario catalog, tools and independent grade assertions.
- [ ] Run complete Python suite; record evidence and commit.

## Task 2: offline runner and artifacts
Files: engine/observatory/{runner,agents,artifacts,cli}.py; engine/tests/test_runner.py.
Interfaces: run_trial(scenario, agent, config, budget) -> TrialResult; export_bundle(bundle, path); CLI offline/showcase/regrade/schema.
- [ ] Test all 24 reference successes, faulty failures, malformed calls, limits, JSON round trip and trace regrading; observe RED.
- [ ] Implement the shared loop, scripted agents, event snapshots and artifact CLI; observe GREEN.
- [ ] Export deterministic demo fixtures and contract JSON Schema; commit with test evidence.

## Task 3: live providers and spending guard
Files: engine/observatory/providers/; engine/observatory/budget.py; engine/tests/test_providers.py, test_budget.py; config/models.json.
Interfaces: Agent.next(observations, limits), count_input(), ProviderTurn; Budget.reserve() and settle().
- [ ] Test official SDK wire protocols through mocked HTTP, counting, malformed output, truncation, unknown usage and ambiguous timeouts; observe RED.
- [ ] Implement adapters, model registry, counted requests, Decimal cost accounting and explicit --live mode; observe GREEN.
- [ ] Verify no SDK retries and no real network in tests; commit.

## Task 4: Nuxt viewer and shared contracts
Files: app/; tests/unit/; tests/e2e/; scripts/contracts.mjs; nuxt.config.ts.
Interfaces: EvaluationBundle generated from Python schema; summary index loads before individual trace files; local file import returns validated bundle.
- [ ] Write failing Vitest aggregation/import/replay tests and Playwright reviewer-flow tests.
- [ ] Build overview, comparison, replay, catalog and local-file workflow; implement warm-neutral/ink-blue observatory panel.
- [ ] Verify types, unit tests, production build, desktop/mobile Playwright and gzip budget; inspect both viewports.
- [ ] Commit the working UI and fixtures.

## Task 5: release and documentation
Files: README.md; docs/; .github/workflows/; LICENSE; scripts/.
- [ ] Add offline CI, schema/demo drift checks, Pages workflow, extension/methodology documentation and copyright notice.
- [ ] Run the complete release suite and independent code/design review; fix material findings with regression tests.
- [ ] If credentials exist, run exactly one capped showcase, preserve all attempts, validate artifacts and publish them.
- [ ] Publish source/site when GitHub authentication permits; otherwise report the exact remaining setup without fabricating success.
