<script setup lang="ts">
import { computed } from 'vue'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const props = withDefaults(defineProps<{
  variant?: BadgeVariant
  icon?: string
}>(), {
  variant: 'neutral'
})

const badgeClasses = computed(() => {
  const base = 'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-[var(--radius-sm)] border'
  
  switch (props.variant) {
    case 'success':
      return `${base} bg-[var(--bg-subtle)] text-[var(--status-success)] border-[var(--status-success)]`
    case 'warning':
      return `${base} bg-[var(--bg-subtle)] text-[var(--status-warning)] border-[var(--status-warning)]`
    case 'danger':
      return `${base} bg-[var(--bg-subtle)] text-[var(--status-danger)] border-[var(--status-danger)]`
    case 'info':
      return `${base} bg-[var(--bg-subtle)] text-[var(--status-info)] border-[var(--status-info)]`
    default:
      return `${base} bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]`
  }
})
</script>

<template>
  <span :class="badgeClasses">
    <slot name="icon" />
    <slot />
  </span>
</template>
