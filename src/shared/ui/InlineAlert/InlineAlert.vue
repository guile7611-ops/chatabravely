<script setup lang="ts">
import { Icon } from '@iconify/vue'

withDefaults(defineProps<{
  title?: string
  message: string
  variant?: 'info' | 'warning' | 'danger' | 'success'
}>(), {
  variant: 'info'
})
</script>

<template>
  <div
    class="p-3.5 rounded-[var(--radius-sm)] border flex items-start gap-3 text-xs"
    :class="{
      'bg-[var(--bg-subtle)] border-[var(--status-info)] text-[var(--text-primary)]': variant === 'info',
      'bg-[var(--bg-subtle)] border-[var(--status-warning)] text-[var(--text-primary)]': variant === 'warning',
      'bg-[var(--bg-subtle)] border-[var(--status-danger)] text-[var(--text-primary)]': variant === 'danger',
      'bg-[var(--bg-subtle)] border-[var(--status-success)] text-[var(--text-primary)]': variant === 'success'
    }"
    role="alert"
  >
    <Icon
      :icon="variant === 'warning' ? 'lucide:alert-triangle' : (variant === 'danger' ? 'lucide:alert-circle' : 'lucide:info')"
      class="text-base flex-shrink-0 mt-0.5"
      :class="{
        'text-[var(--status-info)]': variant === 'info',
        'text-[var(--status-warning)]': variant === 'warning',
        'text-[var(--status-danger)]': variant === 'danger',
        'text-[var(--status-success)]': variant === 'success'
      }"
    />
    <div class="flex flex-col gap-0.5">
      <span v-if="title" class="font-semibold text-[var(--text-primary)]">{{ title }}</span>
      <span class="text-[var(--text-secondary)]">{{ message }}</span>
    </div>
  </div>
</template>
