<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="relative flex items-center w-full select-none">
    <Icon
      icon="lucide:search"
      class="absolute left-3 text-sm text-[var(--text-tertiary)] pointer-events-none"
    />
    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder || 'Pesquisar...'"
      class="w-full bg-[#23252b] border border-[var(--border-default)] rounded-[var(--radius-md)] pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[#155EEF] transition-colors"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
