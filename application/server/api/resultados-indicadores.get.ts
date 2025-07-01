import { z } from 'zod/v4'



export default defineEventHandler(async (event) => {
  const prisma = usePrisma()

  return await prisma.resultados.findMany({
    include: {
      modelo: {
        include: {
          Indicadores: true
        }
      }
    }
  })
})