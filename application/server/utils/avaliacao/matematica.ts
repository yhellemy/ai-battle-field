import { createAgent } from "langchain";
import { z } from 'zod';

export type TesteMatematicaContract = AplicacaoTesteContract<TesteMatematicaQuestion, WithModelMetadata<TesteMatematicaOutput>>

export async function testeMatematica(modelProvider: ModelProvider, ctx: TesteMatematicaQuestion): Promise<WithModelMetadata<TesteMatematicaOutput>> {
  const model = getModel(modelProvider)

  const userMessage = ctx.pergunta

  const systemPrompt = `Solve the following math problem step by step. If you do not know how to solve the problem, your only response should be "I do not know the answer."

Otherwise, provide the solution and ensure the last line of your response is exclusively in the form “ANSWER: $ANSWER” (without quotes), where $ANSWER is the final answer. Do not use a \boxed command.

Remember to put your answer on its own line at the end in the form “ANSWER: $ANSWER” (without quotes) where $ANSWER is the answer to the problem, and you do not need to use a \boxed command.`

  const agent = createAgent({
    model,
    systemPrompt,
  })

  const result = await agent.invoke(
    { messages: [{ role: "user", content: userMessage }] }
  )

  const responseMessage = result.messages.at(-1)!;
  const res = responseMessage.text;

  const modelMetadata = processModelResponseMetadata(responseMessage)

  return {
    resposta: res,
    pergunta: userMessage,
    modelMetadata
  }
}
