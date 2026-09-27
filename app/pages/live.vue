<script setup lang="ts">
import { money, outcome } from '~/utils/results'
const live = useLive()
const evaluation = useEvaluation()
const router = useRouter()
const selectedProfiles = ref<string[]>([])
const baseId = ref('instrument_unavailable-01')
const budget = ref(0.5)
const position = ref(0)
const follow = ref(true)
const run = live.snapshot
const running = computed(() => run.value?.status === 'running')
const tasks = computed(
  () => live.bootstrap.value?.scenarios.filter((s) => s.variant === 'fault') || [],
)
const scenario = computed(
  () =>
    (run.value?.bundle.scenarios || live.bootstrap.value?.scenarios || []).find(
      (s) => s.id === run.value?.active_scenario_id,
    ) || tasks.value.find((s) => s.base_id === baseId.value),
)
const event = computed(() => run.value?.events[position.value])
const state = computed(() => event.value?.state || scenario.value?.initial_state)
const spent = computed(
  () => run.value?.bundle.trials.reduce((sum, t) => sum + t.estimated_cost_usd, 0) || 0,
)
const reserved = computed(
  () => run.value?.bundle.trials.reduce((sum, t) => sum + t.reserved_cost_usd, 0) || 0,
)
const incompleteUsage = computed(() => run.value?.bundle.trials.some((t) => !t.usage_complete))
const activeKey = computed(
  () => `${run.value?.run_id}/${run.value?.active_scenario_id}/${run.value?.active_agent}`,
)
watch(live.bootstrap, (config) => {
  if (!selectedProfiles.value.length && config)
    selectedProfiles.value = config.profiles
      .filter((p) => p.ready)
      .slice(0, 1)
      .map((p) => p.id)
})
watch(activeKey, () => {
  position.value = 0
  follow.value = true
})
watch(
  () => run.value?.events.length,
  (length) => {
    if (follow.value) position.value = Math.max(0, (length || 0) - 1)
  },
)
function start() {
  follow.value = true
  return live.start({
    profile_ids: selectedProfiles.value,
    base_id: baseId.value,
    budget_usd: budget.value,
  })
}
function inspect(index: number) {
  follow.value = false
  position.value = index
}
async function compare() {
  if (!run.value) return
  evaluation.open(JSON.stringify(run.value.bundle))
  await router.push('/compare')
}
const pretty = (value: unknown) => JSON.stringify(value, null, 2)
</script>

<template>
  <section class="page-heading">
    <div>
      <h1>Watch a model work.</h1>
      <p class="lead">Fictional observations. Real model decisions. Visible consequences.</p>
    </div>
    <NuxtLink class="text-link" to="/replay">Watch a recording <ArrowIcon /></NuxtLink>
  </section>
  <p v-if="live.connection.value === 'loading'" class="empty-state">
    Connecting to the local runner…
  </p>
  <section v-else-if="live.connection.value === 'unavailable'" class="live-setup prose">
    <h2>Run it on your computer.</h2>
    <p>
      The portfolio hosts recordings of experiments. To watch a fresh model run, start the local lab
      from this repository with your API key in the ignored <code>.env</code> file.
    </p>
    <pre><code>pnpm live</code></pre>
    <p>
      Open the local address it prints. Choose a model and a task, then start explicitly. API keys
      stay on your computer. The default budget is $0.50 for the entire experiment.
    </p>
    <div class="live-actions">
      <a class="button" href="http://127.0.0.1:8765/live/">Open local lab <ArrowIcon /></a
      ><button class="button secondary" @click="live.connect">Check connection</button>
    </div>
    <p>
      <a href="https://github.com/JarrodSavard/Agentic-Eval#run-locally"
        >Setup instructions and source</a
      >
    </p>
  </section>
  <template v-else>
    <div class="notice">
      <span class="status-dot"></span>Local live execution · Each model attempts a clean control and
      the same task with an injected failure.
    </div>
    <form class="live-form" @submit.prevent="start">
      <fieldset :disabled="running || live.submitting.value">
        <legend>Models</legend>
        <label
          v-for="profile in live.bootstrap.value?.profiles"
          :key="profile.id"
          class="model-choice"
        >
          <input
            v-model="selectedProfiles"
            type="checkbox"
            :value="profile.id"
            :disabled="!profile.ready"
          />
          <span
            >{{ profile.label
            }}<small>{{ profile.ready ? profile.model : profile.reason }}</small></span
          >
        </label>
      </fieldset>
      <label
        >Task<select v-model="baseId" :disabled="running">
          <option v-for="task in tasks" :key="task.base_id" :value="task.base_id">
            {{ task.title }}
          </option>
        </select></label
      >
      <label
        >Experiment budget (USD)<input
          v-model.number="budget"
          type="number"
          min="0.01"
          max="1"
          step="0.01"
          required
          :disabled="running"
        /><small>$1 maximum across all selected trials.</small></label
      >
      <button
        class="button"
        type="submit"
        :disabled="
          running || live.submitting.value || !selectedProfiles.length || !!live.error.value
        "
      >
        {{ live.submitting.value ? 'Starting…' : 'Start live experiment' }}
      </button>
    </form>
    <p class="table-note">
      Each click starts a new paid experiment. Usage is estimated conservatively; an in-flight
      request finishes accounting before a stop takes effect. No automatic paid retries.
    </p>
    <div v-if="live.error.value" class="notice">
      <p role="alert">{{ live.error.value }}</p>
      <button class="button secondary" @click="live.connect">Reconnect</button>
    </div>
    <template v-if="run">
      <div class="live-status" role="status">
        <div>
          <strong>{{
            running
              ? run.cancel_requested
                ? 'Stop requested'
                : 'Experiment running'
              : run.status === 'failed'
                ? 'Experiment stopped unexpectedly'
                : 'Experiment finished'
          }}</strong>
          <p>
            {{ run.active_agent }} ·
            {{ scenario?.variant === 'fault' ? 'Failure condition' : 'Clean control' }} ·
            {{ run.bundle.trials.length }} trials recorded
          </p>
        </div>
        <button
          v-if="running"
          class="button secondary"
          :disabled="run.cancel_requested"
          @click="live.stop"
        >
          Stop experiment
        </button>
        <span v-else>{{ money(spent) }} estimated total</span>
      </div>
      <p v-if="incompleteUsage" class="fault-notice">
        Usage is incomplete. {{ money(reserved) }} reserved for unconfirmed charges; actual charges
        may differ.
      </p>
      <p v-if="run.error" role="alert" class="fault-notice">{{ run.error }}</p>
      <p v-if="running" class="table-note">
        Completed actions appear below as they arrive. A quiet interval means the runner is waiting;
        it does not imply progress or success.
      </p>
      <div v-if="scenario && state" class="replay-layout live-observation">
        <section class="trace-panel">
          <div class="panel-heading">
            <h2>Actions arriving</h2>
            <span>{{ run.events.length }} events</span>
          </div>
          <div class="live-follow">
            <label
              ><input
                v-model="follow"
                type="checkbox"
                @change="position = Math.max(0, run.events.length - 1)"
              />
              Follow newest event</label
            >
          </div>
          <ReplayControls
            :model-value="position"
            :count="run.events.length"
            @update:model-value="inspect"
          />
          <p v-if="!run.events.length" class="panel-heading muted">
            {{
              running
                ? 'Waiting for the first model response…'
                : 'No actions recorded for this trial.'
            }}
          </p>
          <ol class="event-list">
            <li v-for="(entry, index) in run.events" :key="entry.sequence">
              <button
                :class="{ selected: index === position }"
                :aria-current="index === position ? 'step' : undefined"
                @click="inspect(index)"
              >
                <span class="event-number">{{ index + 1 }}</span
                ><span
                  ><strong>{{
                    entry.tool?.replaceAll('_', ' ') ||
                    (entry.kind === 'stopped' ? 'Run stopped' : 'Model message')
                  }}</strong
                  ><small>{{
                    entry.result?.fault
                      ? 'Fault injected'
                      : entry.result?.error?.replaceAll('_', ' ') || entry.kind
                  }}</small></span
                >
              </button>
            </li>
          </ol>
        </section>
        <section class="state-panel">
          <StateBoard :state="state" :requests="scenario.requests" />
          <div class="event-inspector">
            <div class="panel-heading">
              <h2>What happened</h2>
              <span v-if="event">Turn {{ event.turn }}</span>
            </div>
            <p v-if="event?.result?.fault" class="fault-notice">
              Injected failure: {{ event.result.fault.replaceAll('_', ' ') }}. The model must
              respond using the tools it has.
            </p>
            <template v-if="event?.kind === 'tool'"
              ><h3>Requested action</h3>
              <pre>{{ pretty(event.arguments) }}</pre>
              <h3>Tool response</h3>
              <pre>{{ pretty({ data: event.result?.data, error: event.result?.error }) }}</pre>
            </template>
            <p v-else class="agent-message">{{ event?.text || scenario.description }}</p>
          </div>
        </section>
      </div>
      <section v-if="run.bundle.trials.length" class="live-outcomes">
        <h2>Did the task actually succeed?</h2>
        <p class="table-note">
          The grader checks reservations and constraints independently of the model's final answer.
          One pair illustrates behavior; it does not establish a ranking.
        </p>
        <ul>
          <li v-for="trial in run.bundle.trials" :key="trial.id">
            <span
              >{{ trial.agent }} ·
              {{
                trial.scenario_id.endsWith('-fault') ? 'Failure condition' : 'Clean control'
              }}</span
            ><strong
              :class="[
                'outcome',
                trial.status === 'completed' && trial.grade.success ? 'passed' : 'failed',
              ]"
              >{{ outcome(trial) }}</strong
            ><span
              >{{ trial.tool_calls }} calls · {{ trial.invalid_actions }} invalid attempts ·
              {{ money(trial.estimated_cost_usd) }}</span
            >
          </li>
        </ul>
      </section>
      <div v-if="!running" class="live-actions">
        <button class="button" :disabled="!run.bundle.trials.length" @click="compare">
          Open results in comparison <ArrowIcon /></button
        ><a class="text-link" :href="`/api/live/runs/${run.run_id}/download`" download
          >{{ run.recording_saved ? 'Download recording' : 'Download partial progress' }}
          <ArrowIcon
        /></a>
      </div>
      <p v-if="!running && run.recording_saved" class="table-note">
        Saved locally as <code>artifacts/local/{{ run.run_id }}.json</code>. Publish the complete
        recording when ready; nothing is uploaded automatically.
      </p>
    </template>
  </template>
</template>
