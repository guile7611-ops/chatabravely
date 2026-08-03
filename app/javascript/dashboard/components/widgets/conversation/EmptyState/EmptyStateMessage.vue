<script>
import FeaturePlaceholder from './FeaturePlaceholder.vue';
export default {
  components: { FeaturePlaceholder },
  props: {
    message: {
      type: String,
      required: true,
    },
  },
};
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full">
    <img
      class="my-6 h-28 object-contain"
      src="/abravely-logo-novo.png"
      alt="Abravely Logo"
    />
    <span class="text-sm text-n-slate-12 font-medium text-center">
      {{ message }}
      <br />
    </span>
    <!-- Cmd bar, keyboard shortcuts placeholder -->
    <FeaturePlaceholder />
  </div>
</template>
