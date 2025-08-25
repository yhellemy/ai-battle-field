import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from 'zod';

export type direitoAdministrativoContract = AplicacaoTesteContract<DireitoAdmQuestion, DireitoAdmOutput>

export async function direitoAdministrativo(modelProvider: ModelProvider, ctx: DireitoAdmQuestion): Promise<DireitoAdmOutput>{
  const llm = getModel(modelProvider)

  const system = `Receba uma frase sobre direito administrativo e responda apenas "True" ou "False", sem explicações adicionais.` 
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", system],
    ["human", "Frase: {pergunta}"]
  ]);

  const chain = RunnableSequence.from([
    {
      pergunta: () => ctx.pergunta,
      nivel: () => ctx.nivel,
    },
    promptTemplate,
    llm,
    new StringOutputParser(),
  ]);

  const res = await chain.invoke({})
  console.log(res, ctx)
  // O padrão especial que você quer identificar
  const padraoEspecial = '\n</think>\n\n';

  let textoAProcessar: string;

  // Verifica se a resposta do output contém o padrão especial
  if (res.includes(padraoEspecial)) {
    // CASO 1: O padrão foi encontrado → pegamos o texto após o padrão
    const partes = res.split(padraoEspecial);
    textoAProcessar = (partes[1] || '').trim();
  } else {
    // CASO 2: O padrão NÃO foi encontrado → pegamos só a primeira parte
    const primeiraParte = res.split(/[.\n,]/)[0];
    textoAProcessar = primeiraParte.trim();
  }

  return {
    resposta: textoAProcessar
  };
 
}
