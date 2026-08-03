<script setup lang="ts">
import { inject } from 'vue'
import { Icon } from '@iconify/vue'
import type { useNavigation } from '../navigation/useNavigation'

const nav = inject<ReturnType<typeof useNavigation>>('navigation')!

const pageTitles: Record<string, string> = {
  conversas: 'Caixa de Entrada',
  kanban: 'Kanban',
  contatos: 'Contatos',
  relatorios: 'Relatórios',
  ajuda: 'Central de Ajuda',
  simulador: 'Simulador WhatsApp',
  configuracoes: 'Configurações'
}
</script>

<template>
  <header class="h-[48px] px-4 bg-[var(--bg-canvas)] border-b border-[var(--border-default)] flex items-center justify-between flex-shrink-0 select-none">
    <!-- Esquerda: Icone Hambúrguer + Título da Página (Imagem 1) -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="text-[var(--text-secondary)] hover:text-white cursor-pointer"
        @click="nav.toggleSidebar()"
        title="Alternar menu lateral"
      >
        <Icon icon="lucide:menu" class="text-lg" />
      </button>
      <h1 class="text-sm font-bold text-[var(--text-primary)] tracking-tight">
        {{ pageTitles[nav.currentView.value] || 'Contatos' }}
      </h1>
    </div>

    <!-- Direita: Tema 🌙, Notificações 🔔, Divisor |, Perfil do Usuário GA (Imagem 1) -->
    <div class="flex items-center gap-3">
      <button type="button" class="text-[var(--text-tertiary)] hover:text-white cursor-pointer p-1" title="Alternar Tema">
        <Icon icon="lucide:moon" class="text-base" />
      </button>

      <button type="button" class="text-[var(--text-tertiary)] hover:text-white cursor-pointer p-1" title="Notificações">
        <Icon icon="lucide:bell" class="text-base" />
      </button>

      <div class="h-4 w-[1px] bg-[var(--border-default)]"></div>

      <!-- Avatar do Usuário (GA + Nome + Role - Imagem 1) -->
      <div class="flex items-center gap-2 cursor-pointer hover:opacity-90">
        <div class="relative w-7 h-7 rounded-full bg-[#1c1d21] border border-[var(--border-default)] flex items-center justify-center text-[10px] font-bold text-white">
          GA
          <span class="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-[var(--bg-canvas)]"></span>
        </div>
        <div class="flex flex-col text-left leading-tight">
          <span class="text-xs font-semibold text-[var(--text-primary)]">Guilherme</span>
          <span class="text-[10px] text-[var(--text-tertiary)]">Super Admin</span>
        </div>
      </div>
    </div>
  </header>
</template>
