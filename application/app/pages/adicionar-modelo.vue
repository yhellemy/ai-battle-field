<script setup lang="ts">
definePageMeta({
  colorMode: 'light',
})

const toast = useToast()

const modelo = ref('')
async function adicionarModelo () {
  const { data, error } = await asyncEnvelope(async () => await $fetch('/api/modelos/modelo', {
    method: 'POST',
    body: {
      modelo: modelo.value,
      provedor: 1,
    },
  }))
  
  if (error) return toast.add({
    title: 'Falha ao adicionar modelo ' + modelo.value,
    color: 'error'
  })
  else if (data) return toast.add({
    title: 'Modelo adicionado com sucesso!',
    description: 'O modelo ' + modelo.value + ' foi adicionado, e recebeu o ID ' + data.id
  })
}

const { data: providers, status: providerStatus } = await useAsyncData('providers',() => $fetch('/api/providers'))

const selectedProvider = ref<number | undefined>(undefined)

watch(providers, (currentProviderList) => {
  if (typeof selectedProvider.value === 'undefined') {
    selectedProvider.value = currentProviderList?.at(0)?.id
  }
}, { immediate: true, once: true })
</script>

<template>
  <div class="grid items-center mx-auto">
    <UCard class="min-w-lg">
      <template #header>
        <div class="text-lg">
          Adicionar Modelo
        </div>
        <div class="text-sm text-[var(--ui-text-dimmed)]">
          Adicione um novo modelo a ser processado
        </div>
      </template>

      <div>
        <div class="grid gap-3 grid-flow-col">
          <USelectMenu v-if="providers" :items="providers" value-key="id" label-key="nome" v-model="selectedProvider"></USelectMenu>
          <UInput v-model="modelo" placeholder="Modelo..." />
        </div>
      </div>

      <template #footer>
        <div class="grid justify-end">
          <UButton @click="adicionarModelo()">Enviar</UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>