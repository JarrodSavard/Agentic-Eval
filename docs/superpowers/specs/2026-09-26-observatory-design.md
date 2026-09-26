# Observatory: approved design

Build a public portfolio application comparing Claude and OpenAI recovery while scheduling observations in a fictional observatory. Nuxt/TypeScript displays static recordings; Python runs local evaluations. Results cross the boundary as versioned JSON, with Pydantic as the contract source and generated TypeScript types.

## Benchmark
Twelve base tasks, each clean and faulty: four variations for transient reads, instrument unavailability after inspection, and successful reservations whose responses time out. Deterministic outcome graders check requested reservations, capabilities, windows, existing bookings, conflicts and duplicates. Different valid solutions, including idempotent retries, pass. Invalid attempts, actual invariant violations, provider errors and incomplete trials remain distinct.

## Runner
One provider-neutral agent loop, common prompts/tools/limits, sequential tool calls. Official OpenAI Responses and Anthropic Messages SDKs behind adapters. Model configuration is data; new providers implement a protocol and contract tests. Record model identifiers, settings, scenario/prompt versions, timestamps, code revision, scores, usage, provenance and state snapshots.

## Viewer
Overview, comparisons, replay, 24-scenario catalog, local JSON import without upload. Static GitHub Pages output, summaries before traces, restrained observatory panel, keyboard accessibility and responsive layout. Untrusted text is rendered as text. Initial compressed JS <=250 KB.

## Budget
Offline default; --live and local keys required. Default $0.50; maximum $1 per invocation. Showcase: timeout task 1, clean and failure, once per provider. Defaults gpt-6-luna and claude-haiku-4-5-20251001, additional reasoning disabled. Eight model turns, twelve tool calls, 512 output tokens and 6,000 input tokens per request. Count inputs before sending, reserve maximum request cost plus 20%, disable SDK retries, abort on unknown pricing/accounting and preserve partial results. Publish every showcase attempt and label its small sample size. No model judges or ranking claims.

## Verification
Pytest/Hypothesis simulator properties and independent grading. Mocked HTTP provider contracts. Runner/export integration and cross-language schema checks. Vitest behavior tests and Playwright desktop/mobile tests against static output and a non-root base path. All automated checks are offline. Scripted reference agent passes all 24; faulty agents fail independently graded tasks. Real runs require available credentials, and their outcomes need not pass.

## Publication
Public review with copyright reserved, no permissive project license. Documentation covers setup, methodology, architecture, limitations, provider/model extension. No auth, database, hosted paid runs, additional domains or research-scale claims in v1.
