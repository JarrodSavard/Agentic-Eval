import type { EvaluationBundle, TrialResult } from '~/generated/evaluation'
import type { SummaryIndex } from '~/utils/results'
import { parseBundle } from '~/utils/import'

const pendingLoads = new WeakMap<object, Promise<void>>()

export function useEvaluation() {
  const app = useNuxtApp()
  const index = useState<SummaryIndex | null>('evaluation-index', () => null)
  const imported = useState<EvaluationBundle | null>('evaluation-import', () => null)
  const loadError = useState('evaluation-error', () => '')
  const loading = useState('evaluation-loading', () => false)
  const base = useRuntimeConfig().app.baseURL
  const data = computed<SummaryIndex | null>(() => imported.value || index.value)

  async function load() {
    if (index.value) return
    const pending = pendingLoads.get(app)
    if (pending) return pending
    const request = (async () => {
      loading.value = true
      loadError.value = ''
      try {
        index.value = await $fetch<SummaryIndex>(`${base}data/index.json`)
      } catch {
        loadError.value =
          'The recorded experiment could not be loaded. Try again or open a local result file.'
      } finally {
        loading.value = false
        pendingLoads.delete(app)
      }
    })()
    pendingLoads.set(app, request)
    return request
  }

  async function trial(id: string): Promise<TrialResult | null> {
    if (imported.value) return imported.value.trials.find((t) => t.id === id) || null
    const summary = index.value?.trials.find((t) => t.id === id)
    if (!summary?.trace_path || !/^traces\/trial-\d+\.json$/.test(summary.trace_path)) return null
    return await $fetch<TrialResult>(`${base}data/${summary.trace_path}`)
  }

  function open(text: string) {
    imported.value = parseBundle(text)
  }

  function reset() {
    imported.value = null
  }
  return { data, imported, loading, loadError, load, trial, open, reset }
}
