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
  if (
    props.inbox.page_id === 'mock' ||
    props.inbox.channel_type === 'Channel::Mock' ||
    props.inbox.status === 'disconnected' ||
    (props.inbox.phone_number && String(props.inbox.phone_number).toLowerCase().includes('mock'))
  ) {
    return false;
  }
  return true;
});
</script>

<template>
  <div class="relative flex items-center justify-center me-1">
    <ChannelIcon :inbox="inbox" class="size-4 flex-shrink-0" />
    <span
      class="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-n-solid-2"
      :class="isConnected ? 'bg-emerald-500' : 'bg-amber-400'"
      :title="isConnected ? 'Conectado' : 'Desconectado / Conexão Mockup'"
    />
  </div>
  <div class="flex-1 truncate min-w-0 text-sm ms-1">{{ label }}</div>
  <SidebarUnreadBadge :count="badgeCount" />
</template>
