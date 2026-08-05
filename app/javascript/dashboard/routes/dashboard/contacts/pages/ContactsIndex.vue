<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { debounce } from '@chatwoot/utils';
import { useStore, useMapGetter } from 'dashboard/composables/store';

import ContactsListLayout from 'dashboard/components-next/Contacts/ContactsListLayout.vue';
import ContactsList from 'dashboard/components-next/Contacts/Pages/ContactsList.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();

const contacts = useMapGetter('contacts/getContactsList');
const uiFlags = useMapGetter('contacts/getUIFlags');
const meta = useMapGetter('contacts/getMeta');

const searchValue = ref(String(route.query.search || ''));
const pageNumber = computed(() => Math.max(1, Number(route.query.page) || 1));
const isFetching = computed(() => uiFlags.value.isFetching);
const currentPage = computed(() => Number(meta.value?.currentPage) || 1);
const totalItems = computed(() => Number(meta.value?.count) || 0);

const fetchContacts = async () => {
  if (searchValue.value.trim()) {
    await store.dispatch('contacts/search', {
      search: encodeURIComponent(searchValue.value.trim()),
      page: pageNumber.value,
      sortAttr: 'name',
      append: false,
    });
    return;
  }
  await store.dispatch('contacts/get', {
    page: pageNumber.value,
    sortAttr: 'name',
  });
};

const search = debounce(async value => {
  searchValue.value = value;
  await router.replace({
    name: 'contacts_dashboard_index',
    query: { page: 1, ...(value ? { search: value } : {}) },
  });
}, 300);

const changePage = page => {
  router.replace({
    name: 'contacts_dashboard_index',
    query: {
      page,
      ...(searchValue.value ? { search: searchValue.value } : {}),
    },
  });
};

watch(
  () => [route.query.page, route.query.search],
  () => {
    searchValue.value = String(route.query.search || '');
    fetchContacts();
  }
);

onMounted(fetchContacts);
</script>

<template>
  <div class="flex flex-col flex-1 h-full overflow-hidden bg-n-surface-1">
    <ContactsListLayout
      :search-value="searchValue"
      header-title="Contatos"
      :current-page="currentPage"
      :total-items="totalItems"
      :show-pagination-footer="!isFetching && totalItems > 0"
      @search="search"
      @refresh="fetchContacts"
      @update:current-page="changePage"
    >
      <div
        v-if="isFetching"
        class="flex items-center justify-center py-16 text-n-slate-11"
      >
        <Spinner />
      </div>
      <div
        v-else-if="!contacts.length"
        class="flex items-center justify-center py-16 text-n-slate-11"
      >
        Nenhum contato encontrado.
      </div>
      <div v-else class="pt-4 pb-6">
        <ContactsList :contacts="contacts" />
      </div>
    </ContactsListLayout>
  </div>
</template>
