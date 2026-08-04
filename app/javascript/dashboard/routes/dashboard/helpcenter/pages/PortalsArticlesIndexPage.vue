<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMapGetter, useStore } from 'dashboard/composables/store.js';
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
const currentUserId = useMapGetter('getCurrentUserID');

const selectedPortalSlug = computed(() => route.params.portalSlug);
const selectedCategorySlug = computed(() => route.params.categorySlug);
const status = computed(() => getArticleStatus(route.params.tab));

const author = computed(() =>
  route.params.tab === 'mine' ? currentUserId.value : null
);

const activeLocale = computed(() => route.params.locale);
const allowedLocales = [{ id: 'pt_BR', name: 'Português (Brasil)', code: 'pt_BR' }];

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

const fetchCategories = () => store.dispatch('categories/index');

onMounted(() => {
  fetchCategories();
  fetchArticles();
});

watch(
  () => route.params,
  () => {
    pageNumber.value = 1;
    fetchCategories();
    fetchArticles();
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="w-full h-full">
    <ArticlesPage
      :articles="articles"
      portal-name="Central de Ajuda"
      :categories="categories"
      :allowed-locales="allowedLocales"
      :meta="meta"
      :is-category-articles="isCategoryArticles"
      @page-change="onPageChange"
      @search="onSearch"
      @fetch-portal="fetchCategories"
      @refresh-articles="fetchArticles"
    />
  </div>
</template>
