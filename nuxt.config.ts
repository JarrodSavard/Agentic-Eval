import { resolve } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-26',
  devtools: { enabled: false },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'Road Test — AI booking challenge',
      meta: [
        {
          name: 'description',
          content:
            'Can AI book the right rental car when things go wrong? Watch its actions and compare the results.',
        },
      ],
      htmlAttrs: { lang: 'en' },
    },
  },
  css: ['~/assets/main.css'],
  typescript: { strict: true },
  nitro: {
    ...(process.env.ROADTEST_LOCAL_BUILD === '1'
      ? {
          output: {
            dir: resolve('.local-output'),
            publicDir: resolve('.local-output/public'),
            serverDir: resolve('.local-output/server'),
          },
        }
      : {}),
    prerender: { routes: ['/', '/compare', '/replay', '/scenarios', '/methodology', '/live'] },
  },
})
