export default defineEventHandler( async (event) => {
  const prisma = usePrisma()

  return await prisma.indicadores.findMany({
    include: {
      modelo: true
    }
  })
})