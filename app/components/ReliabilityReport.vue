<script setup lang="ts">
import type { SummaryIndex, TrialSummary } from '../utils/results'
import { reliabilityGroups } from '../utils/evaluations'
const props = defineProps<{ bundle: SummaryIndex; trials: TrialSummary[] }>()
const k = ref(2)
const rows = computed(() => reliabilityGroups(props.bundle, props.trials, k.value))
const enough = computed(() => rows.value.some((r) => r.every !== null))
const percent = (v: number | null) => (v === null ? 'Not enough runs' : `${Math.round(v * 100)}%`)
</script>
<template>
  <section class="reliability-report" aria-label="Repeated-run reliability">
    <h2>Would it work again?</h2>
    <p>
      A single success is an example. Repeat the same task with the same settings to see how
      consistent it is.
    </p>
    <label class="repeat-picker"
      >Attempts to consider<select v-model.number="k">
        <option :value="2">2 attempts</option>
        <option :value="3">3 attempts</option>
        <option :value="5">5 attempts</option>
      </select></label
    >
    <p v-if="!enough" class="notice">
      Not enough repeated runs to estimate consistency. Choose repetitions in the local Live page.
      Different tasks are not repetitions of the same task.
    </p>
    <details v-if="rows.length" :open="enough">
      <summary>Repeated-run details · {{ rows.length }} matching groups</summary>
      <div class="table-scroll">
        <table class="reliability-table">
          <caption>
            Outcome estimates for
            {{
              k
            }}
            attempts, grouped by matching task, model, settings and source.
          </caption>
          <thead>
            <tr>
              <th>Task / AI</th>
              <th>Recorded outcomes</th>
              <th>
                At least one succeeds <small>pass@{{ k }}</small>
              </th>
              <th>
                Every attempt succeeds <small>pass^{{ k }}</small>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.key">
              <td>
                {{ bundle.scenarios.find((s) => s.id === row.scenarioId)?.title
                }}<span class="cell-detail"
                  >{{ row.agent }} · {{ row.source === 'live' ? 'Real AI' : 'Scripted example' }} ·
                  {{
                    row.scenarioId.endsWith('-fault') ? 'With a challenge' : 'Normal conditions'
                  }}</span
                >
              </td>
              <td>
                {{ row.successes }} / {{ row.attempts }} successful<span class="cell-detail"
                  >{{ row.incomplete }} incomplete</span
                >
              </td>
              <td>{{ row.unresolved ? 'Withheld' : percent(row.atLeast) }}</td>
              <td>
                {{ row.unresolved ? 'Withheld' : percent(row.every)
                }}<small v-if="row.unresolved"
                  >{{ row.unresolved }} attempt(s) with no confirmed model version</small
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
    <p class="table-note">
      These are estimates from the recorded outcomes, not guarantees. Interrupted and not-run
      attempts remain unsuccessful in the counts. Unknown returned model versions stay separate and
      withhold estimates for the matching requested configuration. Scripted consistency does not
      measure real AI reliability.
    </p>
  </section>
</template>
