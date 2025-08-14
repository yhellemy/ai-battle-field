import { Provider } from "@prisma/client"

export const PROVIDERS = {
  OLLAMA: Provider.ollama,
  GEMINI: 'gemini',
  OPENAI: 'openai',
  AZURE_OPENAI: 'ao'
} as const