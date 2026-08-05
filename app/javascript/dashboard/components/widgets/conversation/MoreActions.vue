<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import ResolveAction from '../../buttons/ResolveAction.vue';
import SidepanelSwitch from 'dashboard/components-next/Conversation/SidepanelSwitch.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import ConversationApi from 'dashboard/api/abravely/conversations';
import { useAlert } from 'dashboard/composables';

const store = useStore();
const currentChat = computed(() => store.getters.getSelectedChat);
const isClaimable = computed(() =>
  ['RECEPTION', 'DEPARTMENT'].includes(currentChat.value?.queue)
);
const isReopenable = computed(() => currentChat.value?.queue === 'CLOSED');
const showTransfer = ref(false);
const transferTarget = ref('');
const agents = computed(() => store.getters['agents/getAgents'] || []);
const departments = computed(() => store.getters['teams/getTeams'] || []);
const canTransfer = computed(() => ['RECEPTION', 'DEPARTMENT', 'CONVERSATION'].includes(currentChat.value?.queue));

const refreshConversation = async () => {
  await store.dispatch('getConversation', currentChat.value.id);
  await store.dispatch('fetchAllConversations');
};

const claimConversation = async () => {
  try {
    await ConversationApi.claim(currentChat.value.id);
    await refreshConversation();
    useAlert('Conversa assumida com sucesso.');
  } catch (error) {
    useAlert(error?.response?.data?.message || 'Não foi possível assumir a conversa.');
  }
};

const reopenConversation = async () => {
  try {
    await ConversationApi.reopen(currentChat.value.id);
    await refreshConversation();
    useAlert('Conversa reaberta e adicionada às Ativas.');
  } catch (error) {
    useAlert(error?.response?.data?.message || 'Não foi possível reabrir a conversa.');
  }
};

const transferConversation = async () => {
  if (!transferTarget.value) return;
  const [kind, id] = transferTarget.value.split(':');
  try {
    await ConversationApi.transfer(currentChat.value.id, kind === 'agent' ? { agentId: id } : { departmentId: id });
    showTransfer.value = false;
    transferTarget.value = '';
    await refreshConversation();
    useAlert('Conversa transferida com sucesso.');
  } catch (error) {
    useAlert(error?.response?.data?.message || 'Não foi possível transferir a conversa.');
  }
};
</script>

<template>
  <div class="relative flex items-center gap-2 actions--container">
    <Button
      v-if="isClaimable"
      label="Assumir"
      size="sm"
      blue
      @click="claimConversation"
    />
    <Button
      v-if="isReopenable"
      label="Reabrir"
      size="sm"
      blue
      @click="reopenConversation"
    />
    <Button
      v-if="canTransfer"
      label="Transferir"
      size="sm"
      @click="showTransfer = !showTransfer"
    />
    <div v-if="showTransfer" class="absolute right-0 top-full z-20 mt-2 flex items-center gap-2 rounded-md bg-n-surface-2 p-2 shadow-lg">
      <select v-model="transferTarget" class="rounded border border-n-weak bg-n-surface-1 px-2 py-1 text-xs text-n-slate-12">
        <option value="">Destino...</option>
        <optgroup label="Departamentos">
          <option v-for="department in departments" :key="`department:${department.id}`" :value="`department:${department.id}`">
            {{ department.name }}
          </option>
        </optgroup>
        <optgroup label="Atendentes">
          <option v-for="agent in agents" :key="`agent:${agent.id}`" :value="`agent:${agent.id}`">
            {{ agent.name }}
          </option>
        </optgroup>
      </select>
      <Button label="Confirmar" size="sm" blue :disabled="!transferTarget" @click="transferConversation" />
    </div>
    <ResolveAction
      v-if="currentChat.queue === 'CONVERSATION'"
      :conversation-id="currentChat.id"
      :status="currentChat.status"
    />
    <SidepanelSwitch />
  </div>
</template>
