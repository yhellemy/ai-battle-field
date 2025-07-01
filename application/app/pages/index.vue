<script setup lang="ts">
definePageMeta({
  colorMode: 'light',
})
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
            <HomeChart />
          </UCard>
        </div>
        <div class="col-span-4 ring ring-default rounded-md"></div>
        <div class="col-span-4 ring ring-default rounded-md"></div>
        <div class="col-span-8 aspect-video ring ring-default rounded-md"></div>
      </div>
    </div>
  </div>
</template>