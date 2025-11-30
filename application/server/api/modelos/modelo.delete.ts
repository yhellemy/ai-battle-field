export default defineEventHandler(async (event) => {
    const prisma = usePrisma()
    const body = await readBody<{ id: number }>(event)

    const { data: modelo } = await asyncEnvelope(async () => await prisma.modelos.delete({
        where: {
            id: body.id
        }
    }))

    if (!modelo) return null

    return modelo
})
