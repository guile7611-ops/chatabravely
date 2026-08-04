<script setup>
import { computed } from 'vue';
import ChannelIcon from 'next/icon/ChannelIcon.vue';
import SidebarUnreadBadge from './SidebarUnreadBadge.vue';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  // eslint-disable-next-line vue/no-unused-properties
  active: {
    type: Boolean,
    default: false,
  },
  inbox: {
    type: Object,
    required: true,
  },
  badgeCount: {
    type: [Number, String],
    default: 0,
  },
});

const isConnected = computed(() => {
  if (props.inbox.reauthorization_required) return false;

  const status = String(
    props.inbox.connection_status ??
      props.inbox.connectionStatus ??
      props.inbox.status ??
      ''
  ).toUpperCase();

  return status === 'CONNECTED';
});
</script>

<template>
  <div class="relative flex items-center justify-center me-1">
    <ChannelIcon :inbox="inbox" class="size-4 flex-shrink-0" />
    <span
      data-test-id="channel-connection-status"
      :data-status="isConnected ? 'connected' : 'disconnected'"
      class="absolute z-10 -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-n-solid-2"
      :class="isConnected ? 'bg-n-teal-9' : 'bg-n-amber-9'"
      :title="isConnected ? 'Conectado' : 'Desconectado'"
    />
  </div>
  <div class="flex-1 truncate min-w-0 text-sm ms-1">{{ label }}</div>
  <SidebarUnreadBadge :count="badgeCount" />
</template>
