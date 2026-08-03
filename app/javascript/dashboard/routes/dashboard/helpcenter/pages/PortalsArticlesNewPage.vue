<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAlert, useTrack } from 'dashboard/composables';
import { useStore, useMapGetter } from 'dashboard/composables/store';
import { PORTALS_EVENTS } from 'dashboard/helper/AnalyticsHelper/events';

import ArticleEditor from 'dashboard/components-next/HelpCenter/Pages/ArticleEditorPage/ArticleEditor.vue';

const route = useRoute();
const router = useRouter();
const store = useStore();
const { t } = useI18n();

const { portalSlug } = route.params;

const selectedAuthorId = ref(null);
const selectedCategoryId = ref(null);

const currentUserId = useMapGetter('getCurrentUserID');
const categories = useMapGetter('categories/allCategories');

const categoryId = computed(() => {
  const { categorySlug } = route.params;
  if (categorySlug) {
    const matched = categories.value?.find(c => c.slug === categorySlug);
    if (matched) return matched.id;
  }
  return categories.value[0]?.id || null;
});

const isCategoryArticles = computed(
  () => route.name === 'portals_categories_articles_new'
);

const article = ref({});
const isUpdating = ref(false);
const isSaved = ref(false);

const setAuthorId = authorId => {
  selectedAuthorId.value = authorId;
};

const setCategoryId = newCategoryId => {
  selectedCategoryId.value = newCategoryId;
};

const createNewArticle = async (payload = {}) => {
  const title = payload?.title || article.value.title || 'Novo Comunicado / Artigo';
  const content = payload?.content || article.value.content || '';
  const attachments = payload?.attachments || [];

  article.value.title = title;
  article.value.content = content;

  if (isUpdating.value) return;

  isUpdating.value = true;
  try {
    const { locale, portalSlug: routePortalSlug } = route.params;
    const targetPortalSlug = routePortalSlug || portalSlug || 'default';
    const resolvedCategoryId = selectedCategoryId.value || categoryId.value;

    const articleId = await store.dispatch('articles/create', {
      portalSlug: targetPortalSlug,
      content,
      title,
      locale: locale || 'pt_BR',
      authorId: selectedAuthorId.value || currentUserId.value,
      categoryId: resolvedCategoryId,
      attachments,
      status: 'published',
    });

    useTrack(PORTALS_EVENTS.CREATE_ARTICLE, { locale });
    useAlert('Comunicado / Artigo publicado com sucesso!');

    router.push({
      name: 'portals_articles_index',
      params: {
        portalSlug: targetPortalSlug,
        tab: 'all',
        locale: locale || 'pt_BR',
      },
    });
  } catch (error) {
    const errorMessage =
      error?.message || t('HELP_CENTER.EDIT_ARTICLE_PAGE.API.ERROR');
    useAlert(errorMessage);
  } finally {
    isUpdating.value = false;
  }
};

const goBackToArticles = () => {
  const { portalSlug, tab, categorySlug, locale } = route.params;
  const targetPortalSlug = portalSlug || 'default';
  const targetLocale = locale || 'pt_BR';

  if (isCategoryArticles.value) {
    router.push({
      name: 'portals_categories_articles_index',
      params: {
        portalSlug: targetPortalSlug,
        categorySlug: categorySlug || '',
        locale: targetLocale,
      },
    });
  } else {
    router.push({
      name: 'portals_articles_index',
      params: {
        portalSlug: targetPortalSlug,
        tab: tab || 'mine',
        categorySlug: categorySlug || '',
        locale: targetLocale,
      },
    });
  }
};
</script>

<template>
  <ArticleEditor
    :article="article"
    :is-updating="isUpdating"
    :is-saved="isSaved"
    @create-article="createNewArticle"
    @go-back="goBackToArticles"
    @set-author="setAuthorId"
    @set-category="setCategoryId"
  />
</template>
