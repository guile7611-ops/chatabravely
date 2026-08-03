<script setup lang="ts">
import { ref } from 'vue'
import IconButton from '../IconButton/IconButton.vue'
import Button from '../Button/Button.vue'

const text = ref('')
const isNote = ref(false)

const emit = defineEmits<{
  (e: 'send', payload: { content: string; isNote: boolean }): void
}>()

function handleSend() {
  if (!text.value.trim()) return
  emit('send', { content: text.value, isNote: isNote.value })
  text.value = ''
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="p-3 bg-[var(--bg-surface)] border-t border-[var(--border-default)] flex flex-col gap-2">
    <div class="flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-medium transition-colors cursor-pointer"
          :class="!isNote ? 'bg-[var(--action-primary)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'"
          @click="isNote = false"
        >
          💬 Mensagem
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-medium transition-colors cursor-pointer"
          :class="isNote ? 'bg-[var(--status-warning)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'"
          @click="isNote = true"
        >
          📌 Nota Interna
        </button>
      </div>

      <span class="text-[10px] text-[var(--text-tertiary)]">Digite / para respostas rápidas</span>
    </div>

    <div class="flex items-end gap-2">
      <div class="flex-1 relative">
        <textarea
          v-model="text"
          rows="2"
          :placeholder="isNote ? 'Escreva uma nota interna visível apenas para a equipe...' : 'Digite sua mensagem...'"
          class="w-full p-2.5 text-xs bg-[var(--bg-canvas)] text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--border-strong)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--action-primary)] resize-none"
          @keydown="handleKeyDown"
        />
      </div>

      <div class="flex items-center gap-1">
        <IconButton icon="lucide:paperclip" label="Anexar arquivo" size="sm" />
        <IconButton icon="lucide:smile" label="Inserir emoji" size="sm" />
        <Button :variant="isNote ? 'secondary' : 'primary'" size="sm" :disabled="!text.trim()" @click="handleSend">
          Enviar
        </Button>
      </div>
    </div>
  </div>
</template>
