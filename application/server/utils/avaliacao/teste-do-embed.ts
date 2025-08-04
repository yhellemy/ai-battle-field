import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from 'zod';

export type TesteDoEmbedContract = AplicacaoTesteContract<TesteDoEmbedQuestion, TesteDoEmbedOutput>

export async function testeDoEmbed(modelProvider: ModelProvider, ctx: TesteDoEmbedQuestion): Promise<TesteDoEmbedOutput>{
  const llm = getModel(modelProvider)

  const index = useUpstashIndex()

  const results = await index.query({
    data: ctx.pergunta,
    topK: 10,
    includeMetadata: true,
    includeData: true,
  })

  const rag = `"""${results.map(result => `${result.metadata?.title}:\n${result.data}\n`).join('---\n')}"""`

  const system = `
  **Instruções para o Modelo:**

  Você é um assistente de IA especializado em responder perguntas com base em um conjunto específico de documentos fornecidos. Sua tarefa é analisar o **[Contexto]** abaixo e usar apenas as informações contidas nele para responder à **[Pergunta]** do usuário.

  **Regras Essenciais:**

  1.  **Baseie-se Exclusivamente no Contexto:** Sua resposta deve ser derivada *diretamente* das informações encontradas no **[Contexto]**. Não utilize nenhum conhecimento prévio ou informações externas.
  2.  **Seja Direto e Conciso:** Responda à pergunta de forma clara e objetiva, focando nos fatos relevantes apresentados nos documentos.
  3.  **Cite Suas Fontes:** Se o contexto contiver múltiplos documentos ou fontes com identificadores (ex: [fonte-1], [documento-A]), mencione qual fonte você usou para formular sua resposta.
  4.  **Resposta Incompleta ou Ausente:** Se as informações no **[Contexto]** não forem suficientes para responder à pergunta de forma completa e precisa, declare explicitamente: "Com base nas informações fornecidas, não foi possível encontrar uma resposta para esta pergunta." Não tente inferir ou adivinhar a resposta.

  ---

  **[Contexto]**

  \`\`\`
  {rag}
  \`\`\``

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", system],
    ["human", `
    **[Pergunta]**
    \`\`\`
    [{pergunta}]
    \`\`\``],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  const chain = RunnableSequence.from([
    {
      pergunta: () => ctx.pergunta,
      rag: () => rag
    },
    promptTemplate,
    llm,
    new StringOutputParser(),
  ]);

  const res = await chain.invoke({})

  return {
    resposta: res,
    pergunta: ctx.pergunta
  }
}
