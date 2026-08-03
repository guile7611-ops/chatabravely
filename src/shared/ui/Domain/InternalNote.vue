<script setup lang="ts">
defineProps<{
  author: string
  content: string
  createdAt: string
}>()
</script>

<template>
  <div class="p-3 bg-[var(--bg-subtle)] border-l-4 border-l-[var(--status-warning)] rounded-[var(--radius-sm)] text-xs text-[var(--text-primary)] my-2">
    <div class="flex items-center justify-between text-[10px] text-[var(--status-warning)] font-semibold mb-1">
      <span>📌 Nota Interna — {{ author }}</span>
      <span>{{ createdAt }}</span>
    </div>
    <p class="whitespace-pre-wrap">{{ content }}</p>
  </div>
</template>
