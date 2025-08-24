import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from 'zod';

export type CompreensaoTextualContract = AplicacaoTesteContract<ComprTextualQuestion, ComprTextualOutput>

export async function compreensaoTextual(modelProvider: ModelProvider, ctx: ComprTextualQuestion): Promise<ComprTextualOutput>{
  const llm = getModel(modelProvider)

  const system = `**Objetivo:** O objetivo deste prompt é avaliar a capacidade do modelo de Inferência de Linguagem Natural (NLI) em\n
  identificar a relação lógica entre uma Premissa e uma Hipótese, **estritamente com base nas informações contidas na Premissa**, dentro\n
  do contexto do Governo de Goiás.

  **Instruções para o Modelo:**

  1.Você receberá uma série de pares de sentenças. Cada par consiste em uma **Premissa** e uma **Hipótese**.
      
  2.Sua tarefa é analisar a relação entre a Hipótese e a Premissa.
      
  3.Classifique cada relação em uma das duas categorias exclusivas:
      

  * **implicação:** Se a Hipótese for necessariamente verdadeira **com base na Premissa**. A Premissa implica a Hipótese.
  * **contradição:** Se a Hipótese for necessariamente falsa ou impossível **com base na Premissa**. A Premissa contradiz a Hipótese.
 A sua resposta deverá ser direta, respondendo apenas as palavaras *implicação* ou *contradição*` 
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", system],
    ["human", "Premissa: {premissa}\nHipótese: {hipotese}"],
  ]);

  const chain = RunnableSequence.from([
    {
      categoria: () => ctx.categoria,
      premissa: () => ctx.premissa,
      hipotese: () => ctx.hipotese,
      nivel: () => ctx.nivel,
    },
    promptTemplate,
    llm,
    new StringOutputParser(),
  ]);

  const res = await chain.invoke({})
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
