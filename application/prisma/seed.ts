import { PrismaClient, TipoMetrica, Provider } from '@prisma/client'
import { Index } from "@upstash/vector"
import comprTextualJson from './compreensao-textual.json'
import clarezaResJson from './clareza-resposta.json'
import { cartas, perguntas } from './cartas-servico.json'
import direito from './direito-administrativo.json'
import matematica from './matematica.json'
import raciociniologico from './raciocinio-logico.json'
import { vibeCodingExercises } from '../prisma/vibe-coding';
//import { servicos } from './cartas.json'

const prisma = new PrismaClient()

async function main() {
  /*if (process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN) {
    const index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    })
    for (let i = 0; i < servicos.length; i++) {
      const element = servicos[i];
      if () {
        
      }
      await index.upsert(element)
    }
  //}*/

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

  const da = await prisma.metricas.create({
    data: {
      metricas: 'Direito Administrativo',
      tipo: TipoMetrica.DireitoAdministrativo,
    }
  })

    const mt = await prisma.metricas.create({
    data: {
      metricas: 'Matematica',
      tipo: TipoMetrica.Matematica,
    }
  })

  const rl = await prisma.metricas.create({
    data: {
      metricas: 'Raciocinio Logico',
      tipo: TipoMetrica.RaciocinioLogico,
    }
  })

  const vc = await prisma.metricas.create({
    data: {
      metricas: 'Vibe Coding',
      tipo: TipoMetrica.VibeCoding,
    }
  })


 await prisma.bancoDeQuestoes.createMany({
    data: [
      {
        metricaId: tx.id,
        pergunta: {
          categoria: 'Meio Ambiente',
          premissa: 'Plantar árvores melhora a qualidade do ar.',
          hipotese: 'A arborização contribui para um ambiente mais saudável.',
          nivel: 'Fácil'
        } satisfies ComprTextualQuestion,
        gabarito: { resposta: 'Implicação' },
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
    })//.filter((item, index) => 10 > index)
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
    })//.filter((item, index) => 10 > index)
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
    })//.filter((item, index) => 10 > index)
  })

  await prisma.bancoDeQuestoes.createMany({
    data: direito.map((item) => {
      return {
        metricaId: da.id,
        pergunta: {
          pergunta: item.pergunta,
          nivel: item.nivel
        } satisfies DireitoAdmQuestion,
        gabarito: {
          gabarito: item.gabarito,
          justificativa: item.justificativa
        } satisfies DireitoAdmGabarito,
      }
    })
  })

    await prisma.bancoDeQuestoes.createMany({
    data: matematica.map((item) => {
      return {
        metricaId: mt.id,
        pergunta: {
          pergunta: item.problem,
          nivel: item.level,
          tipo: item.type
        } satisfies TesteMatematicaQuestion,
        gabarito: {
          gabarito: item.solution 
        } satisfies TesteMatematicaGabarito,
      }
    })//.filter((item, index) => 10 > index)
  })

    await prisma.bancoDeQuestoes.createMany({
    data: raciociniologico.map((item) => {
      return {
        metricaId: rl.id,
        pergunta: {
          pergunta: item.pergunta,
          nivel: item.level
        } satisfies TesteRaciocinioQuestion,
        gabarito: {
          gabarito: item.Gabarito 
        } satisfies TesteRaciocinioGabarito,
      }
    })//.filter((item, index) => 10 > index)
  }) 

  await prisma.bancoDeQuestoes.createMany({
    data: vibeCodingExercises.map((item) => {
      return {
        metricaId: vc.id,
        pergunta: {
          problema: item.problema,
          contexto: item.contexto,
          baseScript: item.baseScript,
          nivel: item.nivel,
          tipo: item.tipo
        } satisfies TesteVibeCodingQuestion,
        gabarito: {
          gabarito: item.gabarito 
        } satisfies TesteVibeCodingGabarito,
      }
    })//.filter((item, index) => 10 > index)
  })

  if (false && process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN) {
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
  }) 

  */
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
