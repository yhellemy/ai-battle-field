import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from 'zod';

export type TesteMatematicaContract = AplicacaoTesteContract<TesteMatematicaQuestion, TesteMatematicaOutput>

export async function testeMatematica(modelProvider: ModelProvider, ctx: TesteMatematicaQuestion): Promise<TesteMatematicaOutput>{
  const llm = getModel(modelProvider)

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["human", `Solve the following math problem step by step. If you do not know how to solve the problem, your only response should be "I do not know the answer."

Otherwise, provide the solution and ensure the last line of your response is exclusively in the form “ANSWER: $ANSWER” (without quotes), where $ANSWER is the final answer. Do not use a \boxed command.

{pergunta}

Remember to put your answer on its own line at the end in the form “ANSWER: $ANSWER” (without quotes) where $ANSWER is the answer to the problem, and you do not need to use a \boxed command.`],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  const chain = RunnableSequence.from([
    {
      pergunta: () => ctx.pergunta,
    },
    promptTemplate,
    llm,
    new StringOutputParser(),
  ]);

  const res = await chain.invoke({})
console.log("Resposta final:", res);
  return {
    resposta: res,
    pergunta: ctx.pergunta
  }
}
