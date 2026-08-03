<script setup lang="ts">
import { ref, inject } from 'vue'
import { Icon } from '@iconify/vue'
import type { useNavigation } from '../navigation/useNavigation'

const nav = inject<ReturnType<typeof useNavigation>>('navigation')!

const searchQuery = ref('')
const showProfileMenu = ref(false)
const isAutoOffline = ref(false)
const isOnlineStatus = ref(true)

const expandedTopics = ref<Record<string, boolean>>({
  conversas: true,
  relatorios: false
})

function toggleTopic(key: string) {
  expandedTopics.value[key] = !expandedTopics.value[key]
}
</script>

<template>
  <aside
    class="bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] flex flex-col justify-between h-full transition-all duration-200 select-none z-30 relative"
    :class="nav.isSidebarOpen.value ? 'w-60' : 'w-16'"
  >
    <div class="flex flex-col flex-1 min-h-0">
      <!-- Topo: Logo da Aplicação & Recolher (Imagem 1) -->
      <div class="h-[48px] px-3 border-b border-[var(--border-default)] flex items-center justify-between flex-shrink-0">
        <div v-if="nav.isSidebarOpen.value" class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-[var(--radius-sm)] bg-[#155EEF] flex items-center justify-center text-white font-bold text-xs">
            AC
          </div>
          <span class="font-bold text-xs text-[var(--text-primary)] tracking-tight">Abravely Chat</span>
        </div>
        <div v-else class="mx-auto">
          <div class="w-6 h-6 rounded-[var(--radius-sm)] bg-[#155EEF] flex items-center justify-center text-white font-bold text-xs">
            AC
          </div>
        </div>

        <button
          type="button"
          class="text-[var(--text-tertiary)] hover:text-white cursor-pointer"
          :class="!nav.isSidebarOpen.value ? 'hidden' : ''"
          @click="nav.toggleSidebar()"
          title="Recolher menu"
        >
          <Icon icon="lucide:panel-left-close" class="text-base" />
        </button>
      </div>

      <!-- Barra de Pesquisa Cápsula no Topo da Sidebar (Imagem 1) -->
      <div v-if="nav.isSidebarOpen.value" class="p-2 border-b border-[var(--border-default)] flex items-center gap-1.5">
        <div class="relative flex-1 items-center">
          <Icon icon="lucide:search" class="absolute left-2.5 top-2 text-xs text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Pesquisar..."
            class="w-full bg-[#23252b] border border-[var(--border-default)] rounded-[var(--radius-md)] pl-7 pr-2 py-1 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
          />
        </div>
        <button type="button" class="p-1 text-[var(--text-tertiary)] hover:text-white bg-[#23252b] border border-[var(--border-default)] rounded-[var(--radius-md)] cursor-pointer">
          <Icon icon="lucide:pencil" class="text-xs" />
        </button>
      </div>

      <!-- Lista de Itens do Menu (Imagens 1, 2 e 3) -->
      <nav class="flex-1 p-2 space-y-1 overflow-y-auto">
        <!-- 1. Caixa de Entrada -->
        <button
          type="button"
          class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer"
          :class="nav.currentView.value === 'conversas' ? 'bg-[#2b2d35] text-white font-semibold' : 'text-[var(--text-secondary)] hover:bg-[#23252b] hover:text-white'"
          @click="nav.navigateTo('conversas')"
        >
          <Icon icon="lucide:inbox" class="text-base flex-shrink-0" />
          <span v-if="nav.isSidebarOpen.value" class="truncate text-[12px]">Caixa de Entrada</span>
        </button>

        <!-- 2. Conversas (Expansível) -->
        <div class="flex flex-col">
          <button
            type="button"
            class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[#23252b] hover:text-white transition-colors cursor-pointer"
            @click="toggleTopic('conversas')"
          >
            <Icon icon="lucide:message-circle" class="text-base flex-shrink-0" />
            <span v-if="nav.isSidebarOpen.value" class="truncate text-[12px] flex-1 text-left">Conversas</span>
            <Icon v-if="nav.isSidebarOpen.value" :icon="expandedTopics.conversas ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="text-xs text-[var(--text-tertiary)]" />
          </button>

          <div v-if="expandedTopics.conversas && nav.isSidebarOpen.value" class="ml-4 pl-2 my-0.5 border-l border-[#2a2c32] space-y-0.5">
            <button
              type="button"
              class="w-full flex items-center gap-2 px-2.5 py-1 text-xs rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[#23252b] hover:text-white cursor-pointer"
              @click="nav.navigateTo('conversas')"
            >
              <Icon icon="lucide:inbox" class="text-xs" />
              <span class="truncate text-[11px]">Todas as conversas</span>
            </button>
          </div>
        </div>

        <!-- 3. Capitão -->
        <button
          type="button"
          class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[#23252b] hover:text-white transition-colors cursor-pointer"
        >
          <Icon icon="lucide:bot" class="text-base flex-shrink-0" />
          <span v-if="nav.isSidebarOpen.value" class="truncate text-[12px]">Capitão</span>
        </button>

        <!-- 4. Calls -->
        <button
          type="button"
          class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[#23252b] hover:text-white transition-colors cursor-pointer"
        >
          <Icon icon="lucide:phone" class="text-base flex-shrink-0" />
          <span v-if="nav.isSidebarOpen.value" class="truncate text-[12px]">Calls</span>
        </button>

        <!-- 5. Contatos (Selecionado no Print) -->
        <button
          type="button"
          class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer"
          :class="nav.currentView.value === 'contatos' ? 'bg-[#2b2d35] text-white font-semibold' : 'text-[var(--text-secondary)] hover:bg-[#23252b] hover:text-white'"
          @click="nav.navigateTo('contatos')"
        >
          <Icon icon="lucide:contact-2" class="text-base flex-shrink-0" />
          <span v-if="nav.isSidebarOpen.value" class="truncate text-[12px]">Contatos</span>
        </button>

        <!-- 6. Relatórios -->
        <div class="flex flex-col">
          <button
            type="button"
            class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer"
            :class="nav.currentView.value === 'relatorios' ? 'bg-[#2b2d35] text-white font-semibold' : 'text-[var(--text-secondary)] hover:bg-[#23252b] hover:text-white'"
            @click="toggleTopic('relatorios')"
          >
            <Icon icon="lucide:trending-up" class="text-base flex-shrink-0" />
            <span v-if="nav.isSidebarOpen.value" class="truncate text-[12px] flex-1 text-left">Relatórios</span>
            <Icon v-if="nav.isSidebarOpen.value" :icon="expandedTopics.relatorios ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="text-xs text-[var(--text-tertiary)]" />
          </button>
        </div>

        <!-- 7. Central de Ajuda -->
        <button
          type="button"
          class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer"
          :class="nav.currentView.value === 'ajuda' ? 'bg-[#2b2d35] text-white font-semibold' : 'text-[var(--text-secondary)] hover:bg-[#23252b] hover:text-white'"
          @click="nav.navigateTo('ajuda')"
        >
          <Icon icon="lucide:library" class="text-base flex-shrink-0" />
          <span v-if="nav.isSidebarOpen.value" class="truncate text-[12px]">Central de Ajuda</span>
        </button>

        <!-- 8. Simulador WhatsApp -->
        <button
          type="button"
          class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer"
          :class="nav.currentView.value === 'simulador' ? 'bg-[#2b2d35] text-white font-semibold' : 'text-[var(--text-secondary)] hover:bg-[#23252b] hover:text-white'"
          @click="nav.navigateTo('simulador')"
        >
          <Icon icon="lucide:smartphone" class="text-base flex-shrink-0" />
          <span v-if="nav.isSidebarOpen.value" class="truncate text-[12px]">Simulador WhatsApp</span>
        </button>

        <!-- 9. Configurações -->
        <button
          type="button"
          class="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer"
          :class="nav.currentView.value === 'configuracoes' ? 'bg-[#2b2d35] text-white font-semibold' : 'text-[var(--text-secondary)] hover:bg-[#23252b] hover:text-white'"
          @click="nav.navigateTo('configuracoes')"
        >
          <Icon icon="lucide:settings" class="text-base flex-shrink-0" />
          <span v-if="nav.isSidebarOpen.value" class="truncate text-[12px]">Configurações</span>
        </button>
      </nav>
    </div>

    <!-- Rodapé: Perfil do Usuário no Canto Inferior Esquerdo (Imagem 3) -->
    <div class="p-2 border-t border-[var(--border-default)] relative">
      <button
        type="button"
        class="w-full flex items-center gap-2.5 p-2 rounded-[var(--radius-md)] hover:bg-[#23252b] transition-colors cursor-pointer text-left border border-transparent hover:border-[var(--border-default)]"
        @click="showProfileMenu = !showProfileMenu"
      >
        <div class="relative w-8 h-8 rounded-md bg-[#1d4ed8] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          GT
          <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--bg-sidebar)]"></span>
        </div>

        <div v-if="nav.isSidebarOpen.value" class="flex flex-col min-w-0 flex-1 leading-tight">
          <span class="text-xs font-bold text-white truncate">Guilherme Tenorio</span>
          <span class="text-[10px] text-[var(--text-tertiary)] truncate">guilherme.tenorio@mul...</span>
        </div>
      </button>

      <!-- MENU POPOVER DO PERFIL (IMAGEM 3 EXATA) -->
      <div
        v-if="showProfileMenu"
        class="absolute bottom-14 left-2 w-64 bg-[#1c1d21] border border-[#2a2c32] rounded-xl shadow-2xl p-2 space-y-2 z-50 text-xs text-left text-white select-none animate-in fade-in zoom-in-95 duration-100"
      >
        <!-- Status de Disponibilidade -->
        <div class="flex items-center justify-between px-2 py-1.5">
          <span class="font-medium text-[var(--text-secondary)]">Disponibilidade</span>
          <button
            type="button"
            class="px-2 py-1 bg-[#23252b] border border-[#2a2c32] rounded-md text-emerald-400 font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            Online
            <Icon icon="lucide:chevron-down" class="text-xs text-[var(--text-tertiary)]" />
          </button>
        </div>

        <!-- Marcar Offline Automática -->
        <div class="flex items-center justify-between px-2 py-1.5">
          <div class="flex items-center gap-1">
            <span class="font-medium text-[var(--text-secondary)]">Marcar offline automaticamente</span>
            <Icon icon="lucide:info" class="text-xs text-[var(--text-tertiary)]" />
          </div>

          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="isAutoOffline" class="sr-only peer" />
            <div class="w-7 h-4 bg-[#23252b] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#155EEF]"></div>
          </label>
        </div>

        <div class="h-[1px] bg-[#2a2c32]"></div>

        <!-- Lista de Opções do Menu Popover (Imagem 3) -->
        <div class="space-y-0.5">
          <button type="button" class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#23252b] text-[var(--text-secondary)] hover:text-white cursor-pointer">
            <Icon icon="lucide:help-circle" class="text-sm flex-shrink-0" />
            <span>Contate o suporte</span>
          </button>

          <button type="button" class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#23252b] text-[var(--text-secondary)] hover:text-white cursor-pointer">
            <Icon icon="lucide:keyboard" class="text-sm flex-shrink-0" />
            <span>Atalhos do teclado</span>
          </button>

          <button type="button" class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#23252b] text-[var(--text-secondary)] hover:text-white cursor-pointer">
            <Icon icon="lucide:user" class="text-sm flex-shrink-0" />
            <span>Configurações do Perfil</span>
          </button>

          <button type="button" class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#23252b] text-[var(--text-secondary)] hover:text-white cursor-pointer">
            <Icon icon="lucide:palette" class="text-sm flex-shrink-0" />
            <span>Alterar Tema</span>
          </button>

          <button type="button" class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#23252b] text-[var(--text-secondary)] hover:text-white cursor-pointer">
            <Icon icon="lucide:book-open" class="text-sm flex-shrink-0" />
            <span>Ler documentação</span>
          </button>

          <button type="button" class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#23252b] text-[var(--text-secondary)] hover:text-white cursor-pointer">
            <Icon icon="lucide:file-text" class="text-sm flex-shrink-0" />
            <span>Notas de versão</span>
          </button>

          <button type="button" class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#23252b] text-red-400 hover:bg-red-950/30 cursor-pointer">
            <Icon icon="lucide:log-out" class="text-sm flex-shrink-0" />
            <span>Encerrar sessão</span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>
