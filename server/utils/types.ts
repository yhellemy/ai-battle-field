import { Provider } from "@prisma/client"

export type AplicacaoTesteContract<T, Y> = (id: number, ctx: T) => Promise<Y>

export type AvailableProviders = typeof PROVIDERS[keyof typeof PROVIDERS]

export type ModelProvider = {
  provider: AvailableProviders
  model: string
}