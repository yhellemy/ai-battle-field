import { Provider } from "@prisma/client";
import { Ollama } from "@langchain/ollama";

export function getModel(providerModel: ModelProvider) {
  let llm;

  if (providerModel.provider === Provider.ollama) {
    llm = new Ollama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: providerModel.model,
    });
  } else if(llm === undefined) {
    throw new Error('invalid provider')
  }

  return llm
}