import { ChatPromptTemplate } from "@langchain/core/prompts"
import z from "zod";
import { getModel } from "../ai";

export const AvaliacaoRespostaModeloSchema = z.object({
  pontuacaoGeral: z.number().min(0).max(3).describe("Pontuação geral da resposta, onde 0 o modelo (Errou), 1 (Acertou), 2 (Não soube responder) e 3 (Alucinou)."),
});

const instruction = `
Você é um juiz especialista em avaliar a qualidade de código gerado por IA. Sua tarefa é avaliar a resposta de um modelo de IA para um problema de programação.

Você receberá o problema, a resposta do modelo, o gabarito (solução correta) e um eventual erro de execução do código.

**Problema:**
{pergunta}

**Gabarito (Solução Correta):**
{gabarito}

**Resposta do Modelo:**
{resposta}

**Erro de Execução:**
{codeError}

**Instruções de Avaliação:**

1.  **Analise o Erro de Execução (\`codeError\`):**
    *   Se \`codeError\` **não for nulo**, significa que o código gerado pelo modelo falhou ao ser executado (seja por erro de sintaxe, erro em tempo de execução, ou por não ser um código válido). Neste caso, a resposta é uma alucinação. Atribua a pontuação **3 (Alucinou)**.

2.  **Analise a Resposta do Modelo se não houver erro:**
    *   Se \`codeError\` for **nulo**, o código foi executado sem travar. Agora, você deve avaliar a lógica da \`Resposta do Modelo\`.
    *   Verifique se a \`Resposta do Modelo\` resolve o \`Problema\` corretamente. A lógica deve ser funcionalmente equivalente ao \`Gabarito\`. Não precisa ser idêntico, mas deve produzir o mesmo resultado esperado.
    *   Se a lógica estiver correta e resolver o problema, atribua a pontuação **1 (Acertou)**.
    *   Se a lógica estiver incorreta, incompleta ou não resolver o problema, atribua a pontuação **0 (Errou)**.

3.  **Casos de "Não Sei":**
    *   Se a \`Resposta do Modelo\` indicar explicitamente que não sabe a resposta, se recusar a responder, ou fornecer um texto genérico em vez de código, atribua a pontuação **2 (Não soube responder)**.

**Resumo das Pontuações:**
*   **3 (Alucinou):** A resposta não é um código, ou o código falhou na execução (\`codeError\` não é nulo).
*   **2 (Não soube responder):** O modelo explicitamente se recusa a responder ou pede desculpas.
*   **1 (Acertou):** O código executa sem erros (\`codeError\` é nulo) e a lógica resolve o problema corretamente.
*   **0 (Errou):** O código executa sem erros (\`codeError\` é nulo), mas a lógica está incorreta e não resolve o problema.

Avalie a resposta e forneça a \`pontuacaoGeral\` de acordo com o esquema solicitado.
`

export async function testeVibeCodingEngine(output: TesteVibeCodingOutput, gabarito: TesteVibeCodingGabarito) {
  const llm = getModel({provider: process.env.EMBED_TEST_PROVIDER! as "gemini", model: process.env.EMBED_TEST_MODEL!})
  if (!llm) throw new Error('invalid llm')

  const structuredLlm = llm.withStructuredOutput(AvaliacaoRespostaModeloSchema)

  const prompt = ChatPromptTemplate.fromMessages([
    ['human', instruction],
    ['placeholder', '{agent_scratchpad}'],
  ])

  const chain = prompt.pipe(structuredLlm)

  const res = await chain.invoke({
    pergunta: output.problema,
    resposta: output.resposta,
    gabarito: gabarito.gabarito,
    codeError: output.codeError,
  })

  return res.pontuacaoGeral
}