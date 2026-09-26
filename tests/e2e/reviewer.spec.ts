import { test, expect } from '@playwright/test'
import { resolve } from 'node:path'

test.beforeEach(async ({ page }) => {
  await page.route(/\/data\/(index\.json|traces\/trial-\d+\.json)$/, async (route) => {
    const path = new URL(route.request().url()).pathname.split('/data/')[1]!
    await route.fulfill({
      path: resolve('artifacts/test-data', path),
      contentType: 'application/json',
    })
  })
})

test('replay initializes when navigation happens before the dataset arrives', async ({ page }) => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/data/index.json', async (route) => {
    await pending
    await route.fallback()
  })
  await page.goto('./')
  await page.getByRole('link', { name: 'Replay', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Every action leaves evidence.' })).toBeVisible()
  release()
  await expect(page.getByLabel('Next event')).toBeEnabled()
})

test('narrow screens keep source, outcomes and replay reachable without sideways scrolling', async ({
  page,
}) => {
  await page.goto('./')
  await expect(page.getByRole('link', { name: 'View source' })).toBeInViewport()
  await page.goto('./compare')
  await page.getByLabel('Failure family').selectOption('instrument_unavailable')
  await page.locator('.results-table tbody tr').first().scrollIntoViewIfNeeded()
  await expect(page.getByText('Task achieved', { exact: true }).first()).toBeInViewport()
  await expect(page.getByRole('link', { name: 'Replay trial' }).first()).toBeInViewport()
})

test('reviewer can understand the lab and inspect its evidence', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'When the plan breaks.' })).toBeVisible()
  await expect(page.getByText('Scripted demonstration', { exact: true }).first()).toBeVisible()
  await page.getByRole('link', { name: 'Explore the comparison' }).click()
  await expect(page.getByRole('heading', { name: 'Compare behavior, not promises.' })).toBeVisible()
  await page.getByLabel('Failure family').selectOption('instrument_unavailable')
  await page.getByLabel('Conditions').selectOption('fault')
  await expect(page.getByRole('table')).toBeVisible()
  await page.getByRole('link', { name: 'Replay trial' }).first().click()
  await expect(page.getByRole('heading', { name: 'Every action leaves evidence.' })).toBeVisible()
  await expect(page.getByLabel('Next event')).toBeEnabled()
  await expect(page.locator('.fault-notice')).toContainText('instrument unavailable')
  await expect(page.locator('.slot-new')).toHaveCount(0)
  await page.getByLabel('Next event').click()
  await expect(page.getByTestId('event-position')).toContainText('2 of')
  await page.getByLabel('Replay event').focus()
  await page.keyboard.press('End')
  await expect(page.locator('.slot-new')).toHaveCount(1)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Every action leaves evidence.' })).toBeVisible()
})

test('catalog exposes all scenarios and their actual model coverage', async ({ page }) => {
  await page.goto('./scenarios')
  await expect(
    page.getByRole('heading', { name: 'A small world. Twenty-four ways through.' }),
  ).toBeVisible()
  await expect(page.getByTestId('scenario-row')).toHaveCount(24)
  await page.getByLabel('Scenario variant').selectOption('fault')
  await expect(page.getByTestId('scenario-row')).toHaveCount(12)
})

test('local import stays local and invalid files are actionable', async ({ page }) => {
  await page.goto('./compare')
  const posts: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url())
  })
  await page.getByLabel('Open result file').setInputFiles('artifacts/test-data/bundle.json')
  await expect(page.getByRole('status')).toContainText('Loaded 48 trials locally')
  expect(posts).toEqual([])
  await page.getByLabel('Open result file').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"schema_version":"9"}'),
  })
  await expect(page.getByRole('alert')).toContainText('version')
  await expect(page.getByRole('table')).toBeVisible()
})

test('navigation and replay are keyboard accessible without horizontal page overflow', async ({
  page,
}) => {
  await page.goto('./replay')
  await expect(page.getByLabel('Next event')).toBeEnabled()
  await page.getByLabel('Next event').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('event-position')).toContainText('2 of')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(overflow).toBe(false)
})
