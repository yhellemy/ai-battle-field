import { Provider } from "@prisma/client"

export const PROVIDERS = {
  OLLAMA: Provider.ollama,
  GEMINI: 'gemini'
} as const