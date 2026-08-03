<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  online?: boolean
}>(), {
  src: null,
  size: 'md',
  online: undefined
})

const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return props.name.slice(0, 2).toUpperCase()
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-7 h-7 text-xs'
    case 'lg': return 'w-11 h-11 text-base'
    default: return 'w-9 h-9 text-sm'
  }
})
</script>

<template>
  <div class="relative inline-flex flex-shrink-0">
    <img
      v-if="src"
      :src="src"
      :alt="name"
      class="rounded-full object-cover border border-[var(--border-default)]"
      :class="sizeClasses"
    />
    <div
      v-else
      class="rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold border border-[var(--border-default)] flex items-center justify-center select-none"
      :class="sizeClasses"
      aria-hidden="true"
    >
      {{ initials }}
    </div>

    <span
      v-if="online !== undefined"
      class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-surface)]"
      :class="online ? 'bg-[var(--status-success)]' : 'bg-[var(--text-tertiary)]'"
      :title="online ? 'Online' : 'Offline'"
    />
  </div>
</template>
