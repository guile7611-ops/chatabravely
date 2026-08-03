<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  text: string
}>()

const visible = ref(false)
</script>

<template>
  <div class="relative inline-flex" @mouseenter="visible = true" @mouseleave="visible = false" @focusin="visible = true" @focusout="visible = false">
    <slot />
    <div
      v-if="visible && text"
      role="tooltip"
      class="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--text-primary)] text-[var(--bg-surface)] text-[11px] font-medium rounded-[var(--radius-sm)] whitespace-nowrap z-50 pointer-events-none shadow-sm"
    >
      {{ text }}
    </div>
  </div>
</template>
