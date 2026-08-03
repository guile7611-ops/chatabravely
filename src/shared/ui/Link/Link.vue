<script setup lang="ts">
defineProps<{
  href?: string
  external?: boolean
}>()
</script>

<template>
  <a
    :href="href || '#'"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    class="text-sm font-medium text-[var(--action-primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--action-primary)] rounded-sm cursor-pointer"
  >
    <slot />
  </a>
</template>
