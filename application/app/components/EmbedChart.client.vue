<script lang="ts">
// A definição da interface de dados permanece a mesma.
export interface TesteDoEmbed {
  tipo: "TesteDoEmbed";
  nome: string;
  indicador: number;
  count: number;
}

export type DadosDoGrafico = TesteDoEmbed[];
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { defu } from 'defu';
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

// Registra os componentes necessários do ECharts.
use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

// Obtém referências reativas ao elemento do gráfico e suas dimensões.
const root = document.documentElement;
const el = useTemplateRef('chart');
const { width, height } = useElementSize(el);

// Define os props que o componente espera receber.
const props = defineProps<{ data: DadosDoGrafico | null }>();

// Estilos comuns para os eixos.
const commonAxisStyles = {
  axisLine: {
    show: true,
    lineStyle: {
      color: getComputedStyle(root).getPropertyValue('--ui-border'),
    },
  },
  axisLabel: {
    color: getComputedStyle(root).getPropertyValue('--ui-text'),
  },
  nameTextStyle: {
    color: getComputedStyle(root).getPropertyValue('--ui-text'),
  },
  axisTick: {
    lineStyle: {
      color: getComputedStyle(root).getPropertyValue('--ui-border'),
    },
  },
  splitLine: {
    lineStyle: {
      color: getComputedStyle(root).getPropertyValue('--ui-border'),
    },
  },
};

const VALORES = {
  0: 'Alucinação',
  1: 'Péssimo',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente'
} as const

const CORES = {
  0: '#004C97',
  1: '#f7931e',
  2: '#fbb03b',
  3: '#FEDD00',
  4: '#00766f',
  5: '#00c951'
} as const;

// Opção computada do ECharts que reage a mudanças nos props.
const option = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {};
  }

  // 1. Extrai os nomes dos modelos (eixo X) e os indicadores únicos (séries/cores).
  const nomes = [...new Set(props.data.map(item => item.nome))];
  const indicadores = [...new Set(props.data.map(item => item.indicador))].sort((a, b) => a - b) as (keyof typeof VALORES)[];

  // 2. Mapeia cada 'indicador' para uma série de dados do ECharts. Cada indicador terá uma cor.
  const series = indicadores.map(indicador => {
    return {
      name: `${VALORES[indicador]}`, // O nome da série será o indicador.
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      // Para cada nome de modelo no eixo X, encontra a contagem correspondente para este indicador.
      data: nomes.map(nome => {
        const item = props.data!.find(d => d.nome === nome && d.indicador === indicador);
        return item ? item.count : 0; // Usa 0 se não houver dados.
      }),
    };
  });

  // 3. Constrói a configuração final do gráfico.
  return {
    color: indicadores.map(indicador => CORES[indicador]),
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow', // Mostra uma sombra sobre o grupo de barras do modelo.
      },
    },
    legend: {
      // A legenda agora é baseada nos indicadores.
      data: indicadores.map(i => `${VALORES[i]}`),
      bottom: 10,
      textStyle: {
        color: getComputedStyle(root).getPropertyValue('--ui-text'),
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%', // Deixa espaço para a legenda e rótulos rotacionados.
      containLabel: true,
    },
    xAxis: defu({
      type: 'category',
      // Os nomes dos modelos são as categorias no eixo X.
      data: nomes,
      axisLabel: {
        // Rotaciona os rótulos para evitar sobreposição, já que os nomes podem ser longos.
        rotate: 360
      }
    }, commonAxisStyles),
    yAxis: defu({
      type: 'value',
      name: 'Count',
    }, commonAxisStyles),
    // As séries de dados, uma para cada indicador.
    series: series,
  };
});
</script>

<template>
  <div ref="chart" class="grid aspect-video">
    <v-chart v-if="option.series" class="chart" :style="{ width: width + 'px', height: height + 'px' }" :option="option" autoresize />
  </div>
</template>