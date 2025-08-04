import { TipoMetrica } from '@prisma/client'
export * from './avaliacao/index'

export const avaliacao = {
  [TipoMetrica.CompreensaoTextual]: compreensaoTextual,
  [TipoMetrica.ClarezaResposta]: clarezaResposta,
  [TipoMetrica.TesteDoEmbed]: testeDoEmbed,
} as const

export async function processarAvaliacaoLlm(metrica: TipoMetrica, modelo: ModelProvider, ctx: any) {
  return await avaliacao[metrica](modelo, ctx)
}

export async function processarQuestao(id: number, modeloId: number) {
  const prisma = usePrisma()

  const { data: questao, error: questaoError } = await asyncEnvelope(async () => await prisma.bancoDeQuestoes.findUnique({
    where: {
      id,
    },
    include: {
      metrica: true
    }
  }))

  const { data: modelo, error: modeloError } = await asyncEnvelope(async () => await prisma.modelos.findUnique({
    where: {
      id: modeloId,
    },
    include: {
      provedor: true
    }
  }))

  if (!questao || !modelo) {
    return null
  }

  const { data: result, error: aiError } = await asyncEnvelope(async () => await processarAvaliacaoLlm(
    questao.metrica.tipo, 
    { model: modelo.nome, provider: modelo.provedor.nome }, 
    questao.pergunta
  ))

  if (aiError) {
    return await prisma.resultados.create({
      data: {
        tipoResultado: questao.metrica.tipo,
        jsonResultado: {},
        erro: true,
        jsonErro: {
          stack: aiError.stack,
          message: aiError.message,
          name: aiError.name,
        },
        bancoDeQuestoesId: questao.id,
        modeloId: modelo.id
      },
    })
  }

  return await prisma.resultados.create({
    data: {
      tipoResultado: questao.metrica.tipo,
      jsonResultado: result,
      bancoDeQuestoesId: questao.id,
      modeloId: modelo.id
    },
  })
}

export async function mapearQuestoesNaoProcessadas(ids?: number[]){
  const prisma = usePrisma()

  const modelos = await prisma.modelos.findMany({
    select: {
      id: true,
      nome: true,
      provedorId: true,
      resultados: {
        select: {
          id: true,
          tipoResultado: true,
          bancoDeQuestoesId: true,
        },
      }
    },
  })

  const questoes = await prisma.bancoDeQuestoes.findMany({
    select: {
      id: true
    }
  })

  return modelos.filter((modelo) => ids ? ids.includes(modelo.id) : true)
    .map((modelo) => {
      const processed = modelo.resultados.map((resultado) => resultado.bancoDeQuestoesId)
      return {
        nome: modelo.nome,
        idModelo: modelo.id,
        idProvedor: modelo.provedorId,
        pendente: questoes.map((questao) => questao.id).filter((id) => !processed.includes(id))
      }
    })
}

export async function processarModelo(ids?: number[]) {
  const prisma = usePrisma()
  const { data: mapeado, error: mapError } = await asyncEnvelope(async () => await mapearQuestoesNaoProcessadas(ids))

  if (mapError) {
    return new Error('Ocorreu um erro ao mapear items não processados')
  }

  return await Promise.all(mapeado.map(async (item) => {
    const modelTasks = await Promise.all(item.pendente.map(async (id) => {
      const { data: resultado} = await asyncEnvelope(async () => processarQuestao(id, item.idModelo))
      if (!resultado) throw new Error('falha ao processar questão ' + id)
      const { data: resultadoProcessado } = await asyncEnvelope(async () => processarResultado(resultado.id))
      if (!resultadoProcessado) throw new Error('falha ao processar resultado ' + resultado.id)

      const { data: indicador } = await asyncEnvelope(async () => await prisma.indicadores.create({
        data: resultadoProcessado
      }))

      if (!indicador) throw new Error('falha ao armazenar resultado processado ' + resultado.id)

      return { resultado, indicador }
    }))
    return {
      modelo: item.idModelo,
      processado: modelTasks
    }
}))
}


