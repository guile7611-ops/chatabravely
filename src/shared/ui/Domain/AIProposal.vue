<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Button from '../Button/Button.vue'

defineProps<{
  suggestionText: string
  confidence?: string
}>()

const emit = defineEmits<{
  (e: 'accept', text: string): void
  (e: 'reject'): void
}>()
</script>

<template>
  <div class="p-3 bg-[var(--bg-subtle)] border border-[var(--status-info)] rounded-[var(--radius-md)] text-xs text-[var(--text-primary)] my-2">
    <div class="flex items-center justify-between font-semibold text-[var(--status-info)] mb-1.5">
      <div class="flex items-center gap-1.5">
        <Icon icon="lucide:sparkles" class="text-sm" />
        <span>Sugestão da IA</span>
      </div>
      <span v-if="confidence" class="text-[10px] text-[var(--text-tertiary)]">Confiança: {{ confidence }}</span>
    </div>

    <p class="mb-3 text-[var(--text-secondary)] italic">"{{ suggestionText }}"</p>

    <div class="flex items-center gap-2 justify-end">
      <Button variant="ghost" size="sm" @click="emit('reject')">Descartar</Button>
      <Button variant="primary" size="sm" @click="emit('accept', suggestionText)">Usar Resposta</Button>
    </div>
  </div>
</template>
