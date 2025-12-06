import { generateEmbedding } from '../utils/ai'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const query = body.query

    if (!query) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Query is required',
        })
    }

    const prisma = usePrisma()
    const embedding = await generateEmbedding(query)
    const vectorQuery = `[${embedding.join(',')}]`

    const results = await prisma.$queryRaw`
    SELECT id, content, metadata, 1 - (embedding <=> ${vectorQuery}::vector) as similarity
    FROM "cartas_servico"
    ORDER BY embedding <=> ${vectorQuery}::vector
    LIMIT 5;
  `

    return {
        query,
        results
    }
})
