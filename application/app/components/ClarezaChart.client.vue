<script lang="ts">
export type ValorTupla = [number, number];

export type ModeloDados = {
  modelo: string;
  valores: ValorTupla[];
};

export type DadosCompletos = ModeloDados[];
</script>

<script setup lang="ts">
import { defu } from 'defu'
import { useElementSize } from '@vueuse/core'
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, ScatterChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkLineComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

function calculateAverage(data: ValorTupla[]): number {
  let total = 0;
  for (let i = 0; i < data.length; i++) {
    total += data[i]![1] === data[i]![0] ? 100 : 0;
  }
  return total / data.length;
}

use([
  CanvasRenderer,
  BarChart,
  ScatterChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkLineComponent,
]);

const root = document.documentElement;
const el = useTemplateRef('chart');
const { width, height } = useElementSize(el);

const props = defineProps<{ data: DadosCompletos | null, scatter: boolean }>()

const commonAxisStyles = {
  axisLine: {
    show: true,
    lineStyle: {
      color: getComputedStyle(root).getPropertyValue('--ui-border')
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
      color: getComputedStyle(root).getPropertyValue('--ui-border')
    }
  },
  splitLine: {
    lineStyle: {
      color: getComputedStyle(root).getPropertyValue('--ui-border')
    }
  }
};

const universalTransition = {
  enabled: true,
  delay: () => Math.random() * 400
};


const scatterOption = computed(() => ({
  color: colors,
  legend: {
    data: props.data?.map(item=>item.modelo) ?? [],
    bottom: 10,
    textStyle: {
      color: getComputedStyle(root).getPropertyValue('--ui-text'),
    }
  },
  xAxis: defu(commonAxisStyles, {
    min: 0,
    max: 5,
    scale: true,
    name: 'Esperado',
    nameTextStyle: {
      align: 'center',
      verticalAlign: 'bottom',
    }
  }),
  yAxis: defu(commonAxisStyles, {
    min: 0,
    max: 5,
    scale: true,
    name: 'Predito',
    nameTextStyle: {
      align: 'center',
      verticalAlign: 'bottom',
    }
  }),
  series: [
    ...props.data?.map(item => {
      return {
        name: item.modelo,
        type: 'scatter',
        id: item.modelo,
        dataGroupId: item.modelo,
        universalTransition,
        data: item.valores
      }
    }) ?? [],
    {
      type: 'line',
      data: [[0, 0], [5, 5]],
      lineStyle: {
        color: '#f39323',
        type: 'dashed'
      },
      symbolSize: 0
    }
  ]
}));

// Opção para o gráfico de Barras (Bar)
const barOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  xAxis: defu(commonAxisStyles, {
    type: 'category',
    data: props.data?.map(item=>item.modelo) ?? [],
  }),
  yAxis: defu(commonAxisStyles, {
    max: 100,
  }),
  series: [
    {
      type: 'bar',
      id: 'total',
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
      data: props.data?.map((item) => {
        return {
          value: calculateAverage(item.valores),
          groupId: item.modelo,
          itemStyle: { color: "#00c951" }
        }
      }) ?? [],
      universalTransition: {
        ...universalTransition,
        seriesKey: props.data?.map(item => item.modelo) ?? [],
      }
    }
  ]
}));

const option = computed(() => props.scatter ? scatterOption.value : barOption.value);
</script>

<template>
  <div ref="chart" class="grid aspect-video">
    <v-chart v-if="option" class="chart" :style="{ width: width + 'px', height: height + 'px' }" :option="option" autoresize />
  </div>
</template>