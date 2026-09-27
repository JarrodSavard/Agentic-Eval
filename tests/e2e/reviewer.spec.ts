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
  await expect(page.getByRole('heading', { name: 'Watch the booking step by step.' })).toBeVisible()
  release()
  await expect(page.getByLabel('Next event')).toBeEnabled()
})

test('narrow screens keep source, outcomes and replay reachable without sideways scrolling', async ({
  page,
}) => {
  await page.goto('./')
  await expect(page.getByRole('link', { name: 'View source' })).toBeInViewport()
  await page.goto('./compare')
  await page.getByLabel('Problem type').selectOption('car_unavailable')
  await page.locator('.results-table tbody tr').first().scrollIntoViewIfNeeded()
  await expect(page.getByText('Booking completed', { exact: true }).first()).toBeInViewport()
  await expect(page.getByRole('link', { name: 'Replay trial' }).first()).toBeInViewport()
})

test('reviewer can understand the lab and inspect its evidence', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Can AI book the right car?' })).toBeVisible()
  await expect(page.getByText('Scripted example', { exact: true }).first()).toBeVisible()
  await page.getByRole('link', { name: 'Compare the AIs' }).click()
  await expect(page.getByRole('heading', { name: 'Which AI got the booking right?' })).toBeVisible()
  await page.getByLabel('Problem type').selectOption('car_unavailable')
  await page.getByLabel('Conditions').selectOption('fault')
  await expect(page.getByRole('table')).toBeVisible()
  await page.getByRole('link', { name: 'Replay trial' }).first().click()
  await expect(page.getByRole('heading', { name: 'Watch the booking step by step.' })).toBeVisible()
  await expect(page.getByLabel('Next event')).toBeEnabled()
  await expect(page.locator('.fault-notice')).toContainText('car unavailable')
  await expect(page.locator('.day-new')).toHaveCount(0)
  await page.getByLabel('Next event').click()
  await expect(page.getByTestId('event-position')).toContainText('2 of')
  await page.getByLabel('Replay event').focus()
  await page.keyboard.press('End')
  await expect(page.locator('.day-new')).toHaveCount(1)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Watch the booking step by step.' })).toBeVisible()
})

test('catalog exposes all scenarios and their actual model coverage', async ({ page }) => {
  await page.goto('./scenarios')
  await expect(
    page.getByRole('heading', { name: 'Everyday challenges. 48 test cases.' }),
  ).toBeVisible()
  await expect(page.getByTestId('scenario-row')).toHaveCount(48)
  await page.getByLabel('Situation').selectOption('fault')
  await expect(page.getByTestId('scenario-row')).toHaveCount(24)
})

test('local import stays local and invalid files are actionable', async ({ page }) => {
  await page.goto('./compare')
  const posts: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url())
  })
  await page.getByLabel('Open result file').setInputFiles('artifacts/test-data/bundle.json')
  await expect(page.getByRole('status')).toContainText('Loaded 96 trials locally')
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

test('replay explains the assignment and keeps technical evidence expandable', async ({ page }) => {
  await page.goto('./replay')
  await expect(page.getByRole('region', { name: 'The assignment' })).toContainText(
    'Keep existing bookings',
  )
  await expect(page.locator('.event-story')).toContainText('model has not seen')
  await expect(page.locator('.technical-details pre').first()).toBeHidden()
  await page.getByText('Technical details', { exact: true }).click()
  await expect(page.locator('.technical-details pre').first()).toBeVisible()
})

test('evaluation coverage explains missing evidence and replay checks link to actions', async ({
  page,
}) => {
  await page.goto('./evaluations')
  await expect(page.getByRole('heading', { name: 'What are we testing?' })).toBeVisible()
  await expect(page.getByText('Not enough repeated runs', { exact: false }).first()).toBeVisible()
  await page.goto('./replay')
  const report = page.getByRole('region', { name: 'Evaluation report' })
  await expect(report).toContainText('The final receipt matches reality')
  await report.getByRole('button').first().click()
  await expect(page.getByLabel('Replay event')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  )
})

test('imported checks keep a provenance warning on evaluations and replay', async ({ page }) => {
  await page.goto('./evaluations')
  await page.getByLabel('Open result file').setInputFiles('artifacts/test-data/bundle.json')
  await expect(page.getByRole('note')).toContainText('Format validated only')
  await page.getByRole('link', { name: 'Replay', exact: true }).click()
  await expect(page.getByRole('note')).toContainText('have not been independently verified')
})
