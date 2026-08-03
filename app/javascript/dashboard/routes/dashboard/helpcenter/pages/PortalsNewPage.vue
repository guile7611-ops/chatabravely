<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  router.replace({
    name: 'portals_articles_index',
    params: { portalSlug: 'main', locale: 'pt_BR' },
  });
});
</script>

<template>
  <div class="w-full h-full bg-n-background" />
</template>
