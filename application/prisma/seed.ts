import { PrismaClient, TipoMetrica, Provider } from '@prisma/client'
import { Index } from "@upstash/vector"
import comprTextualJson from './compreensao-textual.json'
import clarezaResJson from './clareza-resposta.json'
import { cartas, perguntas } from './cartas-servico.json'

const prisma = new PrismaClient()

async function main() {
  await prisma.provedores.create({
    data: {
      nome: Provider.ollama,
    }
  })

  const tx = await prisma.metricas.create({
    data: {
      metricas: 'Taxa de compreensão',
      tipo: TipoMetrica.CompreensaoTextual,
    }
  })

  const cr = await prisma.metricas.create({
    data: {
      metricas: 'Clareza da resposta',
      tipo: TipoMetrica.ClarezaResposta,
    }
  })

  const et = await prisma.metricas.create({
    data: {
      metricas: 'Teste do embed',
      tipo: TipoMetrica.TesteDoEmbed,
    }
  })

  await prisma.bancoDeQuestoes.createMany({
    data: [
      {
        metricaId: tx.id,
        pergunta: {
          categoria: 'Segurança Pública',
          premissa: 'A saneago tem ampliado a rede de esgoto',
          hipotese: 'A companhia de saneamento de goiás está expandindo o saneamento básico',
          nivel: 'Fácil'
        } satisfies ComprTextualQuestion,
        gabarito: { resposta: 'implicação' },
      }
    ]
  })

  await prisma.bancoDeQuestoes.createMany({
    data: comprTextualJson.map((item) => {
      return {
        metricaId: tx.id,
        pergunta: {
          categoria: item.categoria,
          premissa: item.premissa,
          hipotese: item.hipotese,
          nivel: item.hipotese
        } satisfies ComprTextualQuestion,
        gabarito: { resposta: item.gabarito },
      }
    })//.filter((item, index) => 20 > index)
  })

  await prisma.bancoDeQuestoes.createMany({
    data: clarezaResJson.map((item) => {
      return {
        metricaId: cr.id,
        pergunta: {
          texto: item.texto,
          gabarito: item.gabarito
        } satisfies ClarezaRespostaQuestao,
        gabarito: { resposta: item.gabarito } satisfies ClarezaRespostaGabarito,
      }
    })//.filter((item, index) => 20 > index)
  })

  await prisma.bancoDeQuestoes.createMany({
    data: perguntas.map((item) => {
      return {
        metricaId: et.id,
        pergunta: {
          pergunta: item.pergunta
        } satisfies TesteDoEmbedQuestion,
        gabarito: {} satisfies TesteDoEmbedGabarito,
      }
    })
  })
  
  if (process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN) {
    const index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    })

    const oque = cartas.map((item, i) => index.upsert({
      id: "cartas-oque-"+i,
      data: item.oque,
      metadata: {
        title: `O que é o serviço "${item.nome}" do órgão "${item.orgao}"`,
      },
    }))

    const quem = cartas.map((item, i) => index.upsert({
      id: "cartas-quem-"+i,
      data: item.quem,
      metadata: {
        title: `Para quem é o serviço "${item.nome}" do órgão "${item.orgao}"`,
      },
    }))

    const como = cartas.map((item, i) => index.upsert({
      id: "cartas-como-"+i,
      data: item.como,
      metadata: {
        title: `Como utilizar o serviço "${item.nome}" do órgão "${item.orgao}"`,
      },
    }))

    const embeddings = [oque, quem, como].flat(2)

    await Promise.all(embeddings)
  }

/*   const modelos = await prisma.modelos.findMany()

  const indicadores = modelos.map(modelo => ({
    metricaId: tx.id,
    indicador: Math.floor(Math.random() * 101),
    modeloId: modelo.id
  }))

  await prisma.indicadores.createMany({
    data: indicadores
  }) */

  
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })