
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Links',
      type: 'label'
    },
    {
      icon: 'material-symbols:shield-spark-outline-rounded',
      label: 'Início',
      to: { name: 'index' }
    },
    {
      icon: 'material-symbols:network-intelligence-update-rounded',
      label: 'Add Modelo',
      to: { name: 'adicionar-modelo' }
    },
  ]
])
</script>

<template>
  <div class="grid min-h-dvh grid-rows-[max-content_1fr]">
    <div class="border-b border-[var(--ui-border)] px-3">
      <AssetsLogo />
    </div>
    <div class="grid grid-cols-[max-content_1fr] gap-3">
      <div class="grid p-4 border-r border-[var(--ui-bg-elevated)]">
        <div class="grid">
          <UNavigationMenu orientation="vertical" :items="items" class="data-[orientation=vertical]:w-48" />
        </div>
      </div>
      <div class="grid">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
