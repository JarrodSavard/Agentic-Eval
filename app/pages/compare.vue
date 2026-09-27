<script setup lang="ts">
import {
  familyLabels,
  filterTrials,
  money,
  outcome,
  provenanceLabel,
  summarize,
} from '~/utils/results'
const evaluation = useEvaluation()
onMounted(evaluation.load)
const family = ref('')
const model = ref('')
const variant = ref('')
const trials = computed(() =>
  filterTrials(evaluation.data.value?.trials || [], evaluation.data.value?.scenarios || [], {
    family: family.value,
    model: model.value,
    variant: variant.value,
  }),
)
const summary = computed(() => summarize(trials.value))
const models = computed(() => [
  ...new Map((evaluation.data.value?.trials || []).map((t) => [t.model, t.agent])).entries(),
])
const scenario = (id: string) => evaluation.data.value?.scenarios.find((s) => s.id === id)
</script>

<template>
  <section class="page-heading">
    <div>
      <h1>Which AI got<br />the booking right?</h1>
      <p class="lead">Compare the same trip, then watch how each AI handled the problem.</p>
    </div>
    <ResultImport />
  </section>
  <div v-if="evaluation.imported.value" class="notice">
    Local file · Format validated. Results and provenance are supplied by the file; run the Python
    verifier to check recorded transitions.
  </div>
  <div v-else class="notice">
    <span class="status-dot"></span
    >{{
      summary.live
        ? 'Real AI attempts are illustrative; this sample does not establish a ranking.'
        : 'Scripted example — these are prewritten actions, not real AI results.'
    }}
  </div>
  <section class="comparison-guide" aria-label="How to read this comparison">
    <h2>Start with the booking result.</h2>
    <p>
      Each AI tries the same trip with <strong>No problem</strong> and
      <strong>With a problem</strong>. “Booking completed” means the customer got a suitable car on
      an allowed date. A rejected attempt is okay if the AI recovers.
    </p>
    <p v-if="models.length === 1">
      This recording contains one model. To compare GPT-6 Luna with GPT-5.6 Luna,
      <NuxtLink to="/live">open the local live lab</NuxtLink>, select both models, and run the same
      task.
    </p>
    <dl>
      <div>
        <dt>Outcome</dt>
        <dd>Checked from actual bookings, not the model's claim.</dd>
      </div>
      <div>
        <dt>Actions / rejected</dt>
        <dd>
          Requests to the booking site / rejected requests. An AI can recover from a rejection.
        </dd>
      </div>
      <div>
        <dt>Time taken &amp; tokens</dt>
        <dd>
          How long it took and how much text the AI processed. Faster does not always mean better.
        </dd>
      </div>
    </dl>
  </section>
  <div class="filters">
    <label
      >Problem type<select v-model="family">
        <option value="">All problems</option>
        <option v-for="(label, key) in familyLabels" :key="key" :value="key">{{ label }}</option>
      </select></label
    ><label
      >AI<select v-model="model">
        <option value="">All AIs</option>
        <option v-for="[id, label] in models" :key="id" :value="id">{{ label }}</option>
      </select></label
    ><label
      >Conditions<select v-model="variant">
        <option value="">Both situations</option>
        <option value="clean">No problem</option>
        <option value="fault">With a problem</option>
      </select></label
    >
  </div>
  <div class="results-summary">
    <span
      ><strong>{{ summary.trials }}</strong> attempts shown</span
    ><span
      ><strong>{{ summary.passed }}</strong> successful attempts</span
    ><span
      ><strong>{{ summary.incomplete }}</strong> incomplete</span
    ><span
      ><strong>{{ money(summary.cost) }}</strong> estimated API cost</span
    ><span v-if="summary.reserved">{{ money(summary.reserved) }} reserved / unconfirmed</span>
  </div>
  <p v-if="evaluation.loading.value" class="empty-state">Loading the experiment…</p>
  <div v-else-if="evaluation.loadError.value && !evaluation.data.value" class="empty-state">
    <p role="alert">{{ evaluation.loadError.value }}</p>
    <button class="button" @click="evaluation.load">Try again</button>
  </div>
  <div v-else-if="!trials.length" class="empty-state">
    No trials match these filters. Choose another family or agent.
  </div>
  <div v-else class="table-scroll">
    <table class="results-table">
      <caption class="sr-only">
        Trial outcomes and resource usage
      </caption>
      <thead>
        <tr>
          <th>Trip / situation</th>
          <th>AI</th>
          <th>Outcome</th>
          <th>Actions / rejected</th>
          <th>Time taken</th>
          <th>Tokens</th>
          <th>Est. cost</th>
          <th><span class="sr-only">Evidence</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="trial in trials" :key="trial.id">
          <td>
            <strong>{{ scenario(trial.scenario_id)?.title }}</strong
            ><span class="cell-detail"
              >{{
                scenario(trial.scenario_id)?.variant === 'fault' ? 'With a problem' : 'No problem'
              }}
              · trial {{ trial.repetition }}</span
            >
          </td>
          <td>
            {{ trial.agent }}<span class="cell-detail">{{ provenanceLabel(trial) }}</span>
          </td>
          <td>
            <span
              :class="[
                'outcome',
                trial.status === 'completed' && trial.grade.success ? 'passed' : 'failed',
              ]"
              >{{ outcome(trial) }}</span
            ><span v-if="trial.grade.violations.length" class="cell-detail">{{
              trial.grade.violations.join(', ')
            }}</span>
          </td>
          <td class="numeric" data-label="Actions / rejected">
            {{ trial.tool_calls }} / {{ trial.invalid_actions }}
          </td>
          <td class="numeric" data-label="Time taken">
            {{ trial.source === 'live' ? `${(trial.latency_ms / 1000).toFixed(1)}s` : '—' }}
          </td>
          <td class="numeric" data-label="Tokens">
            {{
              trial.source === 'live'
                ? `${trial.usage.input_tokens} in / ${trial.usage.output_tokens} out`
                : '—'
            }}<span v-if="!trial.usage_complete" class="cell-detail">Partial usage</span>
          </td>
          <td class="numeric" data-label="Est. cost">{{ money(trial.estimated_cost_usd) }}</td>
          <td>
            <NuxtLink
              :to="{ path: '/replay', query: { trial: trial.id } }"
              class="replay-link"
              aria-label="Replay trial"
              >Watch steps <ArrowIcon
            /></NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="table-note">
    A completed booking requires a finished run and a booking that passes every rule. An unfinished
    run is never counted as a pass. Scripted timing and token metrics are intentionally omitted.
  </p>
</template>
