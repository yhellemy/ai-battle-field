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
 pontuacaoGeral: z.number().min(0).max(3).describe("Pontuação geral da resposta, onde 0 o modelo (Errou), 1 (Acertou), 2 (O modelo explicitamente diz que não sabe ou se recusa a responder) e 3 (Alucinou)."),
});
export async function direitoAdministrativoEngine(output: DireitoAdmOutput, gabarito: DireitoAdmGabarito) {
  const llm = getModel({provider: process.env.EMBED_TEST_PROVIDER! as "gemini", model: process.env.EMBED_TEST_MODEL!})
  if (!llm) throw new Error('invalid llm')
    

  const human = `
Você é um especialista em Direito Administrativo, com conhecimento profundo da doutrina, jurisprudência e legislação brasileira. Sua tarefa é avaliar a resposta de um modelo de IA com base em um gabarito.

**Critérios de Avaliação (pontuação de 0 a 3):**
- (0) Errou: quando a resposta objetiva ("True" ou "False") não corresponde ao gabarito.
- (1) Acertou: quando a resposta objetiva corresponde ao gabarito **e** a justificativa é juridicamente correta (sem contradições, invenções ou distorções).
- (2) Não Sei: quando a resposta objetiva for "Não Sei" **e** a justificativa confirmar que o modelo não sabe ou se recusa a responder.
- (3) Alucinação: em três situações
   a) quando a resposta objetiva for "True" ou "False", mas a justificativa disser que não sabe (contradição);  
   b) quando a resposta objetiva for "Não Sei", mas a justificativa tentar explicar algo referente a questão;  
   c) quando o modelo inventar leis, regras, jurisprudência ou fundamentos inexistentes — mesmo que acerte a resposta objetiva.

**INFORMAÇÕES PARA AVALIAÇÃO:**

**[PERGUNTA ORIGINAL]**
{pergunta}

**[GABARITO - RESPOSTA CORRETA]**
{gabarito}

**[GABARITO - JUSTIFICATIVA CORRETA]**
{justificativa}

**[RESPOSTA DO MODELO AVALIADO]**
{resposta}

**[JUSTIFICATIVA DO MODELO AVALIADO]**
{justificativa_resposta}
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
  justificativa_resposta: output.justificativa_resposta, 
  gabarito: gabarito.gabarito,
  justificativa: gabarito.justificativa, 
  })

  //await delay(6000)

console.log("Invocando o modelo de avaliação com os seguintes dados:", {
    pergunta: output.pergunta,
    resposta: output.resposta,
    justificativa_resposta: output.justificativa_resposta,
    gabarito: gabarito.gabarito,
    justificativa: gabarito.justificativa,
    pontos: res.pontuacaoGeral,
});

return res.pontuacaoGeral
}



//export async function direitoAdministrativoEngine(output: DireitoAdmOutput, gabarito: DireitoAdmGabarito) {
  //const regex = /[^\w\s]/g
  //console.log(gabarito.gabarito?.toLowerCase().replace(regex, "").trim(), ' e ', output.resposta?.toLowerCase().replace(regex, "").trim())
//  return output.resposta?.toLowerCase().replace(regex, "").trim() === gabarito.gabarito?.toLowerCase().replace(regex, "").trim() ? 100 : 0
//}
