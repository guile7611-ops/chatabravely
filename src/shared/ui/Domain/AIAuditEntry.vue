<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  action: string
  timestamp: string
  confidence?: string
  modelName?: string
}>()
</script>

<template>
  <div class="p-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-xs text-[var(--text-primary)] flex items-start gap-2 my-1">
    <Icon icon="lucide:shield-check" class="text-[var(--status-info)] text-base flex-shrink-0 mt-0.5" />
    <div class="flex-1 min-w-0 flex flex-col gap-0.5">
      <div class="flex items-center justify-between gap-1">
        <span class="font-medium text-[var(--text-primary)] truncate">{{ action }}</span>
        <span class="text-[10px] text-[var(--text-tertiary)] flex-shrink-0">{{ timestamp }}</span>
      </div>
      <div class="flex items-center gap-3 text-[10px] text-[var(--text-tertiary)]">
        <span v-if="modelName">Modelo: {{ modelName }}</span>
        <span v-if="confidence">Confiança: {{ confidence }}</span>
      </div>
    </div>
  </div>
</template>
