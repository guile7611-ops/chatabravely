<script setup lang="ts">
import { Icon } from '@iconify/vue'

export interface Column<T = any> {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  width?: string
}

const props = withDefaults(defineProps<{
  columns: Column[]
  items: any[]
  loading?: boolean
  emptyMessage?: string
}>(), {
  loading: false,
  emptyMessage: 'Nenhum registro encontrado.'
})

const emit = defineEmits<{
  (e: 'row-click', item: any): void
}>()
</script>

<template>
  <div class="w-full border border-[var(--border-default)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-surface)]">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs">
        <thead class="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-semibold h-10 select-none">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-3 py-2"
              :class="{
                'text-left': col.align !== 'center' && col.align !== 'right',
                'text-center': col.align === 'center',
                'text-right': col.align === 'right'
              }"
              :style="{ width: col.width }"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-[var(--border-default)] text-[var(--text-primary)]">
          <tr v-if="loading" class="h-10">
            <td :colspan="columns.length" class="px-3 text-center text-[var(--text-tertiary)] py-4">
              Carregando dados...
            </td>
          </tr>

          <tr v-else-if="!items || items.length === 0" class="h-10">
            <td :colspan="columns.length" class="px-3 text-center text-[var(--text-tertiary)] py-8">
              {{ emptyMessage }}
            </td>
          </tr>

          <tr
            v-for="(item, idx) in items"
            :key="item.id || idx"
            class="h-10 hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            @click="emit('row-click', item)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-3 py-2 align-middle font-normal"
              :class="{
                'text-left': col.align !== 'center' && col.align !== 'right',
                'text-center': col.align === 'center',
                'text-right': col.align === 'right'
              }"
            >
              <slot :name="`cell(${col.key})`" :item="item" :value="item[col.key]">
                {{ item[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
