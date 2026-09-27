# Evaluation coverage implementation plan

> **For agentic workers:** Use superpowers:executing-plans for inline work, test-driven-development for behavior, and a fresh whole-change review before release.

**Goal:** Make the rental-car portfolio demonstrate the main applicable agent-evaluation dimensions, with honest coverage and repeatability reporting.

**Architecture:** Python independently grades saved actions and state, exports explicit assessment records, and verifies them on replay. Nuxt presents checks and grouped statistics without reimplementing the simulator. Shared budget controls apply to repetitions and provider comparisons.

**Tech Stack:** Python/Pydantic/Pytest/Hypothesis; Nuxt/TypeScript/Vitest/Playwright.

**Spec:** `docs/superpowers/specs/2026-09-27-evaluation-coverage-design.md`

## Global constraints

- Rental cars only; everyday copy and expandable technical details.
- Deterministic correctness graders; no paid model judges or credentialed CI.
- Preserve original evidence provenance and unknown/not-applicable distinctions.
- $0.50 default/$1 maximum shared budget; eight turns/twelve calls/512 output/6,000 input limits.
- Test first, then implement and refactor; commit coherent increments.

## Review focus

- A fault the agent avoids must not earn a recovery claim (Task 1).
- Legacy recordings lacking receipts must not earn a reporting pass (Tasks 1/3).
- Partial trials and mixed configurations must not inflate reliability (Tasks 2/3).
- Malicious text remains tool data and cannot cancel unrelated bookings (Task 1).
- Empty/invalid imported evidence and small-screen reports remain usable (Task 3).

### Task 1: Independent assessment and expanded tasks

Files: `engine/roadtest/{contracts,assessment,scenarios,simulator,grading,agents,runner,artifacts}.py`, provider prompt, and Python tests.

Interfaces: `assess_trial(scenario, trial, config) -> TrialAssessment`; check verdicts `pass/fail/not_applicable/not_assessed`; reference policy supports report_result.

- [x] Write failing behavior tests for false receipts, blocked unsafe attempts, avoided faults, unavailable rentals, scarce-car allocation, and tool-data instructions.
- [x] Run the new tests and observe missing behaviors.
- [x] Implement 48 cases, structured receipts, independent checks and artifact verification; preserve version 2 replay.
- [x] Run the full Python suite, lint/types, and commit.

### Task 2: Repetition, statistics, and regression controls

Files: Python `live.py`, `cli.py`, `statistics.py` and tests; generated contracts.

Interfaces: repeated live runs use ExperimentConfig.repetitions and one Budget; `summarize_reliability(bundle, k)`; `compare_baseline(before, after)` reports matching-case changes.

- [x] Write failing tests for k greater than sample size, incomplete attempts, mixed settings, zero-trial groups, and shared-budget repetition.
- [x] Implement combinatorial estimates, exact compatible-group matching, CLI report/regression commands, and local repetition control.
- [x] Verify provider-independent accounting, contracts, and CLI behavior, then commit.

### Task 3: Plain-language evaluation reports

Files: frontend utilities/components/pages, import handling, styles, Vitest and browser tests.

Interfaces: generated TrialAssessment and legacy normalization; frontend statistics use the same defined combinatorial rules with cross-language fixtures.

- [x] Write failing unit tests for summaries and legacy imports; browser tests for coverage, receipt evidence, and small-screen replay.
- [x] Implement evaluation coverage page, per-trial checks with replay evidence links, repeated-run summary, and local repetition field.
- [x] Update catalog/home/methodology to describe actual coverage dynamically; preserve straightforward booking view.
- [x] Run unit/types/format/static build and browser tests at the Pages base path; commit.

### Task 4: Verify and publish evidence

Files: docs, fixtures, public recordings, quality workflow as needed.

- [x] Verify all reference cases, known-bad behavior, reproducible fixtures, schema drift, and public evidence.
- [x] Obtain a fresh code review and fix material issues with regression tests.
- [ ] Commit tested implementation, then run one predetermined $0.50 showcase using both configured Luna profiles, all six first task pairs, once each; preserve every attempt.
- [ ] Publish recordings, rerun affected validation, commit, push, confirm CI/Pages and refresh the local app.

## Execution notes

- User explicitly requested completion without more planning pauses; proceed inline.
- Work on the existing user-authorized main checkout; no independent changes present at start.
- Existing version 2 rental evidence remains available locally and in Git history; the new showcase must identify its own prompt and code revisions.

- Completed test-first engine and UI increments. Validation: 140 Python tests, 21 Vitest tests, 24 Playwright tests on desktop/mobile at the Pages base path; types, formatting, schemas and compressed-JavaScript budget passed.
- Fresh review found and regression tests fixed malformed receipts, missing-receipt handling, unknown model identities in repeated-run summaries and baseline comparisons, and imported-evidence provenance notices.
- Inspected evaluation and replay reports at desktop/mobile sizes. Kept the established palette and typography; refreshed stale design sidecar references without changing DESIGN.md. Existing design-token literal warnings reflect the incomplete older token inventory and were checked in context.
- Confirmed both configured Luna prices against official documentation on September 27, 2026 before the new paid showcase.
