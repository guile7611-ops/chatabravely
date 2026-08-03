<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../../mocks/fixtures/conversations.fixture'
import type { ConversationEntity } from '../../entities/conversation/model'
import ConversationListItem from '../../shared/ui/Domain/ConversationListItem.vue'
import MessageBubble from '../../shared/ui/Domain/MessageBubble.vue'
import MessageComposer from '../../shared/ui/Domain/MessageComposer.vue'
import AIProposal from '../../shared/ui/Domain/AIProposal.vue'
import AIStatus from '../../shared/ui/Domain/AIStatus.vue'
import Avatar from '../../shared/ui/Avatar/Avatar.vue'
import Button from '../../shared/ui/Button/Button.vue'
import IconButton from '../../shared/ui/IconButton/IconButton.vue'
import SearchField from '../../shared/ui/SearchField/SearchField.vue'
import Badge from '../../shared/ui/Badge/Badge.vue'
import Drawer from '../../shared/ui/Drawer/Drawer.vue'
import Toast from '../../shared/ui/Toast/Toast.vue'

const activeTab = ref<'recepcao' | 'departamentos' | 'ativas'>('recepcao')
const searchQuery = ref('')
// Nenhuma conversa selecionada por padrão (Espaço de chat todo aberto conforme Imagem 5)
const selectedConvId = ref<string | null>(null)
const showContextDrawer = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const messagesList = ref(MOCK_MESSAGES)

const countRecepcao = computed(() => MOCK_CONVERSATIONS.filter(c => c.department === 'Recepção' || !c.department || !c.assignedAgent).length)
const countDepartamentos = computed(() => MOCK_CONVERSATIONS.filter(c => c.department && c.department !== 'Recepção').length)
const countAtivas = computed(() => MOCK_CONVERSATIONS.filter(c => c.status !== 'RESOLVIDA' && c.status !== 'CLOSED').length)

const filteredConversations = computed(() => {
  return MOCK_CONVERSATIONS.filter(conv => {
    if (activeTab.value === 'recepcao' && !(conv.department === 'Recepção' || !conv.department || !conv.assignedAgent)) return false
    if (activeTab.value === 'departamentos' && !(conv.department && conv.department !== 'Recepção')) return false
    if (activeTab.value === 'ativas' && (conv.status === 'RESOLVIDA' || conv.status === 'CLOSED')) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return conv.contactName.toLowerCase().includes(q) || conv.lastMessage.toLowerCase().includes(q)
    }
    return true
  })
})

const selectedConversation = computed(() => {
  if (!selectedConvId.value) return null
  return MOCK_CONVERSATIONS.find(c => c.id === selectedConvId.value) || null
})

const currentMessages = computed(() => {
  if (!selectedConvId.value) return []
  return messagesList.value[selectedConvId.value] || []
})

function handleSendMessage(payload: { content: string; isNote: boolean }) {
  if (!selectedConvId.value) return
  if (!messagesList.value[selectedConvId.value]) {
    messagesList.value[selectedConvId.value] = []
  }
  messagesList.value[selectedConvId.value].push({
    id: `msg-${Date.now()}`,
    conversationId: selectedConvId.value,
    content: payload.content,
    senderType: payload.isNote ? 'NOTE' : 'AGENT',
    senderName: 'Guilherme',
    createdAt: 'Agora'
  })

  toastMessage.value = payload.isNote ? 'Nota interna salva no histórico local' : 'Mensagem demonstrativa adicionada'
  showToast.value = true
}

function handleAcceptProposal(text: string) {
  handleSendMessage({ content: text, isNote: false })
}
</script>

<template>
  <div class="h-screen w-full flex overflow-hidden bg-[var(--bg-canvas)]">
    <!-- PAINEL 2: Lista / Fila de Conversas -->
    <div class="w-80 border-r border-[var(--border-default)] flex flex-col bg-[var(--bg-surface)] flex-shrink-0">
      <!-- Topbar da Fila -->
      <div class="px-3.5 py-3 border-b border-[var(--border-default)] flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-bold text-[var(--text-primary)] tracking-tight">Conversas</h2>
          <Badge variant="info">Abertas</Badge>
        </div>

        <div class="flex items-center gap-1">
          <IconButton icon="lucide:filter" label="Filtrar conversas" size="sm" />
          <IconButton icon="lucide:pencil" label="Nova conversa" size="sm" />
        </div>
      </div>

      <!-- Tabs com Contadores Numéricos (Imagens 1 & 2) -->
      <div class="px-2 py-2 border-b border-[var(--border-default)] flex items-center justify-between gap-1 text-xs">
        <button
          type="button"
          class="flex-1 py-1 px-2 font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          :class="activeTab === 'recepcao' ? 'bg-[#2b2d35] text-white font-semibold' : 'text-[var(--text-secondary)] hover:bg-[#23252b]'"
          @click="activeTab = 'recepcao'"
        >
          <span>Recepção</span>
          <span class="px-1.5 py-0.2 text-[10px] rounded-full" :class="activeTab === 'recepcao' ? 'bg-white/20 text-white' : 'text-[var(--text-tertiary)]'">
            {{ countRecepcao }}
          </span>
        </button>

        <button
          type="button"
          class="flex-1 py-1 px-2 font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          :class="activeTab === 'departamentos' ? 'bg-[#2b2d35] text-white font-semibold' : 'text-[var(--text-secondary)] hover:bg-[#23252b]'"
          @click="activeTab = 'departamentos'"
        >
          <span>Departamentos</span>
          <span class="px-1.5 py-0.2 text-[10px] rounded-full" :class="activeTab === 'departamentos' ? 'bg-white/20 text-white' : 'text-[var(--text-tertiary)]'">
            {{ countDepartamentos }}
          </span>
        </button>

        <button
          type="button"
          class="flex-1 py-1 px-2 font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          :class="activeTab === 'ativas' ? 'bg-[#2b2d35] text-white font-semibold' : 'text-[var(--text-secondary)] hover:bg-[#23252b]'"
          @click="activeTab = 'ativas'"
        >
          <span>Ativas</span>
          <span class="px-1.5 py-0.2 text-[10px] rounded-full" :class="activeTab === 'ativas' ? 'bg-white/20 text-white' : 'text-[var(--text-tertiary)]'">
            {{ countAtivas }}
          </span>
        </button>
      </div>

      <!-- Campo de Busca -->
      <div class="p-2 border-b border-[var(--border-default)]">
        <SearchField v-model="searchQuery" placeholder="Pesquisar..." />
      </div>

      <!-- Lista de Conversas com Divisor Sutil de 1px -->
      <div class="flex-1 overflow-y-auto divide-y divide-[var(--border-default)]">
        <ConversationListItem
          v-for="conv in filteredConversations"
          :key="conv.id"
          :id="conv.id"
          :contact-name="conv.contactName"
          :channel-name="conv.channelName"
          :last-message="conv.lastMessage"
          :updated-at="conv.updatedAt"
          :unread-count="conv.unreadCount"
          :active="selectedConvId === conv.id"
          @select="selectedConvId = $event"
        />

        <div v-if="filteredConversations.length === 0" class="p-6 text-center text-xs text-[var(--text-tertiary)]">
          Não há conversas ativas neste grupo.
        </div>
      </div>
    </div>

    <!-- PAINEL 3: Área Principal de Atendimento / Conversa (Espaço Totalmente Aberto) -->
    <div class="flex-1 flex flex-col bg-[var(--bg-canvas)] min-w-0 h-full">
      <!-- ESTADO 1: Nenhuma conversa selecionada (Fundo Todo Aberto com Ícone Central - Imagem 5) -->
      <div v-if="!selectedConversation" class="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--bg-canvas)] select-none">
        <div class="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-tertiary)] mb-3">
          <Icon icon="lucide:inbox" class="text-2xl" aria-hidden="true" />
        </div>
        <p class="text-xs text-[var(--text-secondary)] font-medium">Notificações de todas as caixas inscritas</p>
      </div>

      <!-- ESTADO 2: Conversa Selecionada (Exibe Mensagens, Cabeçalho e Composer) -->
      <template v-else>
        <!-- Header Fixo da Conversa -->
        <div class="h-[56px] px-4 bg-[var(--bg-surface)] border-b border-[var(--border-default)] flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <Avatar :name="selectedConversation.contactName" size="sm" :online="true" />
            <div class="flex flex-col text-left min-w-0">
              <span class="font-semibold text-sm text-[var(--text-primary)] truncate">{{ selectedConversation.contactName }}</span>
              <span class="text-[10px] text-[var(--text-tertiary)]">{{ selectedConversation.channelName }} • {{ selectedConversation.contactPhone }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <AIStatus :active="true" label="IA Sumarizadora" />

            <Button variant="secondary" size="sm" @click="showContextDrawer = true">
              <Icon icon="lucide:user" class="mr-1" />
              Contexto
            </Button>

            <Button variant="danger" size="sm" @click="toastMessage = 'Atendimento encerrado na demonstração'; showToast = true">
              Finalizar
            </Button>

            <IconButton icon="lucide:x" label="Fechar conversa" size="sm" @click="selectedConvId = null" />
          </div>
        </div>

        <!-- Área de Mensagens -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-canvas)]">
          <AIProposal
            suggestionText="Olá Carlos! Confirmamos o seu pedido corporativo de 10 pizzas grandes para sexta-feira às 12:00."
            confidence="96%"
            @accept="handleAcceptProposal"
            @reject="toastMessage = 'Sugestão descartada demonstrativamente'; showToast = true"
          />

          <MessageBubble
            v-for="msg in currentMessages"
            :key="msg.id"
            :id="msg.id"
            :content="msg.content"
            :sender-type="msg.senderType"
            :sender-name="msg.senderName"
            :created-at="msg.createdAt"
          />
        </div>

        <!-- Composer de Envio -->
        <MessageComposer @send="handleSendMessage" />
      </template>
    </div>

    <!-- DRAWER: Detalhes do Atendimento -->
    <Drawer :open="showContextDrawer" title="Contexto do Atendimento" width="md" @close="showContextDrawer = false">
      <div v-if="selectedConversation" class="space-y-4 text-xs text-[var(--text-primary)] text-left">
        <div class="flex items-center gap-3 p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-sm)] border border-[var(--border-default)]">
          <Avatar :name="selectedConversation.contactName" size="lg" />
          <div>
            <h4 class="font-bold text-sm">{{ selectedConversation.contactName }}</h4>
            <p class="text-[var(--text-tertiary)]">{{ selectedConversation.contactPhone }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <h5 class="font-semibold text-[var(--text-secondary)]">Dados do Contato</h5>
          <div class="p-3 border border-[var(--border-default)] rounded-[var(--radius-sm)] space-y-1">
            <p><strong>Canal Origem:</strong> {{ selectedConversation.channelName }}</p>
            <p><strong>Atendente Responsável:</strong> {{ selectedConversation.assignedAgent || 'Não atribuído' }}</p>
            <p><strong>Departamento:</strong> {{ selectedConversation.department || 'Geral' }}</p>
          </div>
        </div>
      </div>
    </Drawer>

    <Toast :open="showToast" :message="toastMessage" @close="showToast = false" />
  </div>
</template>
