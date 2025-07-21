<script setup lang="ts">
import type { DadosCompletos } from '~/components/ClarezaChart.client.vue';

definePageMeta({
  colorMode: 'light',
})

let intervalId: any | null = null;

const scatter = ref(false)

const { data: compreensaoChartData, refresh: refreshIndicadores } = useAsyncData('contar-indicadores', async () => await $fetch<ContarIndicadoresResponse[]>('/api/contar-indicadores'))
const { data: clarezaChartData, refresh: refreshClareza } = useAsyncData('contar-clareza', () => $fetch<ClarezaRespostaResponse>('/api/contar-clareza'))

onMounted(() => {
  intervalId = setInterval(async () => {
    await Promise.all([
      refreshIndicadores(),
      refreshClareza()
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
        <div class="col-span-4 ring ring-default rounded-md"></div>
        <div class="col-span-4 ring ring-default rounded-md"></div>
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
      </div>
    </div>
  </div>
</template>