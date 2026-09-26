<template>
  <section class="page-heading">
    <div>
      <h1>Small by design.<br />Honest by construction.</h1>
      <p class="lead">This is an engineering testbed, not a leaderboard.</p>
    </div>
  </section>
  <div class="methodology-layout">
    <aside>
      <a href="#measurement">What is measured</a><a href="#architecture">How it works</a
      ><a href="#limits">What it cannot tell you</a><a href="#local">Run it locally</a>
    </aside>
    <div class="prose">
      <section id="measurement">
        <h2>Measure the resulting world.</h2>
        <p>
          Agents schedule observations using a shared prompt, the same tool definitions, and
          identical limits. Each base task has a clean control and a deterministic failure variant.
          The grader reads the final reservations independently of the agent’s summary.
        </p>
        <p>
          A task passes only when all requested observations have valid reservations, unrelated
          bookings remain unchanged, and no duplicates or conflicts exist. A different valid
          schedule still passes. Retrying with the same idempotency key is a valid way to recover.
        </p>
        <p>
          Tool guards can block a bad action. We report that attempted action separately from actual
          damage. Interrupted runs, provider errors, and budget limits are displayed separately from
          completed task outcomes.
        </p>
      </section>
      <section id="architecture">
        <h2>One experiment. Two independent parts.</h2>
        <div class="architecture-flow">
          <span>Python simulator<br /><small>Tools + independent grader</small></span
          ><ArrowIcon /><span>Versioned JSON<br /><small>Events + state snapshots</small></span
          ><ArrowIcon /><span>Nuxt viewer<br /><small>Compare + replay</small></span>
        </div>
        <p>
          The Python runner uses official OpenAI and Anthropic SDKs behind small adapters. Adding a
          model is configuration; adding a provider requires an adapter and contract tests. Pydantic
          defines the artifact contract, which generates the TypeScript types and validator.
        </p>
        <p>
          The public site is static. Opening a local file keeps it in your browser. There are no
          hosted model calls, accounts, or uploaded results.
        </p>
      </section>
      <section id="limits">
        <h2>Keep the evidence in proportion.</h2>
        <p>
          Scripted demonstrations are deterministic policies written to exercise the test harness.
          They are not Claude or OpenAI results. Real model runs, when published, are a tiny
          illustrative sample. They cannot establish a statistically meaningful winner or predict
          general agent reliability.
        </p>
        <p>
          A reproducible environment does not make a model’s behavior deterministic. Provider
          versions, service conditions, and prompt choices affect results. The full scenario library
          has 24 cases; model coverage is shown per scenario.
        </p>
        <p>
          Costs are estimates from a dated rate table and reported usage, not invoices. Unknown
          usage retains its reservation and stops paid work. Every attempt from a showcase is
          preserved, including failed and incomplete attempts.
        </p>
      </section>
      <section id="local">
        <h2>A deliberately small footprint.</h2>
        <p>
          Development and CI use offline tests. The default local command runs the scripted
          policies. Live calls require local API keys and an explicit flag.
        </p>
        <pre>
uv sync
uv run observatory run
uv run observatory verify artifacts/evaluation.json</pre>
        <p>
          The paid showcase defaults to $0.50 and rejects budgets above $1. Each trial allows eight
          model turns, twelve tool calls, 512 output tokens per response, and 6,000 input tokens per
          request. Automatic SDK retries are disabled.
        </p>
        <a
          class="button button-secondary"
          href="https://github.com/JarrodSavard/Agentic-Eval#readme"
          >Setup and source code <ArrowIcon
        /></a>
      </section>
      <section>
        <h2>Public for review.</h2>
        <p>
          Copyright © 2026 Jarrod Savard. All rights reserved. The source is publicly available for
          portfolio review and is not released under a permissive open-source license. Third-party
          dependencies keep their own licenses.
        </p>
      </section>
    </div>
  </div>
</template>
