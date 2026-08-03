<script setup>
import { ref, computed } from 'vue';
import Avatar from 'dashboard/components-next/avatar/Avatar.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import Icon from 'dashboard/components-next/icon/Icon.vue';
import { dynamicTime } from 'shared/helpers/timeHelper';

const props = defineProps({
  article: {
    type: Object,
    default: null,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  isManager: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['close', 'confirmRead', 'editArticle']);

const readConfirmed = ref(false);
const localViews = ref(0);

const formattedDate = computed(() => {
  if (!props.article?.updatedAt) return 'Hoje';
  return dynamicTime(props.article.updatedAt);
});

const authorName = computed(() => {
  return props.article?.author?.name || props.article?.author?.availableName || 'Gestão / Comunicação';
});

const handleConfirmRead = () => {
  if (readConfirmed.value) return;
  readConfirmed.value = true;
  localViews.value += 1;
  emit('confirmRead', props.article?.id);
};

const handleEdit = () => {
  emit('editArticle', props.article);
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && article"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      @click.self="handleClose"
    >
      <div
        class="relative w-full max-w-3xl bg-n-background border border-n-weak rounded-2xl p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto text-start"
        @click.stop
      >
        <!-- Cabeçalho do Artigo (Estilo Leitura de E-mail) -->
        <div class="flex items-start justify-between border-b border-n-weak pb-4 min-w-0">
          <div class="flex items-center gap-3 min-w-0">
            <Avatar
              :name="authorName"
              :src="article.author?.thumbnail"
              :size="40"
              rounded-full
            />
            <div class="flex flex-col min-w-0">
              <span class="font-semibold text-lg text-n-slate-12 truncate">
                {{ article.title }}
              </span>
              <div class="flex items-center gap-2 text-xs text-n-slate-10 mt-0.5">
                <span>Publicado por <strong>{{ authorName }}</strong></span>
                <span>•</span>
                <span>{{ formattedDate }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-n-alpha-2 text-xs text-n-slate-11">
              <Icon icon="i-lucide-eye" class="size-4" />
              <span class="font-medium">{{ (article.views || 0) + localViews }} visualizações</span>
            </div>

            <Button
              v-if="isManager"
              label="Editar"
              icon="i-lucide-pencil"
              color="slate"
              size="sm"
              @click="handleEdit"
            />

            <button
              type="button"
              class="text-n-slate-10 hover:text-n-slate-12 p-1 rounded-md transition-colors"
              @click="handleClose"
            >
              <Icon icon="i-lucide-x" class="size-5" />
            </button>
          </div>
        </div>

        <!-- Conteúdo do Artigo -->
        <div class="prose dark:prose-invert max-w-none text-sm leading-relaxed text-n-slate-12 min-h-[160px]">
          <div v-if="article.content" v-html="article.content" />
          <div v-else class="text-n-slate-10 italic">
            Nenhum conteúdo adicional foi inserido neste comunicado.
          </div>
        </div>

        <!-- Seção de Anexos (Mídias, Áudios e Arquivos) -->
        <div v-if="article.attachments && article.attachments.length" class="border-t border-n-weak pt-4 flex flex-col gap-2">
          <span class="text-xs font-semibold text-n-slate-11 uppercase tracking-wider">
            Anexos ({{ article.attachments.length }})
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              v-for="(file, idx) in article.attachments"
              :key="idx"
              :href="file.url || '#'"
              target="_blank"
              class="flex items-center gap-2.5 p-2.5 rounded-lg border border-n-weak bg-n-alpha-1 hover:bg-n-alpha-2 transition-colors text-xs text-n-slate-12 min-w-0"
            >
              <Icon
                :icon="file.type === 'audio' ? 'i-lucide-volume-2' : file.type === 'image' ? 'i-lucide-image' : 'i-lucide-file-text'"
                class="size-4 text-n-brand flex-shrink-0"
              />
              <span class="truncate font-medium flex-1">{{ file.name || `Anexo ${idx + 1}` }}</span>
              <Icon icon="i-lucide-download" class="size-3.5 text-n-slate-10" />
            </a>
          </div>
        </div>

        <!-- Barra de Ação Inferior: Confirmar Leitura -->
        <div class="flex items-center justify-between border-t border-n-weak pt-4 mt-2">
          <div class="flex items-center gap-2">
            <span v-if="readConfirmed" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-n-teal-2 text-n-teal-11 text-xs font-semibold">
              <Icon icon="i-lucide-check-circle-2" class="size-4 text-n-teal-11" />
              Leitura Confirmada
            </span>
            <span v-else class="text-xs text-n-slate-10">
              Confirme a leitura deste artigo para atualizar o contador da equipe.
            </span>
          </div>

          <Button
            v-if="!readConfirmed"
            label="Confirmar Leitura"
            icon="i-lucide-check-check"
            color="blue"
            size="sm"
            @click="handleConfirmRead"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
