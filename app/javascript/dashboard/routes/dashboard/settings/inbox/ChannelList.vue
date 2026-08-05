<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useAccount } from 'dashboard/composables/useAccount';

import ChannelItem from 'dashboard/components/widgets/ChannelItem.vue';

const router = useRouter();
const { accountId } = useAccount();

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

const initChannelAuth = channel => {
  const params = {
    sub_page: channel,
    accountId: accountId.value,
  };
  router.push({ name: 'settings_inboxes_page_channel', params });
};
</script>

<template>
  <div
    class="grid max-w-3xl grid-cols-1 xs:grid-cols-2 mx-0 gap-6 sm:grid-cols-3 p-8"
  >
    <ChannelItem
      v-for="channel in channelList"
      :key="channel.key"
      :channel="channel"
      :enabled-features="{}"
      @channel-item-click="initChannelAuth"
    />
  </div>
</template>
