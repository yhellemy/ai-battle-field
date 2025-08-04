import { TipoMetrica } from "@prisma/client";

export default defineEventHandler( async (event) => {
  const prisma = usePrisma()

  // query aqui
  return await prisma.$queryRaw<TesteDoEmbed[]>`
SELECT met.tipo, mls.nome,ind.indicador, count(ind.indicador)::integer FROM"Indicadores" as ind
INNER JOIN  "Metricas" as met on met.id = ind."metricaId"
INNER JOIN "Modelos" AS mls on ind."modeloId" = mls.id
where tipo = 'TesteDoEmbed'
GROUP BY 1,2,3;
  `;
})