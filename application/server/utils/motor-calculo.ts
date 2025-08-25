import { TipoMetrica } from '@prisma/client'

export * from './motor-calculo/index'

export const motor = {
  [TipoMetrica.CompreensaoTextual]: compreensaoTextualEngine,
  [TipoMetrica.ClarezaResposta]: clarezaRespostaEngine,
  [TipoMetrica.TesteDoEmbed]: testeDoEmbedEngine,
  [TipoMetrica.DireitoAdministrativo]: direitoAdministrativoEngine,
} as const

export async function processarIndicador(metrica: TipoMetrica, output: any, gabarito: any) {
  return await motor[metrica](output, gabarito)
}

export async function processarResultado(idResultado: number) {
  const prisma = usePrisma()

  const { data: resultado, error: resultadoError } = await asyncEnvelope(async () => await prisma.resultados.findUnique({
    where: {
      id: idResultado
    },
    include: {
      bancoDeQuestoes: true
    }
  }))

  if (!resultado) 
    return null

  if (resultado.erro)
    return null

  const indicador = await processarIndicador(resultado.tipoResultado, resultado.jsonResultado, resultado.bancoDeQuestoes.gabarito)

  return {
    indicador,
    modeloId: resultado.modeloId,
    metricaId: resultado.bancoDeQuestoes.metricaId
  }
}