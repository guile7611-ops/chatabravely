<template>
  <aside 
    :class="[
      'bg-[#151718] border-r border-[#222526] flex flex-col h-full shrink-0 select-none transition-all duration-200 z-30 font-sans text-left',
      isMainSidebarCollapsed ? 'w-[64px]' : 'w-[230px]',
      isMobileSidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 w-[240px]' : '-translate-x-full md:translate-x-0'
    ]"
  >
    <!-- Cabeçalho da Sidebar -->
    <div class="h-14 px-3.5 flex items-center justify-between border-b border-[#222526] shrink-0">
      <div class="flex items-center gap-2.5 overflow-hidden">
        <img src="/abravely-logo.png" alt="Abravely Logo" class="w-6.5 h-6.5 shrink-0 object-contain rounded-md" />
        <span v-show="!isMainSidebarCollapsed" class="font-bold text-[15px] tracking-wide text-white truncate">Abravely chat</span>
      </div>

      <button 
        @click="$emit('toggle-collapse')"
        class="p-1.5 hover:bg-[#202425] rounded-md text-[#a3a8ae] hover:text-white transition-colors shrink-0"
        title="Recolher / Expandir Menu"
      >
        <IconPanelLeftExpand width="18" height="18" :class="['transition-transform duration-200', isMainSidebarCollapsed ? 'rotate-180' : '']" />
      </button>
    </div>

    <!-- Barra de Pesquisa + Botão Novo Chat -->
    <div class="px-2.5 pt-3 pb-1.5 flex items-center gap-1.5 shrink-0">
      <div v-show="!isMainSidebarCollapsed" class="relative flex-1">
        <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[#a3a8ae]">
          <IconSearch width="18" height="18" />
        </span>
        <input 
          type="text" 
          placeholder="Pesquisar..." 
          class="w-full bg-[#242729] border border-[#26292b] rounded-lg pl-8 pr-2.5 py-1.5 text-[12.5px] text-[#eceded] placeholder-[#a3a8ae] focus:outline-none focus:border-[#0091ff] transition-colors"
        />
      </div>
      <button class="w-[32px] h-[32px] flex items-center justify-center bg-[#242729] border border-[#26292b] hover:bg-[#202425] rounded-lg text-[#a3a8ae] hover:text-white shrink-0 transition-colors mx-auto" title="Nova Conversa">
        <IconCompose width="18" height="18" />
      </button>
    </div>

    <!-- Itens de Navegação Principal -->
    <nav class="flex-1 overflow-y-auto px-2 space-y-1 text-[13.5px] py-1.5 scrollbar-thin">
      <!-- Conversas (Acordeão) -->
      <div>
        <button 
          @click="$emit('toggle-conversas')"
          :class="[
            'w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#202425] text-[#a3a8ae] hover:text-white transition-colors',
            isMainSidebarCollapsed ? 'justify-center' : ''
          ]"
          title="Conversas"
        >
          <div class="flex items-center gap-3">
            <IconChat width="22" height="22" />
            <span v-show="!isMainSidebarCollapsed" class="font-medium">Conversas</span>
          </div>
          <IconChevronDown v-show="!isMainSidebarCollapsed" :class="['transition-transform duration-200 text-[#a3a8ae]', isConversasOpen ? 'rotate-180' : '']" width="14" height="14" />
        </button>

        <div v-show="isConversasOpen && !isMainSidebarCollapsed" class="pl-[26px] relative flex flex-col mt-[2px] before:content-[''] before:absolute before:left-[11px] before:top-0 before:w-[1.5px] before:bottom-[20px] before:bg-[#2e3335] before:rounded-t">
          <div class="relative min-w-0 flex items-center py-[2px]">
            <a 
              href="#" 
              @click.prevent="$emit('select-view', 'conversas', 'todas')"
              :class="[
                'flex items-center gap-2.5 py-1.5 pr-2 pl-9 rounded-[5px] transition-colors w-full',
                currentView === 'conversas' && activeMenu === 'todas' ? 'bg-[#202425] text-white font-semibold' : 'text-[#a3a8ae] hover:text-white hover:bg-[#202425]'
              ]"
            >
              <IconMailInbox :class="currentView === 'conversas' && activeMenu === 'todas' ? 'text-white' : 'text-[#a3a8ae]'" width="18" height="18" />
              <span class="text-[13px] truncate">Todas as conversas</span>
            </a>
          </div>

          <div class="relative min-w-0 flex items-center py-[2px] after:content-[''] after:absolute after:left-[-15px] after:bottom-[calc(50%_-_1px)] after:h-[12px] after:w-[10px] after:border-b-[1.5px] after:border-l-[1.5px] after:rounded-bl-[5px] after:border-[#2e3335]">
            <a 
              href="#" 
              @click.prevent="$emit('select-view', 'conversas', 'participantes')"
              :class="[
                'flex items-center gap-2.5 py-1.5 pr-2 pl-9 rounded-[5px] transition-colors w-full',
                currentView === 'conversas' && activeMenu === 'participantes' ? 'bg-[#202425] text-white font-semibold' : 'text-[#a3a8ae] hover:text-white hover:bg-[#202425]'
              ]"
            >
              <IconPeople :class="currentView === 'conversas' && activeMenu === 'participantes' ? 'text-white' : 'text-[#a3a8ae]'" width="18" height="18" />
              <span class="text-[13px] truncate">Participantes</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Canais (Acordeão) -->
      <div>
        <button 
          @click="$emit('toggle-canais')"
          :class="[
            'w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#202425] text-[#a3a8ae] hover:text-white transition-colors',
            isMainSidebarCollapsed ? 'justify-center' : ''
          ]"
          title="Canais"
        >
          <div class="flex items-center gap-3">
            <IconTabDesktop width="22" height="22" />
            <span v-show="!isMainSidebarCollapsed" class="font-medium">Canais</span>
          </div>
          <IconChevronDown v-show="!isMainSidebarCollapsed" :class="['transition-transform duration-200 text-[#a3a8ae]', isCanaisOpen ? 'rotate-180' : '']" width="14" height="14" />
        </button>

        <div v-show="isCanaisOpen && !isMainSidebarCollapsed" class="pl-[26px] relative flex flex-col mt-[2px] before:content-[''] before:absolute before:left-[11px] before:top-0 before:w-[1.5px] before:bottom-[20px] before:bg-[#2e3335] before:rounded-t">
          <div 
            v-for="(inbox, idx) in inboxesList" 
            :key="inbox.id" 
            :class="[
              'relative min-w-0 flex items-center py-[2px]',
              idx === inboxesList.length - 1 ? 'after:content-[\'\'] after:absolute after:left-[-15px] after:bottom-[calc(50%_-_1px)] after:h-[12px] after:w-[10px] after:border-b-[1.5px] after:border-l-[1.5px] after:rounded-bl-[5px] after:border-[#2e3335]' : ''
            ]"
          >
            <a 
              href="#" 
              @click.prevent="$emit('select-view', 'conversas', 'todas')"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors w-full text-[#a3a8ae] hover:text-white hover:bg-[#202425]"
            >
              <span class="w-2 h-2 rounded-full bg-[#30a46c] shrink-0" title="Conectado"></span>
              <span class="text-[13px] truncate">{{ inbox.name }}</span>
            </a>
          </div>
        </div>
      </div>

      <div class="h-[1px] bg-[#222526] my-2"></div>

      <!-- Contatos -->
      <a 
        href="#" 
        @click.prevent="$emit('select-view', 'contatos')"
        :class="[
          'flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors',
          isMainSidebarCollapsed ? 'justify-center' : '',
          currentView === 'contatos' ? 'bg-[#202425] text-white font-semibold' : 'text-[#a3a8ae] hover:text-white hover:bg-[#202425]'
        ]"
        title="Contatos"
      >
        <IconBookContacts width="22" height="22" />
        <span v-show="!isMainSidebarCollapsed" class="font-medium">Contatos</span>
      </a>

      <!-- Relatórios -->
      <div v-if="currentUserRole === 'ADMIN'">
        <button 
          @click="$emit('toggle-relatorios')"
          :class="[
            'w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#202425] text-[#a3a8ae] hover:text-white transition-colors',
            isMainSidebarCollapsed ? 'justify-center' : ''
          ]"
          title="Relatórios"
        >
          <div class="flex items-center gap-3">
            <IconPoll width="22" height="22" />
            <span v-show="!isMainSidebarCollapsed" class="font-medium">Relatórios</span>
          </div>
          <IconChevronDown v-show="!isMainSidebarCollapsed" :class="['transition-transform duration-200 text-[#a3a8ae]', isRelatoriosOpen ? 'rotate-180' : '']" width="14" height="14" />
        </button>

        <div v-show="isRelatoriosOpen && !isMainSidebarCollapsed" class="pl-[26px] relative flex flex-col mt-[2px] before:content-[''] before:absolute before:left-[11px] before:top-0 before:w-[1.5px] before:bottom-[20px] before:bg-[#2e3335] before:rounded-t">
          <div class="relative min-w-0 flex items-center py-[2px]">
            <a 
              href="#" 
              @click.prevent="$emit('select-reports-view', 'visao_geral')"
              :class="[
                'flex items-center gap-2.5 py-1.5 pr-2 pl-9 rounded-[5px] transition-colors w-full',
                currentView === 'relatorios' && activeReportsMenu === 'visao_geral' ? 'bg-[#202425] text-white font-semibold' : 'text-[#a3a8ae] hover:text-white hover:bg-[#202425]'
              ]"
            >
              <span class="text-[13px] truncate">Visão geral</span>
            </a>
          </div>
          <div class="relative min-w-0 flex items-center py-[2px] after:content-[''] after:absolute after:left-[-15px] after:bottom-[calc(50%_-_1px)] after:h-[12px] after:w-[10px] after:border-b-[1.5px] after:border-l-[1.5px] after:rounded-bl-[5px] after:border-[#2e3335]">
            <a 
              href="#" 
              @click.prevent="$emit('select-reports-view', 'finalizados')"
              :class="[
                'flex items-center gap-2.5 py-1.5 pr-2 pl-9 rounded-[5px] transition-colors w-full',
                currentView === 'relatorios' && activeReportsMenu === 'finalizados' ? 'bg-[#202425] text-white font-semibold' : 'text-[#a3a8ae] hover:text-white hover:bg-[#202425]'
              ]"
            >
              <span class="text-[13px] truncate">Finalizados</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Central de Ajuda -->
      <a 
        href="#" 
        @click.prevent="$emit('select-view', 'ajuda')"
        :class="[
          'flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors',
          isMainSidebarCollapsed ? 'justify-center' : '',
          currentView === 'ajuda' ? 'bg-[#202425] text-white font-semibold' : 'text-[#a3a8ae] hover:text-white hover:bg-[#202425]'
        ]"
        title="Central de Ajuda"
      >
        <IconBookOpenGlobe width="22" height="22" />
        <span v-show="!isMainSidebarCollapsed" class="font-medium">Central de Ajuda</span>
      </a>

      <!-- Configurações -->
      <a 
        href="#" 
        @click.prevent="$emit('select-view', 'configuracoes')"
        :class="[
          'flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors',
          isMainSidebarCollapsed ? 'justify-center' : '',
          currentView === 'configuracoes' ? 'bg-[#202425] text-white font-semibold' : 'text-[#a3a8ae] hover:text-white hover:bg-[#202425]'
        ]"
        title="Configurações"
      >
        <IconSettings width="22" height="22" />
        <span v-show="!isMainSidebarCollapsed" class="font-medium">Configurações</span>
      </a>
    </nav>

    <!-- Rodapé da Sidebar -->
    <div class="h-14 px-3 border-t border-[#222526] flex items-center justify-between bg-[#151718] shrink-0">
      <div :class="['flex items-center gap-2.5 overflow-hidden', isMainSidebarCollapsed ? 'justify-center w-full' : '']">
        <div class="w-8 h-8 rounded-full bg-[#1c2022] border border-[#26292b] flex items-center justify-center text-[12px] font-semibold text-white shrink-0 select-none relative">
          GT
          <div class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#30a46c] border-[2px] border-[#151718]"></div>
        </div>
        <div v-show="!isMainSidebarCollapsed" class="flex flex-col text-[13px] overflow-hidden flex-1">
          <div class="flex items-center justify-between">
            <span class="font-medium text-white leading-tight truncate">Guilherme Tenorio</span>
            <button 
              @click="$emit('toggle-user-role')" 
              :class="['text-[10px] px-1.5 py-0.5 rounded font-bold uppercase border cursor-pointer hover:opacity-80 transition-opacity', currentUserRole === 'ADMIN' ? 'bg-[#0091ff]/15 text-[#0091ff] border-[#0091ff]/30' : 'bg-[#f5d90a]/15 text-[#f5d90a] border-[#f5d90a]/30']"
              title="Clique para alternar o perfil de acesso"
            >
              {{ currentUserRole === 'ADMIN' ? 'Gestor' : 'Atendente' }}
            </button>
          </div>
          <span class="text-[#a3a8ae] truncate text-[11px]">guilherme@abravely.com</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import IconPanelLeftExpand from '~icons/lucide/sidebar-open';
import IconSearch from '~icons/lucide/search';
import IconCompose from '~icons/lucide/pencil';
import IconChat from '~icons/lucide/message-circle';
import IconChevronDown from '~icons/lucide/chevron-down';
import IconMailInbox from '~icons/lucide/inbox';
import IconPeople from '~icons/lucide/user-check';
import IconTabDesktop from '~icons/lucide/mailbox';
import IconBookContacts from '~icons/lucide/notebook';
import IconPoll from '~icons/lucide/trending-up';
import IconBookOpenGlobe from '~icons/lucide/library';
import IconSettings from '~icons/lucide/settings';

defineProps<{
  isMainSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  isConversasOpen: boolean;
  isCanaisOpen: boolean;
  isRelatoriosOpen: boolean;
  currentView: string;
  activeMenu: string;
  activeReportsMenu: string;
  currentUserRole: 'ADMIN' | 'AGENT';
  inboxesList: any[];
}>();

defineEmits<{
  (e: 'toggle-collapse'): void;
  (e: 'toggle-conversas'): void;
  (e: 'toggle-canais'): void;
  (e: 'toggle-relatorios'): void;
  (e: 'select-view', view: string, menu?: string): void;
  (e: 'select-reports-view', reportMenu: string): void;
  (e: 'toggle-user-role'): void;
}>();
</script>
