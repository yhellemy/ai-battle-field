import { TipoMetrica } from "@prisma/client";

export default defineEventHandler( async (event) => {
  const prisma = usePrisma()

  // query aqui
  const totalErro = await prisma.$queryRaw<ErroDetalhado[]>`
  WITH TotalDados AS (
        SELECT
        bdq."metricaId",
        res."modeloId",
        COUNT(*) AS total_geral
        FROM "Resultados" AS res
        INNER JOIN "BancoDeQuestoes" AS bdq 
         ON res."bancoDeQuestoesId" = bdq.id
		WHERE 
		res."tipoResultado" in ('ClarezaResposta', 'CompreensaoTextual') 
        GROUP BY 1,2
      ),
 	TotalErros AS (
        SELECT
        bdq."metricaId",
        res."modeloId",
        COUNT(*) AS total_geral_erros
        FROM "Resultados" AS res
        INNER JOIN "BancoDeQuestoes" AS bdq 
          ON res."bancoDeQuestoesId" = bdq.id
        WHERE
          regexp_replace(lower(trim(res."jsonResultado"->>'resposta')), '[^a-z0-9]', '', 'g') !=
          regexp_replace(lower(trim(bdq.gabarito->>'resposta')), '[^a-z0-9]', '', 'g')
          GROUP BY 1,2
      ),
    tabalucinacao AS (
      SELECT 
        bdq."metricaId",
        res."modeloId",
        COUNT(*)::integer AS totalucinacao
      FROM "Resultados" AS res
      INNER JOIN "BancoDeQuestoes" AS bdq 
      INNER JOIN "Metricas" as mt on bdq."metricaId" = mt.id

        ON res."bancoDeQuestoesId" = bdq.id
      WHERE
        (
          -- Para metricaId = Clareza da resposta
          mt.tipo = 'ClarezaResposta' AND
          NOT LOWER(TRIM(res."jsonResultado"->>'resposta')) IN ('1', '2', '3', '4', '5')
        )
        OR
        (
          -- Para metricaId = Compreensção textual
          mt.tipo = 'CompreensaoTextual' AND
          NOT regexp_replace(lower(trim(res."jsonResultado"->>'resposta')), '[^a-z0-9]', '', 'g')  IN (
            'contradio', 'implicao'
          )
        )
      GROUP BY 
        bdq."metricaId", res."modeloId")
      SELECT 
      td."metricaId",
      td."modeloId",
      mls.nome as modelo,
      mt.tipo,
      coalesce(((e.totalucinacao::float / td.total_geral) * 100)::NUMERIC(10, 2),0)  AS porcentagem_alucinacao,
  	  coalesce((((te.total_geral_erros::float - COALESCE(e.totalucinacao::float, 0) ) / td.total_geral) * 100)::NUMERIC(10, 2),0)  AS porcentagem_erros
      FROM TotalDados td
      inner join "Metricas" as mt on td."metricaId" = mt.id
      INNER JOIN "Modelos" AS mls on td."modeloId" = mls.id
      LEFT JOIN TotalErros te on td."metricaId" = te."metricaId" and td."modeloId" = te."modeloId"
	  LEFT JOIN tabalucinacao e  on td."metricaId" = e."metricaId" and td."modeloId" = e."modeloId";
  `;

  const totalAlucinacao = await prisma.$queryRaw<AlucinacaoDetalhada[]>`
    WITH TotalErros AS (
        SELECT
        bdq."metricaId",
        res."modeloId",
        COUNT(*) AS total_geral_erros
        FROM "Resultados" AS res
        INNER JOIN "BancoDeQuestoes" AS bdq 
          ON res."bancoDeQuestoesId" = bdq.id
        WHERE
          regexp_replace(lower(trim(res."jsonResultado"->>'resposta')), '[^a-z0-9]', '', 'g') !=
          regexp_replace(lower(trim(bdq.gabarito->>'resposta')), '[^a-z0-9]', '', 'g')
          GROUP BY 1,2
      ),
    tabalucinacao AS (
      SELECT 
        bdq."metricaId",
        res."modeloId",
        COUNT(*)::integer AS totalucinacao
      FROM "Resultados" AS res
      INNER JOIN "BancoDeQuestoes" AS bdq 
      INNER JOIN "Metricas" as mt on bdq."metricaId" = mt.id

        ON res."bancoDeQuestoesId" = bdq.id
      WHERE
        (
          -- Para metricaId = Clareza da resposta
          mt.tipo = 'ClarezaResposta' AND
          NOT LOWER(TRIM(res."jsonResultado"->>'resposta')) IN ('1', '2', '3', '4', '5')
        )
        OR
        (
          -- Para metricaId = Compreensção textual
          mt.tipo = 'CompreensaoTextual' AND
          NOT regexp_replace(lower(trim(res."jsonResultado"->>'resposta')), '[^a-z0-9]', '', 'g')  IN (
            'contradio', 'implicao'
          )
        )
      GROUP BY 
        bdq."metricaId", res."modeloId")
      SELECT 
      e."metricaId",
      e."modeloId",
      mls.nome as modelo,
      mt.tipo,
      e.totalucinacao::integer,
      te.total_geral_erros::integer,
      ((e.totalucinacao::float / te.total_geral_erros) * 100)::NUMERIC(10, 2)  AS porcentagem_erro
      FROM tabalucinacao e
      inner join "Metricas" as mt on e."metricaId" = mt.id
      INNER JOIN "Modelos" AS mls on e."modeloId" = mls.id
      LEFT JOIN TotalErros te on e."metricaId" = te."metricaId" and e."modeloId" = te."modeloId";
    `;


  return {
    totalErro,
    totalAlucinacao,
  } satisfies ApiResponseAlucinacao
})