<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import Button from '../../shared/ui/Button/Button.vue'
import SearchField from '../../shared/ui/SearchField/SearchField.vue'

const activeSettingTab = ref<'caixas' | 'etiquetas'>('etiquetas')
const searchQuery = ref('')
const showAddTagModal = ref(false)
const tagForm = ref({
  name: '',
  description: '',
  color: '#86efac',
  showInSidebar: true
})
</script>

<template>
  <div class="p-6 space-y-6 text-left relative">
    <!-- Navegação Secundária das Configurações -->
    <div class="border-b border-[var(--border-default)] flex gap-6 text-xs font-semibold">
      <button
        type="button"
        class="pb-2 cursor-pointer transition-colors"
        :class="activeSettingTab === 'caixas' ? 'text-[#155EEF] border-b-2 border-[#155EEF]' : 'text-[var(--text-secondary)] hover:text-white'"
        @click="activeSettingTab = 'caixas'"
      >
        Caixas de Entrada
      </button>

      <button
        type="button"
        class="pb-2 cursor-pointer transition-colors"
        :class="activeSettingTab === 'etiquetas' ? 'text-[#155EEF] border-b-2 border-[#155EEF]' : 'text-[var(--text-secondary)] hover:text-white'"
        @click="activeSettingTab = 'etiquetas'"
      >
        Etiquetas
      </button>
    </div>

    <!-- SEÇÃO 1: Caixas de Entrada (Imagem 1) -->
    <div v-if="activeSettingTab === 'caixas'" class="space-y-6">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1.5 max-w-3xl">
          <h2 class="text-base font-bold text-[var(--text-primary)] tracking-tight">Caixas de Entrada</h2>
          <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
            Um canal é o modo de comunicação que seu cliente escolhe para interagir com você. Uma caixa de entrada é onde você gerencia interações para um canal específico. Pode incluir comunicações de várias fontes, como e-mail, chat ao vivo e mídia social.
          </p>
          <a href="#" class="inline-flex items-center gap-1 text-xs text-[#155EEF] font-medium hover:underline">
            Saiba mais sobre as caixas de entrada &gt;
          </a>
        </div>

        <Button variant="primary" size="sm">
          Adicionar Caixa de Entrada
        </Button>
      </div>

      <div class="w-64">
        <SearchField v-model="searchQuery" placeholder="Pesquisar caixas de entrada..." />
      </div>

      <div class="min-h-[260px] flex items-center justify-center text-xs text-[var(--text-secondary)] font-medium">
        Não há caixas de entrada anexadas a esta conta.
      </div>
    </div>

    <!-- SEÇÃO 2: Etiquetas (Imagem 2 & Modal da Imagem 4) -->
    <div v-if="activeSettingTab === 'etiquetas'" class="space-y-6">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1.5 max-w-3xl">
          <h2 class="text-base font-bold text-[var(--text-primary)] tracking-tight">Etiquetas</h2>
          <p class="text-xs text-[var(--text-secondary)] leading-relaxed">
            As etiquetas ajudam você a categorizar e priorizar conversas e leads. Você pode atribuir uma etiqueta a uma conversa ou contato usando o painel lateral.
          </p>
          <a href="#" class="inline-flex items-center gap-1 text-xs text-[#155EEF] font-medium hover:underline">
            Aprenda mais sobre etiquetas &gt;
          </a>
        </div>

        <Button variant="primary" size="sm" @click="showAddTagModal = true">
          Adicionar etiqueta
        </Button>
      </div>

      <div class="w-64">
        <SearchField v-model="searchQuery" placeholder="Pesquisar etiquetas..." />
      </div>

      <div class="min-h-[260px] flex items-center justify-center text-xs text-[var(--text-secondary)] font-medium">
        Não há etiquetas disponíveis nesta conta.
      </div>
    </div>

    <!-- MODAL ADICIONAR ETIQUETA (IMAGEM 4 EXATA) -->
    <div
      v-if="showAddTagModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150"
    >
      <div class="w-[460px] bg-[#1c1d21] border border-[#2a2c32] rounded-xl shadow-2xl p-5 space-y-4 text-left text-white">
        <!-- Header do Modal -->
        <div class="flex items-start justify-between">
          <div class="space-y-0.5">
            <h3 class="text-sm font-bold text-white">Adicionar etiqueta</h3>
            <p class="text-xs text-[var(--text-tertiary)]">Etiquetas permitem agrupar as conversas.</p>
          </div>
          <button type="button" class="text-[var(--text-tertiary)] hover:text-white cursor-pointer" @click="showAddTagModal = false">
            <Icon icon="lucide:x" class="text-base" />
          </button>
        </div>

        <!-- Formulário do Modal -->
        <div class="space-y-3 text-xs">
          <div class="space-y-1">
            <label class="font-medium text-[var(--text-secondary)]">Nome da Etiqueta</label>
            <input
              type="text"
              v-model="tagForm.name"
              placeholder="nome da etiqueta"
              class="w-full bg-[#23252b] border border-[#2a2c32] rounded-md px-3 py-2 text-xs text-white placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[#155EEF]"
            />
          </div>

          <div class="space-y-1">
            <label class="font-medium text-[var(--text-secondary)]">Descrição</label>
            <input
              type="text"
              v-model="tagForm.description"
              placeholder="Descrição da etiqueta"
              class="w-full bg-[#23252b] border border-[#2a2c32] rounded-md px-3 py-2 text-xs text-white placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[#155EEF]"
            />
          </div>

          <div class="space-y-1">
            <label class="font-medium text-[var(--text-secondary)] block">Cor</label>
            <div class="w-6 h-6 rounded-md bg-[#86efac] border border-white/20 cursor-pointer"></div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input type="checkbox" id="showInSidebar" v-model="tagForm.showInSidebar" class="rounded bg-[#23252b] border-[#2a2c32] text-[#155EEF] focus:ring-0 cursor-pointer" />
            <label for="showInSidebar" class="text-xs font-normal text-[var(--text-secondary)] cursor-pointer">Exibir etiqueta na barra lateral</label>
          </div>
        </div>

        <!-- Botões de Ação no Rodapé (Imagem 4) -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#2a2c32]">
          <button
            type="button"
            class="px-4 py-2 bg-[#23252b] hover:bg-[#2b2d35] text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
            @click="showAddTagModal = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-[#155EEF] hover:bg-[#1d6bf3] text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
            @click="showAddTagModal = false"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
