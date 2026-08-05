<script setup>
import { computed, ref } from 'vue';
import { useStore, useMapGetter } from 'dashboard/composables/store';
import { useAlert } from 'dashboard/composables';

import Button from 'dashboard/components-next/button/Button.vue';
import ContactsForm from '../ContactsForm/ContactsForm.vue';
import ConfirmContactDeleteDialog from '../ContactsForm/ConfirmContactDeleteDialog.vue';

const props = defineProps({
  selectedContact: { type: Object, required: true },
});
const emit = defineEmits(['goToContactsList']);

const store = useStore();
const uiFlags = useMapGetter('contacts/getUIFlags');
const form = ref(null);
const deleteDialog = ref(null);
const draft = ref({ ...props.selectedContact });

const isUpdating = computed(() => uiFlags.value.isUpdating);
const updateDraft = value => {
  draft.value = { ...draft.value, ...value };
};

const updateContact = async () => {
  try {
    await store.dispatch('contacts/update', draft.value);
    useAlert('Contato atualizado com sucesso.');
  } catch (error) {
    useAlert(error?.message || 'Não foi possível atualizar o contato.');
  }
};
</script>

<template>
  <div class="flex flex-col w-full gap-8 pb-8">
    <div class="flex flex-col gap-1">
      <h2 class="text-xl font-semibold text-n-slate-12">
        {{ selectedContact.name }}
      </h2>
      <span class="text-sm text-n-slate-11">
        Dados essenciais do contato
      </span>
    </div>

    <ContactsForm
      ref="form"
      :contact-data="draft"
      @update="updateDraft"
    />
    <div class="flex items-center justify-between gap-3">
      <Button
        label="Excluir contato"
        color="ruby"
        variant="ghost"
        @click="deleteDialog?.dialogRef.open()"
      />
      <Button
        label="Salvar alterações"
        :is-loading="isUpdating"
        :disabled="isUpdating || form?.isFormInvalid"
        @click="updateContact"
      />
    </div>

    <ConfirmContactDeleteDialog
      ref="deleteDialog"
      :selected-contact="selectedContact"
      @go-to-contacts-list="emit('goToContactsList')"
    />
  </div>
</template>
