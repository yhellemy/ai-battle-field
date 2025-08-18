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

const props = defineProps<{ data: ContarIndicadoresResponse[] | null }>()

const titleTuple = computed(() => props.data?.map((indicador) => indicador.modeloNome) ?? [])
const valueTuple = computed(() => props.data?.map((indicador) => indicador.mediaIndicadores) ?? [])


const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
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
      data: valueTuple.value.map((value) => ({
        value: value,
        itemStyle: {
          color: "#00c951",
           
        }
      })),
      type: 'bar',
      showBackground: true,
      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => {
          return `${params.value.toFixed(2)}%`;
        },
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