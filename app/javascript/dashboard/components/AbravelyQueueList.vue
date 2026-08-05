<script>
const QUEUES = [
  { key: 'RECEPTION', label: 'Recepção', counter: 'reception_count' },
  { key: 'DEPARTMENT', label: 'Departamentos', counter: 'departments_count' },
  { key: 'CONVERSATION', label: 'Ativas', counter: 'active_count' },
];

export default {
  props: {
    showConversationList: { type: Boolean, default: true },
    isOnExpandedLayout: { type: Boolean, default: false },
    selectedConversationId: { type: [String, Number], default: null },
  },
  emits: ['conversation-load', 'select-conversation'],
  data() {
    return {
      activeQueue: 'RECEPTION',
      search: '',
      onlyUnread: false,
      filterOpen: false,
      sortDirection: 'desc',
    };
  },
  computed: {
    queueMeta() {
      const getQueueMeta =
        this.$store.getters['abravelyConversationPanel/getQueueMeta'];
      return typeof getQueueMeta === 'function'
        ? getQueueMeta(this.activeQueue)
        : {};
    },
    queueItems() {
      return QUEUES.map(item => ({
        ...item,
        count: Number(this.queueMeta[item.counter] || 0),
      }));
    },
    conversations() {
      const getQueue = this.$store.getters['abravelyConversationPanel/getQueue'];
      return typeof getQueue === 'function' ? getQueue(this.activeQueue) : [];
    },
    isLoading() {
      return Boolean(
        this.$store.getters['abravelyConversationPanel/getIsLoadingQueue']
      );
    },
    visibleConversations() {
      const term = this.search.trim().toLocaleLowerCase('pt-BR');
      const matchesSearch = conversation => {
        const sender = conversation.meta?.sender || conversation.contact || {};
        return [sender.name, sender.phone_number, sender.phone, conversation.id]
          .filter(Boolean)
          .some(value => String(value).toLocaleLowerCase('pt-BR').includes(term));
      };

      return [...this.conversations]
        .filter(conversation => !term || matchesSearch(conversation))
        .filter(conversation => !this.onlyUnread || Number(conversation.unread_count) > 0)
        .sort((first, second) => {
          const firstDate = Number(first.updated_at || first.created_at || 0);
          const secondDate = Number(second.updated_at || second.created_at || 0);
          return this.sortDirection === 'desc'
            ? secondDate - firstDate
            : firstDate - secondDate;
        });
    },
  },
  mounted() {
    this.fetchQueue(this.activeQueue);
  },
  methods: {
    async fetchQueue(queue) {
      try {
        await this.$store.dispatch('abravelyConversationPanel/fetchQueue', {
          queue,
        });
        this.$emit('conversation-load');
      } catch {
        // O erro fica registrado na store e é exibido pela view principal.
      }
    },
    async selectQueue(queue) {
      if (this.activeQueue === queue) return;
      this.activeQueue = queue;
      await this.fetchQueue(queue);
    },
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    },
    setUnreadFilter(value) {
      this.onlyUnread = value;
      this.filterOpen = false;
    },
    openConversation(conversation) {
      this.$emit('select-conversation', conversation);
    },
    preview(conversation) {
      return conversation.messages?.[0]?.content || 'Sem mensagens ainda';
    },
  },
};
</script>

<template>
  <aside
    class="flex flex-col flex-shrink-0 bg-n-surface-1 ltr:border-r rtl:border-l border-n-weak"
    :class="[{ hidden: !showConversationList }, isOnExpandedLayout ? 'basis-full' : 'w-[340px] 2xl:w-[412px]']"
  >
    <header class="px-3 pt-4 pb-3 border-b border-n-weak">
      <div class="flex items-center justify-between gap-2">
        <h1 class="text-base font-semibold text-n-slate-12">Conversas</h1>
        <div class="flex items-center gap-1">
          <div class="relative">
            <button id="toggleConversationFilterButton" type="button" class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-n-slate-11 hover:bg-n-slate-3 hover:text-n-slate-12" title="Filtrar conversas" aria-label="Filtrar conversas" @click="filterOpen = !filterOpen">
              <span class="i-lucide-filter size-4" />
            </button>
            <div v-if="filterOpen" class="absolute right-0 z-30 w-44 p-1 mt-1 border rounded-lg shadow-lg bg-n-surface-1 border-n-weak">
              <button type="button" class="w-full px-3 py-2 text-sm text-left rounded-md text-n-slate-12 hover:bg-n-slate-3" :class="!onlyUnread ? 'bg-n-slate-3' : ''" @click="setUnreadFilter(false)">Todas as conversas</button>
              <button type="button" class="w-full px-3 py-2 text-sm text-left rounded-md text-n-slate-12 hover:bg-n-slate-3" :class="onlyUnread ? 'bg-n-slate-3' : ''" @click="setUnreadFilter(true)">Não lidas</button>
            </div>
          </div>
          <button type="button" class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-n-slate-11 hover:bg-n-slate-3 hover:text-n-slate-12" :title="sortDirection === 'desc' ? 'Mais recentes primeiro' : 'Mais antigas primeiro'" aria-label="Ordenar conversas" @click="toggleSortDirection">
            <span class="i-lucide-arrow-down-up size-4" />
          </button>
          <span class="px-2 py-1 text-xs font-medium rounded-md bg-n-slate-3 text-n-slate-11">Abertas</span>
        </div>
      </div>
      <input v-model="search" type="search" class="w-full px-3 py-2 mt-3 text-sm border rounded-lg bg-n-background border-n-weak text-n-slate-12 placeholder:text-n-slate-10" placeholder="Pesquisar conversas...">
    </header>

    <nav class="flex gap-1 px-2 border-b border-n-weak" aria-label="Filas de conversas">
      <button v-for="item in queueItems" :key="item.key" type="button" class="px-2 py-3 text-sm font-medium border-b-2" :class="activeQueue === item.key ? 'border-n-brand text-n-brand' : 'border-transparent text-n-slate-11 hover:text-n-slate-12'" @click="selectQueue(item.key)">
        {{ item.label }} <span class="inline-flex items-center justify-center min-w-5 h-5 px-1 ml-1 text-xs rounded-full bg-n-slate-3 text-n-slate-11">{{ item.count }}</span>
      </button>
    </nav>

    <div class="flex-1 overflow-y-auto">
      <div v-if="isLoading && !visibleConversations.length" class="p-6 text-sm text-center text-n-slate-11">Carregando conversas…</div>
      <p v-else-if="!visibleConversations.length" class="p-6 text-sm text-center text-n-slate-11">Não há conversas nesta fila.</p>
      <button v-for="conversation in visibleConversations" :key="conversation.id" type="button" class="flex w-full gap-3 px-3 py-3 text-left border-b border-n-weak hover:bg-n-slate-2" :class="String(selectedConversationId) === String(conversation.id) ? 'bg-n-slate-3' : ''" @click="openConversation(conversation)">
        <span class="flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-lg bg-n-brand/15 text-n-brand">{{ (conversation.meta?.sender?.name || conversation.contact?.name || '?').slice(0, 1).toUpperCase() }}</span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold truncate text-n-slate-12">{{ conversation.meta?.sender?.name || conversation.contact?.name || 'Contato' }}</span>
          <span class="block mt-1 text-sm truncate text-n-slate-11">{{ preview(conversation) }}</span>
        </span>
        <span v-if="conversation.unread_count" class="self-center inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs rounded-full bg-n-brand text-white">{{ conversation.unread_count }}</span>
      </button>
    </div>
  </aside>
</template>
