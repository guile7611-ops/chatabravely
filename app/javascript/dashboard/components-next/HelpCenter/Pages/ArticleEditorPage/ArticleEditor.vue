<script setup>
import { ref, computed, watch } from 'vue';
import { debounce } from '@chatwoot/utils';
import { useI18n } from 'vue-i18n';
import { ARTICLE_EDITOR_MENU_OPTIONS } from 'dashboard/constants/editor';

import HelpCenterLayout from 'dashboard/components-next/HelpCenter/HelpCenterLayout.vue';
import TextArea from 'dashboard/components-next/textarea/TextArea.vue';
import FullEditor from 'dashboard/components/widgets/WootWriter/FullEditor.vue';
import ArticleEditorHeader from 'dashboard/components-next/HelpCenter/Pages/ArticleEditorPage/ArticleEditorHeader.vue';
import ArticleEditorControls from 'dashboard/components-next/HelpCenter/Pages/ArticleEditorPage/ArticleEditorControls.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import Icon from 'dashboard/components-next/icon/Icon.vue';

const props = defineProps({
  article: {
    type: Object,
    default: () => ({}),
  },
  isUpdating: {
    type: Boolean,
    default: false,
  },
  isSaved: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'saveArticle',
  'goBack',
  'setAuthor',
  'setCategory',
  'previewArticle',
  'createArticle',
]);

const { t } = useI18n();

const isNewArticle = computed(() => !props.article?.id);

const localTitle = ref(props.article?.title ?? '');
const localContent = ref(props.article?.content ?? '');
const attachments = ref(props.article?.attachments ?? []);
const fileInputRef = ref(null);

watch(
  () => props.article?.id,
  newId => {
    if (newId) {
      localTitle.value = props.article?.title ?? '';
      localContent.value = props.article?.content ?? '';
      attachments.value = props.article?.attachments ?? [];
    }
  }
);

const debouncedSave = debounce(value => emit('saveArticle', value), 500, false);

const handleSave = value => {
  if (isNewArticle.value) return;
  debouncedSave(value);
};

const articleTitle = computed({
  get: () => localTitle.value,
  set: value => {
    localTitle.value = value;
    handleSave({ title: value });
  },
});

const articleContent = computed({
  get: () => localContent.value,
  set: content => {
    localContent.value = content;
    handleSave({ content });
  },
});

const onClickGoBack = () => {
  emit('goBack');
};

const setAuthorId = authorId => {
  emit('setAuthor', authorId);
};

const setCategoryId = categoryId => {
  emit('setCategory', categoryId);
};

const previewArticle = () => {
  emit('previewArticle');
};

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files || []);
  files.forEach(file => {
    const isAudio = file.type.startsWith('audio/');
    const isImage = file.type.startsWith('image/');
    attachments.value.push({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: isAudio ? 'audio' : isImage ? 'image' : 'file',
      url: URL.createObjectURL(file),
    });
  });
};

const removeAttachment = (index) => {
  attachments.value.splice(index, 1);
};

const handlePublishNewArticle = (status = 'published') => {
  const title = localTitle.value || 'Comunicado Sem Título';
  emit('createArticle', {
    title,
    content: localContent.value || '',
    attachments: attachments.value,
    status,
  });
};
</script>

<template>
  <HelpCenterLayout :show-header-title="false" :show-pagination-footer="false">
    <template #header-actions>
      <ArticleEditorHeader
        :is-updating="isUpdating"
        :is-saved="isSaved"
        :status="article.status"
        :article-id="article.id"
        @go-back="onClickGoBack"
        @preview-article="previewArticle"
        @publish-new-article="handlePublishNewArticle"
      />
    </template>
    <template #content>
      <div class="flex flex-col gap-3 pl-4 mb-3 rtl:pr-3 rtl:pl-0">
        <div class="flex items-center gap-2 text-xs font-semibold text-n-brand uppercase tracking-wider">
          <Icon icon="i-lucide-mail" class="size-4" />
          <span>Escrever Comunicado / Artigo</span>
        </div>

        <TextArea
          v-model="articleTitle"
          auto-height
          min-height="3rem"
          custom-text-area-class="!text-[28px] !leading-[40px] !font-semibold !tracking-[0.2px]"
          custom-text-area-wrapper-class="border-0 !bg-transparent dark:!bg-transparent !py-0 !px-0"
          placeholder="Assunto / Título do Comunicado..."
          :autofocus="isNewArticle"
          @blur="handleCreateArticle"
        />

        <ArticleEditorControls
          :article="article"
          @save-article="values => emit('saveArticle', values)"
          @set-author="setAuthorId"
          @set-category="setCategoryId"
        />

        <!-- Anexos de Mídias e Arquivos (Estilo E-mail) -->
        <div class="flex flex-col gap-2 pt-2 border-t border-n-weak">
          <div class="flex items-center justify-between">
            <span class="text-xs text-n-slate-11 font-medium">Anexar Mídias e Arquivos:</span>
            <input ref="fileInputRef" type="file" multiple class="hidden" @change="handleFileUpload" />
            <Button
              label="Anexar Arquivo / Áudio"
              icon="i-lucide-paperclip"
              color="slate"
              size="xs"
              @click="triggerFileUpload"
            />
          </div>

          <div v-if="attachments.length" class="flex flex-wrap gap-2 mt-1">
            <div
              v-for="(att, idx) in attachments"
              :key="idx"
              class="flex items-center gap-2 px-2.5 py-1 rounded-md bg-n-alpha-2 border border-n-weak text-xs text-n-slate-12"
            >
              <Icon
                :icon="att.type === 'audio' ? 'i-lucide-volume-2' : att.type === 'image' ? 'i-lucide-image' : 'i-lucide-file-text'"
                class="size-3.5 text-n-brand"
              />
              <span class="truncate max-w-[150px] font-medium">{{ att.name }}</span>
              <button type="button" class="text-n-slate-10 hover:text-n-red-11" @click="removeAttachment(idx)">
                <Icon icon="i-lucide-x" class="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <FullEditor
        v-model="articleContent"
        class="py-0 pb-10 pl-4 rtl:pr-4 rtl:pl-0 h-fit"
        placeholder="Escreva a mensagem ou comunicado para a sua equipe aqui..."
        :enabled-menu-options="ARTICLE_EDITOR_MENU_OPTIONS"
        :autofocus="!isNewArticle"
      />
    </template>
  </HelpCenterLayout>
</template>

<style lang="scss" scoped>
:deep(.ProseMirror .empty-node::before) {
  @apply text-n-slate-10 text-base;
}

:deep(.ProseMirror-menubar-wrapper) {
  .ProseMirror-woot-style {
    @apply min-h-[15rem] max-h-full;
  }
}

:deep(.ProseMirror-menubar) {
  display: none; // Hide by default
}

:deep(.editor-root .has-selection) {
  .ProseMirror-menubar:not(:has(*)) {
    display: none !important;
  }

  .ProseMirror-menubar {
    @apply rounded-lg !px-3 !py-1.5 z-50 bg-n-background items-center gap-4 ml-0 mb-0 shadow-md outline outline-1 outline-n-weak;
    display: flex;
    top: var(--selection-top, auto) !important;
    left: var(--selection-left, 0) !important;
    width: fit-content !important;
    position: absolute !important;

    .ProseMirror-menuitem {
      @apply ltr:mr-0 rtl:ml-0 size-4 flex items-center;

      .ProseMirror-icon {
        @apply p-0.5 flex-shrink-0 ltr:mr-2 rtl:ml-2;
      }
    }

    .ProseMirror-menu-active {
      @apply bg-n-slate-3;
    }
  }
}
</style>
