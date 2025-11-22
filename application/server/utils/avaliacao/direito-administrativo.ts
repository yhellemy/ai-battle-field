import { createAgent } from "langchain";
import { z } from 'zod';

export type direitoAdministrativoContract = AplicacaoTesteContract<DireitoAdmQuestion, WithModelMetadata<DireitoAdmOutput>>

export async function direitoAdministrativo(modelProvider: ModelProvider, ctx: DireitoAdmQuestion): Promise<WithModelMetadata<DireitoAdmOutput>> {
  const model = getModel(modelProvider)

  const systemPrompt = `Você é um especialista em Direito Administrativo, com conhecimento profundo da doutrina, jurisprudência e legislação brasileira. Sua tarefa é analisar uma frase e determinar sua correção jurídica com alta precisão e honestidade.

Siga estritamente as seguintes instruções de formato:

1.  **Primeira Linha (Decisão):** A primeira linha da sua resposta deve conter APENAS uma das três palavras:
    * **"True":** Se a frase estiver juridicamente correta.
    * **"False":** Se a frase estiver juridicamente incorreta.
    * **"Não Sei":** Se você, como modelo de IA, não possuir informações suficientes, dados de treinamento consolidados, ou a capacidade de verificar a afirmativa com o nível de precisão jurídica exigido.

    **Importante:** Sinta-se totalmente à vontade para usar "Não Sei". É muito preferível que você admita honestamente uma limitação de conhecimento a tentar adivinhar ou fornecer uma resposta imprecisa. Use "Não Sei" se você realmente não possui os dados para confirmar ou negar a afirmativa com segurança.

2.  **A Partir da Segunda Linha (Justificativa):** Na segunda linha, inicie sua justificativa.
    * Para respostas "True" ou "False", fundamente sua decisão com base na doutrina majoritária, jurisprudência consolidada e/ou legislação vigente.
    * Para uma resposta "Não Sei", explique honestamente a limitação que o impede de responder. NÃO critique a pergunta (dizendo que é ambígua ou mal formulada). Em vez disso, foque em sua própria capacidade, por exemplo:
        * "Não foi possível localizar jurisprudência consolidada a respeito."
        * "Meu conhecimento sobre esta portaria/lei específica é limitado."
        * "Trata-se de um tema muito específico ou recente sobre o qual não possuo dados suficientes."`

  const agent = createAgent({
    model,
    systemPrompt,
  })

  const userMessage = `Frase: ${ctx.pergunta}`

  const result = await agent.invoke(
    { messages: [{ role: "user", content: userMessage }] }
  )

  const responseMessage = result.messages.at(-1)!;

  let textoAProcessar = responseMessage.text.trim();


  const match = textoAProcessar.match(/<\/think>\s*([\s\S]*)/);
  if (match && match[1]) {
    textoAProcessar = match[1].trim();
  }


  const linhas = textoAProcessar.split('\n');
  const respostaFinal = linhas[0].trim();
  const justificativaFinal = linhas.slice(1).join('\n').trim();

  const modelMetadata = processModelResponseMetadata(responseMessage)

  return {
    pergunta: ctx.pergunta,
    resposta: respostaFinal,
    justificativa_resposta: justificativaFinal || textoAProcessar,
    modelMetadata,
  };
}
