import { TipoMetrica } from "@prisma/client";

export default defineEventHandler( async (event) => {
  const prisma = usePrisma()

  // query aqui
  const totalErro = await prisma.$queryRaw<ErroDetalhado[]>`
  WITH TotalErros AS (
      SELECT
	    bdq."metricaId",
        COUNT(*) AS total_geral_erros
      FROM "Resultados" AS res
      INNER JOIN "BancoDeQuestoes" AS bdq 
        ON res."bancoDeQuestoesId" = bdq.id
      WHERE
        regexp_replace(lower(trim(res."jsonResultado"->>'resposta')), '[^a-z0-9]', '', 'g') !=
        regexp_replace(lower(trim(bdq.gabarito->>'resposta')), '[^a-z0-9]', '', 'g')
		GROUP BY bdq."metricaId"
    ),
    Erros AS (
      SELECT 
        bdq."metricaId",
        res."modeloId",
        mls.nome,
        COUNT(*) AS erros
      FROM "Resultados" AS res
      INNER JOIN "BancoDeQuestoes" AS bdq 
        ON res."bancoDeQuestoesId" = bdq.id
      INNER JOIN "Modelos" AS mls on res."modeloId" = mls.id

      WHERE
        regexp_replace(lower(trim(res."jsonResultado"->>'resposta')), '[^a-z0-9]', '', 'g') !=
        regexp_replace(lower(trim(bdq.gabarito->>'resposta')), '[^a-z0-9]', '', 'g')
      GROUP BY bdq."metricaId", res."modeloId",mls.nome
    )
    SELECT 
      e."metricaId",
      e."modeloId",
      mt.tipo,
      e.nome as modelo,
      e.erros::integer,
      te.total_geral_erros::integer,
      ((e.erros::float / te.total_geral_erros) * 100 )::NUMERIC(10, 2) AS porcentagem_erro

    FROM Erros e
    inner join "Metricas" as mt on e."metricaId" = mt.id
    LEFT JOIN TotalErros te on e."metricaId" = te."metricaId";
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