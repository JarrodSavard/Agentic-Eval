<script setup lang="ts">
const props = defineProps<{ count: number; modelValue: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
const move = (value: number) =>
  emit('update:modelValue', Math.max(0, Math.min(props.count - 1, value)))
</script>

<template>
  <div class="replay-controls">
    <button
      class="icon-button"
      aria-label="Previous event"
      :disabled="modelValue <= 0"
      @click="move(modelValue - 1)"
    >
      <span aria-hidden="true">←</span>
    </button>
    <span data-testid="event-position" aria-live="polite"
      >{{ count ? modelValue + 1 : 0 }} of {{ count }}</span
    >
    <input
      aria-label="Replay event"
      type="range"
      min="0"
      :max="Math.max(0, count - 1)"
      :value="modelValue"
      :disabled="count === 0"
      @input="move(Number(($event.target as HTMLInputElement).value))"
    />
    <button
      class="icon-button"
      aria-label="Next event"
      :disabled="modelValue >= count - 1"
      @click="move(modelValue + 1)"
    >
      <span aria-hidden="true">→</span>
    </button>
  </div>
</template>
