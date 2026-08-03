<script setup lang="ts">
import { Icon } from '@iconify/vue'

export interface TimelineItem {
  id: string
  title: string
  timestamp: string
  author?: string
  icon?: string
}

defineProps<{
  items: TimelineItem[]
}>()
</script>

<template>
  <div class="flex flex-col gap-3 relative pl-4 border-l border-[var(--border-default)] ml-2 text-xs">
    <div
      v-for="item in items"
      :key="item.id"
      class="relative flex flex-col gap-0.5 text-left"
    >
      <div class="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--action-primary)]" />
      <div class="flex items-center justify-between gap-2">
        <span class="font-semibold text-[var(--text-primary)]">{{ item.title }}</span>
        <span class="text-[10px] text-[var(--text-tertiary)]">{{ item.timestamp }}</span>
      </div>
      <span v-if="item.author" class="text-[var(--text-secondary)]">Por {{ item.author }}</span>
    </div>
  </div>
</template>
