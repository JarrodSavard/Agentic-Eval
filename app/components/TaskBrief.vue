<script setup lang="ts">
import type { Scenario } from '~/generated/evaluation'
import { featureLabel, rentalDay } from '~/utils/rental'
defineProps<{ scenario: Scenario }>()
const failures: Record<string, string> = {
  car_unavailable:
    'The Blue SUV becomes unavailable just after the AI checks the cars. Can it find another suitable car?',
  transient_read:
    'The booking site returns an error the first time the AI checks the cars. Can it try again and finish?',
  committed_timeout:
    'The booking goes through, but its confirmation never arrives. Can the AI check without booking twice?',
}
</script>
<template>
  <section class="task-brief" aria-label="The assignment">
    <div>
      <span class="eyebrow">The customer asks</span>
      <h2 v-if="scenario.requests.length === 1">A car for {{ scenario.requests[0]!.customer }}.</h2>
      <h2 v-else>Find a car for each customer.</h2>
      <ul>
        <li v-for="request in scenario.requests" :key="request.id">
          {{ request.customer }} is planning {{ request.trip }}. They need a
          <strong>{{ featureLabel(request.required_feature) }}</strong> on
          <strong>{{ request.allowed_days.map(rentalDay).join(' or ') }}</strong
          >.
        </li>
      </ul>
      <p>
        Book one car per trip. Keep existing bookings safe. Never book the same car twice on the
        same day.
      </p>
    </div>
    <div class="task-condition">
      <span class="eyebrow">{{
        scenario.variant === 'fault' ? 'What goes wrong' : 'Nothing goes wrong'
      }}</span>
      <p>
        {{
          scenario.variant === 'fault'
            ? failures[scenario.family]
            : 'The booking site works normally. We use this run to see how the AI handles the same request without a problem.'
        }}
      </p>
      <small
        >Made-up customers and cars. Each rental lasts one day, in October 2026. No real bookings or
        payments.</small
      >
    </div>
  </section>
</template>
