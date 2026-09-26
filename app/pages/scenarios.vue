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
      <h1>A small world.<br />Twenty-four ways through.</h1>
      <p class="lead">
        Twelve tasks, paired with clean and failure conditions. Every rule is explicit.
      </p>
    </div>
  </section>
  <div class="family-descriptions">
    <article>
      <h2>Lost signal</h2>
      <p>The first inspection fails. Can the agent recover its view of the world?</p>
    </article>
    <article>
      <h2>Change of plans</h2>
      <p>Aurora goes offline after inspection. A valid alternative is still available.</p>
    </article>
    <article>
      <h2>An uncertain success</h2>
      <p>
        The reservation commits, but its response times out. A safe retry should not duplicate it.
      </p>
    </article>
  </div>
  <div class="catalog-heading">
    <h2>
      Scenario catalog <span class="muted">/ {{ scenarios.length }}</span>
    </h2>
    <label
      >Scenario variant<select v-model="variant">
        <option value="">All conditions</option>
        <option value="clean">Clean controls</option>
        <option value="fault">Failure variants</option>
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
              : `Clean control for ${familyLabels[scenario.family]?.toLowerCase()}. No fault is injected.`
          }}
        </p>
      </div>
      <div class="scenario-detail">
        <span
          >{{ scenario.requests.length }} requested observation{{
            scenario.requests.length > 1 ? 's' : ''
          }}</span
        ><span
          >{{ coverage(scenario.id) }} recorded model attempt{{
            coverage(scenario.id) !== 1 ? 's' : ''
          }}</span
        ><span class="muted">{{ scenario.id }}</span>
      </div>
    </article>
  </div>
</template>
