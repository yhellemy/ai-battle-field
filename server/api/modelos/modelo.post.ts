export default defineEventHandler(async (event) => {
  const prisma = usePrisma()
  const body = await readBody<{ modelo: string, provedor: number }>(event)

  const { data: modelo } = await asyncEnvelope( async () => await prisma.modelos.create({
    data: {
      nome: body.modelo,
      provedor: {
        connect: {
          id: body.provedor
        }
      }
    }
  }))

  if (!modelo) return null

  processarModelo([modelo.id])

  return modelo
})