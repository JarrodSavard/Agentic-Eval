<script setup lang="ts">
import { featuredTrial, outcome } from '~/utils/results'
import type { TrialResult } from '~/generated/evaluation'
const evaluation = useEvaluation()
const example = ref<TrialResult | null>(null)
onMounted(async () => {
  await evaluation.load()
  const candidate = featuredTrial(evaluation.data.value?.trials || [])
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
      <h1>Can AI book<br />the right car?</h1>
      <p class="lead">
        Ask an AI to book a rental car. Then make the website fail, take a car out of service, or
        lose the confirmation. Watch whether it still gets the customer a suitable car.
      </p>
      <div class="intro-actions">
        <NuxtLink class="button" to="/compare">Compare the AIs <ArrowIcon /></NuxtLink
        ><NuxtLink class="text-link" to="/replay">Watch a booking <ArrowIcon /></NuxtLink>
      </div>
      <p class="intro-note">
        No real cars. No real bookings.<br />
        Just a clear way to see how an AI handles a problem.
      </p>
    </div>
    <div class="intro-evidence">
      <div class="evidence-title">
        <span class="status-dot"></span
        ><span>{{ example?.source === 'live' ? 'Real AI recording' : 'Scripted example' }}</span
        ><span class="badge">{{
          scenario?.variant === 'fault' ? 'Problem introduced' : 'Baseline'
        }}</span>
      </div>
      <div class="evidence-body">
        <h2>{{ scenario?.title.split(' / ')[0] || 'The car is no longer available' }}</h2>
        <p>
          {{
            scenario?.description ||
            'The preferred car becomes unavailable. The customer still needs a ride.'
          }}
        </p>
        <StateBoard
          v-if="example && scenario"
          :state="example.final_state"
          :requests="scenario.requests"
        />
        <div v-else class="loading-board">Loading the car bookings…</div>
        <div class="evidence-outcome">
          <span class="outcome-mark">{{ example ? outcome(example) : 'Inspect the outcome' }}</span
          ><span v-if="example">{{ example.tool_calls }} actions · watch every step</span>
        </div>
      </div>
      <NuxtLink
        class="evidence-link"
        :to="{ path: '/replay', query: example ? { trial: example.id } : {} }"
        >See what happened <ArrowIcon
      /></NuxtLink>
    </div>
  </section>
  <section class="experiment-strip" aria-label="Experiment scope">
    <p>
      <strong>{{ evaluation.data.value?.scenarios.length || 48 }}</strong> test cases
    </p>
    <p>
      <strong>{{
        new Set(evaluation.data.value?.scenarios.map((s) => s.family) || []).size || 6
      }}</strong>
      everyday challenges
    </p>
    <p>
      <strong>{{ liveCount }}</strong> real AI attempts
    </p>
    <p><strong>$0</strong> to explore this demo</p>
  </section>
  <section class="section split-section">
    <div>
      <h2>
        Saying “booked”<br />
        is not enough.
      </h2>
      <p class="muted">We check the booking itself, not just the AI’s final message.</p>
    </div>
    <div class="explanation-list">
      <article>
        <h3>Same trip. Different problems.</h3>
        <p>
          Each AI gets the same customer request twice: once when everything works, and once when
          something goes wrong.
        </p>
      </article>
      <article>
        <h3>Did the customer get the right car?</h3>
        <p>
          A separate checker looks for the right car features, an allowed date, no double bookings,
          and no changes to another customer’s booking.
        </p>
      </article>
      <article>
        <h3>An example, not a winner.</h3>
        <p>
          These short runs show what happened in this example. They do not prove that one AI is
          always better.
        </p>
        <NuxtLink class="text-link" to="/evaluations">See every evaluation <ArrowIcon /></NuxtLink>
      </article>
    </div>
  </section>
</template>
