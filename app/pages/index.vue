<script setup lang="ts">
import type { TrialResult } from '~/generated/evaluation'
const evaluation = useEvaluation()
const example = ref<TrialResult | null>(null)
onMounted(async () => {
  await evaluation.load()
  const candidate =
    evaluation.data.value?.trials.find(
      (t) =>
        t.scenario_id === 'instrument_unavailable-01-fault' && t.model === 'scripted-recovery-v1',
    ) || evaluation.data.value?.trials[0]
  if (candidate) {
    try {
      example.value = await evaluation.trial(candidate.id)
    } catch {
      /* summary remains usable */
    }
  }
})
const scenario = computed(() =>
  evaluation.data.value?.scenarios.find((s) => s.id === example.value?.scenario_id),
)
const liveCount = computed(
  () =>
    evaluation.data.value?.trials.filter((t) => t.source === 'live' && t.status !== 'not_run')
      .length || 0,
)
</script>

<template>
  <section class="intro">
    <div class="intro-copy">
      <h1>When the<br />plan breaks.</h1>
      <p class="lead">
        An agent’s answer is only part of the story. See what it actually does when a tool fails, a
        resource disappears, or success looks like a timeout.
      </p>
      <div class="intro-actions">
        <NuxtLink class="button" to="/compare">Explore the comparison <ArrowIcon /></NuxtLink
        ><NuxtLink class="text-link" to="/replay">Open a replay <ArrowIcon /></NuxtLink>
      </div>
      <p class="intro-note">
        A small observatory. A controlled experiment.<br />
        Every action available for inspection.
      </p>
    </div>
    <div class="intro-evidence">
      <div class="evidence-title">
        <span class="status-dot"></span
        ><span>{{
          example?.source === 'live' ? 'Recorded model run' : 'Scripted demonstration'
        }}</span
        ><span class="badge">{{
          scenario?.variant === 'fault' ? 'Fault injected' : 'Baseline'
        }}</span>
      </div>
      <div class="evidence-body">
        <h2>{{ scenario?.title.split(' / ')[0] || 'Change of plans' }}</h2>
        <p>
          {{
            scenario?.description || 'An instrument becomes unavailable. The task stays the same.'
          }}
        </p>
        <StateBoard
          v-if="example && scenario"
          :state="example.final_state"
          :requests="scenario.requests"
        />
        <div v-else class="loading-board">Loading the recorded observation board…</div>
        <div class="evidence-outcome">
          <span class="outcome-mark">{{
            example?.grade.success ? 'Task achieved' : 'Inspect the outcome'
          }}</span
          ><span v-if="example">{{ example.tool_calls }} tool calls · full trace available</span>
        </div>
      </div>
      <NuxtLink
        class="evidence-link"
        :to="{ path: '/replay', query: example ? { trial: example.id } : {} }"
        >Follow the recovery <ArrowIcon
      /></NuxtLink>
    </div>
  </section>
  <section class="experiment-strip" aria-label="Experiment scope">
    <p><strong>24</strong> controlled scenarios</p>
    <p><strong>3</strong> kinds of failure</p>
    <p>
      <strong>{{ liveCount }}</strong> recorded model attempts
    </p>
    <p><strong>$0</strong> to explore this demo</p>
  </section>
  <section class="section split-section">
    <div>
      <h2>
        A good outcome<br />
        needs evidence.
      </h2>
      <p class="muted">The observatory is fictional. The engineering questions are familiar.</p>
    </div>
    <div class="explanation-list">
      <article>
        <h3>Same task. Different conditions.</h3>
        <p>
          Each task has a clean version and a failure version. Agents use the same tools and
          constraints to find a valid schedule.
        </p>
      </article>
      <article>
        <h3>Check the world, not the claim.</h3>
        <p>
          The grader examines actual reservations: correct instruments, valid windows, preserved
          bookings, and no duplicates.
        </p>
      </article>
      <article>
        <h3>Keep the sample in perspective.</h3>
        <p>
          Scripted policies demonstrate the harness. A few real model attempts illustrate behavior;
          they do not establish a winner.
        </p>
        <NuxtLink class="text-link" to="/methodology">Read the methodology <ArrowIcon /></NuxtLink>
      </article>
    </div>
  </section>
</template>
