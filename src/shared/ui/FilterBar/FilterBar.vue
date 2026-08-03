<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  activeCount?: number
}>()

const emit = defineEmits<{
  (e: 'clear'): void
}>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 p-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-sm)] mb-3 text-xs text-[var(--text-secondary)]">
    <div class="flex items-center gap-1 font-medium text-[var(--text-primary)] mr-1">
      <Icon icon="lucide:filter" class="text-sm" />
      <span>Filtros</span>
      <span v-if="activeCount" class="px-1.5 py-0.2 rounded-full bg-[var(--action-primary)] text-white text-[10px]">
        {{ activeCount }}
      </span>
    </div>

    <div class="flex flex-wrap items-center gap-2 flex-1">
      <slot />
    </div>

    <button
      v-if="activeCount"
      type="button"
      class="text-xs text-[var(--action-primary)] hover:underline font-medium cursor-pointer ml-auto"
      @click="emit('clear')"
    >
      Limpar filtros
    </button>
  </div>
</template>
