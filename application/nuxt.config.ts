// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    server: {
      allowedHosts: true
    },
  },
  compatibilityDate: '2025-05-15',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  runtimeConfig: {
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    AZURE_OPENAI_API_INSTANCE_NAME: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    AZURE_OPENAI_API_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION
  },
  modules: ['@nuxt/ui', '@nuxt/fonts'],
  css: ['./assets/css/main.css'],
})