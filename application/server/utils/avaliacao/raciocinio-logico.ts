import { createAgent } from "langchain";
import { z } from 'zod';

export type TesteRaciocinioContract = AplicacaoTesteContract<TesteRaciocinioQuestion, WithModelMetadata<TesteRaciocinioOutput>>

export async function testeRaciocinioLogico(modelProvider: ModelProvider, ctx: TesteRaciocinioQuestion): Promise<WithModelMetadata<TesteRaciocinioOutput>> {
  const model = getModel(modelProvider)

  const systemPrompt = `Resolva o seguinte problema de raciocínio lógico passo a passo. Se você não souber como resolver o problema, sua única resposta deve ser "Não sei a resposta."

Caso contrário, forneça a solução e garanta que a última linha da sua resposta esteja exclusivamente no formato “RESPOSTA: $RESPOSTA” (sem aspas), onde $RESPOSTA é a resposta final. Não use o comando \boxed.

Lembre-se de colocar sua resposta em uma linha separada no final, no formato “RESPOSTA: $RESPOSTA” (sem aspas), onde $RESPOSTA é a resposta para o problema, e você não precisa usar o comando \boxed.`

  const agent = createAgent({
    model,
    systemPrompt,
  })

  const userMessage = ctx.pergunta

  const result = await agent.invoke(
    { messages: [{ role: "user", content: userMessage }] }
  )

  const responseMessage = result.messages.at(-1)!;
  const res = responseMessage.text;

  const modelMetadata = processModelResponseMetadata(responseMessage)

  return {
    resposta: res,
    pergunta: ctx.pergunta,
    modelMetadata
  }
}
