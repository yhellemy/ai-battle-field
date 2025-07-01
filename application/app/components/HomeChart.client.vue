<template>
  <div ref="chart" class="grid aspect-video">
    <v-chart v-if="data" class="chart" :style="{ width: width+'px', height: height+'px' }" :option="option" autoresize />
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';

import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkLineComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { ref, provide } from 'vue';

const root = document.documentElement

const el = useTemplateRef('chart')
const { width, height } = useElementSize(el)
let intervalId: any | null = null;

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkLineComponent,
]);


const { data, refresh } = useAsyncData('contar-indicadores', async () => await $fetch('/api/contar-indicadores'))
// provide(THEME_KEY, 'dark');

const titleTuple = computed(() => data.value ? data.value.map((indicador) => indicador.modeloNome) : [])
const valueTuple = computed(() => data.value ? data.value.map((indicador) => indicador.mediaIndicadores) : [])

/* [
  '#13a538', 
  '#f9b03d',
  '#f39323',
  '#d56f24',
  '#00776f',
  '#03504b',
  '#074223'
] */
const option = computed(() => ({
  color: '#13a538',
  xAxis: {
    type: 'category',
    data: titleTuple.value,
    axisLine: {
      show: true,
      lineStyle: {
        color: getComputedStyle(root).getPropertyValue('--ui-border')
      },
    },
    axisLabel: {
      color: getComputedStyle(root).getPropertyValue('--ui-text'),
    }
  },
  yAxis: {
    type: 'value',
    show: true,
    splitLine: {
      lineStyle: {
        color: getComputedStyle(root).getPropertyValue('--ui-border')
      }
    },
    min: 0,
    max: 100,
  },
  axisTick: {
    lineStyle: {
      color: getComputedStyle(root).getPropertyValue('--ui-border')
    }
  },
  series: [
    {
      data: valueTuple.value,
      type: 'bar',
      showBackground: true,
      backgroundStyle: {
        color: getComputedStyle(root).getPropertyValue('--ui-border')
      },
      markLine: {
        symbol: 'none', // Remove as setas nas pontas da linha
        data: [
          {
            yAxis: 85, // Posição da linha no eixo Y (85% de 200)
            name: '85%',
            lineStyle: {
              color: '#f39323', // Cor da linha
              type: 'dashed' // Estilo da linha (pode ser 'solid', 'dashed', 'dotted')
            },
            label: {
              show: true,
              position: 'end',
              formatter: '{b}',
              // Cor do texto
              color: getComputedStyle(root).getPropertyValue('--ui-text'),
              // Cor de fundo (borda)
              backgroundColor: getComputedStyle(root).getPropertyValue('--ui-bg'),
              // Espaçamento para o fundo aparecer
              padding: [5, 10],
              // Bordas arredondadas
              borderRadius: 4,
            }
          }
        ]
      }
    }
  ]
}));

onMounted(() => {
  intervalId = setInterval(refresh, 10000);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>