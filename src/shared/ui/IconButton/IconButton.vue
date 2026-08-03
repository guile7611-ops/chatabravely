<script setup lang="ts">
import { Icon } from '@iconify/vue'

const props = withDefaults(defineProps<{
  icon: string
  label: string
  variant?: 'ghost' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
  disabled?: boolean
}>(), {
  variant: 'ghost',
  size: 'md',
  disabled: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    class="inline-flex items-center justify-center transition-colors rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--action-primary)] disabled:opacity-50 cursor-pointer"
    :class="[
      size === 'sm' ? 'w-8 h-8 text-base' : 'w-9 h-9 text-lg',
      variant === 'ghost' ? 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]' : '',
      variant === 'secondary' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-subtle)]' : '',
      variant === 'danger' ? 'text-[var(--status-danger)] hover:bg-[var(--bg-subtle)]' : ''
    ]"
    @click="(e) => !disabled && emit('click', e)"
  >
    <Icon :icon="icon" aria-hidden="true" />
  </button>
</template>
