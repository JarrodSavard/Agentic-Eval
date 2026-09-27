<script setup lang="ts">
import type { Scenario } from '~/generated/evaluation'
defineProps<{ scenario: Scenario }>()
const failures: Record<string, string> = {
  instrument_unavailable: 'An instrument goes offline after the model first checks the schedule.',
  transient_read: 'The first attempt to read the schedule temporarily fails.',
  committed_timeout:
    'A booking is saved, but the model receives a timeout instead of confirmation.',
}
</script>
<template>
  <section class="task-brief" aria-label="The assignment">
    <div>
      <span class="eyebrow">The assignment</span>
      <h2>Book the observations. Keep the schedule valid.</h2>
      <ul>
        <li v-for="request in scenario.requests" :key="request.id">
          {{ request.id }} needs a {{ request.band }} instrument in slot
          {{ request.allowed_slots.join(' or ') }}.
        </li>
      </ul>
      <p>Keep existing bookings, use available equipment, and never book the same request twice.</p>
    </div>
    <div class="task-condition">
      <span class="eyebrow">{{
        scenario.variant === 'fault' ? 'The complication' : 'The control'
      }}</span>
      <p>
        {{
          scenario.variant === 'fault'
            ? failures[scenario.family]
            : 'Nothing is deliberately broken. This establishes how the model handles the same task normally.'
        }}
      </p>
      <small
        >Fictional instruments and numbered time slots. Real model actions are checked against these
        rules.</small
      >
    </div>
  </section>
</template>
