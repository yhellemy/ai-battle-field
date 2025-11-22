import { createAgent } from "langchain";
import { z } from 'zod';

export type CompreensaoTextualContract = AplicacaoTesteContract<ComprTextualQuestion, WithModelMetadata<ComprTextualOutput>>

export async function compreensaoTextual(modelProvider: ModelProvider, ctx: ComprTextualQuestion): Promise<WithModelMetadata<ComprTextualOutput>> {
  const model = getModel(modelProvider)

  const systemPrompt = `**Objetivo:** O objetivo deste prompt é avaliar a capacidade do modelo de Inferência de Linguagem Natural (NLI) em

  identificar a relação lógica entre uma Premissa e uma Hipótese, **estritamente com base nas informações contidas na Premissa**, dentro
  do contexto do Governo de Goiás.
 
  **Instruções para o Modelo:**

  1.Você receberá uma série de pares de sentenças. Cada par consiste em uma **Premissa** e uma **Hipótese**.
      
  2.Sua tarefa é analisar a relação entre a Hipótese e a Premissa.
 
  3.Classifique cada relação em uma das duas categorias exclusivas:
      

  * **implicação:** Se a Hipótese for necessariamente verdadeira **com base na Premissa**. A Premissa implica a Hipótese.
  * **contradição:** Se a Hipótese for necessariamente falsa ou impossível **com base na Premissa**. A Premissa contradiz a Hipótese.
 A sua resposta deverá ser direta, respondendo apenas as palavaras *implicação* ou *contradição*`

  const agent = createAgent({
    model,
    systemPrompt,
  })

  const userMessage = `Premissa: ${ctx.premissa}\nHipótese: ${ctx.hipotese}`

  const result = await agent.invoke(
    { messages: [{ role: "user", content: userMessage }] }
  )

  const responseMessage = result.messages.at(-1)!;

  let textoAProcessar: string;

  const match = responseMessage.text.match(/<\/think>\s*([\s\S]*)/);

  if (match) {
    textoAProcessar = match[1].trim();
  } else {
    textoAProcessar = responseMessage.text.trim();
  }

  const modelMetadata = processModelResponseMetadata(responseMessage)

  return {
    resposta: textoAProcessar,
    modelMetadata,
  };

}
