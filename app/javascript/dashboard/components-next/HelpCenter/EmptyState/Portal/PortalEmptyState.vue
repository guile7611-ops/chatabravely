<script setup>
import { useRouter } from 'vue-router';
import EmptyStateLayout from 'dashboard/components-next/EmptyStateLayout.vue';
import Button from 'dashboard/components-next/button/Button.vue';

const router = useRouter();

const onCreateArticle = () => {
  router.push({
    name: 'portals_articles_new',
    params: { portalSlug: 'main', locale: 'pt_BR' },
  });
};
</script>

<template>
  <EmptyStateLayout
    :title="$t('HELP_CENTER.TITLE')"
    :subtitle="$t('HELP_CENTER.NEW_PAGE.DESCRIPTION')"
    class="bg-n-surface-1"
  >
    <template #actions>
      <Button
        :label="$t('HELP_CENTER.NEW_PAGE.CREATE_PORTAL_BUTTON')"
        icon="i-lucide-plus"
        @click="onCreateArticle"
      />
    </template>
  </EmptyStateLayout>
</template>
