<script setup lang="ts">
import { Icon } from '@iconify/vue'

withDefaults(defineProps<{
  active?: boolean
  label?: string
}>(), {
  active: true,
  label: 'IA Ativa no Atendimento'
})
</script>

<template>
  <div
    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] text-xs font-medium border"
    :class="active 
      ? 'bg-[var(--bg-subtle)] text-[var(--status-info)] border-[var(--status-info)]' 
      : 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border-[var(--border-default)]'"
  >
    <Icon :icon="active ? 'lucide:bot' : 'lucide:bot-off'" class="text-sm flex-shrink-0" aria-hidden="true" />
    <span>{{ label }}</span>
  </div>
</template>
