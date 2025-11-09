import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from 'zod';

export type TesteVibeCodingContract = AplicacaoTesteContract<TesteVibeCodingQuestion, TesteVibeCodingOutput>

export async function testeVibeCoding(modelProvider: ModelProvider, ctx: TesteVibeCodingQuestion): Promise<TesteVibeCodingOutput> {
  const llm = getModel(modelProvider)

  console.log(ctx.contexto)

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", `
      // A sua única saída deve ser um bloco de código JavaScript.
      // Não forneça nenhuma introdução, explicação ou conclusão em texto.
      // Qualquer comentário ou anotação deve ser feito estritamente dentro do código, utilizando //.
      // Siga rigorosamente estas instruções para a seguinte solicitação:
    `],
    ['human', '{problema}\n{baseScript}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  const chain = RunnableSequence.from([
    {
      problema: () => ctx.problema,
      baseScript: () => ctx.baseScript
    },
    promptTemplate,
    llm,
    new StringOutputParser(),
  ]);

  const res = await chain.invoke({})

  const extracted = /```javascript\n([\s\S]*?)```/.exec(res)
  const codigo = ctx.contexto.replaceAll('{respostaModelo}', extracted ? extracted[1] : '')

  const codeReturns = await runSandbox(codigo);

  return {
    resposta: res,
    problema: ctx.problema,
    codeError: codeReturns.error
  }
}