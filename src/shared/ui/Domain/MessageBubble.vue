<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import Attachment from './Attachment.vue'

export type SenderType = 'USER' | 'AGENT' | 'SYSTEM' | 'AI' | 'NOTE'

const props = withDefaults(defineProps<{
  id: string
  content: string
  senderType: SenderType
  senderName?: string
  createdAt: string
  mediaUrl?: string | null
  mediaType?: string | null
}>(), {
  senderType: 'USER'
})

const isOutgoing = computed(() => props.senderType === 'AGENT' || props.senderType === 'AI')
</script>

<template>
  <div v-if="senderType === 'SYSTEM'" class="my-2 text-center text-[11px] text-[var(--text-tertiary)] italic">
    {{ content }} — {{ createdAt }}
  </div>

  <div
    v-else-if="senderType === 'NOTE'"
    class="my-2 p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-200 max-w-lg mx-auto shadow-xs"
  >
    <div class="flex items-center justify-between text-[10px] font-bold text-amber-400 mb-1">
      <span class="flex items-center gap-1">
        <Icon icon="lucide:pin" class="text-xs" />
        Nota Interna Privada — {{ senderName }}
      </span>
      <span>{{ createdAt }}</span>
    </div>
    <p class="whitespace-pre-wrap leading-relaxed">{{ content }}</p>
  </div>

  <div
    v-else
    class="flex flex-col my-1 max-w-[75%]"
    :class="isOutgoing ? 'ml-auto items-end' : 'mr-auto items-start'"
  >
    <span v-if="senderName" class="text-[10px] text-[var(--text-tertiary)] mb-0.5 px-1 font-medium">
      {{ senderName }}
    </span>

    <div
      class="px-3.5 py-2.5 text-xs shadow-xs break-words whitespace-pre-wrap leading-relaxed transition-all"
      :class="isOutgoing 
        ? 'bg-[#155EEF] text-white rounded-2xl rounded-tr-xs shadow-blue-950/20' 
        : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-2xl rounded-tl-xs'"
    >
      <Attachment v-if="mediaUrl" :url="mediaUrl" :type="mediaType || 'file'" class="mb-2" />
      <p class="text-[13px] tracking-normal">{{ content }}</p>

      <div
        class="flex items-center justify-end gap-1 text-[9px] mt-1 text-right"
        :class="isOutgoing ? 'text-white/80' : 'text-[var(--text-tertiary)]'"
      >
        <span>{{ createdAt }}</span>
        <Icon v-if="isOutgoing" icon="lucide:check-check" class="text-xs text-blue-200 ml-0.5" />
      </div>
    </div>
  </div>
</template>
