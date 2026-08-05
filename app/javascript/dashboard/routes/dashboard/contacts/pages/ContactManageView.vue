<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAlert } from 'dashboard/composables';
import { useStore, useMapGetter } from 'dashboard/composables/store';
import ContactAPI from 'dashboard/api/contacts';
import InboxesAPI from 'dashboard/api/inboxes';

const store = useStore();
const route = useRoute();
const router = useRouter();
const getContact = useMapGetter('contacts/getContactById');
const uiFlags = useMapGetter('contacts/getUIFlags');
const contact = computed(() => getContact.value(route.params.contactId));
const form = reactive({ name: '', company: '', phone: '' });
const isFetching = computed(() => uiFlags.value.isFetchingItem);
const isUpdating = computed(() => uiFlags.value.isUpdating);
const isOpeningConversation = ref(false);
const isLoadingChannels = ref(false);
const newConversationOpen = ref(false);
const contactableInboxes = ref([]);
const approvedTemplates = ref([]);
const conversationForm = reactive({ inboxId: '', content: '', templateName: '', templateParameters: '' });
const selectedInbox = computed(() => contactableInboxes.value.find(item => String(item.id) === String(conversationForm.inboxId)) || null);
const isMetaInbox = computed(() => selectedInbox.value?.medium === 'meta');

const syncForm = value => {
  form.name = value?.name || '';
  form.company = value?.additionalAttributes?.companyName || '';
  form.phone = value?.phoneNumber || '';
};

const save = async () => {
  try {
    await store.dispatch('contacts/update', { id: contact.value.id, name: form.name, phoneNumber: form.phone, additionalAttributes: { companyName: form.company } });
    useAlert('Contato atualizado.');
  } catch (error) {
    useAlert(error.message || 'Não foi possível atualizar o contato.');
  }
};

const remove = async () => {
  if (!window.confirm('Excluir este contato? Esta ação não pode ser desfeita.')) return;
  try {
    await store.dispatch('contacts/delete', contact.value.id);
    await router.push({ name: 'contacts_dashboard_index', params: { accountId: route.params.accountId } });
  } catch (error) {
    useAlert(error.message || 'Não foi possível excluir o contato.');
  }
};

const loadTemplates = async () => {
  approvedTemplates.value = [];
  conversationForm.templateName = '';
  if (!isMetaInbox.value) return;
  try {
    const response = await InboxesAPI.getApprovedTemplates(conversationForm.inboxId);
    approvedTemplates.value = response.data.templates || [];
  } catch (error) {
    useAlert(error.response?.data?.message || 'Não foi possível carregar os templates Meta aprovados.');
  }
};

const openNewConversation = async () => {
  isLoadingChannels.value = true;
  try {
    const response = await ContactAPI.getContactableInboxes(contact.value.id);
    contactableInboxes.value = (response.data.payload || []).map(item => item.inbox);
    if (!contactableInboxes.value.length) return useAlert('Cadastre e conecte um canal antes de iniciar uma conversa.');
    conversationForm.inboxId = String(contactableInboxes.value[0].id);
    newConversationOpen.value = true;
    await loadTemplates();
  } catch (error) {
    useAlert(error.response?.data?.message || 'Não foi possível carregar os canais disponíveis.');
  } finally {
    isLoadingChannels.value = false;
  }
};

const startConversation = async () => {
  if (isMetaInbox.value && !conversationForm.templateName) return useAlert('Selecione um template Meta aprovado para iniciar a conversa.');
  if (!isMetaInbox.value && !conversationForm.content.trim()) return useAlert('Digite a primeira mensagem.');
  isOpeningConversation.value = true;
  try {
    const template = approvedTemplates.value.find(item => item.name === conversationForm.templateName);
    const body = Object.fromEntries(conversationForm.templateParameters.split(',').map(value => value.trim()).filter(Boolean).map((value, index) => [String(index + 1), value]));
    const response = await ContactAPI.createConversation(contact.value.id, {
      account_id: Number(route.params.accountId), inbox_id: conversationForm.inboxId,
      message: { content: conversationForm.content.trim(), template_params: template ? { name: template.name, language: template.language, processed_params: { body } } : {} },
    });
    newConversationOpen.value = false;
    await router.push({ name: 'inbox_conversation', params: { accountId: route.params.accountId, conversation_id: response.data.id } });
  } catch (error) {
    useAlert(error.response?.data?.message || 'Não foi possível iniciar a conversa.');
  } finally {
    isOpeningConversation.value = false;
  }
};

watch(contact, syncForm, { immediate: true });
onMounted(async () => {
  try { await store.dispatch('contacts/show', { id: route.params.contactId }); } catch (error) { useAlert('Não foi possível carregar o contato.'); }
});
</script>

<template>
  <main class="flex-1 h-full p-6 overflow-y-auto bg-n-surface-1">
    <header class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div><button class="text-sm text-n-slate-11 hover:text-n-slate-12" @click="router.back()">← Voltar para contatos</button><h1 class="mt-2 text-xl font-semibold text-n-slate-12">{{ contact.name || 'Contato' }}</h1></div>
      <div class="flex gap-2"><button class="btn btn-blue" type="button" :disabled="isLoadingChannels" @click="openNewConversation">{{ isLoadingChannels ? 'Carregando…' : 'Nova conversa' }}</button><button class="btn btn-soft text-red-600" type="button" @click="remove">Excluir</button></div>
    </header>
    <div v-if="isFetching" class="py-12 text-sm text-n-slate-11">Carregando contato…</div>
    <form v-else class="max-w-2xl p-5 border rounded-xl border-n-weak" @submit.prevent="save">
      <label class="block text-sm font-medium text-n-slate-12">Nome<input v-model.trim="form.name" required class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak"></label>
      <label class="block mt-4 text-sm font-medium text-n-slate-12">Empresa<input v-model.trim="form.company" class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak"></label>
      <label class="block mt-4 text-sm font-medium text-n-slate-12">Número de telefone<input v-model.trim="form.phone" required class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak"></label>
      <button class="mt-6 btn btn-blue" :disabled="isUpdating">{{ isUpdating ? 'Salvando…' : 'Salvar alterações' }}</button>
    </form>
    <div v-if="newConversationOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" @click.self="newConversationOpen = false">
      <form class="w-full max-w-lg p-6 border shadow-xl rounded-xl bg-n-solid-2 border-n-weak" @submit.prevent="startConversation">
        <h2 class="text-lg font-semibold text-n-slate-12">Nova conversa com {{ contact.name }}</h2><p class="mt-1 text-sm text-n-slate-11">A conversa será criada em Ativas e atribuída a você.</p>
        <label class="block mt-4 text-sm font-medium text-n-slate-12">Canal<select v-model="conversationForm.inboxId" class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak" @change="loadTemplates"><option v-for="inbox in contactableInboxes" :key="inbox.id" :value="String(inbox.id)">{{ inbox.name }}</option></select></label>
        <template v-if="isMetaInbox"><label class="block mt-4 text-sm font-medium text-n-slate-12">Template Meta aprovado<select v-model="conversationForm.templateName" required class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak"><option value="" disabled>Selecione um template</option><option v-for="template in approvedTemplates" :key="template.id || template.name" :value="template.name">{{ template.name }} · {{ template.language }}</option></select></label><label class="block mt-3 text-sm font-medium text-n-slate-12">Variáveis do corpo (separadas por vírgula)<input v-model="conversationForm.templateParameters" class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak" placeholder="Ex.: Maria, pedido 123"></label></template>
        <label v-else class="block mt-4 text-sm font-medium text-n-slate-12">Primeira mensagem<textarea v-model="conversationForm.content" required rows="4" class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak" /></label>
        <div class="flex justify-end gap-2 mt-6"><button type="button" class="btn btn-soft" @click="newConversationOpen = false">Cancelar</button><button class="btn btn-blue" :disabled="isOpeningConversation">{{ isOpeningConversation ? 'Enviando…' : isMetaInbox ? 'Enviar template' : 'Iniciar conversa' }}</button></div>
      </form>
    </div>
  </main>
</template>
