# Architecture

## A portable experiment, not a hosted agent service

The Python package owns simulation, scoring, provider communication, budget accounting and result production. The Nuxt application only reads recordings. This boundary makes the public demo cheap to host and prevents visitors from generating API charges.

```mermaid
flowchart LR
    CLI[Local Python command] --> Runner[Shared bounded agent loop]
    Runner --> Adapters[OpenAI / Anthropic / scripted adapters]
    Runner --> Simulator[Deterministic simulator]
    Simulator --> Grader[Independent outcome grader]
    Runner --> Artifact[Versioned JSON artifact]
    Grader --> Artifact
    Artifact --> Viewer[Static Nuxt comparison and replay]
```

## Responsibilities

| Module         | Responsibility                                      | Boundary                                    |
| -------------- | --------------------------------------------------- | ------------------------------------------- |
| `contracts.py` | Public Pydantic models                              | JSON Schema and generated frontend types    |
| `scenarios.py` | Authored task/control pairs                         | Scenario data                               |
| `simulator.py` | Tool validation, transitions and faults             | Tool call → result and state                |
| `grading.py`   | Independent outcome assertions                      | Scenario + final state → grade              |
| `protocol.py`  | Provider-neutral interface                          | Count, generate, observe                    |
| `providers/`   | Official SDK request/response translation           | Provider-native conversation stays internal |
| `budget.py`    | Decimal reservations and settlement                 | Invocation-wide spending estimate           |
| `runner.py`    | Limits, event recording and stop conditions         | One loop for every agent                    |
| `artifacts.py` | Atomic export and deterministic replay verification | Portable bundle                             |
| `cli.py`       | Offline/live workflows and publication preparation  | Explicit local commands                     |

The simulator does not know about SDKs or the UI. Grading does not reuse the simulator's constraint validators. Adapters do not decide success or repair failures. Injected faults are visible in the evaluator's trace but omitted from tool observations sent to models.

## Contracts and persistence

`EvaluationBundle` includes the config, scenario definitions and trials. Trials contain visible messages, tool events, state snapshots, independent grades, model identifiers, code revision and usage. Hidden reasoning and provider credentials are not exported. Pydantic produces a serialization schema; the build generates TypeScript and an Ajv standalone validator. The full Ajv compiler is not shipped in the browser.

There is no database or runtime API. The CLI checkpoints the bundle after each trial using a temporary file and atomic replacement. Publication writes a small summary index and individual lazy-loaded trace files. Browser imports are in-memory and local; reloading clears an imported dataset.

## Failure boundaries

Tool faults are part of the task and go back to the agent. Provider transport failures, unsupported responses, uncertain usage, token limits, and budget interruptions are runner statuses. The runner never silently retries paid generation. After an uncertain paid request it keeps the reservation and stops the invocation; the remaining planned trials are recorded as `not_run`.

The model result is not deterministic. Only the environment, scripted baselines, transition replay and graders are reproducible. The experiment stores configuration and code provenance so differences can be investigated.

## Deliberate tradeoffs

- Synchronous, sequential trials keep cost accounting and ordering easy to inspect. The tiny paid showcase does not need a worker queue.
- State snapshots cost some file space but avoid duplicating the simulation engine in TypeScript.
- Three explicit tools and small protocols provide extension points without a large agent framework.
- Static hosting removes production service maintenance. Starting a local evaluation from the browser is outside v1.
