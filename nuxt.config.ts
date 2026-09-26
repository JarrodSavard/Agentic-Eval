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
  nitro: { prerender: { routes: ['/', '/compare', '/replay', '/scenarios', '/methodology'] } },
})
