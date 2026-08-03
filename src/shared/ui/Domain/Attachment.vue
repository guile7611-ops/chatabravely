<script setup lang="ts">
import { Icon } from '@iconify/vue'

withDefaults(defineProps<{
  url: string
  name?: string
  type?: string // 'image' | 'audio' | 'document' | 'video' | 'file'
}>(), {
  type: 'file'
})
</script>

<template>
  <div class="inline-flex items-center gap-2 p-2 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-xs text-[var(--text-primary)] max-w-xs overflow-hidden">
    <div class="w-8 h-8 rounded bg-[var(--bg-surface)] flex items-center justify-center text-[var(--action-primary)] flex-shrink-0">
      <Icon
        :icon="type === 'image' ? 'lucide:image' : (type === 'audio' ? 'lucide:mic' : 'lucide:file-text')"
        class="text-base"
      />
    </div>

    <div class="flex-1 min-w-0">
      <p class="font-medium truncate text-xs">{{ name || 'Anexo' }}</p>
      <span class="text-[10px] text-[var(--text-tertiary)] uppercase">{{ type }}</span>
    </div>

    <a
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
      class="p-1 text-[var(--text-tertiary)] hover:text-[var(--action-primary)] cursor-pointer"
      title="Baixar ou visualizar anexo"
    >
      <Icon icon="lucide:download" class="text-sm" />
    </a>
  </div>
</template>
