<script setup>
import { useAttrs } from 'vue';
import { useMapGetter } from 'dashboard/composables/store';

const attrs = useAttrs();
const globalConfig = useMapGetter('globalConfig/get');
</script>

<template>
  <img
    v-if="globalConfig.logoThumbnail"
    v-bind="attrs"
    :src="globalConfig.logoThumbnail"
  />
  <img
    v-else
    v-bind="attrs"
    src="/abravely-logo-novo.png"
    alt="Abravely Logo"
    class="object-contain"
  />
</template>
