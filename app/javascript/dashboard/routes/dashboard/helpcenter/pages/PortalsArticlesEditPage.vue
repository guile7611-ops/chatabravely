<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAlert, useTrack } from 'dashboard/composables';
import { PORTALS_EVENTS } from 'dashboard/helper/AnalyticsHelper/events';
import { useStore, useMapGetter } from 'dashboard/composables/store';

import ArticleEditor from 'dashboard/components-next/HelpCenter/Pages/ArticleEditorPage/ArticleEditor.vue';

const route = useRoute();
const router = useRouter();
const store = useStore();
const { t } = useI18n();

const { articleSlug } = route.params;

const articleById = useMapGetter('articles/articleById');

const article = computed(() => articleById.value(articleSlug));

const isUpdating = ref(false);
const isSaved = ref(false);

const saveArticle = async ({ ...values }) => {
  isUpdating.value = true;
  try {
    await store.dispatch('articles/update', {
      articleId: articleSlug,
      ...values,
    });
    isSaved.value = true;
  } catch (error) {
    const errorMessage =
      error?.message || t('HELP_CENTER.EDIT_ARTICLE_PAGE.API.ERROR');
    useAlert(errorMessage);
  } finally {
    setTimeout(() => {
      isUpdating.value = false;
      isSaved.value = true;
    }, 1500);
  }
};

const isCategoryArticles = computed(() => {
  return (
    route.name === 'portals_categories_articles_index' ||
    route.name === 'portals_categories_articles_edit' ||
    route.name === 'portals_categories_index'
  );
});

const goBackToArticles = () => {
  const { tab, categorySlug, locale } = route.params;
  const targetLocale = locale || 'pt_BR';

  if (isCategoryArticles.value) {
    router.push({
      name: 'portals_categories_articles_index',
      params: {
        portalSlug: 'main',
        categorySlug: categorySlug || '',
        locale: targetLocale,
      },
    });
  } else {
    router.push({
      name: 'portals_articles_index',
      params: {
        portalSlug: 'main',
        tab: tab || 'mine',
        categorySlug: categorySlug || '',
        locale: targetLocale,
      },
    });
  }
};

const fetchArticleDetails = () => {
  store.dispatch('articles/show', {
    id: articleSlug,
  });
};

const previewArticle = () => useAlert('A pré-visualização pública será disponibilizada junto do portal público da Central de Ajuda.');

onMounted(fetchArticleDetails);
</script>

<template>
  <ArticleEditor
    :article="article"
    :is-updating="isUpdating"
    :is-saved="isSaved"
    @save-article="saveArticle"
    @preview-article="previewArticle"
    @go-back="goBackToArticles"
  />
</template>
