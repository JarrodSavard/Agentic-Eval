import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

const fixture = JSON.parse(readFileSync('artifacts/test-data/bundle.json', 'utf8'))
const pair = fixture.trials.filter(
  (t: { model: string; scenario_id: string }) =>
    t.model === 'scripted-recovery-v1' && t.scenario_id.startsWith('car_unavailable-01'),
)

test('live screen explains local setup when no runner is available', async ({ page }) => {
  await page.route('**/api/live/bootstrap', (route) => route.fulfill({ status: 404, body: '{}' }))
  await page.goto('./live')
  await expect(page.getByRole('heading', { name: 'Let an AI book a car.' })).toBeVisible()
  await expect(page.getByText('pnpm live', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start live experiment' })).toHaveCount(0)
})

test('live screen shows incoming actions then opens completed evidence without another run', async ({
  page,
}) => {
  let phase = 0
  let starts = 0
  const snapshot = () => ({
    run_id: 'live-test',
    status: phase < 2 ? 'running' : 'completed',
    active_scenario_id: pair[1].scenario_id,
    active_agent: 'OpenAI / GPT-6 Luna',
    events: phase < 2 ? pair[1].events.slice(0, 1) : pair[1].events,
    bundle: { ...fixture, trials: phase < 2 ? [] : pair },
    recording_saved: phase >= 2,
    cancel_requested: false,
    error: null,
  })
  await page.route('**/api/live/**', async (route) => {
    const url = route.request().url()
    let data: unknown
    if (url.endsWith('/bootstrap'))
      data = {
        token: 'test-token',
        latest_run_id: null,
        scenarios: fixture.scenarios,
        profiles: [
          {
            id: 'openai-luna',
            label: 'OpenAI / GPT-6 Luna',
            model: 'gpt-6-luna',
            ready: true,
            reason: null,
          },
        ],
      }
    else if (route.request().method() === 'POST') {
      starts++
      expect(route.request().headers()['x-roadtest-token']).toBe('test-token')
      phase = 1
      data = snapshot()
    } else data = snapshot()
    await route.fulfill({ json: data })
  })
  await page.goto('./live')
  await page.getByRole('button', { name: 'Start live experiment' }).click()
  await expect(page.getByRole('heading', { name: 'The AI checks available cars' })).toBeVisible()
  await expect(page.getByText('Problem introduced', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Stop experiment' })).toBeEnabled()
  phase = 2
  await expect(page.getByRole('button', { name: 'Open results in comparison' })).toBeEnabled()
  await expect(page.getByRole('link', { name: 'Download recording' })).toBeVisible()
  await page.getByRole('button', { name: 'Open results in comparison' }).click()
  await expect(page.getByRole('table')).toBeVisible()
  expect(starts).toBe(1)
})

test('unknown usage remains visible instead of implying a free run', async ({ page }) => {
  const trial = {
    ...pair[0],
    usage_complete: false,
    reserved_cost_usd: 0.0042,
    status: 'provider_error',
  }
  await page.route('**/api/live/**', (route) =>
    route.fulfill({
      json: route.request().url().endsWith('/bootstrap')
        ? { token: 'test', latest_run_id: 'uncertain', profiles: [], scenarios: fixture.scenarios }
        : {
            run_id: 'uncertain',
            status: 'completed',
            active_scenario_id: trial.scenario_id,
            active_agent: 'Luna',
            events: trial.events,
            bundle: { ...fixture, trials: [trial] },
            cancel_requested: false,
            error: null,
            recording_saved: true,
          },
    }),
  )
  await page.goto('./live')
  await expect(page.getByText(/Usage is incomplete/)).toBeVisible()
  await expect(page.getByText(/\$0.0042 reserved/)).toBeVisible()
})
