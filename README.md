# Agentic-Eval

**Road Test · AI booking challenge**

Can an AI book the right rental car when something goes wrong? This portfolio project by Jarrod Savard gives models the same customer request, then makes the booking site fail, takes a car out of service, or loses a booking confirmation. You can watch every action and check whether the customer actually got a suitable car.

[Explore the application](https://jarrodsavard.github.io/Agentic-Eval/) · [Methodology](docs/methodology.md) · [Architecture](docs/architecture.md) · [Add a model or provider](docs/extending.md)

## What is here

The expanded suite covers outcomes, tool use, workflow, recovery, safety, misleading website instructions, accurate receipts, execution limits, repeated-run reliability, and regression comparisons. See **Evaluations** in the app for plain-language explanations and actual evidence coverage.

- **48 scenarios:** 24 rental tasks, each with normal and challenging variants across six families.
- **Independent grading:** checks the final reservations rather than trusting the agent's answer.
- **Inspectible traces:** tool calls, responses, injected faults, environment snapshots, usage, and provenance.
- **Nuxt/TypeScript viewer:** comparisons, replay, scenario catalog, and local JSON import without uploading.
- **Python runner:** official SDK adapters, a shared bounded agent loop, typed artifacts, and a conservative spending guard.
- **Offline testing:** pytest, Hypothesis, mocked HTTP integration tests, generated-contract checks, Vitest, and Playwright on desktop and mobile.

New runs use **artifact and prompt version 3.0**. The original scenarios remain version 2.0, and added scenarios use version 3.0. Version 2 rental recordings still open with missing new checks marked unassessed.

**Published real comparison:** 24 completed attempts on September 27, 2026: GPT-6 Luna and GPT-5.6 Luna each tried the first normal/challenge pair in all six families. GPT-6 Luna completed 12/12 tasks; GPT-5.6 Luna completed 11/12. In the competing-bookings challenge, GPT-5.6 Luna gave the only available car with large luggage space to the customer who could have used the hatchback, leaving the second customer without a car. Its receipt accurately reported the incomplete result. All attempts, including that failure, are published. Total estimated API cost: **$0.0184195**. The sample covers **12 of 48 scenarios**, once per model, and is not a model ranking or repeatability estimate.

The recorded actions and grades were independently replayed before publication. The recording's automatic Git lookup failed because of Windows checkout ownership; its code revision was corrected to the verified clean implementation commit without changing any trial data. [Provenance correction and file hashes](public/data/provenance.json) document that correction; the original recording remains saved locally.

The reference scripted agent passes all 48 rental scenarios; the deliberately faulty baseline demonstrates failed outcomes. Scripted examples are clearly labeled and make no claims about real model performance. Genuine rental recordings, when published, contain every attempt from the experiment, not just successful ones. Tiny samples illustrate behavior; they do not establish a ranking.

## Run locally

Requirements: Python 3.12+, Node.js 22.12+ (CI uses Node 22), [uv](https://docs.astral.sh/uv/getting-started/installation/), and pnpm 10.32.1.

```sh
uv sync --frozen
pnpm install --frozen-lockfile
pnpm dev
```

Open the local address shown by Nuxt. No API keys are required for the viewer, tests, or scripted evaluations.

### Watch a model run live

Copy `.env.example` to `.env` and configure the provider you want to use. For GPT-6 Luna and GPT-5.6 Luna, only `OPENAI_API_KEY` is needed; Claude stays unavailable until `ANTHROPIC_API_KEY` is present. Restart the local runner after changing keys.

```sh
pnpm live
```

Open **http://127.0.0.1:8765/live/**. Select a model and task, then click **Start live experiment**. Each selected model attempts both normal and challenging conditions. Set **Attempts per situation** to repeat the same task (1–10); all repetitions share the single experiment budget. Tool calls, failures, and state changes appear as the runner reports them. The default $0.50 budget covers the entire click, with a $1 maximum. Starting another experiment is a new paid invocation.

**Stop experiment** prevents subsequent requests and tool actions after any in-flight response finishes accounting. Refreshing reconnects to the current/latest run without restarting it. The service binds only to loopback, keeps keys on the Python side, and accepts browser mutations only from its own local origin with a session token. The public Pages site provides recordings and setup instructions; it cannot initiate paid work.

Results are saved under `artifacts/local/`. Download a finished recording or open it directly in the comparison view. Progress checkpoints use `.progress.json`; standard replayable bundles use `.json`. A hard process kill can leave only the progress checkpoint for an unfinished trial. No automatic resume or paid retry occurs. Browser reconnect works while the same server process is running; saved bundles survive a restart and can be opened through **Open result file**.

To publish every attempt from one completed experiment:

```sh
uv run roadtest verify artifacts/local/live-<run-id>.json
uv run roadtest publish artifacts/local/live-<run-id>.json
```

Commit the generated `public/data` files and push `main` to publish them through Pages. This replaces the current public dataset with that complete experiment. The local build uses `.local-output/`, separate from the Pages build in `.output/`.

```sh
uv run roadtest run
uv run roadtest verify artifacts/evaluation.json
```

Use **Open result file** on the comparison page to inspect `artifacts/evaluation.json`. Files stay in browser memory. The importer validates format, version, references, and event order; it does not prove a file's claimed provenance. The Python verifier re-executes tool transitions and checks grades.

## Run a live showcase

Copy `.env.example` to `.env` and add `OPENAI_API_KEY` for the Luna comparison. Add `ANTHROPIC_API_KEY` only if you also want Claude. Never commit that file. Confirm the model IDs and prices in `config/models.json`; live runs refuse price tables older than 30 days.

```sh
uv run roadtest run --live --models openai-luna,openai-5.6-luna --tasks showcase --budget 0.50 --output artifacts/live-showcase.json
uv run roadtest verify artifacts/live-showcase.json
```

This attempts the first task in each of the six families, in normal and challenging conditions, once per selected Luna model: 24 planned attempts. Omit `--tasks showcase` for the smaller default timeout pair, or provide comma-separated task base IDs. `--repetitions 2` repeats the selected cases within the same budget. The invocation's default budget is **$0.50** and its maximum allowed budget is **$1**. There are no automatic paid retries. Re-running the command is a new invocation and can spend additional money.

Before generation, the runner counts input tokens and reserves the maximum output cost plus a 20% margin. Unknown usage or ambiguous failures keep their reservation and stop further paid requests. These are application-level estimates, not a provider-enforced account billing cap. Provider invoices remain authoritative. Unstarted and interrupted attempts stay visible in the artifact.

Configured models include `gpt-6-luna`, `gpt-5.6-luna` and `claude-haiku-4-5-20251001`, with extra reasoning disabled. Select only profiles whose local keys are configured. A different supported model is a configuration change. Use `--models openai-luna` to select one profile or `--repetitions 2` to repeat the same cases within the same invocation budget.

To prepare the entire live experiment for the static viewer, including failed attempts:

```sh
uv run roadtest publish artifacts/live-showcase.json
pnpm generate
```

Publishing replaces the viewer's current dataset; it does not merge or cherry-pick individual trials. `uv run roadtest demo` restores the deterministic scripted demonstration. Review generated public artifacts before committing; they contain model-visible prompts/actions/results, not API keys or provider reasoning internals.

## Repeatability and regressions

```sh
uv run roadtest run --repetitions 3 --output artifacts/offline-repeated.json
uv run roadtest report artifacts/offline-repeated.json --k 2
uv run roadtest regress artifacts/before.json artifacts/after.json
```

The first command is offline. Scripted consistency tests the harness, not AI reliability. Live repeats require `--live` and share the invocation budget. `pass@k` estimates at least one success; `pass^k` estimates all attempts succeeding. Insufficient samples and unresolved returned-model identities withhold estimates. Matching requires the same task, settings, model versions and prompt. Regression comparisons verify both recordings and return exit code 1 for observed regressions, 2 for invalid evidence, unresolved model identities, or no matching groups. These are observed differences, not significance tests.

Version 3 recordings contain separate checks with explanations and replay evidence links. Version 2 rental recordings remain importable; absent checks are unassessed. The structured receipt checker does not judge arbitrary natural-language messages. Semantic similarity and paid model judges are deliberately not used for booking facts; human review is supported through the replay.

## Verify

```sh
uv run pytest -q
uv run ruff check engine
uv run ruff format --check engine
uv run mypy
pnpm check:contracts
pnpm typecheck
pnpm test
pnpm format:check
```

Build and test the same nested path used by GitHub Pages:

```sh
# Bash
NUXT_APP_BASE_URL=/Agentic-Eval/ pnpm generate
pnpm exec playwright install chromium
pnpm test:e2e
pnpm check:budget
```

```powershell
# PowerShell
$env:NUXT_APP_BASE_URL = '/Agentic-Eval/'
pnpm generate
node node_modules/@playwright/test/cli.js install chromium
pnpm test:e2e
pnpm check:budget
```

The budget check counts **all** compressed client JavaScript chunks against 250 KB, which is stricter than checking only the initial route. Detailed JSON traces load on demand. Tests never call live models; the Python suite blocks external network connections (Windows event-loop self-pipes use loopback). Frontend test commands regenerate their own scripted fixtures, so publishing genuine runs does not change their inputs.

When changing the public Python contracts:

```sh
uv run roadtest schema
pnpm contracts
```

The schema, generated TypeScript, and standalone browser validator are checked into the repository. CI regenerates them and fails if they drift.

## Deployment

`.github/workflows/quality.yml` runs the offline quality suite for pushes and pull requests. A successful push to `main` deploys the verified static output through GitHub Pages. Enable **Settings → Pages → Source: GitHub Actions**. No production API keys are required or used by the workflow.

## Copyright

**Copyright © 2026 Jarrod Savard. All rights reserved.**

This repository is publicly available for portfolio review. It is not released under a permissive open-source license. See [LICENSE](LICENSE) for the complete notice. GitHub's applicable platform rights and third-party licenses remain in effect. See [third-party notices](docs/third-party-notices.md).

### Compare Luna generations

In the local **Live** page, select **OpenAI / GPT-6 Luna** and **OpenAI / GPT-5.6 Luna**, choose one task, and start the experiment. Each model attempts the clean and failure conditions, producing four trials under one shared budget. Use **Open results in comparison** when finished. A two-model experiment contains four attempts: each model tries the same trip with and without a problem.

The assignment and step explanations describe observed actions and environment changes. Expand **Technical details** for the exact tool request and response. They do not claim to expose private model reasoning.

Prices and support for reasoning disabled were checked against the official [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna) and [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna) documentation on September 27, 2026.
