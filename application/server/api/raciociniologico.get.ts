import { TipoMetrica } from "@prisma/client";

export default defineEventHandler( async (event) => {
  const prisma = usePrisma()

  // query aqui
  return await prisma.$queryRaw<RaciocinioLogico[]>`
with total_raciocinio as (
SELECT met.id, count(*) as total
FROM"Indicadores" as ind
INNER JOIN  "Metricas" as met on met.id = ind."metricaId"
INNER JOIN "Modelos" AS mls on ind."modeloId" = mls.id
where tipo = 'RaciocinioLogico'
GROUP BY 1
)
SELECT met.tipo, mls.nome,ind.indicador,ROUND((CAST(count(ind.indicador) AS DECIMAL) / MAX(td.total))*100,2)  as count 
FROM"Indicadores" as ind
INNER JOIN  "Metricas" as met on met.id = ind."metricaId"
INNER JOIN "Modelos" AS mls on ind."modeloId" = mls.id
INNER JOIN total_raciocinio td on td.id = met.id
where tipo = 'RaciocinioLogico'
GROUP BY 1,2,3;
  `;
})