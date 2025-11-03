import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from 'zod';
import ivm from 'isolated-vm'

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
  const isolate = new ivm.Isolate({ memoryLimit: 128 })

  let codeError: null | string = null

  const extracted = /```javascript\n([\s\S]*?)```/.exec(res)

  try {
    const context = isolate.createContextSync()
    const jail = context.global;
    jail.setSync('global', jail.derefInto())
    jail.setSync('log', function(...args: any) {
        console.log(...args);
    });
    context.evalSync('log("hello world")');
    console.log('chegou aqui')
    const hostile = isolate.compileScriptSync(ctx.contexto.replaceAll('{respostaModelo}', extracted ? extracted[1] : ''));
    await hostile.run(context)
    console.log('chegou aqui 2')
  } catch(e) {
      if (e instanceof Error) {
        codeError = e.message
      }
  }

  return {
    resposta: res,
    problema: ctx.problema,
    codeError
  }
}