<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore, useMapGetter } from 'dashboard/composables/store';

import ContactsDetailsLayout from 'dashboard/components-next/Contacts/ContactsDetailsLayout.vue';
import ContactDetails from 'dashboard/components-next/Contacts/Pages/ContactDetails.vue';
import Spinner from 'dashboard/components-next/spinner/Spinner.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();
const getContact = useMapGetter('contacts/getContactById');
const uiFlags = useMapGetter('contacts/getUIFlags');

const selectedContact = computed(() => getContact.value(route.params.contactId));
const isFetching = computed(() => uiFlags.value.isFetchingItem);

const goToContactsList = () =>
  router.push({
    name: 'contacts_dashboard_index',
    params: { accountId: route.params.accountId },
    query: { page: 1 },
  });

onMounted(async () => {
  await store.dispatch('contacts/show', { id: route.params.contactId });
  await store.dispatch('contacts/fetchContactableInbox', route.params.contactId);
});
</script>

<template>
  <div class="flex flex-col flex-1 h-full overflow-hidden bg-n-surface-1">
    <ContactsDetailsLayout
      :selected-contact="selectedContact"
      @go-to-contacts-list="goToContactsList"
    >
      <div v-if="isFetching" class="flex justify-center py-16">
        <Spinner />
      </div>
      <ContactDetails
        v-else-if="selectedContact?.id"
        :selected-contact="selectedContact"
        @go-to-contacts-list="goToContactsList"
      />
    </ContactsDetailsLayout>
  </div>
</template>
