# Agentic-Eval

**Observatory · Agent Reliability Lab**

A small agent evaluation application built by Jarrod Savard. Claude and OpenAI models use the same tools to schedule observations in a fictional observatory. The experiment checks whether they achieve the task when tools fail, equipment goes offline, or a successful write returns a timeout.

[Explore the application](https://jarrodsavard.github.io/Agentic-Eval/) · [Methodology](docs/methodology.md) · [Architecture](docs/architecture.md) · [Add a model or provider](docs/extending.md)

## What is here

- **24 scenarios:** 12 tasks, each with clean and failure variants.
- **Independent grading:** checks the final reservations rather than trusting the agent's answer.
- **Inspectible traces:** tool calls, responses, injected faults, environment snapshots, usage, and provenance.
- **Nuxt/TypeScript viewer:** comparisons, replay, scenario catalog, and local JSON import without uploading.
- **Python runner:** official SDK adapters, a shared bounded agent loop, typed artifacts, and a conservative spending guard.
- **Offline testing:** pytest, Hypothesis, mocked HTTP integration tests, generated-contract checks, Vitest, and Playwright on desktop and mobile.

**The published seed data is scripted, not Claude or OpenAI evidence.** The recovery reference passes all scenarios; the optimistic baseline intentionally handles failures poorly. The interface labels these policies as scripted demonstrations and omits fabricated timing/token comparisons. Live runs can be added with the explicit command below. A four-attempt showcase illustrates behavior; it does not establish a model ranking.

## Run locally

Requirements: Python 3.12+, Node.js 22.12+ (CI uses Node 22), [uv](https://docs.astral.sh/uv/getting-started/installation/), and pnpm 10.32.1.

```sh
uv sync --frozen
pnpm install --frozen-lockfile
pnpm dev
```

Open the local address shown by Nuxt. No API keys are required for the viewer, tests, or scripted evaluations.

### Watch a model run live

Copy `.env.example` to `.env` and configure the provider you want to use. For Luna, only `OPENAI_API_KEY` is needed; Claude stays unavailable until `ANTHROPIC_API_KEY` is present. Restart the local runner after changing keys.

```sh
pnpm live
```

Open **http://127.0.0.1:8765/live/**. Select a model and task, then click **Start live experiment**. Each selected model attempts both the clean and failure conditions. Tool calls, failures, and state changes appear as the runner reports them. The default $0.50 budget covers the entire click, with a $1 maximum. Starting another experiment is a new paid invocation.

**Stop experiment** prevents subsequent requests and tool actions after any in-flight response finishes accounting. Refreshing reconnects to the current/latest run without restarting it. The service binds only to loopback, keeps keys on the Python side, and accepts browser mutations only from its own local origin with a session token. The public Pages site provides recordings and setup instructions; it cannot initiate paid work.

Results are saved under `artifacts/local/`. Download a finished recording or open it directly in the comparison view. Progress checkpoints use `.progress.json`; standard replayable bundles use `.json`. A hard process kill can leave only the progress checkpoint for an unfinished trial. No automatic resume or paid retry occurs. Browser reconnect works while the same server process is running; saved bundles survive a restart and can be opened through **Open result file**.

To publish every attempt from one completed experiment:

```sh
uv run observatory verify artifacts/local/live-<run-id>.json
uv run observatory publish artifacts/local/live-<run-id>.json
```

Commit the generated `public/data` files and push `main` to publish them through Pages. This replaces the current public dataset with that complete experiment. The local build uses `.local-output/`, separate from the Pages build in `.output/`.

```sh
uv run observatory run
uv run observatory verify artifacts/evaluation.json
```

Use **Open result file** on the comparison page to inspect `artifacts/evaluation.json`. Files stay in browser memory. The importer validates format, version, references, and event order; it does not prove a file's claimed provenance. The Python verifier re-executes tool transitions and checks grades.

## Run the tiny live showcase

Copy `.env.example` to `.env` and add `OPENAI_API_KEY` and `ANTHROPIC_API_KEY`. Never commit that file. Confirm the model IDs and prices in `config/models.json`; live runs refuse price tables older than 30 days.

```sh
uv run observatory run --live --budget 0.50 --output artifacts/live-showcase.json
uv run observatory verify artifacts/live-showcase.json
```

This attempts the predetermined `committed_timeout-01` task in clean and failure conditions, once with each configured provider: four attempts. The invocation's default budget is **$0.50** and its maximum allowed budget is **$1**. There are no automatic paid retries. Re-running the command is a new invocation and can spend additional money.

Before generation, the runner counts input tokens and reserves the maximum output cost plus a 20% margin. Unknown usage or ambiguous failures keep their reservation and stop further paid requests. These are application-level estimates, not a provider-enforced account billing cap. Provider invoices remain authoritative. Unstarted and interrupted attempts stay visible in the artifact.

The default models are `gpt-6-luna` and `claude-haiku-4-5-20251001`, with extra reasoning disabled. A different supported model is a configuration change. Use `--models openai-luna` to select one profile or `--repetitions 2` to repeat the same cases within the same invocation budget.

To prepare the entire live experiment for the static viewer, including failed attempts:

```sh
uv run observatory publish artifacts/live-showcase.json
pnpm generate
```

Publishing replaces the viewer's current dataset; it does not merge or cherry-pick individual trials. `uv run observatory demo` restores the deterministic scripted demonstration. Review generated public artifacts before committing; they contain model-visible prompts/actions/results, not API keys or provider reasoning internals.

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
uv run observatory schema
pnpm contracts
```

The schema, generated TypeScript, and standalone browser validator are checked into the repository. CI regenerates them and fails if they drift.

## Deployment

`.github/workflows/quality.yml` runs the offline quality suite for pushes and pull requests. A successful push to `main` deploys the verified static output through GitHub Pages. Enable **Settings → Pages → Source: GitHub Actions**. No production API keys are required or used by the workflow.

## Copyright

**Copyright © 2026 Jarrod Savard. All rights reserved.**

This repository is publicly available for portfolio review. It is not released under a permissive open-source license. See [LICENSE](LICENSE) for the complete notice. GitHub's applicable platform rights and third-party licenses remain in effect. See [third-party notices](docs/third-party-notices.md).
