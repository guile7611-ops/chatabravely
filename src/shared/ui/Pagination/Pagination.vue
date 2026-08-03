<script setup lang="ts">
import IconButton from '../IconButton/IconButton.vue'

const props = withDefaults(defineProps<{
  page: number
  totalPages: number
  totalItems?: number
  itemName?: string
}>(), {
  page: 1,
  totalPages: 1,
  itemName: 'contatos'
})

const emit = defineEmits<{
  (e: 'change-page', newPage: number): void
}>()
</script>

<template>
  <div class="flex items-center justify-between px-4 py-2 text-xs text-[var(--text-tertiary)] border-t border-[var(--border-default)] select-none">
    <div>
      <span v-if="totalItems !== undefined">Exibindo 1 - {{ totalItems }} de {{ totalItems }} {{ itemName }}</span>
      <span v-else>Página {{ page }} de {{ totalPages }}</span>
    </div>

    <div class="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
      <button
        type="button"
        class="hover:text-white disabled:opacity-40 cursor-pointer"
        :disabled="page <= 1"
        @click="emit('change-page', 1)"
      >
        «
      </button>
      <button
        type="button"
        class="hover:text-white disabled:opacity-40 cursor-pointer"
        :disabled="page <= 1"
        @click="emit('change-page', page - 1)"
      >
        &lt;
      </button>
      <span class="px-2 py-0.5 bg-[#23252b] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-white text-[11px] font-semibold">
        {{ page }}
      </span>
      <span class="text-[var(--text-tertiary)]">de {{ totalPages }} páginas</span>
      <button
        type="button"
        class="hover:text-white disabled:opacity-40 cursor-pointer"
        :disabled="page >= totalPages"
        @click="emit('change-page', page + 1)"
      >
        &gt;
      </button>
      <button
        type="button"
        class="hover:text-white disabled:opacity-40 cursor-pointer"
        :disabled="page >= totalPages"
        @click="emit('change-page', totalPages)"
      >
        »
      </button>
    </div>
  </div>
</template>
