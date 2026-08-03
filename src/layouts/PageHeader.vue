<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-default)]">
    <div class="text-left">
      <h2 class="text-lg font-bold text-[var(--text-primary)] tracking-tight">{{ title }}</h2>
      <p v-if="description" class="text-xs text-[var(--text-tertiary)] mt-0.5">{{ description }}</p>
    </div>

    <div v-if="$slots.actions" class="flex items-center gap-2 flex-shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
