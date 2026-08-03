<script setup lang="ts">
import { Icon } from '@iconify/vue'

const props = withDefaults(defineProps<{
  label: string
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  icon?: string
}>(), {
  status: 'neutral'
})
</script>

<template>
  <div class="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
    <Icon v-if="icon" :icon="icon" aria-hidden="true" class="text-sm" />
    <span
      v-else
      class="w-2 h-2 rounded-full flex-shrink-0"
      :class="{
        'bg-[var(--status-success)]': status === 'success',
        'bg-[var(--status-warning)]': status === 'warning',
        'bg-[var(--status-danger)]': status === 'danger',
        'bg-[var(--status-info)]': status === 'info',
        'bg-[var(--text-tertiary)]': status === 'neutral'
      }"
    />
    <span>{{ label }}</span>
  </div>
</template>
