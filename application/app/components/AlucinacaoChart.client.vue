<template>
  <div ref="chart" class="grid">
    <v-chart v-if="data" class="chart" :style="{ width: width+'px', height: height+'px' }" :option="option" autoresize />
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent, // Adicionado para melhor controle de layout
} from 'echarts/components';
import VChart from 'vue-echarts';


use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

const root = document.documentElement;
const el = useTemplateRef('chart');
const { width, height } = useElementSize(el);

const props = defineProps<{
  data: ApiResponseAlucinacao | null;
  metrica: string; 
}>();


const chartData = computed(() => {
  if (!props.data) return [];
  
  const seriesData: any[] = [];
  
  const modelosDaMetrica = props.data.totalErro.filter(e => e.tipo === props.metrica);

  modelosDaMetrica.forEach((erroInfo, index) => {
    const alucinacaoInfo = props.data!.totalAlucinacao.find(
      a => a.modeloId === erroInfo.modeloId && a.tipo === props.metrica
    );

    const valorErro = erroInfo.porcentagem_erro;
    const valorAlucinacao = alucinacaoInfo ? alucinacaoInfo.porcentagem_erro : 0;
    const corBase = getColorByIndex(index);

    seriesData.push({
      value: valorErro,
      name: `${erroInfo.modelo}: Erro`, 
      itemStyle: { 
        color: corBase,
        opacity: 1, 
        borderWidth: 1,
        borderColor: '#fff'
      },
    });
    
    seriesData.push({
      value: valorAlucinacao,
      name: `${erroInfo.modelo}: Alucinação`, 
      itemStyle: { 
        color: corBase,
        opacity: 0.65, 
        borderWidth: 1,
        borderColor: '#fff'
      },
    });
  });
  return seriesData;
});

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
        const [modelo, tipo] = params.name.split(': ');
        return `<b>${modelo}</b><br/>${tipo}: ${params.value}`;
    }
  },
  legend: {
    type: 'scroll',
    orient: 'horizontal',
    top: 'bottom',
    left: 'left'
  },

  series: [
    {
      name: 'Desempenho por Modelo',
      type: 'pie',
      roseType: 'radius',
      radius: ['10%', '75%'], 
      center: ['50%', '50%'], 
      avoidLabelOverlap: true,
      
      label: { 
        show: false, 
      },
      labelLine: { 
        show: false,
      },
      data: chartData.value,
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