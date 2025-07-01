// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  runtimeConfig: {
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
  },
  modules: ['@nuxt/ui', '@nuxt/fonts'],
  css: ['./assets/css/main.css'],
})