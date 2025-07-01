import { Provider } from "@prisma/client"

export type AplicacaoTesteContract<T, Y> = (id: number, ctx: T) => Promise<Y>

export type ModelProvider = {
  provider: Provider
  model: string
}