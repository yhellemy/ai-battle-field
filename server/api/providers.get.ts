export default defineEventHandler(async (event) => {
  const prisma = usePrisma()

  return await prisma.provedores.findMany({
    select: {
      nome: true,
      id: true,
    }
  })
})