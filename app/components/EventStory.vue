<script setup lang="ts">
import type { TraceEvent } from '~/generated/evaluation'
import { explainEvent } from '~/utils/story'
const props = defineProps<{ event: TraceEvent }>()
const story = computed(() => explainEvent(props.event))
</script>
<template>
  <div class="event-story" aria-live="polite">
    <span class="eyebrow">What this means</span>
    <h3>{{ story.title }}</h3>
    <p>{{ story.detail }}</p>
  </div>
</template>
