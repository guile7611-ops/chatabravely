<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  padding?: boolean
}>()
</script>

<template>
  <div class="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] overflow-hidden">
    <div v-if="title || $slots.header" class="px-4 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
      <div>
        <h3 v-if="title" class="text-sm font-semibold text-[var(--text-primary)]">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-[var(--text-tertiary)] mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="header-actions" />
    </div>

    <div :class="padding !== false ? 'p-4' : ''">
      <slot />
    </div>

    <div v-if="$slots.footer" class="px-4 py-2.5 bg-[var(--bg-subtle)] border-t border-[var(--border-default)]">
      <slot name="footer" />
    </div>
  </div>
</template>
