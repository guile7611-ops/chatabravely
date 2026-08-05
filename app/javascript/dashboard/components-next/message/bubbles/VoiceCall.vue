<script setup>
import { computed } from 'vue';
import { useMessageContext } from '../provider.js';
import { VOICE_CALL_STATUS, ATTACHMENT_TYPES } from '../constants';
import { formatDuration } from 'shared/helpers/timeHelper';

import Icon from 'dashboard/components-next/icon/Icon.vue';
import BaseBubble from 'next/message/bubbles/Base.vue';
import AudioChip from 'next/message/chips/Audio.vue';

const { call, attachments, contentAttributes } = useMessageContext();

const status = computed(() => call.value?.status);
const label = computed(() => {
  if (status.value === VOICE_CALL_STATUS.COMPLETED) return 'Chamada encerrada';
  if (status.value === VOICE_CALL_STATUS.IN_PROGRESS) return 'Chamada em andamento';
  return 'Registro de chamada';
});

const audioAttachment = computed(() =>
  (attachments?.value || []).find(item => item.fileType === ATTACHMENT_TYPES.AUDIO)
);

const duration = computed(() => {
  const seconds =
    call.value?.durationSeconds ||
    call.value?.duration_seconds ||
    contentAttributes?.value?.data?.durationSeconds ||
    contentAttributes?.value?.data?.duration_seconds;
  return seconds ? formatDuration(seconds) : '';
});
</script>

<template>
  <BaseBubble class="!p-3 !max-w-md min-w-[220px]" hide-meta>
    <div class="flex flex-col gap-3 w-full">
      <div class="flex gap-2.5 items-center">
        <div
          class="flex justify-center items-center rounded-xl size-11 shrink-0 bg-n-alpha-2 text-n-slate-12"
        >
          <Icon class="size-4" icon="i-ph-phone-bold" />
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-medium text-n-slate-12">{{ label }}</span>
          <span v-if="duration" class="text-sm text-n-slate-10">
            {{ duration }}
          </span>
        </div>
      </div>
      <AudioChip
        v-if="audioAttachment"
        :attachment="audioAttachment"
        show-transcribed-text
      />
    </div>
  </BaseBubble>
</template>
