<script setup lang="ts">
withDefaults(defineProps<{
  height?: string
  width?: string
  circle?: boolean
}>(), {
  height: '16px',
  width: '100%',
  circle: false
})
</script>

<template>
  <div
    class="animate-pulse bg-[var(--bg-subtle)]"
    :class="circle ? 'rounded-full' : 'rounded-[var(--radius-sm)]'"
    :style="{ height, width }"
    aria-hidden="true"
  />
</template>
