<script>
import { mapGetters } from 'vuex';

const QUEUES = [
  { key: 'RECEPTION', label: 'Recepção' },
  { key: 'DEPARTMENT', label: 'Departamentos' },
  { key: 'CONVERSATION', label: 'Ativas' },
];

export default {
  props: {
    showConversationList: { type: Boolean, default: true },
    isOnExpandedLayout: { type: Boolean, default: false },
  },
  data() {
    return { activeQueue: 'RECEPTION', search: '' };
  },
  computed: {
    ...mapGetters({
      conversations: 'getAllConversations',
      isLoading: 'getChatListLoadingStatus',
      stats: 'conversationStats/getStats',
    }),
    queueItems() {
      return QUEUES.map(item => ({
        ...item,
        count: ({
          RECEPTION: this.stats.receptionCount,
          DEPARTMENT: this.stats.departmentsCount,
          CONVERSATION: this.stats.activeCount,
        }[item.key] ?? this.conversations.filter(conversation => conversation.queue === item.key).length),
      }));
    },
    visibleConversations() {
      const term = this.search.trim().toLocaleLowerCase('pt-BR');
      return this.conversations.filter(conversation => {
        if (conversation.queue !== this.activeQueue) return false;
        if (!term) return true;
        const sender = conversation.meta?.sender || {};
        return [sender.name, sender.phone_number, conversation.id]
          .filter(Boolean)
          .some(value => String(value).toLocaleLowerCase('pt-BR').includes(term));
      });
    },
  },
  mounted() {
    this.fetchQueue(this.activeQueue);
  },
  methods: {
    async fetchQueue(queue) {
      await this.$store.dispatch('setChatListFilters', {
        queue,
        status: queue === 'CLOSED' ? 'resolved' : 'open',
        page: 1,
      });
      await this.$store.dispatch('fetchAllConversations');
    },
    async selectQueue(queue) {
      if (this.activeQueue === queue) return;
      this.activeQueue = queue;
      await this.fetchQueue(queue);
    },
    openConversation(conversation) {
      this.$router.push({
        name: 'inbox_conversation',
        params: {
          accountId: this.$route.params.accountId,
          conversation_id: conversation.id,
        },
      });
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
        <span class="px-2 py-1 text-xs font-medium rounded-md bg-n-slate-3 text-n-slate-11">Abertas</span>
      </div>
      <input
        v-model="search"
        type="search"
        class="w-full px-3 py-2 mt-3 text-sm border rounded-lg bg-n-background border-n-weak text-n-slate-12 placeholder:text-n-slate-10"
        placeholder="Pesquisar conversas..."
      />
    </header>

    <nav class="flex gap-1 px-2 border-b border-n-weak" aria-label="Filas de conversas">
      <button
        v-for="item in queueItems"
        :key="item.key"
        type="button"
        class="px-2 py-3 text-sm font-medium border-b-2"
        :class="activeQueue === item.key ? 'border-n-brand text-n-brand' : 'border-transparent text-n-slate-11 hover:text-n-slate-12'"
        @click="selectQueue(item.key)"
      >
        {{ item.label }} <span class="inline-flex items-center justify-center min-w-5 h-5 px-1 ml-1 text-xs rounded-full bg-n-slate-3 text-n-slate-11">{{ item.count }}</span>
      </button>
    </nav>

    <div class="flex-1 overflow-y-auto">
      <div v-if="isLoading && !visibleConversations.length" class="p-6 text-sm text-center text-n-slate-11">
        Carregando conversas…
      </div>
      <p v-else-if="!visibleConversations.length" class="p-6 text-sm text-center text-n-slate-11">
        Não há conversas nesta fila.
      </p>
      <button
        v-for="conversation in visibleConversations"
        :key="conversation.id"
        type="button"
        class="flex w-full gap-3 px-3 py-3 text-left border-b border-n-weak hover:bg-n-slate-2"
        @click="openConversation(conversation)"
      >
        <span class="flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-lg bg-n-brand/15 text-n-brand">
          {{ (conversation.meta?.sender?.name || '?').slice(0, 1).toUpperCase() }}
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold truncate text-n-slate-12">{{ conversation.meta?.sender?.name || 'Contato' }}</span>
          <span class="block mt-1 text-sm truncate text-n-slate-11">{{ preview(conversation) }}</span>
        </span>
        <span v-if="conversation.unread_count" class="self-center inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs rounded-full bg-n-brand text-white">{{ conversation.unread_count }}</span>
      </button>
    </div>
  </aside>
</template>
