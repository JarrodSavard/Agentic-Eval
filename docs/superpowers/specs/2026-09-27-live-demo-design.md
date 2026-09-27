# Local live demonstrations

The user chose live model runs on their computer and real recordings on the public portfolio. Preserve the fictional testbed, provider-neutral runner, independent grades, spending limits and copyright.

The local app provides model selection, a paired clean/fault task, explicit start and stop, incremental visible tool events, state snapshots and completed outcomes. It must distinguish a running model, an interrupted attempt and a replay. No simulated animation may be presented as live model activity.

A loopback-only Python service serves the built Nuxt app and a small same-origin API. It reuses the existing runner with event and cancellation hooks. The browser polls progress while a single background worker executes trials sequentially. One invocation shares the existing $0.50 default / $1 maximum budget across all selected models and both conditions. A stop request waits for an in-flight provider request to settle and prevents subsequent requests/actions. No automatic paid retry or restart.

Keys remain in the ignored local .env or process environment. Configuration responses disclose only readiness, model names and dated prices. Host/origin checks and a per-process request token protect local mutations; public GitHub Pages cannot invoke this service. The public Live page explains local setup, while published recordings remain free to replay.

Save partial progress after events and standard EvaluationBundle artifacts after trials and at completion. Expose a download of the final bundle and an option to open it in the existing comparison/replay interface. Publishing remains an explicit operation, preserving all attempts. Keep all 24 scenarios in exports so coverage stays visible.

Tests remain offline: runner event/cancel behavior, local API boundaries, single-run admission, malformed requests, missing keys, interruption, provider errors, saved artifacts, generated contracts and desktop/mobile live UI with clearly test-only fixtures. Actual model verification waits for locally configured keys.
