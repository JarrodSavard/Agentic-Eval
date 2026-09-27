<script setup lang="ts">
import { explainEvent } from '~/utils/story'
import { featuredTrial } from '~/utils/results'
import type { TrialResult } from '~/generated/evaluation'
import { outcome, provenanceLabel, returnedModelLabel, money } from '~/utils/results'
const route = useRoute()
const router = useRouter()
const evaluation = useEvaluation()
const selected = ref('')
const recording = ref<TrialResult | null>(null)
const position = ref(0)
const error = ref('')
const busy = ref(false)
let requestNumber = 0
async function loadRecording(id: string) {
  const request = ++requestNumber
  recording.value = null
  position.value = 0
  error.value = ''
  busy.value = true
  try {
    const result = await evaluation.trial(id)
    if (request !== requestNumber) return
    recording.value = result
    if (!result)
      error.value = 'This trial is not in the current experiment. Choose another recording.'
  } catch {
    if (request === requestNumber)
      error.value = 'This recording could not be loaded. Choose it again to retry.'
  } finally {
    if (request === requestNumber) busy.value = false
  }
}
function choose(id: string) {
  selected.value = id
  void router.replace({ query: { trial: id } })
  void loadRecording(id)
}
onMounted(async () => {
  await evaluation.load()
  const fromQuery = typeof route.query.trial === 'string' ? route.query.trial : ''
  const defaultTrial = featuredTrial(evaluation.data.value?.trials || [])
  selected.value = fromQuery || defaultTrial?.id || ''
  if (selected.value) await loadRecording(selected.value)
})
const scenario = computed(() =>
  evaluation.data.value?.scenarios.find((s) => s.id === recording.value?.scenario_id),
)
const event = computed(() => recording.value?.events[position.value])
const state = computed(() => event.value?.state || scenario.value?.initial_state)
const pretty = (value: unknown) => JSON.stringify(value, null, 2)
function inspectCheck(sequence: number) {
  if (!recording.value?.events[sequence]) return
  position.value = sequence
  document.querySelector('.event-inspector')?.scrollIntoView({ block: 'center' })
}
</script>

<template>
  <section class="page-heading">
    <div>
      <h1>Watch the booking<br />step by step.</h1>
      <p class="lead">
        See what the AI checked, what it tried to book, and what actually happened.
      </p>
    </div>
    <NuxtLink class="text-link" to="/compare">Back to comparison <ArrowIcon /></NuxtLink>
  </section>
  <p v-if="evaluation.imported.value" class="notice" role="note">
    Local file · Format validated only. Model identities, provenance and check results are supplied
    by the file and have not been independently verified here. Run the Python verifier before
    trusting recorded results.
  </p>
  <label class="recording-picker"
    >Recording<select
      :value="selected"
      @change="choose(($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="trial in evaluation.data.value?.trials || []"
        :key="trial.id"
        :value="trial.id"
      >
        {{ evaluation.data.value?.scenarios.find((s) => s.id === trial.scenario_id)?.title }} ·
        {{ trial.agent }} ·
        {{ trial.scenario_id.endsWith('-fault') ? 'With a problem' : 'No problem' }}
      </option>
    </select></label
  >
  <p v-if="busy" class="empty-state">Loading the recorded trace…</p>
  <p v-else-if="error || evaluation.loadError.value" role="alert" class="empty-state">
    {{ error || evaluation.loadError.value }}
  </p>
  <template v-else-if="recording && scenario && state">
    <div class="replay-meta">
      <span class="badge">{{ provenanceLabel(recording) }}</span
      ><span>{{ recording.agent }}</span
      ><span
        :class="[
          'outcome',
          recording.status === 'completed' && recording.grade.success ? 'passed' : 'failed',
        ]"
        >{{ outcome(recording) }}</span
      ><span>{{ money(recording.estimated_cost_usd) }} estimated</span>
    </div>
    <TaskBrief :scenario="scenario" />
    <div class="replay-layout">
      <section class="trace-panel">
        <div class="panel-heading">
          <h2>What the AI did</h2>
          <span>{{ recording.tool_calls }} actions</span>
        </div>
        <ReplayControls v-model="position" :count="recording.events.length" />
        <ol class="event-list">
          <li v-for="(entry, index) in recording.events" :key="entry.sequence">
            <button
              :class="{ selected: index === position }"
              :aria-current="index === position ? 'step' : undefined"
              @click="position = index"
            >
              <span class="event-number">{{ String(index + 1).padStart(2, '0') }}</span
              ><span
                ><strong>{{ explainEvent(entry).title }}</strong
                ><small>{{
                  entry.result?.error?.replaceAll('_', ' ') ||
                  (entry.result?.fault
                    ? 'Challenge introduced'
                    : entry.kind === 'tool'
                      ? 'Request completed'
                      : entry.kind)
                }}</small></span
              ><span
                v-if="entry.result?.fault"
                class="fault-dot"
                aria-label="Problem introduced"
              ></span>
            </button>
          </li>
        </ol>
        <p v-if="!recording.events.length" class="empty-state">
          No actions were recorded for this attempt.
        </p>
      </section>
      <section class="state-panel">
        <StateBoard :state="state" :requests="scenario.requests" />
        <div class="event-inspector">
          <div class="panel-heading">
            <h2>{{ event?.tool ? 'At this step' : 'Recorded message' }}</h2>
            <span v-if="event">Turn {{ event.turn }}</span>
          </div>
          <p v-if="event?.result?.fault" class="fault-notice">
            We introduced this problem: {{ event.result.fault.replaceAll('_', ' ') }}. The AI only
            sees the booking site’s replies, not this explanation.
          </p>
          <EventStory v-if="event" :event="event" />
          <details v-if="event?.kind === 'tool'" class="technical-details">
            <summary>Technical details</summary>
            <template v-if="event?.kind === 'tool'"
              ><h3>Arguments</h3>
              <pre>{{ pretty(event.arguments) }}</pre>
              <h3>Tool response</h3>
              <pre>{{ pretty({ data: event.result?.data, error: event.result?.error }) }}</pre>
            </template>
          </details>
          <p v-if="event?.kind !== 'tool'" class="agent-message">
            {{ event?.text || 'This attempt has no recorded events.' }}
          </p>
        </div>
      </section>
    </div>
    <EvaluationReport :assessment="recording.assessment" @inspect="inspectCheck" />
    <details class="provenance">
      <summary>Experiment provenance and final grading</summary>
      <dl>
        <dt>Model identifier</dt>
        <dd>{{ recording.model }}</dd>
        <dt>Returned model</dt>
        <dd>{{ returnedModelLabel(recording) }}</dd>
        <dt>Recorded at</dt>
        <dd>{{ recording.started_at }}</dd>
        <dt>Code revision</dt>
        <dd>{{ evaluation.data.value?.code_revision }}</dd>
        <dt>Grading</dt>
        <dd>
          {{ recording.grade.completed_requests }} / {{ recording.grade.total_requests }} trips
          booked.
          {{
            recording.grade.violations.length
              ? recording.grade.violations.join(', ')
              : 'No final-state violations.'
          }}
        </dd>
        <dt>Attempted invalid actions</dt>
        <dd>{{ recording.invalid_actions }}</dd>
        <dt>Token usage</dt>
        <dd>
          {{ recording.usage.input_tokens }} input / {{ recording.usage.output_tokens }} output{{
            recording.usage_complete ? '' : ' (partial / unknown)'
          }}
        </dd>
        <dt>Unconfirmed cost reservation</dt>
        <dd>{{ money(recording.reserved_cost_usd) }}</dd>
      </dl>
      <pre>{{ pretty(recording.settings) }}</pre>
    </details>
  </template>
</template>
