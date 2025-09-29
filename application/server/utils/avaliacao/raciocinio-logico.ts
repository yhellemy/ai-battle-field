import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from 'zod';

export type TesteRaciocinioContract = AplicacaoTesteContract<TesteRaciocinioQuestion, TesteRaciocinioOutput>

export async function testeRaciocinioLogico(modelProvider: ModelProvider, ctx: TesteRaciocinioQuestion): Promise<TesteRaciocinioOutput>{
  const llm = getModel(modelProvider)

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["human", `Resolva o seguinte problema de raciocínio lógico passo a passo. Se você não souber como resolver o problema, sua única resposta deve ser "Não sei a resposta."

Caso contrário, forneça a solução e garanta que a última linha da sua resposta esteja exclusivamente no formato “RESPOSTA: $RESPOSTA” (sem aspas), onde $RESPOSTA é a resposta final. Não use o comando \boxed.
{pergunta}

Lembre-se de colocar sua resposta em uma linha separada no final, no formato “RESPOSTA: $RESPOSTA” (sem aspas), onde $RESPOSTA é a resposta para o problema, e você não precisa usar o comando \boxed.`],
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
//console.log("Resposta final:", res);
  return {
    resposta: res,
    pergunta: ctx.pergunta
  }
}
