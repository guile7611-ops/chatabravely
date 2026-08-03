<script setup>
import { ref } from 'vue';

import EmptyStateLayout from 'dashboard/components-next/EmptyStateLayout.vue';
import CreateNewContactDialog from 'dashboard/components-next/Contacts/ContactsForm/CreateNewContactDialog.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import ContactsCard from 'dashboard/components-next/Contacts/ContactsCard/ContactsCard.vue';
import contactContent from 'dashboard/components-next/Contacts/EmptyState/contactEmptyStateContent';

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  showButton: {
    type: Boolean,
    default: true,
  },
  buttonLabel: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['create']);

const createNewContactDialogRef = ref(null);

const onClick = () => {
  createNewContactDialogRef.value?.dialogRef.open();
};
</script>

<template>
  <EmptyStateLayout :title="title" :subtitle="subtitle">

    <template #actions>
      <div v-if="showButton">
        <Button :label="buttonLabel" icon="i-lucide-plus" @click="onClick" />
        <CreateNewContactDialog
          ref="createNewContactDialogRef"
          @create="emit('create', $event)"
        />
      </div>
    </template>
  </EmptyStateLayout>
</template>
