import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import z from "zod";

function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * Esquema Zod para avaliar a resposta de um modelo de IA
 * com base em um prompt de RAG (Retrieval Augmented Generation).
 */
export const AvaliacaoRespostaModeloSchema = z.object({
  // Detalhes do contexto original e da interação
  perguntaDoUsuario: z.string().describe("A pergunta original feita pelo usuário ao modelo."),
  respostaDoModelo: z.string().describe("A resposta gerada pelo modelo que está sendo avaliada."),

  // Critérios de Avaliação

  /**
   * 1. Baseou-se Exclusivamente no Contexto?
   * A resposta do modelo utiliza *apenas* as informações contidas no [Contexto] fornecido,
   * sem incorporar conhecimento prévio ou informações externas? [10]
   */
  exclusivamenteBaseadoNoContexto: z.boolean().describe("Indica se a resposta se baseou exclusivamente no contexto fornecido."),
  comentarioExclusivamenteBaseadoNoContexto: z.string().optional().nullable().describe("Comentários adicionais se a resposta não foi exclusivamente baseada no contexto (ex: informações externas identificadas)."),

  /**
   * 2. Foi Direto e Conciso?
   * A resposta é clara, objetiva e foca nos fatos relevantes apresentados no [Contexto],
   * sem prolixidade desnecessária? [2]
   */
  diretoEConciso: z.boolean().describe("Indica se a resposta foi direta e concisa."),
  comentarioDiretoEConciso: z.string().optional().nullable().describe("Comentários adicionais se a resposta não foi direta e concisa."),

  /**
   * 3. Citou Suas Fontes (se aplicável)?
   * Se o [Contexto] continha múltiplos documentos ou fontes com identificadores (ex: [fonte-1]),
   * a resposta do modelo mencionou qual fonte foi usada para formular a resposta?
   * (Se não houver identificadores de fonte no contexto, esta regra não se aplica.) [3, 4, 11]
   */
  citouFontes: z.enum(['Sim', 'Não', 'Não aplicável']).describe("Indica se o modelo citou suas fontes, se aplicável."),
  comentarioCitouFontes: z.string().optional().nullable().describe("Comentários adicionais se a citação de fontes foi inadequada ou ausente quando necessária."),

  /**
   * 4. Gerenciou Resposta Incompleta ou Ausente Corretamente?
   * Se as informações no [Contexto] não foram suficientes para responder à [Pergunta] de forma
   * completa e precisa, o modelo declarou explicitamente: "Com base nas informações fornecidas,
   * não foi possível encontrar uma resposta para esta pergunta."?
   */
  gerenciouRespostaIncompletaCorretamente: z.enum(['Sim', 'Não', 'Não aplicável']).describe("Indica se o modelo gerenciou corretamente a ausência de informações para a resposta."),
  comentarioGerenciouRespostaIncompletaCorretamente: z.string().optional().nullable().describe("Comentários adicionais se o gerenciamento da resposta incompleta foi incorreto (ex: tentou inferir ou adivinhar)."),

  /**
   * 5. Houve Alucinação ou Inferência Não Justificada?
   * A resposta contém informações que não podem ser verificadas *diretamente* no [Contexto]
   * fornecido (ou seja, o modelo "inventou" algo ou fez uma inferência sem suporte)?
   */
  alucinacaoOuInferenicaNaoJustificada: z.boolean().describe("Indica se a resposta contém alucinação ou inferência não justificada."),
  comentarioAlucinacaoOuInferenicaNaoJustificada: z.string().optional().nullable().describe("Comentários adicionais se houve alucinação ou inferência não justificada, com exemplos se possível."),

  /**
   * Pontuação Geral (Opcional):
   * Qualidade geral da resposta em uma escala de 1 a 5, onde 1 é "Muito Ruim" e 5 é "Excelente". Se o modelo alucinou, Zero (0). [7]
   */
  pontuacaoGeral: z.number().min(0).max(5).describe("Pontuação geral da resposta, de 1 (Muito Ruim) a 5 (Excelente). Se o modelo alucinou, Zero (0)."),

  /**
   * Comentários Finais do Avaliador:
   * Quaisquer observações adicionais sobre a conformidade da resposta com as instruções.
   */
  comentariosFinaisAvaliador: z.string().optional().nullable().describe("Comentários adicionais ou observações finais do avaliador."),
});

export async function testeDoEmbedEngine(output: TesteDoEmbedOutput, gabarito: TesteDoEmbedGabarito) {
  const llm = getModel({provider: PROVIDERS.AZURE_OPENAI, model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME!})
  if (!llm) throw new Error('invalid llm')
    
  const index = useUpstashIndex()

  const results = await index.query({
    data: output.resposta,
    topK: 10,
    includeMetadata: true,
    includeData: true,
  })

  const rag = `"""${results.map(result => `${result.metadata?.title}:\n${result.data}\n`).join('---\n')}"""`

  const system = `
  **Instruções para o Avaliador:**

  Você recebeu uma **[Pergunta]** do usuário, um **[Contexto]** e a **[Resposta do Modelo]** gerada com base nas instruções fornecidas. Sua tarefa é avaliar a qualidade da **[Resposta do Modelo]** em relação às regras estabelecidas.

  **[Contexto Original da Pergunta do Usuário]**
  \`\`\`
  {rag}
  \`\`\`

  **[Pergunta do Usuário]**
  {user_question}
  `
  const model = `
  **[Resposta do Modelo]**
  {model_response}
  `


  const structuredLlm = llm.withStructuredOutput(AvaliacaoRespostaModeloSchema)

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', system],
    ['human', model],
    ['placeholder', '{agent_scratchpad}'],
  ])

  const chain = prompt.pipe(structuredLlm)

  const res = await chain.invoke({
    pergunta: output.pergunta,
    rag,
    user_question: output.pergunta,
    model_response: output.resposta
  })

  console.log(res)

  //await delay(6000)


  return res.pontuacaoGeral
}