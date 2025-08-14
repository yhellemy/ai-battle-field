import { Ollama } from "@langchain/ollama";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI, AzureChatOpenAI } from "@langchain/openai"
import { Index } from '@upstash/vector'

let _index: Index

export function useUpstashIndex() {
  if (!_index) {
    _index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    })
  }

  return _index
}

export function getModel(providerModel: { provider: typeof PROVIDERS.OLLAMA; model: string }): Ollama;

export function getModel(providerModel: { provider: typeof PROVIDERS.GEMINI; model: string }): ChatGoogleGenerativeAI;

export function getModel(providerModel: { provider: typeof PROVIDERS.OPENAI; model: string }): ChatOpenAI;

export function getModel(providerModel: { provider: typeof PROVIDERS.AZURE_OPENAI; model: string }): AzureChatOpenAI;

export function getModel(providerModel: ModelProvider): Ollama | ChatGoogleGenerativeAI;

export function getModel(providerModel: ModelProvider) {
  let llm;

  if (providerModel.provider === PROVIDERS.OLLAMA) {
    llm = new Ollama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: providerModel.model,
    });
  } 
  else if(providerModel.provider === PROVIDERS.GEMINI) {
    llm = new ChatGoogleGenerativeAI({
      model: providerModel.model,
      apiKey: process.env.GEMINI_API_KEY
    })
  }
  else if(providerModel.provider === PROVIDERS.OPENAI) {
    llm = new ChatOpenAI({
      model: providerModel.model,
      apiKey: process.env.OPENAI_API_KEY
    })
  }
  else if(providerModel.provider === PROVIDERS.AZURE_OPENAI) {
    llm = new AzureChatOpenAI({
      model: providerModel.model,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION
    })
  }
  else if(llm === undefined) {
    throw new Error('invalid provider')
  }

  return llm
}