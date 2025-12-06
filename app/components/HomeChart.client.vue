<template>
  <div ref="chart" class="grid aspect-video">
    <v-chart v-if="data" class="chart" :style="{ width: width+'px', height: height+'px' }" :option="option" autoresize />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
import VChart from 'vue-echarts';

const root = document.documentElement

const el = useTemplateRef('chart')
const { width, height } = useElementSize(el)

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkLineComponent,
]);

// Props com dados do backend
const props = defineProps<{ data: ContarIndicadoresResponse[] | null }>()

// Campos usados no gráfico
const titleTuple = computed(() => props.data?.map((item) => item.modeloNome) ?? [])
const valueTuple = computed(() => props.data?.map((item) => item.mediaIndicadores) ?? [])

// CONFIG DO GRAFICO
const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: (params: any) => {
      const p = params[0]; // somente 1 série
      const data = p.data;

      const titulo = p.axisValue;
      const valor = Number(data?.value ?? 0);

      const tokensEntrada = Number(data?.tokensentradas ?? 0);
      const tokensSaida = Number(data?.tokensaida ?? 0);
      const tokensTotais = Number(data?.tokenstotais ?? 0);

      return `
        <strong>${titulo}</strong><br/><br/>
        Assertividade: <strong>${valor.toFixed(2)}%<br/></strong>
        Média Tokens Entrada: <strong>${tokensEntrada.toFixed(2)}<br/></strong>
        Média Tokens Saída: <strong>${tokensSaida.toFixed(2)}<br/></strong>
        Média Tokens Totais: <strong>${tokensTotais.toFixed(2)}</strong>
      `;
    }
  },

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
      interval: 0,
      rotate: 30
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
      data: props.data?.map((item) => ({
        value: Number(item.mediaIndicadores),
        tokensentradas: Number(item.tokensentradas ?? 0),
        tokensaida: Number(item.tokensaida ?? 0),
        tokenstotais: Number(item.tokenstotais ?? 0),
        itemStyle: {
          color: "#00c951",
        }
      })) ?? [],

      type: 'bar',
      showBackground: true,

      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => `${params.value.toFixed(2)}%`,
        color: getComputedStyle(root).getPropertyValue('--ui-text'),
        fontSize: 12,
      },

      backgroundStyle: {
        color: getComputedStyle(root).getPropertyValue('--ui-border')
      },

      markLine: {
        symbol: 'none',
        data: [
          {
            yAxis: 85,
            name: '85%',
            lineStyle: {
              color: '#f39323',
              type: 'dashed'
            },
            label: {
              show: true,
              position: 'end',
              formatter: '{b}',
              color: getComputedStyle(root).getPropertyValue('--ui-text'),
              backgroundColor: getComputedStyle(root).getPropertyValue('--ui-bg'),
              padding: [5, 10],
              borderRadius: 4,
            }
          }
        ]
      }
    }
  ]
}));
</script>
