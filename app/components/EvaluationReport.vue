<script setup lang="ts">
import type { TrialAssessment } from '../generated/evaluation'
import { verdictLabels } from '../utils/evaluations'
defineProps<{ assessment?: TrialAssessment | null }>()
defineEmits<{ inspect: [sequence: number] }>()
</script>

<template>
  <section class="evaluation-report" aria-label="Evaluation report">
    <div class="section-heading">
      <div>
        <h2>More than a successful booking.</h2>
      </div>
    </div>
    <p class="table-note">
      A good final result can still include mistakes. Each check tells a separate part of the story.
    </p>
    <p v-if="!assessment" class="notice">
      Expanded checks were not recorded for this attempt. Its original booking grade and actions are
      still available.
    </p>
    <div v-else class="check-list">
      <article v-for="check in assessment.checks" :key="check.id" class="check-row">
        <div>
          <h3>{{ check.title }}</h3>
          <p>{{ check.detail }}</p>
          <div v-if="check.evidence_sequences.length" class="check-evidence">
            <button
              v-for="sequence in [...new Set(check.evidence_sequences)]"
              :key="sequence"
              type="button"
              class="text-link"
              :data-sequence="sequence"
              @click="$emit('inspect', sequence)"
            >
              See step {{ sequence + 1 }}
            </button>
          </div>
        </div>
        <span :class="['check-verdict', `verdict-${check.verdict}`]">{{
          verdictLabels[check.verdict]
        }}</span>
      </article>
    </div>
  </section>
</template>
