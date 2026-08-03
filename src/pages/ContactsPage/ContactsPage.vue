<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import Button from '../../shared/ui/Button/Button.vue'
import IconButton from '../../shared/ui/IconButton/IconButton.vue'
import SearchField from '../../shared/ui/SearchField/SearchField.vue'
import Pagination from '../../shared/ui/Pagination/Pagination.vue'

const searchQuery = ref('')
const contacts = ref([
  { id: '1', name: '+552120181195', phone: '+552120181195', initial: '+', avatarBg: 'bg-amber-900/40 text-amber-400' },
  { id: '2', name: 'Gui', phone: '+5519983379132', initial: 'G', avatarBg: 'bg-emerald-900/40 text-emerald-400' }
])
</script>

<template>
  <div class="h-full flex flex-col justify-between space-y-4">
    <div class="space-y-4">
      <!-- Toolbar Superior: Título, Busca Cápsula & Ações (Imagem 4) -->
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-base font-bold text-[var(--text-primary)] tracking-tight">Contatos</h2>

        <div class="flex items-center gap-3">
          <div class="w-64">
            <SearchField v-model="searchQuery" placeholder="Pesquisar..." />
          </div>

          <div class="flex items-center gap-1">
            <IconButton icon="lucide:filter" label="Filtrar" size="sm" />
            <IconButton icon="lucide:arrow-up-down" label="Ordenar" size="sm" />
            <IconButton icon="lucide:more-vertical" label="Mais opções" size="sm" />
          </div>

          <Button variant="primary" size="sm">
            Enviar Mensagem
          </Button>
        </div>
      </div>

      <!-- Lista de Contatos em Cards Horizontais #1c1d21 (Imagem 4) -->
      <div class="space-y-2">
        <div
          v-for="contact in contacts"
          :key="contact.id"
          class="p-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] flex items-center justify-between hover:border-[#373a43] transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-md flex items-center justify-center font-bold text-sm" :class="contact.avatarBg">
              {{ contact.initial }}
            </div>
            <div class="text-left">
              <h4 class="font-bold text-xs text-[var(--text-primary)]">{{ contact.name }}</h4>
              <div class="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
                <span>{{ contact.phone }}</span>
                <span>•</span>
                <button type="button" class="text-[#155EEF] font-medium hover:underline cursor-pointer">Ver detalhes</button>
              </div>
            </div>
          </div>

          <Icon icon="lucide:chevron-down" class="text-xs text-[var(--text-tertiary)]" />
        </div>
      </div>
    </div>

    <!-- Rodapé de Paginação Auditado (Imagem 4) -->
    <Pagination :page="1" :total-pages="1" :total-items="contacts.length" item-name="contatos" />
  </div>
</template>
