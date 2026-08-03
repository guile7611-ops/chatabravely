<script setup>
import EmptyStateLayout from 'dashboard/components-next/EmptyStateLayout.vue';
import CategoryCard from 'dashboard/components-next/HelpCenter/CategoryCard/CategoryCard.vue';
import categoryContent from 'dashboard/components-next/HelpCenter/EmptyState/Category/categoryEmptyStateContent.js';

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <EmptyStateLayout :title="title" :subtitle="subtitle">

  </EmptyStateLayout>
</template>
