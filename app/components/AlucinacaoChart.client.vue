<template>
  <div ref="chart" class="grid">
    <v-chart
      v-if="data"
      class="chart"
      :style="{ width: width + 'px', height: height + 'px' }"
      :option="option"
      autoresize
    />
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

// Registrar módulos necessários do ECharts
use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

const el = useTemplateRef('chart');
const { width, height } = useElementSize(el);

const props = defineProps<{
  data: ApiResponseAlucinacao | null;
  metrica: string;
}>();


const chartData = computed(() => {
  if (!props.data) return { modelos: [], erros: [], alucinacoes: [] };

  const modelosDaMetrica = props.data.totalErro.filter(
    (e) => e.tipo === props.metrica
  );

  const modelos: string[] = [];
  const erros: number[] = [];
  const alucinacoes: number[] = [];

  modelosDaMetrica.forEach((erroInfo) => {
    const alucinacaoInfo = props.data!.totalErro.find(
      (a) => a.modeloId === erroInfo.modeloId && a.tipo === props.metrica
    );

    modelos.push(erroInfo.modelo);
    erros.push(erroInfo.porcentagem_erros);
    alucinacoes.push(alucinacaoInfo ? alucinacaoInfo.porcentagem_alucinacao : 0);
  });

  return { modelos, erros, alucinacoes };
});

/**
 * Configuração do gráfico de barras
 */
const option = computed(() => ({
  title: {
    left: 'center',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: any) => {
      const modelo = params[0]?.name || '';
      let texto = `<b>${modelo}</b><br/>`;
      params.forEach((p: any) => {
        texto += `${p.marker} ${p.seriesName}: ${p.value}%<br/>`;
      });
      return texto;
    },
  },
  legend: {
    bottom: 0,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01],
    name: '%',
  },
  yAxis: {
    type: 'category',
    data: chartData.value.modelos,
  },
  series: [
    {
      name: 'Erros',
      type: 'bar',
      data: chartData.value.erros,
      itemStyle: { color: '#f7931e' }, 
    },
    {
      name: 'Alucinações',
      type: 'bar',
      data: chartData.value.alucinacoes,
      itemStyle: { color: '#004C97' }, 
    },
  ],
}));
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
.grid {
  height: 400px;
}
</style>
