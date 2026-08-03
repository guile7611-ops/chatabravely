<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  id?: string
  rows?: number
  error?: string
  helpText?: string
  disabled?: boolean
}>(), {
  modelValue: '',
  rows: 3,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputId = computed(() => props.id || `textarea-${Math.random().toString(36).substring(2, 9)}`)
</script>

<template>
  <div class="flex flex-col gap-1 text-left w-full">
    <label v-if="label" :for="inputId" class="text-xs font-medium text-[var(--text-secondary)]">
      {{ label }}
    </label>

    <textarea
      :id="inputId"
      :rows="rows"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full p-3 text-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--border-strong)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--action-primary)] disabled:opacity-50 resize-y"
      @input="(e) => emit('update:modelValue', (e.target as HTMLTextAreaElement).value)"
    />

    <span v-if="error" class="text-xs text-[var(--status-danger)]">{{ error }}</span>
    <span v-else-if="helpText" class="text-xs text-[var(--text-tertiary)]">{{ helpText }}</span>
  </div>
</template>
