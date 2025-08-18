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
  metrica: string; // O `tipo` da métrica para filtrar
}>();

// 1. Processa os dados para criar uma lista única para a série do gráfico
const chartData = computed(() => {
  if (!props.data) return [];
  
  const seriesData: any[] = [];
  
  // Filtra os modelos únicos que possuem dados para a métrica selecionada
  const modelosDaMetrica = props.data.totalErro.filter(e => e.tipo === props.metrica);

  modelosDaMetrica.forEach((erroInfo, index) => {
    // Encontra o dado de alucinação correspondente
    const alucinacaoInfo = props.data!.totalAlucinacao.find(
      a => a.modeloId === erroInfo.modeloId && a.tipo === props.metrica
    );

    const valorErro = erroInfo.porcentagem_erro;
    const valorAlucinacao = alucinacaoInfo ? alucinacaoInfo.porcentagem_erro : 0;
    const corBase = getColorByIndex(index);

    // Adiciona uma fatia para "Erro"
    seriesData.push({
      value: valorErro,
      name: `${erroInfo.modelo}: Erro`, // Nome descritivo para o tooltip
      itemStyle: { 
        color: corBase,
        opacity: 1, // Sólido
        borderWidth: 1,
        borderColor: '#fff'
      },
    });
    
    // Adiciona uma fatia para "Alucinação"
    seriesData.push({
      value: valorAlucinacao,
      name: `${erroInfo.modelo}: Alucinação`, // Nome descritivo para o tooltip
      itemStyle: { 
        color: corBase,
        opacity: 0.65, // Semitransparente
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
        // Formato: "Modelo: Tipo" <br/> "Contagem: valor"
        const [modelo, tipo] = params.name.split(': ');
        return `<b>${modelo}</b><br/>${tipo}: ${params.value}`;
    }
  },
  legend: {
    top: 'bottom',
    left: 'center'
  },

  series: [
    {
      name: 'Desempenho por Modelo',
      type: 'pie',
      // Chave para transformar em um Nightingale Rose Chart
      // O raio da fatia representa o valor, não o ângulo.
      roseType: 'radius',
      radius: ['20%', '75%'], // Define o tamanho do gráfico, com um centro vazio
      center: ['50%', '50%'], // Centraliza o gráfico
      avoidLabelOverlap: true,
      
      label: { 
        show: false, // Rótulos podem poluir um gráfico Nightingale, melhor usar tooltip
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
  height: 400px; /* Defina uma altura padrão ou herde conforme necessário */
}
</style>