<script setup lang="ts">
import type { ObservatoryState, ObservationRequest } from '~/generated/evaluation'
const props = defineProps<{ state: ObservatoryState; requests: ObservationRequest[] }>()
const slots = computed(() =>
  [...new Set([0, ...props.requests.flatMap((r) => r.allowed_slots)])].sort((a, b) => a - b),
)
const booking = (instrument: string, slot: number) =>
  props.state.reservations.find((b) => b.instrument_id === instrument && b.slot === slot)
const requested = (id: string) => props.requests.some((r) => r.id === id)
</script>

<template>
  <div class="state-board">
    <div class="board-heading">
      <span>Observation board</span><span class="muted">Discrete time slots</span>
    </div>
    <div class="board-scroll">
      <table class="schedule-table">
        <caption class="sr-only">
          Instrument availability and reservations at this step
        </caption>
        <thead>
          <tr>
            <th scope="col">Instrument</th>
            <th v-for="slot in slots" :key="slot" scope="col">
              {{ String(slot).padStart(2, '0') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="instrument in state.instruments" :key="instrument.id">
            <th scope="row">
              <span class="instrument-name"
                >{{ instrument.name.split(' / ')[0]
                }}<span
                  :class="['availability', { unavailable: !instrument.available }]"
                  :aria-label="instrument.available ? 'Available' : 'Unavailable'"
                ></span></span
              ><span class="instrument-band">{{
                instrument.available ? instrument.bands.join(' / ') : 'Unavailable'
              }}</span>
            </th>
            <td v-for="slot in slots" :key="slot">
              <span
                :class="[
                  'slot',
                  {
                    'slot-booked': booking(instrument.id, slot),
                    'slot-new':
                      booking(instrument.id, slot) &&
                      requested(booking(instrument.id, slot)!.request_id),
                    'slot-unavailable': !instrument.available && !booking(instrument.id, slot),
                  },
                ]"
                :title="
                  booking(instrument.id, slot)?.request_id ||
                  (instrument.available ? 'Open slot' : 'Unavailable')
                "
                ><span class="sr-only">{{
                  booking(instrument.id, slot)?.request_id ||
                  (instrument.available ? 'Open' : 'Unavailable')
                }}</span></span
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="board-legend">
      <span><i class="legend-existing"></i>Existing booking</span
      ><span><i class="legend-new"></i>Requested observation</span>
    </div>
  </div>
</template>
