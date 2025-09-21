import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from 'zod';

export type direitoAdministrativoContract = AplicacaoTesteContract<DireitoAdmQuestion, DireitoAdmOutput>

export async function direitoAdministrativo(modelProvider: ModelProvider, ctx: DireitoAdmQuestion): Promise<DireitoAdmOutput>{
  const llm = getModel(modelProvider)

  const system = `Você é um especialista em Direito Administrativo, com conhecimento profundo da doutrina, jurisprudência e legislação brasileira.
  Você receberá uma única frase relacionada ao Direito Administrativo. Sua função é determinar se a frase está juridicamente correta ou incorreta com base no que é aceito pela doutrina majoritária, pela jurisprudência consolidada e pela legislação vigente no Brasil.
  Instruções de Resposta:
  1. Responda exclusivamente com uma única palavra: "True" se a frase estiver correta ou "False" se a frase estiver incorreta.
  2. Nunca adicione explicações, justificativas, exemplos ou qualquer outra informação além de "True" ou "False".
  3. Se a frase for ambígua ou não relacionada ao Direito Administrativo, responda "False".
  4. Mantenha consistência, precisão e objetividade em todas as respostas.
  Importante: Seu objetivo é ser extremamente confiável e preciso, mesmo para casos complexos, respeitando sempre o ordenamento jurídico brasileiro.` 
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

const res = await chain.invoke({});

let textoAProcessar: string;

const match = res.match(/<\/think>\s*([\s\S]*)/);

if (match) {
  textoAProcessar = match[1].trim();
} else {
  textoAProcessar = res.trim();
}

  return {
    resposta: textoAProcessar
  };
 
}
