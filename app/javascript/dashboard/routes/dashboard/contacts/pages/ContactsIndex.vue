<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { debounce } from '@chatwoot/utils';
import { useAlert } from 'dashboard/composables';
import { useStore, useMapGetter } from 'dashboard/composables/store';

const store = useStore();
const route = useRoute();
const router = useRouter();
const contacts = useMapGetter('contacts/getContactsList');
const uiFlags = useMapGetter('contacts/getUIFlags');
const meta = useMapGetter('contacts/getMeta');

const searchValue = ref(String(route.query.search || ''));
const createOpen = ref(false);
const importInput = ref(null);
const newContact = ref({ name: '', company: '', phone: '' });
const pageNumber = computed(() => Math.max(1, Number(route.query.page) || 1));
const isFetching = computed(() => uiFlags.value.isFetching);
const isCreating = computed(() => uiFlags.value.isCreating);

const fetchContacts = async () => {
  try {
    if (searchValue.value.trim()) {
      await store.dispatch('contacts/search', {
        search: searchValue.value.trim(), page: pageNumber.value, sortAttr: 'name', append: false,
      });
    } else {
      await store.dispatch('contacts/get', { page: pageNumber.value, sortAttr: 'name' });
    }
  } catch (error) {
    useAlert(error.message || 'Não foi possível carregar os contatos.');
  }
};

const search = debounce(async value => {
  await router.replace({ name: 'contacts_dashboard_index', query: { page: 1, ...(value ? { search: value } : {}) } });
}, 300);

const createContact = async () => {
  try {
    const contact = await store.dispatch('contacts/create', {
      name: newContact.value.name,
      phoneNumber: newContact.value.phone,
      additionalAttributes: { companyName: newContact.value.company },
    });
    newContact.value = { name: '', company: '', phone: '' };
    createOpen.value = false;
    await router.push({ name: 'contacts_edit', params: { accountId: route.params.accountId, contactId: contact.id } });
  } catch (error) {
    useAlert(error.message || 'Não foi possível cadastrar o contato.');
  }
};

const importContacts = async event => {
  const [file] = event.target.files || [];
  if (!file) return;
  try {
    const result = await store.dispatch('contacts/import', file);
    const errors = result?.errors?.length ? ` ${result.errors.length} linha(s) exigem revisão.` : '';
    useAlert(`Importação concluída.${errors}`);
    await fetchContacts();
  } catch (error) {
    useAlert(error.message || 'Não foi possível importar os contatos.');
  } finally {
    event.target.value = '';
  }
};

const exportContacts = async () => {
  try {
    await store.dispatch('contacts/export', { payload: {}, label: null });
  } catch (error) {
    useAlert(error.message || 'Não foi possível exportar os contatos.');
  }
};

watch(() => [route.query.page, route.query.search], () => {
  searchValue.value = String(route.query.search || '');
  fetchContacts();
});
onMounted(fetchContacts);
</script>

<template>
  <main class="flex-1 h-full p-6 overflow-y-auto bg-n-surface-1">
    <header class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl font-semibold text-n-slate-12">Contatos</h1>
        <p class="mt-1 text-sm text-n-slate-11">Cadastre, importe ou exporte sua base de contatos.</p>
      </div>
      <div class="flex gap-2">
        <input ref="importInput" class="hidden" type="file" accept=".csv,text/csv" @change="importContacts">
        <button class="btn btn-soft" type="button" @click="importInput?.click()">Importar CSV</button>
        <button class="btn btn-soft" type="button" @click="exportContacts">Exportar</button>
        <button class="btn btn-blue" type="button" @click="createOpen = true">Adicionar contato</button>
      </div>
    </header>

    <input
      v-model="searchValue"
      class="w-full max-w-md px-3 py-2 mb-4 border rounded-lg bg-n-alpha-2 border-n-weak text-n-slate-12"
      placeholder="Pesquisar por nome, empresa ou telefone"
      @input="search(searchValue)"
    >

    <div v-if="isFetching" class="py-12 text-sm text-center text-n-slate-11">Carregando contatos…</div>
    <div v-else-if="!contacts.length" class="py-12 text-sm text-center text-n-slate-11">Nenhum contato encontrado.</div>
    <div v-else class="overflow-hidden border rounded-xl border-n-weak">
      <RouterLink
        v-for="contact in contacts"
        :key="contact.id"
        class="flex items-center justify-between gap-4 p-4 border-b last:border-b-0 border-n-weak hover:bg-n-alpha-2"
        :to="{ name: 'contacts_edit', params: { accountId: route.params.accountId, contactId: contact.id } }"
      >
        <div class="min-w-0">
          <p class="font-medium truncate text-n-slate-12">{{ contact.name }}</p>
          <p class="text-sm truncate text-n-slate-11">{{ contact.additionalAttributes?.companyName || 'Sem empresa' }} · {{ contact.phoneNumber }}</p>
        </div>
        <span class="text-sm text-n-slate-10">Abrir</span>
      </RouterLink>
    </div>
    <p v-if="meta.count" class="mt-3 text-xs text-n-slate-10">{{ meta.count }} contato(s)</p>

    <div v-if="createOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" @click.self="createOpen = false">
      <form class="w-full max-w-md p-6 border shadow-xl rounded-xl bg-n-solid-2 border-n-weak" @submit.prevent="createContact">
        <h2 class="text-lg font-semibold text-n-slate-12">Adicionar contato</h2>
        <label class="block mt-4 text-sm font-medium text-n-slate-12">Nome
          <input v-model.trim="newContact.name" required class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak" autocomplete="name">
        </label>
        <label class="block mt-3 text-sm font-medium text-n-slate-12">Empresa
          <input v-model.trim="newContact.company" class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak" autocomplete="organization">
        </label>
        <label class="block mt-3 text-sm font-medium text-n-slate-12">Número de telefone
          <input v-model.trim="newContact.phone" required class="w-full px-3 py-2 mt-1 border rounded-lg bg-n-alpha-2 border-n-weak" autocomplete="tel">
        </label>
        <div class="flex justify-end gap-2 mt-6"><button type="button" class="btn btn-soft" @click="createOpen = false">Cancelar</button><button class="btn btn-blue" :disabled="isCreating">{{ isCreating ? 'Salvando…' : 'Salvar contato' }}</button></div>
      </form>
    </div>
  </main>
</template>
