<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Spinner from 'dashboard/components-next/spinner/Spinner.vue';

const router = useRouter();
const route = useRoute();

const routeToView = (name, params) => {
  router.replace({ name, params, replace: true });
};

const routeToLastActivePortal = () => {
  const { navigationPath } = route.params;
  const isAValidRoute = [
    'portals_articles_index',
    'portals_categories_index',
  ].includes(navigationPath);

  const navigateTo = isAValidRoute ? navigationPath : 'portals_articles_index';
  return routeToView(navigateTo, { portalSlug: 'main', locale: 'pt_BR' });
};

onMounted(routeToLastActivePortal);
</script>

<template>
  <div
    class="flex items-center justify-center w-full bg-n-surface-1 text-n-slate-11"
  >
    <Spinner />
  </div>
</template>
