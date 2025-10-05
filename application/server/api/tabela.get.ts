export default defineEventHandler(async(event) => {
    const prisma = usePrisma()

    // query aqui
    return await prisma.$queryRaw`WITH direito as (SELECT
    mls.id AS modelo_id,
    mls.nome AS nome_modelo,
 SUM(CASE ind.indicador
     WHEN 1 THEN 1.0  
     WHEN 2 THEN 0.5   
     WHEN 0 THEN 0.0   
     WHEN 3 THEN -1.0  
     ELSE 0.0 END) AS Soma_Ponderada,
 COUNT(ind.indicador) AS Total_Perguntas,
  ROUND(CAST(SUM(CASE ind.indicador
     WHEN 1 THEN 1.0
     WHEN 2 THEN 0.5
     WHEN 0 THEN 0.0
     WHEN 3 THEN -1.0
     ELSE 0.0 END) AS NUMERIC(10, 4))/COUNT(ind.indicador),2) AS direitometrica
FROM "Indicadores" AS ind
INNER JOIN "Modelos" AS mls ON ind."modeloId" = mls.id
INNER JOIN "Metricas" AS met ON ind."metricaId" = met.id 
WHERE met.tipo in ('DireitoAdministrativo')
GROUP BY 1,2),
matematica as (SELECT
    mls.id AS modelo_id,
    mls.nome AS nome_modelo,
 SUM(CASE ind.indicador
     WHEN 1 THEN 1.0  
     WHEN 2 THEN 0.5   
     WHEN 0 THEN 0.0   
     WHEN 3 THEN -1.0  
     ELSE 0.0 END) AS Soma_Ponderada,
 COUNT(ind.indicador) AS Total_Perguntas,
  ROUND(CAST(SUM(CASE ind.indicador
     WHEN 1 THEN 1.0
     WHEN 2 THEN 0.5 
     WHEN 0 THEN 0.0
     WHEN 3 THEN -1.0
     ELSE 0.0 END) AS NUMERIC(10, 4))/COUNT(ind.indicador),2) AS matematica
FROM "Indicadores" AS ind
INNER JOIN "Modelos" AS mls ON ind."modeloId" = mls.id
INNER JOIN "Metricas" AS met ON ind."metricaId" = met.id 
WHERE met.tipo in ('Matematica')
GROUP BY 1,2),
consolidado AS (
  SELECT
    d.modelo_id,
    d.nome_modelo,
    d.direitometrica :: float,
    m.matematica :: float,
    ROUND((COALESCE(d.direitometrica, 0) + COALESCE(m.matematica, 0)) / 2, 2) AS media_geral
  FROM direito d
  FULL JOIN matematica m ON d.modelo_id = m.modelo_id
)
SELECT *
FROM consolidado
ORDER BY media_geral DESC;
;`;
})