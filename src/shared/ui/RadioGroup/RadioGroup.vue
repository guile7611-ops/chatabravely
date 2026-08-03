<script setup lang="ts">
export interface RadioOption {
  value: string | number
  label: string
  description?: string
}

const props = withDefaults(defineProps<{
  modelValue?: string | number
  options: RadioOption[]
  name: string
  label?: string
  disabled?: boolean
}>(), {
  modelValue: '',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <div class="flex flex-col gap-2 text-left w-full" role="radiogroup" :aria-label="label">
    <span v-if="label" class="text-xs font-medium text-[var(--text-secondary)]">{{ label }}</span>

    <div class="flex flex-col gap-2">
      <label
        v-for="opt in options"
        :key="opt.value"
        class="inline-flex items-start gap-2.5 p-2.5 rounded-[var(--radius-sm)] border transition-colors cursor-pointer"
        :class="modelValue === opt.value ? 'bg-[var(--bg-subtle)] border-[var(--action-primary)]' : 'bg-[var(--bg-surface)] border-[var(--border-default)] hover:border-[var(--border-strong)]'"
      >
        <input
          type="radio"
          :name="name"
          :value="opt.value"
          :checked="modelValue === opt.value"
          :disabled="disabled"
          class="mt-0.5 w-4 h-4 text-[var(--action-primary)] border-[var(--border-strong)] focus:ring-[var(--action-primary)] cursor-pointer"
          @change="emit('update:modelValue', opt.value)"
        />
        <div class="flex flex-col text-xs">
          <span class="font-medium text-[var(--text-primary)]">{{ opt.label }}</span>
          <span v-if="opt.description" class="text-[var(--text-tertiary)]">{{ opt.description }}</span>
        </div>
      </label>
    </div>
  </div>
</template>
