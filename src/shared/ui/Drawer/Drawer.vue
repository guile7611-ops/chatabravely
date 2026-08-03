<script setup lang="ts">
import IconButton from '../IconButton/IconButton.vue'

withDefaults(defineProps<{
  open?: boolean
  title?: string
  width?: 'sm' | 'md' | 'lg'
}>(), {
  open: false,
  width: 'md'
})

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity"
      @click.self="emit('close')"
    >
      <div
        class="h-full bg-[var(--bg-surface)] border-l border-[var(--border-default)] shadow-[var(--shadow-overlay)] flex flex-col transition-transform duration-300 w-full"
        :class="{
          'max-w-xs': width === 'sm',
          'max-w-md': width === 'md',
          'max-w-xl': width === 'lg'
        }"
      >
        <div v-if="title || $slots.header" class="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
          <h2 v-if="title" class="text-base font-semibold text-[var(--text-primary)]">{{ title }}</h2>
          <slot name="header" />
          <IconButton icon="lucide:x" label="Fechar painel" size="sm" @click="emit('close')" />
        </div>

        <div class="p-5 overflow-y-auto flex-1 text-sm text-[var(--text-secondary)]">
          <slot />
        </div>

        <div v-if="$slots.footer" class="px-5 py-3 bg-[var(--bg-subtle)] border-t border-[var(--border-default)]">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
