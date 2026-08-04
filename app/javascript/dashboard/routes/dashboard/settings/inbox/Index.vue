<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlert } from 'dashboard/composables';
import { picoSearch } from '@scmmishra/pico-search';
import Avatar from 'next/avatar/Avatar.vue';
import { useAdmin } from 'dashboard/composables/useAdmin';
import SettingsLayout from '../SettingsLayout.vue';
import BaseSettingsHeader from '../components/BaseSettingsHeader.vue';
import {
  useMapGetter,
  useStoreGetters,
  useStore,
} from 'dashboard/composables/store';
import ChannelName from './components/ChannelName.vue';
import ChannelIcon from 'next/icon/ChannelIcon.vue';
import Button from 'dashboard/components-next/button/Button.vue';

const getters = useStoreGetters();
const store = useStore();
const { t } = useI18n();
const { isAdmin } = useAdmin();

const showDeletePopup = ref(false);
const selectedInbox = ref({});
const searchQuery = ref('');

const inboxes = useMapGetter('inboxes/getInboxes');

const inboxesList = computed(() => {
  return inboxes.value?.slice().sort((a, b) => a.name.localeCompare(b.name));
});

const filteredInboxesList = computed(() => {
  const query = searchQuery.value.trim();
  if (!query) return inboxesList.value;
  return picoSearch(inboxesList.value, query, ['name', 'channel_type']);
});

const uiFlags = computed(() => getters['inboxes/getUIFlags'].value);
const inboxError = computed(() => getters['inboxes/getInboxesError']?.value || getters.getInboxesError?.value);

const fetchInboxes = () => {
  store.dispatch('inboxes/get');
};

const deleteConfirmText = computed(
  () => `${t('INBOX_MGMT.DELETE.CONFIRM.YES')} ${selectedInbox.value.name}`
);
const deleteRejectText = computed(
  () => `${t('INBOX_MGMT.DELETE.CONFIRM.NO')} ${selectedInbox.value.name}`
);

const confirmDeleteMessage = computed(
  () => `${t('INBOX_MGMT.DELETE.CONFIRM.MESSAGE')} ${selectedInbox.value.name}?`
);
const confirmPlaceHolderText = computed(
  () =>
    `${t('INBOX_MGMT.DELETE.CONFIRM.PLACE_HOLDER', {
      inboxName: selectedInbox.value.name,
    })}`
);

const deleteInbox = async ({ id }) => {
  try {
    await store.dispatch('inboxes/delete', id);
    useAlert(t('INBOX_MGMT.DELETE.API.SUCCESS_MESSAGE'));
  } catch (error) {
    const errorMsg = getters['inboxes/getError'].value || error.message;
    useAlert(errorMsg);
  }
};
const closeDelete = () => {
  showDeletePopup.value = false;
  selectedInbox.value = {};
};

const confirmDeletion = () => {
  deleteInbox(selectedInbox.value);
  closeDelete();
};
const openDelete = inbox => {
  showDeletePopup.value = true;
  selectedInbox.value = inbox;
};
const getInboxProvider = inbox => {
  const provider = String(
    inbox.provider || inbox.channel_provider || inbox.medium || ''
  ).toUpperCase();

  if (
    provider === 'META_CLOUD' ||
    provider === 'META' ||
    inbox.channel_type === 'Channel::MetaCloud' ||
    inbox.channel_type === 'Channel::WhatsappMeta'
  ) {
    return 'META_CLOUD';
  }

  return 'EVOLUTION';
};

const isOfficialApi = inbox => getInboxProvider(inbox) === 'META_CLOUD';

const getInboxType = inbox => (isOfficialApi(inbox) ? 'API Oficial' : 'QR Code');

const getConnectionStatus = inbox =>
  String(
    inbox.connection_status || inbox.connectionStatus || inbox.status || ''
  ).toUpperCase();

const getStatusLabel = inbox => {
  const status = getConnectionStatus(inbox);
  if (status === 'CONNECTING') return 'Conectando';
  return status === 'CONNECTED' ? 'Conectado' : 'Desconectado';
};

const getStatusClass = inbox => {
  const status = getConnectionStatus(inbox);
  if (status === 'CONNECTING')
    return 'bg-n-amber-2 text-n-amber-11 border border-n-amber-4';
  if (status !== 'CONNECTED')
    return 'bg-n-ruby-2 text-n-ruby-11 border border-n-ruby-4';
  if (isOfficialApi(inbox))
    return 'bg-n-blue-2 text-n-blue-11 border border-n-blue-4';
  return 'bg-n-teal-2 text-n-teal-11 border border-n-teal-4';
};

const getStatusDotClass = inbox => {
  const status = getConnectionStatus(inbox);
  if (status === 'CONNECTING') return 'bg-n-amber-9';
  if (status !== 'CONNECTED') return 'bg-n-ruby-9';
  if (isOfficialApi(inbox)) return 'bg-n-blue-9';
  return 'bg-n-teal-9';
};

const getTypeClass = inbox =>
  isOfficialApi(inbox)
    ? 'bg-n-blue-2 text-n-blue-11 border-n-blue-4'
    : 'bg-n-alpha-2 text-n-slate-12 border-n-weak';

const getChannelIconClass = inbox =>
  isOfficialApi(inbox) ? 'text-n-blue-11' : 'text-n-teal-11';
</script>

<template>
  <SettingsLayout
    :no-records-found="!inboxesList.length && !inboxError && !uiFlags.isFetching"
    :no-records-message="$t('INBOX_MGMT.LIST.404')"
    :is-loading="uiFlags.isFetching"
  >
    <template #header>
      <BaseSettingsHeader
        v-model:search-query="searchQuery"
        :title="$t('INBOX_MGMT.HEADER')"
        :description="$t('INBOX_MGMT.DESCRIPTION')"
        :link-text="$t('INBOX_MGMT.LEARN_MORE')"
        :search-placeholder="$t('INBOX_MGMT.SEARCH_PLACEHOLDER')"
        feature-name="inboxes"
      >
        <template v-if="inboxesList?.length" #count>
          <span class="text-body-main text-n-slate-11">
            {{ $t('INBOX_MGMT.COUNT', { n: inboxesList.length }) }}
          </span>
        </template>
        <template #actions>
          <router-link v-if="isAdmin" :to="{ name: 'settings_inbox_new' }">
            <Button :label="$t('SETTINGS.INBOXES.NEW_INBOX')" size="sm" />
          </router-link>
        </template>
      </BaseSettingsHeader>
    </template>
    <template #body>
      <div
        v-if="inboxError"
        class="bg-n-ruby-2 border border-n-ruby-4 text-n-ruby-11 p-4 rounded-xl flex items-center justify-between my-4"
      >
        <span>{{ inboxError }}</span>
        <Button
          label="Tentar novamente"
          size="sm"
          :disabled="uiFlags.isFetching"
          @click="fetchInboxes"
        />
      </div>
      <span
        v-else-if="!filteredInboxesList.length && searchQuery"
        class="flex-1 flex items-center justify-center py-20 text-center text-body-main !text-base text-n-slate-11"
      >
        {{ $t('INBOX_MGMT.NO_RESULTS') }}
      </span>
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4"
      >
        <div
          v-for="inbox in filteredInboxesList"
          :key="inbox.id"
          :data-channel-provider="getInboxProvider(inbox)"
          class="bg-n-solid-2 border border-n-weak rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-n-strong transition-all duration-150"
        >
          <!-- Top Row: Icon/Avatar + Name + Actions -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div
                v-if="inbox.avatar_url"
                class="bg-n-alpha-3 rounded-xl size-10 ring ring-n-solid-1 border border-n-strong shadow-sm grid place-items-center flex-shrink-0"
              >
                <Avatar
                  :src="inbox.avatar_url"
                  :name="inbox.name"
                  :size="24"
                  rounded-full
                />
              </div>
              <div
                v-else
                class="size-10 justify-center bg-n-alpha-3 rounded-xl ring ring-n-solid-1 border border-n-strong shadow-sm grid place-items-center flex-shrink-0"
              >
                <ChannelIcon
                  class="size-6"
                  :class="getChannelIconClass(inbox)"
                  :inbox="inbox"
                />
              </div>
              <div class="flex flex-col min-w-0">
                <span
                  class="text-heading-3 font-semibold text-n-slate-12 capitalize truncate"
                >
                  {{ inbox.name }}
                </span>
                <span class="text-xs text-n-slate-10 font-medium">
                  WhatsApp
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <Button
                v-if="isAdmin"
                v-tooltip.top="$t('INBOX_MGMT.DELETE.BUTTON_TEXT')"
                icon="i-woot-bin"
                slate
                sm
                class="hover:enabled:text-n-ruby-11 hover:enabled:bg-n-ruby-2"
                @click="openDelete(inbox)"
              />
            </div>
          </div>

          <!-- Bottom Row: Connection Type & Status Badges -->
          <div
            class="flex items-center justify-between gap-2 pt-3 border-t border-n-weak/50 text-xs"
          >
            <!-- Type Badge -->
            <span
              data-test-id="channel-type-badge"
              class="px-2.5 py-1 rounded-full font-medium border flex items-center gap-1.5"
              :class="getTypeClass(inbox)"
            >
              <span
                v-if="getInboxType(inbox) === 'QR Code'"
                class="i-lucide-qr-code size-3.5 text-n-teal-10"
              />
              <span v-else class="i-lucide-shield-check size-3.5 text-n-blue-10" />
              {{ getInboxType(inbox) }}
            </span>

            <!-- Status Badge -->
            <span
              data-test-id="channel-status-badge"
              class="px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 text-xs"
              :class="getStatusClass(inbox)"
            >
              <span
                class="size-2 rounded-full animate-pulse"
                :class="getStatusDotClass(inbox)"
              />
              {{ getStatusLabel(inbox) }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <woot-confirm-delete-modal
      v-if="showDeletePopup"
      v-model:show="showDeletePopup"
      :title="$t('INBOX_MGMT.DELETE.CONFIRM.TITLE')"
      :message="confirmDeleteMessage"
      :confirm-text="deleteConfirmText"
      :reject-text="deleteRejectText"
      :confirm-value="selectedInbox.name"
      :confirm-place-holder-text="confirmPlaceHolderText"
      @on-confirm="confirmDeletion"
      @on-close="closeDelete"
    />
  </SettingsLayout>
</template>
