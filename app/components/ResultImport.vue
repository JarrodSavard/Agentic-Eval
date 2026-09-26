<script setup lang="ts">
import { MAX_IMPORT_BYTES } from '~/utils/import'
const evaluation = useEvaluation()
const error = ref('')
const message = ref('')
async function select(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  message.value = ''
  try {
    if (file.size > MAX_IMPORT_BYTES) throw new Error('Result files must be smaller than 5 MB.')
    evaluation.open(await file.text())
    message.value = `Loaded ${evaluation.imported.value?.trials.length} trials locally. Nothing was uploaded.`
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to read this file.'
  }
  input.value = ''
}
function reset() {
  evaluation.reset()
  message.value = 'Showing the published experiment.'
  error.value = ''
}
</script>

<template>
  <div class="result-import">
    <div class="import-actions">
      <label class="button button-secondary file-button"
        >Open result file<input
          aria-label="Open result file"
          type="file"
          accept=".json,application/json"
          @change="select"
      /></label>
      <button v-if="evaluation.imported.value" class="text-button" @click="reset">
        Return to published results
      </button>
    </div>
    <p v-if="message" role="status" class="import-message">{{ message }}</p>
    <p v-if="error" role="alert" class="error-message">{{ error }}</p>
  </div>
</template>
