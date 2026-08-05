<script setup>
import { useRouter } from 'vue-router';
import Avatar from 'dashboard/components-next/avatar/Avatar.vue';

defineProps({
  contacts: { type: Array, required: true },
});

const router = useRouter();
const openContact = contactId =>
  router.push({ name: 'contacts_edit', params: { contactId } });
</script>

<template>
  <div class="overflow-hidden border divide-y rounded-xl border-n-weak divide-n-weak">
    <button
      v-for="contact in contacts"
      :key="contact.id"
      type="button"
      class="flex items-center w-full gap-4 p-4 text-left transition-colors bg-n-surface-1 hover:bg-n-alpha-2"
      @click="openContact(contact.id)"
    >
      <Avatar :name="contact.name" :src="contact.thumbnail" :size="40" />
      <span class="flex flex-col flex-1 min-w-0 gap-1">
        <strong class="text-sm truncate text-n-slate-12">
          {{ contact.name }}
        </strong>
        <span class="text-sm truncate text-n-slate-11">
          {{ contact.phoneNumber }}
        </span>
      </span>
      <span class="text-sm truncate max-w-64 text-n-slate-11">
        {{ contact.additionalAttributes?.companyName || 'Sem empresa' }}
      </span>
      <span class="i-lucide-chevron-right size-4 text-n-slate-10" />
    </button>
  </div>
</template>
