import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { createAgent } from "langchain";
import { z } from 'zod';

export type ClarezaRespostaContract = AplicacaoTesteContract<ClarezaRespostaQuestao, WithModelMetadata<ClarezaRespostaOutput>>

export async function clarezaResposta(
  modelProvider: ModelProvider,
  ctx: ClarezaRespostaQuestao
): Promise<WithModelMetadata<ClarezaRespostaOutput>> {
  const model = getModel(modelProvider);

  const systemPrompt = `Pontue a frase considerando a clareza da resposta usando uma escala de 1 a 5, onde:
1 = Nada claro;
2 = Pouco claro;
3 = Moderadamente claro;
4 = Muito claro;
5 = Perfeitamente claro.
Para avaliar a clareza, considere os seguintes critérios:
- Objetividade;
- Linguagem simples;
- Ausência de ambiguidade;
- Adequação ao contexto.
Responda apenas com um número de 1 a 5, sem justificativas.`; 

  const agent = createAgent({
    model,
    systemPrompt,
  })

  const result = await agent.invoke(
    { messages: [{ role: "user", content: ctx.texto }] }
  )

  const responseMessage = result.messages.at(-1)!;

  let textoAProcessar: string;

  const match = responseMessage.text.match(/<\/think>\s*([\s\S]*)/);

  if (match) {
    textoAProcessar = match[1].trim();
  } else {
    textoAProcessar = responseMessage.text.trim();
  }

  const modelMetadata = processModelResponseMetadata(responseMessage)

  return {
    resposta: textoAProcessar,
    modelMetadata,
  };
}
