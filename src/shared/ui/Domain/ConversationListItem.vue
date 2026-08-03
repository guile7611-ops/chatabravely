<script setup lang="ts">
import Avatar from '../Avatar/Avatar.vue'

defineProps<{
  id: string
  contactName: string
  avatarUrl?: string | null
  channelName: string
  lastMessage: string
  updatedAt: string
  unreadCount?: number
  active?: boolean
  assignedTo?: string
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()
</script>

<template>
  <div
    class="p-2.5 transition-colors cursor-pointer flex items-start gap-2.5 text-xs select-none"
    :class="active 
      ? 'bg-[var(--bg-subtle)] border-l-2 border-l-[var(--action-primary)]' 
      : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)]'"
    @click="emit('select', id)"
  >
    <Avatar :name="contactName" :src="avatarUrl" size="sm" />

    <div class="flex-1 min-w-0 flex flex-col gap-0.5">
      <div class="flex items-center justify-between gap-1">
        <span class="font-semibold text-[var(--text-primary)] truncate text-xs">{{ contactName }}</span>
        <span class="text-[10px] text-[var(--text-tertiary)] flex-shrink-0">{{ updatedAt }}</span>
      </div>

      <p class="text-[var(--text-secondary)] truncate text-[11px] leading-tight">{{ lastMessage }}</p>

      <div class="flex items-center justify-between gap-2 mt-1">
        <span class="text-[9px] text-[var(--text-tertiary)] bg-[var(--bg-subtle)] px-1.5 py-0.2 rounded-[var(--radius-sm)] border border-[var(--border-default)]">
          {{ channelName }}
        </span>

        <span
          v-if="unreadCount && unreadCount > 0"
          class="px-1.5 py-0.2 rounded-full bg-[var(--action-primary)] text-white text-[10px] font-bold"
        >
          {{ unreadCount }}
        </span>
      </div>
    </div>
  </div>
</template>
