# Evaluation methodology

## Experimental unit

A base task describes one to three fictional car-rental requests. Each names a customer, a trip, a required feature (child seat or extra luggage space), and allowed October 2026 dates. Cars advertise features and availability. Each booking is one full day. An unrelated reservation already exists and must survive.

Each base task has a clean and faulty version with equal requests and starting state. Four task variations in each of three families produce 24 scenarios.

| Family            | Deterministic trigger                                                  | Recovery question                                                   |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Transient read    | First car availability check                                           | Does the agent obtain a valid view after a temporary failure?       |
| Car unavailable   | Immediately after the first successful inspection returns its snapshot | Does it refresh stale information and choose a working alternative? |
| Committed timeout | First successful reservation commits before its response fails         | Does it reconcile the uncertain outcome or retry idempotently?      |

Fault triggers are action-relative, not wall-clock events. Different action choices can change exposure to a fault; this is visible in the recorded events. A clean/fault pair is a controlled task comparison, not a guarantee of equal stochastic model behavior.

## Success and failure

The independent grader checks all requested trips have exactly one valid reservation, capability and window constraints hold, no car/date overlaps exist, and original reservations are preserved. It accepts every valid final arrangement rather than requiring a particular trace. Idempotent retries are valid recovery.

The interface counts a pass only when the runner status is `completed` and the grade succeeds. Incomplete attempts remain in the denominator of displayed trial counts but are shown separately; the app never silently drops them. Invalid tool attempts and actual final-state violations are separate fields. A guard can stop an unsafe attempt without invalidating an otherwise correct final state.

Latency is wall-clock time around the trial, including token counting and provider calls. Usage comes from SDK response usage fields; unknown usage is labeled incomplete. Costs use dated standard token rates and conservative treatment of cached reads. They are estimates, not invoices.

## Scripted demonstrations

The recovery reference re-inspects after errors and schedules remaining requests from observed state. The optimistic policy continues after reservation errors and stops after inspection errors. Their purpose is to prove that the harness, fault injection and grader behave as designed. A write timeout can still produce a valid final state for either policy; this illustrates why the grader checks outcomes rather than guessing failure from the transcript.

The checked-in fixture has fixed timestamps and a `scripted-rental-fixture-v2` revision marker for reproducibility. Its timing is zeroed deliberately and suppressed by the viewer. It makes no claims about actual model performance.

## Live showcase and limitations

The default showcase attempts one predetermined timeout task, clean and faulty, once per provider. No model judge is involved. All attempts—including provider errors, interruptions and not-run entries—are exported. The suite supports repetition, but a tiny sample cannot justify confidence intervals, a leaderboard, or a general statement that one model is better.

The testbed is intentionally synthetic. There is no real fleet availability claim, real booking-site integration, real-world reliability guarantee, or protection against public benchmark contamination. Different native API protocols and model internals remain confounders; settings and returned model IDs are recorded.

## Sources

The design follows [Anthropic's discussion of agent tasks, trials, traces and verifiable outcomes](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) and [OpenAI's agent evaluation guidance](https://developers.openai.com/api/docs/guides/agent-evals). API translation follows the official [OpenAI function-calling](https://developers.openai.com/api/docs/guides/function-calling) and [Anthropic tool-call handling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls) documentation. Current prices must be checked against [OpenAI](https://developers.openai.com/api/docs/pricing) and [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing) before paid runs.

## Evidence format

Rental prompts, scenarios and artifacts use version 2.0. The importer rejects incompatible recordings instead of guessing their meaning.
