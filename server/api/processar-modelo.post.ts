

export default defineEventHandler(async (event) => {
  const body = await readBody<{ ids?: number[] }>(event)

  return await processarModelo(body.ids)
})