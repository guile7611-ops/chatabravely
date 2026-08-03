<script setup lang="ts">
import { Icon } from '@iconify/vue'

export interface ViewOption {
  id: string
  name: string
  isDefault?: boolean
}

defineProps<{
  views: ViewOption[]
  activeViewId?: string
}>()

const emit = defineEmits<{
  (e: 'select', view: ViewOption): void
  (e: 'save-current'): void
}>()
</script>

<template>
  <div class="inline-flex items-center gap-1.5 text-xs">
    <Icon icon="lucide:bookmark" class="text-[var(--action-primary)] text-sm" />
    <span class="text-[var(--text-tertiary)] font-medium">Visão:</span>
    <select
      :value="activeViewId"
      class="h-7 px-2 bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--action-primary)]"
      @change="(e) => {
        const val = (e.target as HTMLSelectElement).value
        const found = views.find(v => v.id === val)
        if (found) emit('select', found)
      }"
    >
      <option v-for="v in views" :key="v.id" :value="v.id">
        {{ v.name }} {{ v.isDefault ? '(Padrão)' : '' }}
      </option>
    </select>

    <button
      type="button"
      class="p-1 text-[var(--text-tertiary)] hover:text-[var(--action-primary)] hover:bg-[var(--bg-subtle)] rounded-[var(--radius-sm)] cursor-pointer"
      title="Salvar visão atual"
      @click="emit('save-current')"
    >
      <Icon icon="lucide:plus" class="text-sm" />
    </button>
  </div>
</template>
