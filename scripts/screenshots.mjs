import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('output/playwright', { recursive: true })
const browser = await chromium.launch()
for (const [label, viewport] of [
  ['desktop', { width: 1440, height: 1040 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 })
  for (const route of ['home', 'replay', 'compare']) {
    await page.goto(`http://127.0.0.1:4173/Agentic-Eval/${route === 'home' ? '' : route}`)
    if (route === 'home') await page.locator('.schedule-table').waitFor()
    else if (route === 'replay') await page.getByLabel('Next event').waitFor()
    else await page.getByRole('table').waitFor()
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({
      path: `output/playwright/${label}-${route}.png`,
      fullPage: route !== 'compare',
    })
  }
  await page.close()
}
await browser.close()
