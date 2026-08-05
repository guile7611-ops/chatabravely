<script setup>
import { ref } from 'vue';
import { useStore } from 'dashboard/composables/store';
import { useAlert } from 'dashboard/composables';

import ContactsHeader from './ContactHeader.vue';
import CreateNewContactDialog from '../ContactsForm/CreateNewContactDialog.vue';
import ContactExportDialog from '../ContactsForm/ContactExportDialog.vue';
import ContactImportDialog from '../ContactsForm/ContactImportDialog.vue';

defineProps({
  showSearch: { type: Boolean, default: true },
  searchValue: { type: String, default: '' },
  headerTitle: { type: String, default: 'Contatos' },
});

const emit = defineEmits(['search', 'refresh']);
const store = useStore();

const createDialog = ref(null);
const importDialog = ref(null);
const exportDialog = ref(null);

const onCreate = async contact => {
  try {
    await store.dispatch('contacts/create', contact);
    createDialog.value?.onSuccess();
    emit('refresh');
    useAlert('Contato adicionado com sucesso.');
  } catch (error) {
    useAlert(error?.message || 'Não foi possível adicionar o contato.');
  }
};

const onImport = async file => {
  try {
    await store.dispatch('contacts/import', file);
    importDialog.value?.dialogRef.close();
    emit('refresh');
    useAlert('Contatos importados com sucesso.');
  } catch (error) {
    useAlert(error?.message || 'Não foi possível importar os contatos.');
  }
};

const onExport = async query => {
  try {
    await store.dispatch('contacts/export', query || {});
    useAlert('Exportação iniciada.');
  } catch (error) {
    useAlert(error?.message || 'Não foi possível exportar os contatos.');
  }
};
</script>

<template>
  <ContactsHeader
    :show-search="showSearch"
    :search-value="searchValue"
    :header-title="headerTitle"
    button-label="Adicionar contato"
    @search="emit('search', $event)"
    @add="createDialog?.dialogRef.open()"
    @import="importDialog?.dialogRef.open()"
    @export="exportDialog?.dialogRef.open()"
  />

  <CreateNewContactDialog ref="createDialog" @create="onCreate" />
  <ContactExportDialog ref="exportDialog" @export="onExport" />
  <ContactImportDialog ref="importDialog" @import="onImport" />
</template>
