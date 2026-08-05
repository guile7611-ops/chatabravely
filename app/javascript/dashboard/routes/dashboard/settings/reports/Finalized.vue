<script>
import { useAlert } from 'dashboard/composables';
import FinalizedConversationsAPI from 'dashboard/api/finalizedConversations';
import ConversationAPI from 'dashboard/api/inbox/conversation';
import NextButton from 'dashboard/components-next/button/Button.vue';
import ReportHeader from './components/ReportHeader.vue';

export default {
  name: 'FinalizedConversationsReport',
  components: { NextButton, ReportHeader },
  data() {
    return { items: [], isFetching: false, error: '', reopeningId: null };
  },
  mounted() {
    this.fetchFinalized();
  },
  methods: {
    formatDate(value) {
      if (!value) return '—';
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short', timeStyle: 'short',
      }).format(new Date(value));
    },
    async fetchFinalized() {
      this.isFetching = true;
      this.error = '';
      try {
        const response = await FinalizedConversationsAPI.get();
        this.items = response.data.payload || [];
      } catch (error) {
        this.error = error.response?.data?.message || 'Não foi possível carregar os atendimentos finalizados.';
      } finally {
        this.isFetching = false;
      }
    },
    async reopen(item) {
      this.reopeningId = item.id;
      try {
        const response = await ConversationAPI.reopen(item.conversation_id);
        item.conversation_state = {
          queue: response.data.conversation.queue,
          status: response.data.conversation.status,
        };
        useAlert('Conversa reaberta e atribuída a você em Ativas.');
      } catch (error) {
        useAlert(error.response?.data?.message || 'Não foi possível reabrir a conversa.');
      } finally {
        this.reopeningId = null;
      }
    },
  },
};
</script>

<template>
  <ReportHeader
    header-title="Atendimentos finalizados"
    header-description="Histórico imutável dos atendimentos encerrados. Reabrir mantém este registro e leva a conversa para Ativas."
  >
    <NextButton label="Atualizar" icon="i-lucide-refresh-cw" size="sm" :loading="isFetching" @click="fetchFinalized" />
  </ReportHeader>

  <div v-if="error" class="p-4 text-sm text-red-600 rounded-lg bg-red-50 dark:bg-red-950/30">
    {{ error }}
  </div>
  <div v-else class="overflow-hidden border rounded-xl border-n-weak">
    <div v-if="isFetching" class="p-6 text-sm text-n-slate-11">Carregando atendimentos finalizados…</div>
    <div v-else-if="!items.length" class="p-6 text-sm text-n-slate-11">Nenhum atendimento finalizado no período.</div>
    <div v-else class="divide-y divide-n-weak">
      <article v-for="item in items" :key="item.id" class="flex items-center justify-between gap-5 p-4">
        <div class="min-w-0">
          <p class="font-medium text-n-slate-12 truncate">{{ item.contact?.name || 'Contato sem nome' }}</p>
          <p class="text-sm text-n-slate-11 truncate">
            {{ item.department?.name || 'Sem departamento' }} · {{ item.attendant?.name || 'Sem atendente' }}
          </p>
          <p class="mt-1 text-xs text-n-slate-10">Finalizado em {{ formatDate(item.finalized_at) }} por {{ item.finalized_by.name }}</p>
        </div>
        <NextButton
          v-if="item.conversation_state?.queue === 'CLOSED'"
          label="Reabrir"
          size="sm"
          :loading="reopeningId === item.id"
          @click="reopen(item)"
        />
        <span v-else class="text-sm text-n-slate-11">Reaberta</span>
      </article>
    </div>
  </div>
</template>
