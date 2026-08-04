<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMapGetter, useStore } from 'dashboard/composables/store.js';

import CategoriesPage from 'dashboard/components-next/HelpCenter/Pages/CategoryPage/CategoriesPage.vue';

const store = useStore();
const route = useRoute();

const categories = useMapGetter('categories/allCategoriesSortedByPosition');

const isFetching = useMapGetter('categories/isFetching');
const allowedLocales = [{ id: 'pt_BR', name: 'Português (Brasil)', code: 'pt_BR' }];

const fetchCategories = () => store.dispatch('categories/index');

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <CategoriesPage
    :categories="categories"
    :is-fetching="isFetching"
    :allowed-locales="allowedLocales"
    @fetch-categories="fetchCategories"
  />
</template>
