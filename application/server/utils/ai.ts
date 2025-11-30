import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI, AzureChatOpenAI } from "@langchain/openai"
import { BaseMessage, MessageStructure, MessageType } from "@langchain/core/messages";
import { AIMessageChunk } from "langchain";

export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = new OllamaEmbeddings({
    model: "bge-m3",
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  });
  return await embeddings.embedQuery(text);
}

export function getModel(providerModel: { provider: typeof PROVIDERS.OLLAMA; model: string }): ChatOllama;

export function getModel(providerModel: { provider: typeof PROVIDERS.GEMINI; model: string }): ChatGoogleGenerativeAI;

export function getModel(providerModel: { provider: typeof PROVIDERS.OPENAI; model: string }): ChatOpenAI;

export function getModel(providerModel: { provider: typeof PROVIDERS.AZURE_OPENAI; model: string }): AzureChatOpenAI;

export function getModel(providerModel: ModelProvider): ChatOllama | ChatGoogleGenerativeAI | AzureChatOpenAI | ChatOpenAI;

export function getModel(providerModel: ModelProvider) {
  let llm;

  if (providerModel.provider === PROVIDERS.OLLAMA) {
    llm = new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: providerModel.model,
    });
  }
  else if (providerModel.provider === PROVIDERS.GEMINI) {
    llm = new ChatGoogleGenerativeAI({
      model: providerModel.model,
      apiKey: process.env.GEMINI_API_KEY
    })
  }
  else if (providerModel.provider === PROVIDERS.OPENAI) {
    llm = new ChatOpenAI({
      model: providerModel.model,
      apiKey: process.env.OPENAI_API_KEY
    })
  }
  else if (providerModel.provider === PROVIDERS.AZURE_OPENAI) {
    llm = new AzureChatOpenAI({
      model: providerModel.model,
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY!,
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME!,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION!,
      azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT!,
    })
  }
  else if (llm === undefined) {
    throw new Error('invalid provider')
  }

  return llm
}

interface UsageMetadata {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
}

export interface ModelMetadata {
  usage: UsageMetadata
}

export type WithModelMetadata<T extends Object> = T & { modelMetadata: ModelMetadata }

export function processModelResponseMetadata(res: BaseMessage<MessageStructure, MessageType>): ModelMetadata {
  let totalTokens = 0
  let inputTokens = 0
  let outputTokens = 0

  if ('lc_kwargs' in res) {
    if ('usage_metadata' in res.lc_kwargs) {
      const usage_metadata = res.lc_kwargs.usage_metadata
      if (usage_metadata?.total_tokens) {
        totalTokens = usage_metadata.total_tokens
      }
      if (usage_metadata?.input_tokens) {
        inputTokens = usage_metadata.input_tokens
      }
      if (usage_metadata?.output_tokens) {
        outputTokens = usage_metadata.output_tokens
      }
    }
  }

  return {
    usage: {
      totalTokens,
      inputTokens,
      outputTokens
    }
  }
}