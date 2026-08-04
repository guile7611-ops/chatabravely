<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import ResolveAction from '../../buttons/ResolveAction.vue';
import SidepanelSwitch from 'dashboard/components-next/Conversation/SidepanelSwitch.vue';

const store = useStore();
const currentChat = computed(() => store.getters.getSelectedChat);
</script>

<template>
  <div class="relative flex items-center gap-2 actions--container">
    <ResolveAction
      :conversation-id="currentChat.id"
      :status="currentChat.status"
    />
    <SidepanelSwitch />
  </div>
</template>
