import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from 'zod';

export type ClarezaRespostaContract = AplicacaoTesteContract<ClarezaRespostaQuestao, ClarezaRespostaOutput>

export async function clarezaResposta(
  modelProvider: ModelProvider,
  ctx: ClarezaRespostaQuestao
): Promise<ClarezaRespostaOutput> {
  const llm = getModel(modelProvider);

  const system = `Pontue a frase considerando a clareza da resposta usando uma escala de 1 a 5, onde:
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

  const res: string = await chain.invoke({});

  const padraoEspecial = '\n</think>\n\n';
  let textoAProcessar: string;

  if (res.includes(padraoEspecial)) {
   
    const partes = res.split(padraoEspecial);
    textoAProcessar = (partes[1] || '').trim();
  } else {
    const primeiraParte = res.split(/[.\n,]/)[0];
    textoAProcessar = primeiraParte.trim();
  }

  return {
    resposta: textoAProcessar
  };
}
