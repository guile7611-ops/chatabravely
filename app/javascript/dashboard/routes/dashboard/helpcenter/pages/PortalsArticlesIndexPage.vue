<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMapGetter, useStore } from 'dashboard/composables/store.js';
import allLocales from 'shared/constants/locales.js';
import { getArticleStatus } from 'dashboard/helper/portalHelper.js';
import ArticlesPage from 'dashboard/components-next/HelpCenter/Pages/ArticlePage/ArticlesPage.vue';

const route = useRoute();
const router = useRouter();
const store = useStore();

const pageNumber = ref(1);
const searchQuery = ref(route.query.search || '');

const allArticles = useMapGetter('articles/allArticles');
const articlesSortedByPosition = useMapGetter(
  'articles/allArticlesSortedByPosition'
);
const categories = useMapGetter('categories/allCategories');
const meta = useMapGetter('articles/getMeta');
const portalMeta = useMapGetter('portals/getMeta');
const currentUserId = useMapGetter('getCurrentUserID');
const getPortalBySlug = useMapGetter('portals/portalBySlug');

const selectedPortalSlug = computed(() => route.params.portalSlug);
const selectedCategorySlug = computed(() => route.params.categorySlug);
const status = computed(() => getArticleStatus(route.params.tab));

const author = computed(() =>
  route.params.tab === 'mine' ? currentUserId.value : null
);

const activeLocale = computed(() => route.params.locale);
const portal = computed(() => {
  const fetchedPortal = typeof getPortalBySlug.value === 'function'
    ? getPortalBySlug.value(selectedPortalSlug.value)
    : null;
  return fetchedPortal || {
    name: 'Central de Ajuda',
    slug: selectedPortalSlug.value || 'main',
    config: { allowed_locales: [] },
  };
});

const allowedLocales = computed(() => {
  if (!portal.value || !portal.value.config) {
    return [];
  }
  const allAllowedLocales = portal.value.config.allowed_locales || [];
  if (!Array.isArray(allAllowedLocales)) return [];
  return allAllowedLocales.map(locale => {
    return {
      id: locale?.code,
      name: allLocales[locale?.code] || locale?.code,
      code: locale?.code,
    };
  });
});

const defaultPortalLocale = computed(() => {
  return portal.value?.meta?.default_locale;
});

const selectedLocaleInPortal = computed(() => {
  return route.params.locale || defaultPortalLocale.value;
});

const isCategoryArticles = computed(() => {
  return (
    route.name === 'portals_categories_articles_index' ||
    route.name === 'portals_categories_articles_edit' ||
    route.name === 'portals_categories_index'
  );
});

// Use position-sorted articles for category views and categories filter view (where drag reorder is enabled)
const articles = computed(() =>
  isCategoryArticles.value ? articlesSortedByPosition.value : allArticles.value
);

const fetchArticles = ({ pageNumber: pageNumberParam } = {}) => {
  store.dispatch('articles/index', {
    pageNumber: pageNumberParam || pageNumber.value,
    portalSlug: selectedPortalSlug.value || 'main',
    locale: activeLocale.value || 'pt_BR',
    status: status.value,
    authorId: author.value,
    categorySlug: selectedCategorySlug.value,
    query: searchQuery.value || undefined,
  });
};

const onPageChange = pageNumberParam => {
  fetchArticles({ pageNumber: pageNumberParam });
};

const onSearch = query => {
  searchQuery.value = query;
  pageNumber.value = 1;
  router.replace({
    query: { ...route.query, search: query || undefined },
  });
  fetchArticles({ pageNumber: 1 });
};

const fetchPortalAndItsCategories = async locale => {
  try {
    await store.dispatch('portals/index');
    const selectedPortalParam = {
      portalSlug: selectedPortalSlug.value || 'main',
      locale: locale || selectedLocaleInPortal.value || 'pt_BR',
    };
    store.dispatch('portals/show', selectedPortalParam);
    store.dispatch('categories/index', selectedPortalParam);
    store.dispatch('agents/get');
  } catch (e) {
    // Suppress dispatch error in standalone mode
  }
};

onMounted(() => {
  fetchPortalAndItsCategories();
  fetchArticles();
});

watch(
  () => route.params,
  () => {
    pageNumber.value = 1;
    fetchPortalAndItsCategories();
    fetchArticles();
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="w-full h-full">
    <ArticlesPage
      v-if="portal"
      :articles="articles"
      :portal-name="portal.name"
      :categories="categories"
      :allowed-locales="allowedLocales"
      :meta="meta"
      :portal-meta="portalMeta"
      :is-category-articles="isCategoryArticles"
      @page-change="onPageChange"
      @search="onSearch"
      @fetch-portal="fetchPortalAndItsCategories"
      @refresh-articles="fetchArticles"
    />
  </div>
</template>
