export default defineEventHandler(async (event) => {
  const prisma = usePrisma()

  return await mapearQuestoesNaoProcessadas()
})