<script setup>
import { computed, ref } from 'vue';
import chatWallpaper from 'dashboard/assets/images/chat-wallpaper.jpg';

const props = defineProps({
  conversation: {
    type: Object,
    required: true,
  },
  currentUserId: {
    type: [String, Number],
    default: null,
  },
  departments: {
    type: Array,
    default: () => [],
  },
  attendants: {
    type: Array,
    default: () => [],
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'claim',
  'transfer',
  'close',
  'reopen',
  'send-message',
  'send-template',
  'open-contact',
]);

const messageText = ref('');
const isPrivate = ref(false);
const transferTarget = ref('');
const showTransfer = ref(false);

const contact = computed(() => props.conversation.contact || props.conversation.meta?.sender || {});
const messages = computed(() => props.conversation.messages || []);
const queue = computed(() => props.conversation.queue);
const canClaim = computed(() => ['RECEPTION', 'DEPARTMENT'].includes(queue.value));
const canReply = computed(() => Boolean(props.conversation.can_reply));
const isClosed = computed(() => queue.value === 'CLOSED' || props.conversation.status === 'CLOSED');
const canReopen = computed(() => isClosed.value);
const metaWindow = computed(() => props.conversation.meta_window);
const channelType = computed(
  () => props.conversation.channel?.type || props.conversation.meta?.channel || ''
);
const isMetaWindowClosed = computed(
  () => channelType.value === 'META_CLOUD' && !metaWindow.value?.isOpen
);
const panelStyle = computed(() => ({ backgroundImage: `url(${chatWallpaper})` }));

const isOutgoing = message => {
  if (message.senderType) return message.senderType === 'AGENT';
  return message.message_type === 1 || message.direction === 'outbound';
};

const isNote = message => Boolean(message.isPrivate || message.private || message.senderType === 'NOTE');

const formatTimestamp = timestamp => {
  if (!timestamp) return '';
  const date = typeof timestamp === 'number'
    ? new Date(timestamp > 1e12 ? timestamp : timestamp * 1000)
    : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const submitMessage = () => {
  const content = messageText.value.trim();
  if (!content || !canReply.value || isMetaWindowClosed.value) return;
  emit('send-message', { content, isPrivate: isPrivate.value });
  messageText.value = '';
};

const submitTransfer = () => {
  if (!transferTarget.value) return;
  const [kind, id] = transferTarget.value.split(':');
  emit('transfer', kind === 'attendant' ? { agentId: id } : { departmentId: id });
  transferTarget.value = '';
  showTransfer.value = false;
};
</script>

<template>
  <section class="flex min-w-0 flex-1 flex-col bg-n-surface-1">
    <header class="flex h-16 items-center justify-between gap-3 border-b border-n-weak px-4">
      <button class="flex min-w-0 items-center gap-3 text-left" type="button" @click="emit('open-contact')">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-n-brand/20 text-sm font-semibold text-n-brand">
          {{ (contact.name || '?').slice(0, 1).toUpperCase() }}
        </span>
        <span class="min-w-0">
          <strong class="block truncate text-sm text-n-slate-12">{{ contact.name || 'Contato sem nome' }}</strong>
          <span class="block truncate text-xs text-n-slate-10">{{ contact.phone || conversation.id }}</span>
        </span>
      </button>

      <div class="relative flex shrink-0 items-center gap-2">
        <button v-if="canClaim" class="rounded-md bg-n-brand px-3 py-2 text-sm font-medium text-white" type="button" @click="emit('claim')">Assumir</button>
        <button v-if="canReopen" class="rounded-md bg-n-brand px-3 py-2 text-sm font-medium text-white" type="button" @click="emit('reopen')">Reabrir</button>
        <button v-if="!isClosed" class="rounded-md bg-n-brand px-3 py-2 text-sm font-medium text-white" type="button" @click="showTransfer = !showTransfer">Transferir</button>
        <button v-if="canReply" class="rounded-md bg-n-slate-3 px-3 py-2 text-sm font-medium text-n-slate-12" type="button" @click="emit('close')">Resolver</button>

        <div v-if="showTransfer" class="absolute right-0 top-11 z-20 flex w-72 gap-2 rounded-lg border border-n-weak bg-n-surface-2 p-2 shadow-xl">
          <select v-model="transferTarget" class="min-w-0 flex-1 rounded-md border border-n-weak bg-n-surface-1 px-2 py-1 text-sm text-n-slate-12">
            <option value="">Destino...</option>
            <optgroup label="Departamentos">
              <option v-for="department in departments" :key="department.id" :value="`department:${department.id}`">{{ department.name }}</option>
            </optgroup>
            <optgroup label="Atendentes">
              <option v-for="attendant in attendants" :key="attendant.id" :value="`attendant:${attendant.id}`">{{ attendant.name }}</option>
            </optgroup>
          </select>
          <button class="rounded-md bg-n-brand px-3 text-sm font-medium text-white disabled:opacity-50" :disabled="!transferTarget" type="button" @click="submitTransfer">OK</button>
        </div>
      </div>
    </header>

    <div v-if="!canReply && !isClosed" class="border-b border-n-ruby-5 bg-n-ruby-2 px-4 py-3 text-center text-sm text-n-ruby-11">
      Esta conversa está em uma fila. Assuma ou transfira para um atendente antes de responder.
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto bg-cover bg-center p-5" :style="panelStyle">
      <ol class="flex min-h-full flex-col justify-end gap-3">
        <li v-for="message in messages" :key="message.id" class="flex" :class="isOutgoing(message) ? 'justify-end' : 'justify-start'">
          <article class="max-w-[75%] rounded-xl px-3 py-2 shadow-sm" :class="[
            isNote(message) ? 'bg-n-amber-3 text-n-slate-12' : isOutgoing(message) ? 'bg-n-brand text-white' : 'bg-n-slate-3 text-n-slate-12',
          ]">
            <p class="whitespace-pre-wrap break-words text-sm">{{ message.content }}</p>
            <time class="mt-1 block text-right text-xs opacity-75">{{ formatTimestamp(message.createdAt || message.created_at) }}</time>
          </article>
        </li>
      </ol>
    </div>

    <footer class="border-t border-n-weak bg-n-surface-1 p-3">
      <div v-if="isMetaWindowClosed" class="mb-2 rounded-md bg-n-amber-2 px-3 py-2 text-sm text-n-amber-11">
        Janela de 24 horas expirada. Envie um template Meta aprovado e aguarde a resposta do contato.
      </div>
      <div v-else-if="!canReply" class="mb-2 text-sm text-n-slate-10">Você não pode responder esta conversa.</div>
      <div v-else class="flex gap-2">
        <textarea v-model="messageText" class="min-h-12 flex-1 resize-none rounded-lg border border-n-weak bg-n-surface-2 px-3 py-2 text-sm text-n-slate-12" :disabled="isSubmitting" :placeholder="isPrivate ? 'Nota privada para a equipe' : 'Digite uma mensagem'" @keydown.ctrl.enter.prevent="submitMessage" />
        <button class="rounded-lg bg-n-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50" :disabled="!messageText.trim() || isSubmitting" type="button" @click="submitMessage">Enviar</button>
      </div>
      <label v-if="canReply && !isMetaWindowClosed" class="mt-2 flex items-center gap-2 text-xs text-n-slate-10"><input v-model="isPrivate" type="checkbox"> Mensagem privada</label>
    </footer>
  </section>
</template>
