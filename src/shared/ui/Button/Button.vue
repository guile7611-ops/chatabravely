<script setup lang="ts">
import { computed } from 'vue'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button'
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer'
  
  const sizeCls = props.size === 'sm' 
    ? 'px-3 py-1.5 text-xs rounded-[var(--radius-sm)] gap-1.5 min-h-[32px]'
    : 'px-4 py-2 text-sm rounded-[var(--radius-sm)] gap-2 min-h-[36px]'

  let variantCls = ''
  if (props.variant === 'primary') {
    variantCls = 'bg-[var(--action-primary)] text-white hover:bg-[var(--action-primary-hover)] focus:ring-[var(--action-primary)]'
  } else if (props.variant === 'secondary') {
    variantCls = 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] focus:ring-[var(--border-strong)]'
  } else if (props.variant === 'danger') {
    variantCls = 'bg-[var(--status-danger)] text-white hover:opacity-90 focus:ring-[var(--status-danger)]'
  } else if (props.variant === 'ghost') {
    variantCls = 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:ring-[var(--border-default)]'
  }

  return `${base} ${sizeCls} ${variantCls}`
})

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="handleClick"
  >
    <svg 
      v-if="loading" 
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <slot />
  </button>
</template>
