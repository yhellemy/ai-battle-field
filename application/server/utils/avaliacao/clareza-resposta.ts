import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from 'zod';

export type ClarezaRespostaContract = AplicacaoTesteContract<ClarezaRespostaQuestao, ClarezaRespostaOutput>

export async function clarezaResposta(modelProvider: ModelProvider, ctx: ClarezaRespostaQuestao): Promise<ClarezaRespostaOutput>{
  const llm = getModel(modelProvider)

  const system = `Dada a seguinte resposta, avalie considerando a escala Likert, de 1 a 5 o quão clara ela é, sendo 1 'nada claro' e 5 'perfeitamente claro'. Considere clareza como: objetividade, linguagem simples, ausência de ambiguidade e adequação ao contexto. Não dê justificativas, responda apenas com um número de 1 a 5.` 
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", system],
    ["human", "{texto}"],
  ]);

  const chain = RunnableSequence.from([
    {
      texto: () => ctx.texto,
    },
    promptTemplate,
    llm,
    new StringOutputParser(),
  ]);

  const res = await chain.invoke({})

  return {
    resposta: res
  }
}
