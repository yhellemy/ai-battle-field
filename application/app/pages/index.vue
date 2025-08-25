<script setup lang="ts">
import type { DadosCompletos } from '~/components/ClarezaChart.client.vue';

definePageMeta({
  colorMode: 'light',
})

let intervalId: any | null = null;

const scatter = ref(false)

const { data: compreensaoChartData, refresh: refreshIndicadores } = useAsyncData('contar-indicadores', async () => await $fetch<ContarIndicadoresResponse[]>('/api/contar-indicadores'))
const { data: clarezaChartData, refresh: refreshClareza } = useAsyncData('contar-clareza', () => $fetch<ClarezaRespostaResponse>('/api/contar-clareza'))
const { data: alucinacaoData, refresh: refreshAlucinacao } = useAsyncData('alucinacao', () => $fetch<ApiResponseAlucinacao>('/api/alucinacao'))
const { data: embedtestData, refresh: refreshEmbed } = useAsyncData('embedtest', () => $fetch<TesteDoEmbed[]>('/api/embedtest'))
const { data: direitoChartData, refresh: refreshDireito } = useAsyncData('direito-adm', () => $fetch<DireitoAdmResponse[]>('/api/direito-adm'))

onMounted(() => {
  intervalId = setInterval(async () => {
    await Promise.all([
      refreshIndicadores(),
      refreshClareza(),
      refreshAlucinacao(),
      refreshEmbed(),
    ])
  }, 10000);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>

<template>
  <div class="grid">
    <div class="max-w-7xl w-full mx-auto grid p-6 items-start">
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-8">
          <UCard :ui="{ body: '!p-0' }">
            <template #header>
              <div class="text-lg">
                Compreensão Textual
              </div>
              <div class="text-sm text-[var(--ui-text-dimmed)]">
                Inferência de linguagem natural
              </div>
            </template>
            <HomeChart v-if="compreensaoChartData" :data="compreensaoChartData" />
          </UCard>
        </div>
        <div class="col-span-4 rounded-md grid">
          <UCard :ui="{ body: '!p-0 grid items-center', }" class="grid grid-rows-[max-content_1fr]">
            <template #header>
              <div class="grid grid-flow-col justify-between items-center">
                <div class="grid">
                  <div class="text-lg">
                    Imprecisão e Alucinação (CT)
                  </div>
                  <div class="text-sm text-[var(--ui-text-dimmed)]">&nbsp;</div>
                </div>
                <div>
                  
                </div>
              </div>
            </template>
            <div v-if="alucinacaoData">
              <AlucinacaoChart :data="alucinacaoData" :metrica="TipoMetrica.CompreensaoTextual" />
            </div>
            <div v-else class="grid h-full"></div>
          </UCard>
        </div>
        <div class="col-span-4 rounded-md grid">
          <UCard :ui="{ body: '!p-0 grid items-center', }" class="grid grid-rows-[max-content_1fr]">
            <template #header>
              <div class="grid grid-flow-col justify-between items-center">
                <div class="grid">
                  <div class="text-lg">
                    Imprecisão e Alucinação (CR)
                  </div>
                  <div class="text-sm text-[var(--ui-text-dimmed)]">&nbsp;</div>
                </div>
                <div>
                  
                </div>
              </div>
            </template>
            <AlucinacaoChart v-if="alucinacaoData" :data="alucinacaoData" :metrica="TipoMetrica.ClarezaResposta" />
            <div v-else class="grid h-full"></div>
          </UCard>
        </div>
        <div class="col-span-8 aspect-video ring ring-default rounded-md">
          <UCard :ui="{ body: '!p-0' }">
            <template #header>
              <div class="grid grid-flow-col justify-between items-center">
                <div class="grid">
                  <div class="text-lg">
                    Clareza da Resposta
                  </div>
                  <div class="text-sm text-[var(--ui-text-dimmed)]">LLM como julgador</div>
                </div>
                <div>
                  <USwitch label="Dispersão" v-model="scatter" />
                </div>
              </div>
            </template>
            <ClarezaChart v-if="clarezaChartData" :data="clarezaChartData" :scatter />
          </UCard>
        </div>
        <div class="col-span-12 aspect-video ring ring-default rounded-md">
          <UCard :ui="{ body: '!p-0' }">
            <template #header>
              <div class="grid grid-flow-col justify-between items-center">
                <div class="grid">
                  <div class="text-lg">
                    Qualidade da Resposta
                  </div>
                  <div class="text-sm text-[var(--ui-text-dimmed)]">LLM como julgador</div>
                </div>
              </div>
            </template>
            <EmbedChart v-if="embedtestData" :data="embedtestData" :scatter />
          </UCard>
        </div>
        <div class="col-span-12">
          <UCard :ui="{ body: '!p-0' }">
            <template #header>
              <div class="text-lg">
                Direito Administrativo
              </div>
              <div class="text-sm text-[var(--ui-text-dimmed)]">
                Avaliação direito
              </div>
            </template>
            <HomeChart v-if="direitoChartData" :data="direitoChartData" />
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>