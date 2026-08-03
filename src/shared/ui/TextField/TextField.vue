<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  id?: string
  error?: string
  helpText?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
}>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', event: Event): void
}>()

const inputId = computed(() => props.id || `textfield-${Math.random().toString(36).substring(2, 9)}`)
const errorId = computed(() => `${inputId.value}-error`)
const helpId = computed(() => `${inputId.value}-help`)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="flex flex-col gap-1 text-left w-full">
    <label
      v-if="label"
      :for="inputId"
      class="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1"
    >
      <span>{{ label }}</span>
      <span v-if="required" class="text-[var(--status-danger)]">*</span>
    </label>

    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : (helpText ? helpId : undefined)"
      class="w-full h-9 px-3 text-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border rounded-[var(--radius-sm)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--action-primary)] disabled:opacity-50 placeholder:[var(--text-tertiary)]"
      :class="error ? 'border-[var(--status-danger)]' : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'"
      @input="handleInput"
      @change="(e) => emit('change', e)"
    />

    <span v-if="error" :id="errorId" class="text-xs text-[var(--status-danger)] font-medium">
      {{ error }}
    </span>
    <span v-else-if="helpText" :id="helpId" class="text-xs text-[var(--text-tertiary)]">
      {{ helpText }}
    </span>
  </div>
</template>
