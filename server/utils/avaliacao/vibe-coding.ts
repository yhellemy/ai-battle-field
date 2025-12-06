import { createAgent } from "langchain";
import { z } from 'zod';

export type TesteVibeCodingContract = AplicacaoTesteContract<TesteVibeCodingQuestion, WithModelMetadata<TesteVibeCodingOutput>>

export async function testeVibeCoding(modelProvider: ModelProvider, ctx: TesteVibeCodingQuestion): Promise<WithModelMetadata<TesteVibeCodingOutput>> {
  const model = getModel(modelProvider)

  console.log(ctx.contexto)

  const systemPrompt = `
      // A sua única saída deve ser um bloco de código JavaScript.
      // Não forneça nenhuma introdução, explicação ou conclusão em texto.
      // Qualquer comentário ou anotação deve ser feito estritamente dentro do código, utilizando //.
      // Siga rigorosamente estas instruções para a seguinte solicitação:
    `

  const agent = createAgent({
    model,
    systemPrompt,
  })

  const userMessage = `${ctx.problema}\n${ctx.baseScript}`

  const result = await agent.invoke(
    { messages: [{ role: "user", content: userMessage }] }
  )

  const responseMessage = result.messages.at(-1)!;
  const res = responseMessage.text;

  const extracted = /```javascript\n([\s\S]*?)```/.exec(res)
  const codigo = ctx.contexto.replaceAll('{respostaModelo}', extracted ? extracted[1] : '')

  const codeReturns = await runSandbox(codigo);

  const modelMetadata = processModelResponseMetadata(responseMessage)

  return {
    resposta: res,
    problema: ctx.problema,
    codeError: codeReturns.error,
    modelMetadata
  }
}