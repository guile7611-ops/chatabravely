<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useMapGetter } from 'dashboard/composables/store';

import { useAccount } from 'dashboard/composables/useAccount';

import ChannelItem from 'dashboard/components/widgets/ChannelItem.vue';

const { t } = useI18n();
const router = useRouter();
const { accountId, currentAccount } = useAccount();

const globalConfig = useMapGetter('globalConfig/get');

const enabledFeatures = ref({});

const hasTiktokConfigured = computed(() => {
  return window.chatwootConfig?.tiktokAppId;
});

const channelList = computed(() => {
  return [
    {
      key: 'whatsapp_qrcode',
      title: 'WhatsApp QR Code',
      description: 'Conecte lendo o QR Code do WhatsApp (Evolution API GO)',
      icon: 'i-woot-whatsapp',
    },
    {
      key: 'whatsapp_official',
      title: 'WhatsApp API Oficial',
      description: 'Conecte utilizando a API Oficial da Meta (Meta Cloud API)',
      icon: 'i-woot-whatsapp',
    },
  ];
});

const initializeEnabledFeatures = async () => {
  enabledFeatures.value = currentAccount.value.features;
};

const initChannelAuth = channel => {
  const params = {
    sub_page: channel,
    accountId: accountId.value,
  };
  router.push({ name: 'settings_inboxes_page_channel', params });
};

onMounted(() => {
  initializeEnabledFeatures();
});
</script>

<template>
  <div
    class="grid max-w-3xl grid-cols-1 xs:grid-cols-2 mx-0 gap-6 sm:grid-cols-3 p-8"
  >
    <ChannelItem
      v-for="channel in channelList"
      :key="channel.key"
      :channel="channel"
      :enabled-features="enabledFeatures"
      @channel-item-click="initChannelAuth"
    />
  </div>
</template>
