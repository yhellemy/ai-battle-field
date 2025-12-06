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

export async function testeMatematicaEngine(output: TesteMatematicaOutput, gabarito: TesteMatematicaGabarito) {
  const llm = getModel({provider: process.env.EMBED_TEST_PROVIDER! as "gemini", model: process.env.EMBED_TEST_MODEL!})
  if (!llm) throw new Error('invalid llm')
    




  const human = `
You are a math expert, and your task is to evaluate the quality of the response provided by another AI model for a mathematical problem. The correct answer key for comparison is provided in the **gabarito** field.

Analyze the LLM's response based on the following criteria:

Final Answer Correctness: Is the answer in the ANSWER: line mathematically correct? Compare it with the value in the gabarito field.

Step-by-Step Correction: Are the reasoning and intermediate calculations correct, and do they logically lead to the final answer?

Format Compliance: Does the response strictly follow the requested formatting rules (a step-by-step explanation and the ANSWER: $ANSWER line as the very last line)?

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

  //console.log(output.resposta, ' hhhhhhhhhhhhhh ', gabarito.gabarito)

  return res.pontuacaoGeral
}