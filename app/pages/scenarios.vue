<script setup lang="ts">
import { familyLabels } from '~/utils/results'
const evaluation = useEvaluation()
onMounted(evaluation.load)
const variant = ref('')
const scenarios = computed(() =>
  (evaluation.data.value?.scenarios || []).filter(
    (s) => !variant.value || s.variant === variant.value,
  ),
)
const coverage = (id: string) =>
  evaluation.data.value?.trials.filter(
    (t) => t.scenario_id === id && t.source === 'live' && t.status !== 'not_run',
  ).length || 0
</script>

<template>
  <section class="page-heading">
    <div>
      <h1>Three problems.<br />Twenty-four test cases.</h1>
      <p class="lead">
        Twelve rental tasks. Each is tried once normally and once with a booking problem.
      </p>
    </div>
  </section>
  <div class="family-descriptions">
    <article>
      <h2>The booking site is down</h2>
      <p>The site returns an error when the AI checks cars. Will it try again?</p>
    </article>
    <article>
      <h2>The car is no longer available</h2>
      <p>The Blue SUV becomes unavailable after the AI checks cars. Will it choose another?</p>
    </article>
    <article>
      <h2>The confirmation never arrives</h2>
      <p>
        The booking goes through, but the confirmation is lost. Will it check before booking twice?
      </p>
    </article>
  </div>
  <div class="catalog-heading">
    <h2>
      Test cases <span class="muted">/ {{ scenarios.length }}</span>
    </h2>
    <label
      >Situation<select v-model="variant">
        <option value="">All conditions</option>
        <option value="clean">No problems</option>
        <option value="fault">Runs with a problem</option>
      </select></label
    >
  </div>
  <p v-if="evaluation.loadError.value" role="alert">{{ evaluation.loadError.value }}</p>
  <div class="catalog">
    <article
      v-for="scenario in scenarios"
      :key="scenario.id"
      data-testid="scenario-row"
      class="scenario-row"
    >
      <div>
        <span class="badge">{{ scenario.variant === 'fault' ? 'Failure' : 'Clean' }}</span>
        <h3>{{ scenario.title }}</h3>
        <p>
          {{
            scenario.variant === 'fault'
              ? scenario.description
              : `No problem for ${familyLabels[scenario.family]?.toLowerCase()}. The booking site works normally.`
          }}
        </p>
      </div>
      <div class="scenario-detail">
        <span
          >{{ scenario.requests.length }} rental request{{
            scenario.requests.length > 1 ? 's' : ''
          }}</span
        ><span
          >{{ coverage(scenario.id) }} real AI attempt{{
            coverage(scenario.id) !== 1 ? 's' : ''
          }}</span
        ><span class="muted">{{ scenario.id }}</span>
      </div>
    </article>
  </div>
</template>
