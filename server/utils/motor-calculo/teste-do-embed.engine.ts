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
  perguntaDoUsuario: z.string().describe("A pergunta original feita pelo usuário ao modelo."),
  respostaDoModelo: z.string().describe("A resposta gerada pelo modelo que está sendo avaliada."),
  pontuacaoGeral: z.number().min(0).max(6).describe("Pontuação geral da resposta, de 0 a 6, baseada estritamente nos critérios e no contexto RAG fornecido."),
  comentariosFinaisAvaliador: z.string().optional().nullable().describe("Justificativa clara e concisa para a pontuação atribuída, explicando os acertos ou falhas da resposta em relação ao contexto."),
});

export async function testeDoEmbedEngine(output: TesteDoEmbedOutput, gabarito: TesteDoEmbedGabarito) {
  const llm = getModel({provider: process.env.EMBED_TEST_PROVIDER! as "gemini", model: process.env.EMBED_TEST_MODEL!})
  if (!llm) throw new Error('invalid llm')

  /**
   * [SUGESTÃO 1] O prompt do sistema agora foca exclusivamente nas INSTRUÇÕES.
   * Ele define a persona, a tarefa, os critérios e o formato de saída esperado,
   * sem conter placeholders de dados.
   */
  const systemPrompt = `
# Persona e Objetivo
Você é um LLM Avaliador Sênior, especialista em análise de respostas de modelos de linguagem e em serviços públicos do governo de Goiás. Sua principal tarefa é avaliar a qualidade e a precisão da resposta de um outro modelo de IA, que utiliza a técnica de RAG (Retrieval-Augmented Generation). Sua avaliação deve ser estritamente baseada na relação entre a Pergunta, o Contexto Recuperado e a Resposta do Modelo. Você NÃO deve usar seu conhecimento externo.

# Critérios de Avaliação Detalhados (Pontuação de 0 a 6)
/* O objetivo aqui é fazer o modelo entender que a avaliação é sobre a QUALIDADE da resposta DADO o contexto, e não sobre a qualidade do contexto em si. */

- **PONTUAÇÃO 0 - Alucinação Grave:** A resposta é sobre um assunto completamente diferente (ex: pergunta sobre CNH, resposta sobre receita de bolo) OU inventa informações de forma fabricada e sem qualquer base no contexto.

- **PONTUAÇÃO 1 - Contradição Grave:** A resposta usa o contexto, mas o interpreta de forma ilógica ou **contradiz diretamente** as informações fornecidas no texto.

- **PONTUAÇÃO 2 - Ruim / Erro Factual:** A resposta contém **erros factuais claros que podem ser desmentidos pelo contexto fornecido**. Use esta nota se a resposta extrair a informação de forma incorreta. (Ex: o contexto diz que a taxa é R$50, e a resposta diz que é R$100).

- **PONTUAÇÃO 3 - Regular:** A resposta é factualmente correta de acordo com o contexto, mas é mal escrita, apenas um "copia e cola" mal formatado, ou difícil de entender.

- **PONTUAÇÃO 4 - Bom / Resposta Fiel:** A resposta é precisa, relevante e **totalmente fiel ao contexto fornecido**. Ela responde à pergunta do usuário da melhor maneira possível **com as informações que estavam disponíveis**, mesmo que o contexto seja limitado. A resposta é clara e bem escrita.

- **PONTUAÇÃO 5 - Excelente / Síntese Útil:** Atende a todos os critérios da pontuação 4. Além disso, quando o contexto é rico, a resposta **sintetiza informações** de múltiplas partes de forma lógica e didática. Quando o contexto é limitado, a resposta é **honesta sobre as limitações** e guia o usuário de forma útil com o que foi encontrado (como nos exemplos da batida e da ameaça).

- **PONTUAÇÃO 6 - Recusa Apropriada:** A resposta reconhece que o contexto **não contém nenhuma informação útil** para responder à pergunta e se recusa a adivinhar, informando isso claramente.

# Processo de Avaliação
1. Analise a [Pergunta do Usuário] para entender a intenção.
2. Examine o [Contexto Recuperado (RAG)] para ver se a informação necessária está presente.
3. Compare a [Resposta do Modelo de IA] com o [Contexto Recuperado], verificando fidelidade, omissões ou contradições.
4. Atribua a pontuação e escreva a justificativa com base nessa comparação.

# Formato da Saída
Sua resposta final deve seguir estritamente o schema JSON fornecido. Avalie os dados que serão apresentados a seguir.
  `;

  /**
   * [SUGESTÃO 2] Criamos um template humano para formatar os DADOS.
   * Ele organiza claramente cada peça de informação que o LLM precisa para a avaliação.
   * O uso de Markdown (##) e blocos de código (```) melhora a robustez.
   */
  const humanPromptTemplate = `
# DADOS PARA AVALIAÇÃO

A seguir estão os três elementos que você deve analisar para gerar sua avaliação.

## [Contexto Recuperado (RAG)]
\`\`\`
{rag_context}
\`\`\`

## [Pergunta do Usuário]
\`\`\`
{user_question}
\`\`\`

## [Resposta do Modelo de IA]
\`\`\`
{model_response}
\`\`\`
  `


  const structuredLlm = llm.withStructuredOutput(AvaliacaoRespostaModeloSchema)

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    ['human', humanPromptTemplate],
  ]);

  const chain = prompt.pipe(structuredLlm)

  const res = await chain.invoke({
    pergunta: output.pergunta,
    rag_context: output.rag,
    user_question: output.pergunta,
    model_response: output.resposta
  })

  //await delay(6000)

  console.log(output.pergunta, ' hhhhhhhhhhhhhh ', output.resposta, 'Pontuação Geral:', res.pontuacaoGeral)

  return res.pontuacaoGeral
}