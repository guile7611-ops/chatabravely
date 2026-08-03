<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  label?: string
  id?: string
  disabled?: boolean
}>(), {
  modelValue: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const inputId = computed(() => props.id || `checkbox-${Math.random().toString(36).substring(2, 9)}`)
</script>

<template>
  <label :for="inputId" class="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer select-none">
    <input
      :id="inputId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="w-4 h-4 rounded-[var(--radius-sm)] border-[var(--border-strong)] text-[var(--action-primary)] focus:ring-[var(--action-primary)] cursor-pointer"
      @change="(e) => emit('update:modelValue', (e.target as HTMLInputElement).checked)"
    />
    <span v-if="label">{{ label }}</span>
  </label>
</template>
