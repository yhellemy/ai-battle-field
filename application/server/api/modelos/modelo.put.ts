export default defineEventHandler(async (event) => {
    const prisma = usePrisma()
    const body = await readBody<{ id: number }>(event)

    const { data: modelo } = await asyncEnvelope(async () => await prisma.modelos.delete({
        where: {
            id: body.id
        }
    }))

    if (!modelo) return createError({
        statusCode: 404,
        statusMessage: 'Modelo não encontrado'
    })

    const { data: newModelo } = await asyncEnvelope(async () => await prisma.modelos.create({
        data: modelo
    }))

    if (!newModelo) return createError({
        statusCode: 500,
        statusMessage: 'Erro ao recriar modelo'
    })

    processarModelo([newModelo.id])

    return modelo
})
