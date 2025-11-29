<script lang="ts">
// A definição da interface de dados permanece a mesma.
export interface TesteDoEmbed {
  tipo: string;
  nome: string;
  indicador: number;
  tokensentradas: string;
  tokensaida: string;
  tokenstotais: string;
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
  DataZoomComponent,
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
  DataZoomComponent,
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
  6: 'Não Soube Responder',
  0: 'Alucinação',
  1: 'Péssimo',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente'
} as const

const CORES = {
  6: '#B03BFB',
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

  const nomes = [...new Set(props.data.map(item => item.nome))];
  const indicadores = [...new Set(props.data.map(item => item.indicador))].sort((a, b) => a - b) as (keyof typeof VALORES)[];

  const series = indicadores.map(indicador => {
    return {
      name: `${VALORES[indicador]}`, 
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      data: nomes.map(nome => {
        const item = props.data!.find(d => d.nome === nome && d.indicador === indicador);
        
        if (item) {
          return {
            
            value: Number(item.count), 
            
            tokensentradas: Number(item.tokensentradas),
            tokensaida: Number(item.tokensaida),
            tokenstotais: Number(item.tokenstotais)
          };
        }
        return 0; 
      }),
    };
  });

  return {
    color: indicadores.map(indicador => CORES[indicador]),
tooltip: {
  trigger: 'axis',
  axisPointer: { type: 'shadow' },
  formatter: (params: any) => {
    const nome = params[0].axisValue;

    /* === SOMA DOS TOKENS POR NOME === */
    let totalEntrada = 0;
    let totalSaida = 0;
    let totalTokens = 0;

    params.forEach((p: any) => {
      if (p.data) {
        totalEntrada += p.data.tokensentradas ?? 0;
        totalSaida   += p.data.tokensaida ?? 0;
        totalTokens  += p.data.tokenstotais ?? 0;
      }
    });

    /* === BLOCO DAS SÉRIES (INDICADORES) === */
    let html = `<strong>${nome}</strong><br/><br/>`;

    params.forEach((p: any) => {
     html += `${p.marker} <span style="display:inline-block; width: 160px;">${p.seriesName}:</span> <b>${p.data?.value ?? 0}%</b><br/>`;
    });

    html += `
      <br/>
      Média Tokens Entrada: <strong>${totalEntrada.toFixed(2)}</strong><br/>
      Média Tokens Saída: <strong>${totalSaida.toFixed(2)}</strong><br/>
      Média Tokens Totais: <strong>${totalTokens.toFixed(2)}</strong><br/>
    `;

    return html;
  }
},

    legend: {
    data: indicadores.map(i => `${VALORES[i]}`),
    top: 'top',
    bottom: 'top',
    textStyle: {
    color: getComputedStyle(root).getPropertyValue('--ui-text'),
      },
    },
    grid: {
  left: '3%',
    right: '4%',
    bottom: '15%', 
    containLabel: true
    },
    xAxis: defu({
      type: 'category',
      data: nomes,
      axisLabel: {
        rotate: 30
      }
    }, commonAxisStyles),
    yAxis: defu({
      type: 'value',
      name: '(%)',
    }, commonAxisStyles),
    dataZoom: [
  {
    type: 'slider', 
    show: true,
    xAxisIndex: 0,
    start: 0,
    end: 100,
    handleIcon:'circle',
    handleSize: '100%',
    bottom: '2%', 
    height: 20,
    backgroundColor:'#00c951',
    borderColor: getComputedStyle(root).getPropertyValue('--ui-border'),
    fillerColor: getComputedStyle(root).getPropertyValue('--ui-border'),
    showDataShadow: true,
    textStyle: {
      color: getComputedStyle(root).getPropertyValue('--ui-text'),
    },
  }
],

    series: series,
  };
});
</script>

<template>
  <div ref="chart" class="grid aspect-video">
    <v-chart v-if="option.series" class="chart" :style="{ width: width + 'px', height: height + 'px' }" :option="option" autoresize />
  </div>
</template>