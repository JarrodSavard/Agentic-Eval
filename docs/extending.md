# Extending the lab

## Another model from an existing provider

Add a record to `config/models.json` with a unique `id`, display `label`, registered `provider`, exact API `model`, standard per-million input/output prices, `price_checked_at`, and `reasoning: "none"`. Verify the model supports client tool calling, token counting, and the requested configuration. The initial adapters target non-reasoning operation; a model that cannot disable reasoning needs an explicit adapter/configuration extension first.

Use `uv run roadtest run --live --models profile-id --budget 0.50`. This selects the same predetermined paired task, preserving the invocation spending ceiling. Unknown model ids, unsupported providers, missing keys, and stale pricing fail before generation.

## Another provider

Implement the `Agent` protocol in a new module under `engine/roadtest/providers/`:

- Metadata: `name`, `provider`, `model`, `source="live"`, `settings`, `pricing`.
- `count_input() -> int`: count the exact current system/task/tool/conversation payload before sending generation.
- `next(max_output_tokens) -> AgentTurn`: generate once, normalize calls/text/usage, expose truncation, and retain native continuation state privately.
- `observe(call, result)`: append the tool result to the native conversation, preserving its call identifier and excluding evaluator-only fault metadata.

Register the factory in `PROVIDERS` and add its environment-key name to the CLI preflight registry. Disable SDK retries and use finite request timeouts. Convert transport/protocol exceptions to `ProviderError` without copying sensitive error content into public traces. Missing or invalid usage must remain unknown, never zero.

Write mocked HTTP tests before implementation. Reuse the behavioral checks in `test_providers.py`: exact counting payload, tool round trip, system/prompt parity, no automatic retries, truncation without tool execution, unknown usage, timeouts and budget exhaustion. Never spend live API credits in tests.

## Another scenario

Extend `catalog()` with an explicit starting state and requests. Keep clean/fault pairs identical except for the fault variant. Add independent expected-outcome and negative-grader tests, then require the scripted reference to complete the new scenario. Version changed scenarios rather than presenting different tasks as the same benchmark.

If the public schema changes, regenerate it with `uv run roadtest schema` and `pnpm contracts`. Incompatible changes require a new schema version and an explicit importer path. Do not hand-edit generated types or validators.
