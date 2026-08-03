<script setup lang="ts">
import { Icon } from '@iconify/vue'

withDefaults(defineProps<{
  title: string
  description?: string
  icon?: string
}>(), {
  icon: 'lucide:inbox'
})
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] my-4">
    <div class="w-12 h-12 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-tertiary)] mb-3">
      <Icon :icon="icon" class="text-2xl" aria-hidden="true" />
    </div>

    <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ title }}</h4>
    <p v-if="description" class="text-xs text-[var(--text-tertiary)] max-w-sm mb-4">{{ description }}</p>

    <slot name="action" />
  </div>
</template>
