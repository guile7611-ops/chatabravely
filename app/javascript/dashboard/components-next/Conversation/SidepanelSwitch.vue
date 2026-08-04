<script setup>
import Button from 'dashboard/components-next/button/Button.vue';
import { useUISettings } from 'dashboard/composables/useUISettings';
import { computed } from 'vue';
import { useKeyboardEvents } from 'dashboard/composables/useKeyboardEvents';

const { updateUISettings } = useUISettings();

const { uiSettings } = useUISettings();
const isContactSidebarOpen = computed(
  () => uiSettings.value.is_contact_sidebar_open
);
const toggleConversationSidebarToggle = () => {
  updateUISettings({
    is_contact_sidebar_open: !isContactSidebarOpen.value,
    is_copilot_panel_open: false,
  });
};

const handleConversationSidebarToggle = () => {
  updateUISettings({
    is_contact_sidebar_open: true,
    is_copilot_panel_open: false,
  });
};

const keyboardEvents = {
  'Alt+KeyO': {
    action: toggleConversationSidebarToggle,
  },
};
useKeyboardEvents(keyboardEvents);
</script>

<template>
  <Button
    v-tooltip.bottom="$t('CONVERSATION.SIDEBAR.CONTACT')"
    ghost
    slate
    sm
    class="!rounded-md transition-all duration-[250ms] ease-out active:!scale-95 active:!brightness-105 active:duration-75"
    :class="{
      'bg-n-alpha-2 active:shadow-sm': isContactSidebarOpen,
    }"
    icon="i-ph-user-bold"
    @click="handleConversationSidebarToggle"
  />
</template>
