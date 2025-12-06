import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import z from "zod";
import { AvailableProviders } from "../types";

function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export const AvaliacaoRespostaModeloSchema = z.object({
 pontuacaoGeral: z.number().min(0).max(3).describe("Pontuação geral da resposta, onde 0 o modelo (Errou), 1 (Acertou), 2 (Não soube responder) e 3 (Alucinou)."),
});

export async function testeRaciocinioEngine(output: TesteRaciocinioOutput, gabarito: TesteRaciocinioGabarito) {
  const llm = getModel({provider: process.env.EMBED_TEST_PROVIDER! as "gemini", model: process.env.EMBED_TEST_MODEL!})
  if (!llm) throw new Error('invalid llm')
    




  const human = `
Você é um especialista em raciocínio lógico e sua tarefa é avaliar a qualidade da resposta fornecida por outro modelo de IA para um problema lógico. A resposta correta para comparação é fornecida no campo gabarito.

Analise a resposta do LLM com base nos seguintes critérios:

Correção da Resposta Final: A resposta na linha RESPOSTA: está logicamente correta? Compare-a com o valor no campo gabarito.

Correção do Passo a Passo: A linha de raciocínio está correta e levam logicamente à resposta final?

Conformidade com o Formato: A resposta segue estritamente as regras de formatação solicitadas (uma explicação passo a passo e a linha RESPOSTA: $RESPOSTA como a última linha)?

  **[QUESTION]**
  {pergunta}
  **[TEMPLATE]**
  {gabarito}
  **[ANSWER]**
  {resposta}
  `


  const structuredLlm = llm.withStructuredOutput(AvaliacaoRespostaModeloSchema)

  const prompt = ChatPromptTemplate.fromMessages([
    ['human', human],
    ['placeholder', '{agent_scratchpad}'],
  ])

  const chain = prompt.pipe(structuredLlm)

  const res = await chain.invoke({
    pergunta: output.pergunta,
    resposta: output.resposta,
    gabarito: gabarito.gabarito,
  })

  //await delay(6000)

  console.log(output.resposta, ' hhhhhhhhhhhhhh ', gabarito.gabarito)

  return res.pontuacaoGeral
}