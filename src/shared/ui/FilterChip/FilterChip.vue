<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  label: string
  value: string
}>()

const emit = defineEmits<{
  (e: 'remove'): void
}>()
</script>

<template>
  <div class="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-xs text-[var(--text-primary)]">
    <span class="text-[var(--text-tertiary)]">{{ label }}:</span>
    <span class="font-medium">{{ value }}</span>
    <button
      type="button"
      class="text-[var(--text-tertiary)] hover:text-[var(--status-danger)] ml-0.5 cursor-pointer"
      aria-label="Remover filtro"
      @click="emit('remove')"
    >
      <Icon icon="lucide:x" class="text-xs" />
    </button>
  </div>
</template>
