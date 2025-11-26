<script lang="ts">
// Ajustamos a interface para bater exatamente com o seu JSON
export interface TesteDoEmbed {
  tipo: string;
  nome: string;
  indicador: number;
  tokensentradas: string;
  tokensaida: string;
  tokenstotais: string;
  count: string;
}

export type DadosDoGrafico = TesteDoEmbed[];
</script>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
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

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
]);

const root = document.documentElement;
const el = useTemplateRef('chart');
const { width, height } = useElementSize(el);

const props = defineProps<{ data: DadosDoGrafico | null }>();

const commonAxisStyles = {
  axisLine: {
    show: true,
    lineStyle: {
      color: getComputedStyle(root).getPropertyValue('--ui-border') || '#ccc', // Fallback de cor
    },
  },
  axisLabel: {
    color: getComputedStyle(root).getPropertyValue('--ui-text') || '#333',
  },
  nameTextStyle: {
    color: getComputedStyle(root).getPropertyValue('--ui-text') || '#333',
  },
  axisTick: {
    lineStyle: {
      color: getComputedStyle(root).getPropertyValue('--ui-border') || '#ccc',
    },
  },
  splitLine: {
    lineStyle: {
      color: getComputedStyle(root).getPropertyValue('--ui-border') || '#ccc',
    },
  },
};

const VALORES = {
  0: 'Erros',
  1: 'Acertos',
  2: 'Não Soube Responder',
  3: 'Alucinação',
} as const

const CORES = {
  0: '#f7931e',
  1: '#00c951',
  2: '#B03BFB',
  3: '#004C97', 
} as const;

const option = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {};
  }

  const nomes = [...new Set(props.data.map(item => item.nome))];
  // Ordena os indicadores
  const indicadores = [...new Set(props.data.map(item => item.indicador))].sort((a, b) => a - b) as (keyof typeof VALORES)[];

  const series = indicadores.map(indicador => {
    return {
      name: `${VALORES[indicador]}`, 
      type: 'bar',
      emphasis: { focus: 'series' },
      data: nomes.map(nome => {
        const item = props.data!.find(d => d.nome === nome && d.indicador === indicador);
        
        if (item) {
          return {
            // --- CONVERSÃO IMPORTANTE ---
            value: Number(item.count), 
            
            // Passamos os dados extras convertidos também
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
      confine: true,  
      axisPointer: {
        type: 'shadow' 
      },
      formatter: (params: any) => {
        
        if (!Array.isArray(params) || params.length === 0) return '';

        const nome = params[0].name;
        const registrosDoNome = props.data!.filter(d => d.nome === nome);
        
        const tokens = registrosDoNome[0]
          ? {
              tokensentradas: registrosDoNome[0].tokensentradas,
              tokensaida: registrosDoNome[0].tokensaida,
              tokenstotais: registrosDoNome[0].tokenstotais
            }
          : null;

        let html = `<div style="margin-bottom: 4px; font-weight: bold;">${nome}</div>`;

        params.forEach((param: any) => {
          const val = typeof param.value === 'object' ? param.value.value : param.value;

        

          html += `${param.marker} <span style="display:inline-block; width: 140px;">${param.seriesName}:</span> <b>${val}%</b><br/>`;
        });

        if (tokens) {
          html += `
            <div style="margin-top: 12px; padding-top: 1px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; color: #333; line-height: 1.4;">
              
              Média Tokens Entrada: ${tokens.tokensentradas} <br/>
              Média Tokens Saída: ${tokens.tokensaida} <br/>
              Média Tokens Total: <b>${tokens.tokenstotais}</b>
            </div>
          `;
        }

        return html;
      }
    },
    legend: {
      data: indicadores.map(i => `${VALORES[i]}`),
      top: 'top',
      bottom: 'top',
      textStyle: { color: getComputedStyle(root).getPropertyValue('--ui-text') },
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
      axisLabel: { rotate: 30 }
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
        height: 20,
        bottom: '2%',
        backgroundColor:'#00c951',
        borderColor: getComputedStyle(root).getPropertyValue('--ui-border'),
        textStyle: { color: getComputedStyle(root).getPropertyValue('--ui-text') },
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