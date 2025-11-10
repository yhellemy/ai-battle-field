export default defineEventHandler(async(event) => {
    const prisma = usePrisma()

    // query aqui
    return await prisma.$queryRaw`WITH total_compreesao as (SELECT
ind."metricaId",
mls.id AS modelo_id,
mls.nome AS nome_modelo,
COUNT(*) AS total_pergunta
FROM "Indicadores" AS ind
INNER JOIN  "Modelos" AS mls ON ind."modeloId" = mls.id
WHERE ind."metricaId" = 1 
GROUP BY 1,2,3),

alucinacao_compreensao as (SELECT 
bdq."metricaId",
res."modeloId",
COUNT(*)*-1 AS totalucinacao
FROM "Resultados" AS res
INNER JOIN "BancoDeQuestoes" AS bdq 
INNER JOIN "Metricas" as mt on bdq."metricaId" = mt.id ON res."bancoDeQuestoesId" = bdq.id
WHERE (mt.tipo = 'CompreensaoTextual' AND NOT regexp_replace(lower(trim(res."jsonResultado"->>'resposta')), '[^a-z0-9]', '', 'g')  
IN ('contradio', 'implicao'))
GROUP BY bdq."metricaId", res."modeloId"),

acertos_compreesao as (
SELECT
ind."metricaId",
mls.id AS modelo_id,
mls.nome AS nome_modelo,
COUNT(*)*1 acertos
FROM "Indicadores" AS ind
INNER JOIN  "Modelos" AS mls ON ind."modeloId" = mls.id
WHERE ind."metricaId" = 1 and ind.indicador =100
GROUP BY 1,2,3),

compreesao_textual as (
SELECT
tc.modelo_id,
tc.nome_modelo,
CASE WHEN SUM(COALESCE(tc.total_pergunta, 0)) = 0 THEN 0.0
ELSE ROUND(CAST(SUM(COALESCE(ac.acertos, 0) + COALESCE(al.totalucinacao, 0)) AS NUMERIC) / NULLIF(SUM(COALESCE(tc.total_pergunta, 0)), 0),2)
END AS compreensaotextualmetrica
FROM total_compreesao tc
FULL JOIN alucinacao_compreensao al ON tc.modelo_id = al."modeloId"
FULL JOIN acertos_compreesao ac ON tc.modelo_id = ac.modelo_id
GROUP BY 1,2),

total_clareza as (SELECT
ind."metricaId",
mls.id AS modelo_id,
mls.nome AS nome_modelo,
COUNT(*) AS total_pergunta
FROM "Indicadores" AS ind
INNER JOIN  "Modelos" AS mls ON ind."modeloId" = mls.id
WHERE ind."metricaId" = 2 
GROUP BY 1,2,3),

alucinacao_clareza as (SELECT 
bdq."metricaId",
res."modeloId",
COUNT(*)*-1 AS totalucinacao
FROM "Resultados" AS res
INNER JOIN "BancoDeQuestoes" AS bdq 
INNER JOIN "Metricas" as mt on bdq."metricaId" = mt.id ON res."bancoDeQuestoesId" = bdq.id
WHERE (mt.tipo = 'ClarezaResposta' AND
NOT LOWER(TRIM(res."jsonResultado"->>'resposta')) IN ('1', '2', '3', '4', '5'))
GROUP BY 1,2),

acertos_clareza as (
SELECT
ind."metricaId",
mls.id AS modelo_id,
mls.nome AS nome_modelo,
COUNT(*)*1 acertos
FROM "Indicadores" AS ind
INNER JOIN  "Modelos" AS mls ON ind."modeloId" = mls.id
WHERE ind."metricaId" = 2 and ind.indicador =100
GROUP BY 1,2,3),

clareza_resposta as (
SELECT
tc.modelo_id,
tc.nome_modelo,
CASE WHEN SUM(COALESCE(tc.total_pergunta, 0)) = 0 THEN 0.0
ELSE ROUND(CAST(SUM(COALESCE(ac.acertos, 0) + COALESCE(al.totalucinacao, 0)) AS NUMERIC) / NULLIF(SUM(COALESCE(tc.total_pergunta, 0)), 0),2)
END AS clarezarespostametrica
FROM total_clareza tc
FULL JOIN alucinacao_clareza al ON tc.modelo_id = al."modeloId"
FULL JOIN acertos_clareza ac ON tc.modelo_id = ac.modelo_id
GROUP BY 1,2),

qualidade_resposta as (
SELECT
mls.id AS modelo_id,
mls.nome AS nome_modelo,
SUM(CASE ind.indicador
	WHEN 5 THEN 5.0    -- Excelente
    WHEN 4 THEN 4.0    -- Boa
    WHEN 3 THEN 2.0    -- Mediana
    WHEN 6 THEN 2.5    -- Não Sabe (Calibração)
    WHEN 2 THEN 0.5    -- Abaixo da Média
    WHEN 1 THEN -2.0   -- Muito Ruim
    WHEN 0 THEN -10.0  -- Alucinação 
    ELSE 0.0 END) AS Soma_Ponderada_Qualidade,
    COUNT(ind.indicador) AS Total_Perguntas,
    ROUND((CAST(SUM(CASE ind.indicador
    WHEN 5 THEN 5.0 
    WHEN 4 THEN 4.0 
    WHEN 3 THEN 2.0 
    WHEN 6 THEN 2.5 
    WHEN 2 THEN 0.5 
    WHEN 1 THEN -2.0 
    WHEN 0 THEN -10.0 
    ELSE 0.0 END)  AS NUMERIC(10, 4)) / COUNT(ind.indicador)), 3) AS qualidaderesposta 
FROM "Indicadores" AS ind
INNER JOIN "Modelos" AS mls ON ind."modeloId" = mls.id
INNER JOIN "Metricas" AS met ON ind."metricaId" = met.id 
WHERE met.tipo in ('TesteDoEmbed')
GROUP BY 1,2),

direito as (SELECT
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

raciocinio as (SELECT
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
     ELSE 0.0 END) AS NUMERIC(10, 4))/COUNT(ind.indicador),2) AS raciociniometrica
FROM "Indicadores" AS ind
INNER JOIN "Modelos" AS mls ON ind."modeloId" = mls.id
INNER JOIN "Metricas" AS met ON ind."metricaId" = met.id 
WHERE met.tipo in ('RaciocinioLogico')
GROUP BY 1,2),

vibecode as (SELECT
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
     ELSE 0.0 END) AS NUMERIC(10, 4))/COUNT(ind.indicador),2) AS vibecode
FROM "Indicadores" AS ind
INNER JOIN "Modelos" AS mls ON ind."modeloId" = mls.id
INNER JOIN "Metricas" AS met ON ind."metricaId" = met.id 
WHERE met.tipo in ('VibeCoding')
GROUP BY 1,2),

tokens as (SELECT
    mls.id AS modelo_id,
    mls.nome AS nome_modelo,
	sum(res."inputTokens") as tokensentradas,
	sum(res."outputTokens") as tokensaida,
	sum(res."totalTokens") as tokenstotais
	
 FROM "Resultados" AS res
INNER JOIN "Modelos" AS mls ON res."modeloId" = mls.id
GROUP BY 1,2),

consolidado AS (
SELECT
    coalesce(d.nome_modelo, m.nome_modelo, r.nome_modelo, ct.nome_modelo, cr.nome_modelo, qr.nome_modelo) AS nome_modelo,
    d.direitometrica :: float,
    m.matematica :: float,
    r.raciociniometrica :: float,
    ct.compreensaotextualmetrica :: float,
    cr.clarezarespostametrica :: float,
    qr.qualidaderesposta :: float,
	vc.vibecode:: float,
	tk.tokensentradas:: float,
	tk.tokensaida:: float,
	tk.tokenstotais:: float
	
FROM direito d
FULL JOIN matematica m ON d.modelo_id = m.modelo_id
FULL JOIN raciocinio r ON r.modelo_id = coalesce(d.modelo_id, m.modelo_id)
FULL JOIN compreesao_textual ct ON ct.modelo_id = coalesce(d.modelo_id, m.modelo_id, r.modelo_id)
FULL JOIN clareza_resposta cr ON cr.modelo_id = coalesce(d.modelo_id, m.modelo_id, r.modelo_id, ct.modelo_id)
FULL JOIN qualidade_resposta qr ON qr.modelo_id = coalesce(d.modelo_id, m.modelo_id, r.modelo_id, ct.modelo_id, cr.modelo_id)
FULL JOIN vibecode vc ON vc.modelo_id = coalesce(d.modelo_id, m.modelo_id, r.modelo_id, ct.modelo_id, cr.modelo_id,qr.modelo_id)
FULL JOIN tokens tk on tk.modelo_id = coalesce(d.modelo_id, m.modelo_id, r.modelo_id, ct.modelo_id, cr.modelo_id,qr.modelo_id,vc.modelo_id)

)
SELECT *
FROM consolidado;;`;
})