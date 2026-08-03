<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import IconButton from '../IconButton/IconButton.vue'

const props = withDefaults(defineProps<{
  open?: boolean
  title?: string
}>(), {
  open: false
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) {
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] flex flex-col max-h-[85vh] overflow-hidden"
      >
        <div v-if="title || $slots.header" class="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
          <h2 v-if="title" class="text-base font-semibold text-[var(--text-primary)]">{{ title }}</h2>
          <slot name="header" />
          <IconButton icon="lucide:x" label="Fechar diálogo" size="sm" @click="emit('close')" />
        </div>

        <div class="p-5 overflow-y-auto flex-1 text-sm text-[var(--text-secondary)]">
          <slot />
        </div>

        <div v-if="$slots.footer" class="px-5 py-3 bg-[var(--bg-subtle)] border-t border-[var(--border-default)] flex items-center justify-end gap-2">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
