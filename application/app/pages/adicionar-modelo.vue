<script setup lang="ts">
import { UBadge, UButton } from '#components'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  colorMode: 'light',
})

interface cols  {
  "modelo_id": number,
  "nome_modelo": string,
  "direitometrica": number,
  "matematica": number,
  "media_geral": string
}

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
const { data: tabela, status: tabelaStatus } = await useAsyncData('tabela',() => $fetch<cols[]>('/api/tabela'))

const selectedProvider = ref<number | undefined>(undefined)

watch(providers, (currentProviderList) => {
  if (typeof selectedProvider.value === 'undefined') {
    selectedProvider.value = currentProviderList?.at(0)?.id
  }
}, { immediate: true, once: true })

const sorting = ref([
  {
    id: 'media_geral',
    desc: false
  }
])

const columns: TableColumn<cols>[] = [
  {
    accessorKey: 'modelo_id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('modelo_id')}`
  },
  {
    accessorKey: 'nome_modelo',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        label: 'Modelo',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'mdi:sort-alphabetical-descending'
            : 'mdi:sort-alphabetical-ascending'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'direitometrica',

    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        label: 'Direito',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'mdi:chevron-down'
            : 'mdi:chevron-up'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'matematica',

    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        label: 'Matematica',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'mdi:chevron-down'
            : 'mdi:chevron-up'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'media_geral',
  },
]
</script>

<template>
  <div class="grid items-center mx-auto">
    <div class="grid gap-6">
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
      <UCard class="min-w-lg">
        <UTable v-if="tabela" :data="tabela" v-model:sorting="sorting" :columns="columns"  />
      </UCard>
    </div>
  </div>
</template>