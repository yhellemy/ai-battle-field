import { TipoMetrica } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const prisma = usePrisma();

  const contagensDetalhadas = await prisma.indicadores.groupBy({
    by: ['modeloId', 'indicador'],
    _count: {
      _all: true,
    },
    where: {
      metrica: {
        tipo: TipoMetrica.DireitoAdministrativo
      }
    }
  });

  const agregadosPorModelo = await prisma.indicadores.groupBy({
    by: ['modeloId'],
    _count: {
      _all: true,
    },
    _avg: {
      indicador: true,
    },
    where: {
      metrica: {
        tipo: TipoMetrica.DireitoAdministrativo
      }
    }
  });

  const modelos = await prisma.modelos.findMany({
    select: { id: true, nome: true },
  });
  
  const mapaNomesModelo = new Map(modelos.map(m => [m.id, m.nome]));

  const mapaAgregados = new Map(
    agregadosPorModelo.map((item) => [
      item.modeloId,
      {
        total: item._count._all,
        media: item._avg.indicador,
      },
    ])
  );

  const resultadoAgrupado = contagensDetalhadas.reduce((acc, item) => {
    const { modeloId, indicador } = item;
    const contagem = item._count._all;
    
    const agregados = mapaAgregados.get(modeloId);
    if (!agregados) return acc;

    const totalDoModelo = agregados.total;

    if (!acc[modeloId]) {
      acc[modeloId] = {
        modeloId: modeloId,
        modeloNome: mapaNomesModelo.get(modeloId) || 'Desconhecido',
        totalIndicadores: totalDoModelo,
        mediaIndicadores: agregados.media, // NOVO: Adiciona a média aqui!
        metricas: [],
      };
    }

    // Adicione a métrica detalhada.
    acc[modeloId].metricas.push({
      indicador: indicador,
      contagem: contagem,
      proporcao: totalDoModelo > 0 ? contagem / totalDoModelo : 0,
    });

    return acc;
  }, {} as Record<number, any>);

  // Retornar os valores do objeto como um array.
  return Object.values(resultadoAgrupado);
});