import { TipoMetrica } from "@prisma/client";

export default defineEventHandler( async (event) => {
  const prisma = usePrisma()
  
  return await prisma.$queryRaw<ContarIndicadoresResponse[]>`
with agregados_por_modelo AS (
    SELECT
        ind."modeloId",
        COUNT(*) AS total_indicadores,
        AVG(ind.indicador)::DECIMAL(10,2) AS media_indicador,
		count(*) AS contagem
    FROM "Indicadores" ind
    INNER JOIN "Metricas" met ON met.id = ind."metricaId"
    WHERE met.tipo = 'CompreensaoTextual'
    GROUP BY ind."modeloId"
),
tokens as (
SELECT
res."modeloId" AS modelo_id,
ROUND(AVG(res."inputTokens"),2) as tokensentradas,
ROUND(AVG(res."outputTokens"),2) as tokensaida,
ROUND(AVG(res."totalTokens"),2) as tokenstotais
FROM "Resultados" AS res
where "tipoResultado" = 'CompreensaoTextual'
GROUP BY 1)

SELECT
    ag."modeloId",
    tokensentradas,
    tokensaida,
    tokenstotais,
    mdl.nome AS "modeloNome",
    ag.media_indicador AS "totalIndicadores",
    ag.media_indicador AS "mediaIndicadores",
	ag.media_indicador,
    ag.contagem::INT,
    ROUND((ag.contagem::DECIMAL / ag.total_indicadores), 4) AS proporcao
FROM agregados_por_modelo ag     
INNER JOIN "Modelos" mdl  ON mdl.id = ag."modeloId"
INNER JOIN tokens t on t.modelo_id = ag."modeloId"
;

  `;
})
