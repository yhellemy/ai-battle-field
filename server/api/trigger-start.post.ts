export default defineEventHandler(async (event) => {
  const prisma = usePrisma()

  const questions = await prisma.bancoDeQuestoes.findMany({
    include: {
      metrica: true
    }
  })

  const providers = await prisma.provedores.findMany({
    include: {
      modelos: true
    }
  })

  providers.forEach(async (provider) => {
    provider.modelos.forEach(async (modelo) => {
      questions.forEach(async (question) => {
        console.log('processando provider ', provider.nome, ' modelo ', modelo.nome, ' metrica ', question.metrica.tipo, ' questão ', question.id)
      })
    })
  })

  return { sucess: true }
})