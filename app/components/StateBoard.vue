<script setup lang="ts">
import { featureLabel, rentalDay } from '~/utils/rental'
import type { RentalState, RentalRequest } from '~/generated/evaluation'
const props = defineProps<{ state: RentalState; requests: RentalRequest[] }>()
const days = computed(() =>
  [
    ...new Set([
      ...props.state.bookings.map((b) => b.day),
      ...props.requests.flatMap((r) => r.allowed_days),
    ]),
  ].sort(),
)
const booking = (car: string, day: string) =>
  props.state.bookings.find((b) => b.car_id === car && b.day === day)
const requested = (id: string) => props.requests.some((r) => r.id === id)
const cellLabel = (car: string, day: string, available: boolean) => {
  const current = booking(car, day)
  return current
    ? props.requests.find((r) => r.id === current.request_id)?.customer || 'Booked'
    : available
      ? 'Free'
      : 'Unavailable'
}
</script>

<template>
  <div class="state-board">
    <div class="board-heading">
      <span>Car bookings</span><span class="muted">One-day rentals</span>
    </div>
    <div class="board-scroll">
      <table class="schedule-table">
        <caption class="sr-only">
          Car availability and bookings at this step
        </caption>
        <thead>
          <tr>
            <th scope="col">Car</th>
            <th v-for="day in days" :key="day" scope="col">
              {{ rentalDay(day) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="car in state.cars" :key="car.id">
            <th scope="row">
              <span class="car-name"
                >{{ car.name.split(' / ')[0]
                }}<span
                  :class="['availability', { unavailable: !car.available }]"
                  :aria-label="car.available ? 'Available' : 'Unavailable'"
                ></span></span
              ><span class="car-features">{{
                car.available ? car.features.map(featureLabel).join(' · ') : 'Unavailable'
              }}</span>
            </th>
            <td v-for="day in days" :key="day">
              <span
                :class="[
                  'day',
                  {
                    'day-booked': booking(car.id, day),
                    'day-new': booking(car.id, day) && requested(booking(car.id, day)!.request_id),
                    'day-unavailable': !car.available && !booking(car.id, day),
                  },
                ]"
                :title="cellLabel(car.id, day, car.available)"
                >{{ cellLabel(car.id, day, car.available) }}</span
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="board-legend">
      <span><i class="legend-existing"></i>Someone else's booking</span
      ><span><i class="legend-new"></i>Booked for this trip</span>
    </div>
  </div>
</template>
