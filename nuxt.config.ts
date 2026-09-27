import { resolve } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-26',
  devtools: { enabled: false },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'Observatory — Agent Reliability Lab',
      meta: [
        {
          name: 'description',
          content:
            'A small, transparent testbed for understanding how agents recover when tools fail.',
        },
      ],
      htmlAttrs: { lang: 'en' },
    },
  },
  css: ['~/assets/main.css'],
  typescript: { strict: true },
  nitro: {
    ...(process.env.OBSERVATORY_LOCAL_BUILD === '1'
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
