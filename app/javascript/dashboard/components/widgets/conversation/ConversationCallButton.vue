<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  getVoiceCallProvider,
  VOICE_CALL_PROVIDERS,
} from 'dashboard/helper/inbox';
import {
  VOICE_CALL_DIRECTION,
  VOICE_CALL_OUTBOUND_INIT_STATUS,
} from 'dashboard/components-next/message/constants';
import { useWhatsappCallSession } from 'dashboard/composables/useWhatsappCallSession';
import { useCallsStore } from 'dashboard/stores/calls';
import { useAccount } from 'dashboard/composables/useAccount';
import { FEATURE_FLAGS } from 'dashboard/featureFlags';
import { useAlert } from 'dashboard/composables';
import NextButton from 'dashboard/components-next/button/Button.vue';

const props = defineProps({
  inbox: {
    type: Object,
    default: () => ({}),
  },
  chat: {
    type: Object,
    default: () => ({}),
  },
});

const { t } = useI18n();
const callsStore = useCallsStore();
const whatsappCallSession = useWhatsappCallSession();
const { isCloudFeatureEnabled } = useAccount();

const voiceCallProvider = computed(() => getVoiceCallProvider(props.inbox));
const isWhatsappVoiceInbox = computed(
  () =>
    voiceCallProvider.value === VOICE_CALL_PROVIDERS.WHATSAPP &&
    isCloudFeatureEnabled(FEATURE_FLAGS.CHANNEL_VOICE)
);

const isCallButtonDisabled = computed(() => {
  if (callsStore.hasActiveCall || callsStore.hasIncomingCall) return true;
  return whatsappCallSession.isInitiating.value;
});

const isCallButtonLoading = computed(() => whatsappCallSession.isInitiating.value);

const callButtonTooltip = computed(() => t('CONVERSATION.HEADER.WHATSAPP_CALL'));

const startWhatsappCall = async () => {
  if (whatsappCallSession.isInitiating.value) return;
  try {
    const response = await whatsappCallSession.initiateOutboundCall(
      props.chat.id
    );

    // Composable returns LOCKED when init is already in flight or a call is
    // active; soft no-op so a parallel click doesn't trigger a banner.
    if (response?.status === VOICE_CALL_OUTBOUND_INIT_STATUS.LOCKED) return;
    // Permission template path returns no call id — show banner, no widget yet.
    if (!response?.id) {
      const status = response?.status;
      const messageKey =
        status === VOICE_CALL_OUTBOUND_INIT_STATUS.PERMISSION_PENDING
          ? 'CONVERSATION.HEADER.WHATSAPP_CALL_PERMISSION_PENDING'
          : 'CONVERSATION.HEADER.WHATSAPP_CALL_PERMISSION_REQUESTED';
      useAlert(t(messageKey));
      return;
    }

    // Stay non-active until Meta delivers the connect webhook (sdp_answer);
    // flipping to active here would start the duration timer before pickup.
    callsStore.addCall({
      callSid: response.call_id,
      callId: response.id,
      conversationId: props.chat.id,
      inboxId: props.inbox?.id,
      callDirection: VOICE_CALL_DIRECTION.OUTBOUND,
      provider: VOICE_CALL_PROVIDERS.WHATSAPP,
    });
  } catch (error) {
    useAlert(error?.message || t('CONVERSATION.HEADER.WHATSAPP_CALL_FAILED'));
  }
};

const startCall = () => startWhatsappCall();
</script>

<template>
  <NextButton
    v-if="isWhatsappVoiceInbox"
    v-tooltip.bottom="callButtonTooltip"
    sm
    ghost
    slate
    icon="i-lucide-phone"
    :is-loading="isCallButtonLoading"
    :disabled="isCallButtonDisabled"
    @click="startCall"
  />
  <template v-else />
</template>
