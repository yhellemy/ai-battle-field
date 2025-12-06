<script setup lang="ts">
import { UBadge, UButton, UDropdownMenu, UModal } from '#components'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({
  colorMode: 'light',
})

interface cols  {
  "id": number,
  "nome_modelo": string,
  "compreensaotextualmetrica": number,
  "qualidaderesposta": number,
  "clarezarespostametrica": number,
  "direitometrica": number,
  "matematica": number,
  "raciociniometrica": number,
  "vibecode": number,
  "tokensentradas": number,
  "tokensaida": number,
  "tokenstotais": number
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

async function deletarModelo (id: number) {
  const { error } = await asyncEnvelope(async () => await $fetch('/api/modelos/modelo', {
    method: 'DELETE',
    body: {
      id: id
    }
  }))

  if (error) return toast.add({
    title: 'Falha ao deletar modelo',
    color: 'error'
  })
  
  refreshNuxtData('tabela')
  return toast.add({
    title: 'Modelo deletado com sucesso!'
  })
}

async function atualizarModelo (id: number) {
  const { error } = await asyncEnvelope(async () => await $fetch('/api/modelos/modelo', {
    method: 'PUT',
    body: {
      id: id,
    }
  }))

  if (error) return toast.add({
    title: 'Falha ao atualizar modelo',
    color: 'error'
  })

  refreshNuxtData('tabela')
  return toast.add({
    title: 'Modelo atualizado com sucesso!'
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

])

const columns: TableColumn<cols>[] = [
  {
    id: 'actions',
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
    accessorKey: 'compreensaotextualmetrica',

    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        label: 'Compreensão Textual',
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
    accessorKey: 'qualidaderesposta',

    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        label: 'Qualidade da Resposta',
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
    accessorKey: 'clarezarespostametrica',

    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        label: 'Clareza da Resposta',
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
    accessorKey: 'raciociniometrica',

    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        label: 'Raciocínio lógico',
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
    accessorKey: 'vibecode',

    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        label: 'Criação de Código',
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
    accessorKey: 'tokensentradas',

    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        label: 'Total Tokens de Entrada',
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
    accessorKey: 'tokensaida',

    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        label: 'Total Tokens de Saída',
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
    accessorKey: 'tokenstotais',

    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        label: 'Total Tokens',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'mdi:chevron-down'
            : 'mdi:chevron-up'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  }
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
        <UTable v-if="tabela" :data="tabela" v-model:sorting="sorting" :columns="columns">
          <template #actions-cell="{ row }">
            <UDropdownMenu :items="[
              [{
                label: 'Atualizar Modelo',
                icon: 'i-heroicons-arrow-path-20-solid',
                onSelect: () => {
                  atualizarModelo(row.original.id)
                }
              }],
              [{
                label: 'Deletar Modelo',
                icon: 'i-heroicons-trash-20-solid',
                onSelect: () => {
                  deletarModelo(row.original.id)
                }
              }]
            ]">
              <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
            </UDropdownMenu>
          </template>
        </UTable>
      </UCard>
    </div>
  </div>
</template>