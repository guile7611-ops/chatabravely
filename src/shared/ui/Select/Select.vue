<script setup lang="ts">
import { computed } from 'vue'

export interface SelectOption {
  value: string | number
  label: string
}

const props = withDefaults(defineProps<{
  modelValue?: string | number
  options: SelectOption[]
  label?: string
  id?: string
  disabled?: boolean
}>(), {
  modelValue: '',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const inputId = computed(() => props.id || `select-${Math.random().toString(36).substring(2, 9)}`)
</script>

<template>
  <div class="flex flex-col gap-1 text-left w-full">
    <label v-if="label" :for="inputId" class="text-xs font-medium text-[var(--text-secondary)]">
      {{ label }}
    </label>

    <select
      :id="inputId"
      :value="modelValue"
      :disabled="disabled"
      class="w-full h-9 px-3 text-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--border-strong)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--action-primary)] disabled:opacity-50 cursor-pointer"
      @change="(e) => emit('update:modelValue', (e.target as HTMLSelectElement).value)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>
