export default defineEventHandler(async (event) => {
  const body = await readBody<{ questaoId: number, modeloId: number }>(event)

  return await processarQuestao(body.questaoId, body.modeloId)
})