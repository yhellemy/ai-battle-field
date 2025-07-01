import { PrismaClient, TipoMetrica, Provider } from '@prisma/client'
import testes from './testes.json'
import { type ComprTextualQuestion } from '~~/shared/utils/types'

const prisma = new PrismaClient()

async function main() {
await prisma.provedores.create({
    data: {
      nome: Provider.ollama,
      modelos: {
/*         createMany: {
          data: [
            {
              nome: 'gemma3:latest'
            },
            {
              nome: 'deepseek-r1:8b',
            },
          ]
        } */
      }
    }
  })

  const tx = await prisma.metricas.create({
    data: {
      metricas: 'Taxa de compreensão',
      tipo: TipoMetrica.CompreensaoTextual,
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
    data: testes.map((item) => {
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
    }).filter((item, index) => 20 > index)
  })
  

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