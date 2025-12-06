import { TipoMetrica } from "@prisma/client";

export default defineEventHandler( async (event) => {
  const prisma = usePrisma()

  // query aqui
  return await prisma.$queryRaw<TesteDoEmbed[]>`
with total_qualidade_resposta as (
SELECT met.id, count(*) as total
FROM"Indicadores" as ind
INNER JOIN  "Metricas" as met on met.id = ind."metricaId"
INNER JOIN "Modelos" AS mls on ind."modeloId" = mls.id
where tipo = 'TesteDoEmbed'
GROUP BY 1
),
tokens as (
SELECT
res."modeloId" AS modelo_id,
ROUND(AVG(res."inputTokens"),2) as tokensentradas,
ROUND(AVG(res."outputTokens"),2) as tokensaida,
ROUND(AVG(res."totalTokens"),2) as tokenstotais
FROM "Resultados" AS res
where "tipoResultado" = 'TesteDoEmbed'
GROUP BY 1)

SELECT met.tipo, mls.nome,ind.indicador,tokensentradas,tokensaida,tokenstotais,ROUND((CAST(count(ind.indicador) AS DECIMAL) / MAX(td.total))*100,2)  as count  
FROM"Indicadores" as ind
INNER JOIN  "Metricas" as met on met.id = ind."metricaId"
INNER JOIN "Modelos" AS mls on ind."modeloId" = mls.id
INNER JOIN total_qualidade_resposta td on td.id = met.id
INNER JOIN tokens t on t.modelo_id = ind."modeloId"

where tipo = 'TesteDoEmbed'
GROUP BY 1,2,3,4,5,6;
  `;
})