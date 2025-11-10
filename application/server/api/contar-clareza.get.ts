import { TipoMetrica } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = usePrisma();

  const modelosComResultados = await asyncEnvelope(async () => await prisma.modelos.findMany({
    select: {
      nome: true,
      resultados: {
        where: {
          tipoResultado: TipoMetrica.ClarezaResposta
        },
        select: {
          jsonResultado: true,
          bancoDeQuestoes: {
            select: {
              gabarito: true,
              id: true
            },
          },
          totalTokens: true
        },
      },
    },
  }));
  

  if (!modelosComResultados.data) return []

  return modelosComResultados.data.map(modelo => {
    const valores = modelo.resultados.map(resultado => {
      // resultado.totalTokens
      return {
        value: [
          (resultado.bancoDeQuestoes.gabarito as unknown as ClarezaRespostaGabarito).resposta,
          castFirstChar((resultado.jsonResultado as unknown as ClarezaRespostaOutput).resposta)
        ],
        tokens: resultado.totalTokens
      };
    });

    return {
      modelo: modelo.nome,
      valores: valores,
    };
  });
});