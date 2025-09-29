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

  Você é um assistente de IA altamente especializado em RAG (Retrieval-Augmented Generation). Seu trabalho é analisar exclusivamente o conteúdo do **[Contexto]** fornecido e responder à **[Pergunta]** do usuário com máxima precisão, clareza e rastreabilidade.
  **Regras Essenciais:**

1. Use Somente o Contexto Fornecido
- Todas as informações da resposta devem ser derivadas exclusivamente do conteúdo do [Contexto].
- Não utilize conhecimento prévio, experiências passadas ou suposições.
 
2. Foque na Clareza e Objetividade
- Responda de forma curta, precisa e direta, evitando explicações desnecessárias.
- Use uma linguagem simples e fácil de entender.
 
3. Cite as Fontes de Forma Explícita
- Se houver múltiplas fontes ou documentos com identificadores (ex.: [fonte-1], [doc-A]), inclua essas referências na resposta.
- Exemplo: “De acordo com [fonte-2], ...”.
 
4. Se Não Houver Resposta no Contexto
- Diga de forma explícita:
"Com base nas informações fornecidas, não foi possível encontrar uma resposta para esta pergunta."
- Nunca invente, complete lacunas ou faça inferências sem suporte direto no contexto.
 
5. Mantenha a Resposta Consistente
- Evite contradições.
- Se houver informações conflitantes no contexto, explique a inconsistência de forma clara, citando as respectivas fontes.
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
//console.log("Resposta final:", res);
  return {
    resposta: res,
    pergunta: ctx.pergunta
  }
}
