<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAlert } from 'dashboard/composables';
import { useStore, useMapGetter } from 'dashboard/composables/store';

const store = useStore();
const route = useRoute();
const router = useRouter();
const getContact = useMapGetter('contacts/getContactById');
const uiFlags = useMapGetter('contacts/getUIFlags');
const contact = computed(() => getContact.value(route.params.contactId));
const form = reactive({ name: '', company: '', phone: '' });
const isFetching = computed(() => uiFlags.value.isFetchingItem);
const isUpdating = computed(() => uiFlags.value.isUpdating);

const syncForm = value => {
  form.name = value?.name || '';
  form.company = value?.additionalAttributes?.companyName || '';
  form.phone = value?.phoneNumber || '';
};

const save = async () => {
  try {
    await store.dispatch('contacts/update', {
      id: contact.value.id, name: form.name, phoneNumber: form.phone,
      additionalAttributes: { companyName: form.company },
    });
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

const newConversation = () => {
  useAlert('A abertura de conversa será vinculada ao canal e à regra de template Meta na próxima etapa.');
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
      <div class="flex gap-2"><button class="btn btn-blue" type="button" @click="newConversation">Nova conversa</button><button class="btn btn-soft text-red-600" type="button" @click="remove">Excluir</button></div>
    </header>
    <div v-if="isFetching" class="py-12 text-sm text-n-slate-11">Carregando contato…</div>
    <form v-else class="max-w-2xl p-5 border rounded-xl border-n-weak" @submit.prevent="save">
      <label class="block text-sm font-medium text-n-slate-12">Nome<input v-model.trim="form.name" required class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak"></label>
      <label class="block mt-4 text-sm font-medium text-n-slate-12">Empresa<input v-model.trim="form.company" class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak"></label>
      <label class="block mt-4 text-sm font-medium text-n-slate-12">Número de telefone<input v-model.trim="form.phone" required class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak"></label>
      <button class="mt-6 btn btn-blue" :disabled="isUpdating">{{ isUpdating ? 'Salvando…' : 'Salvar alterações' }}</button>
    </form>
  </main>
</template>
