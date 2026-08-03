<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: boolean
  label?: string
  disabled?: boolean
}>(), {
  modelValue: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <div class="inline-flex items-center gap-2 cursor-pointer select-none" @click="toggle">
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--action-primary)] disabled:opacity-50"
      :class="modelValue ? 'bg-[var(--action-primary)]' : 'bg-[var(--border-strong)]'"
    >
      <span
        aria-hidden="true"
        class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        :class="modelValue ? 'translate-x-4' : 'translate-x-0'"
      />
    </button>
    <span v-if="label" class="text-xs font-medium text-[var(--text-primary)]">{{ label }}</span>
  </div>
</template>
