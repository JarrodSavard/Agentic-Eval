import type { LiveBootstrap, LiveSnapshot, StartRun } from '~/generated/live'

export function useLive() {
  const bootstrap = ref<LiveBootstrap | null>(null)
  const snapshot = ref<LiveSnapshot | null>(null)
  const connection = ref<'loading' | 'ready' | 'unavailable'>('loading')
  const error = ref('')
  const submitting = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let mounted = true

  const message = (cause: unknown) => {
    const detail = (cause as { data?: { detail?: unknown } })?.data?.detail
    return typeof detail === 'string'
      ? detail
      : 'The local runner could not be reached. Reconnect to inspect the existing run; do not start it again.'
  }

  function schedule() {
    if (timer) clearTimeout(timer)
    if (mounted && snapshot.value?.status === 'running') timer = setTimeout(poll, 500)
  }

  async function poll() {
    if (!snapshot.value) return
    try {
      const current = await $fetch<LiveSnapshot>(`/api/live/runs/${snapshot.value.run_id}`, {
        retry: 0,
      })
      if (!mounted) return
      snapshot.value = current
      error.value = ''
      schedule()
    } catch (cause) {
      if (mounted) error.value = message(cause)
    }
  }

  async function connect() {
    connection.value = 'loading'
    error.value = ''
    if (!['127.0.0.1', 'localhost'].includes(window.location.hostname)) {
      connection.value = 'unavailable'
      return
    }
    try {
      const config = await $fetch<LiveBootstrap>('/api/live/bootstrap', { retry: 0 })
      if (!mounted) return
      bootstrap.value = config
      connection.value = 'ready'
      if (config.latest_run_id) {
        snapshot.value = await $fetch<LiveSnapshot>(`/api/live/runs/${config.latest_run_id}`, {
          retry: 0,
        })
        schedule()
      }
    } catch {
      if (mounted) connection.value = 'unavailable'
    }
  }

  async function start(request: StartRun) {
    if (!bootstrap.value || submitting.value || snapshot.value?.status === 'running') return
    submitting.value = true
    error.value = ''
    try {
      snapshot.value = await $fetch<LiveSnapshot>('/api/live/runs', {
        method: 'POST',
        body: request,
        retry: 0,
        headers: { 'X-Observatory-Token': bootstrap.value.token },
      })
      schedule()
    } catch (cause) {
      error.value = message(cause)
    } finally {
      submitting.value = false
    }
  }

  async function stop() {
    if (!snapshot.value || !bootstrap.value) return
    try {
      snapshot.value = await $fetch<LiveSnapshot>(`/api/live/runs/${snapshot.value.run_id}/stop`, {
        method: 'POST',
        retry: 0,
        headers: { 'X-Observatory-Token': bootstrap.value.token },
      })
      schedule()
    } catch (cause) {
      error.value = message(cause)
    }
  }

  onMounted(connect)
  onBeforeUnmount(() => {
    mounted = false
    if (timer) clearTimeout(timer)
  })
  return { bootstrap, snapshot, connection, error, submitting, connect, start, stop }
}
