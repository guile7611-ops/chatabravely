<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import UpgradePage from '../components/UpgradePage.vue';
import { FEATURE_FLAGS } from 'dashboard/featureFlags';

const store = useStore();

const accountId = computed(() => store.getters.getCurrentAccountId);
const isFeatureEnabledonAccount = (id, flag) =>
  store.getters['accounts/isFeatureEnabledonAccount'](id, flag);

const isHelpCenterEnabled = computed(() =>
  isFeatureEnabledonAccount(accountId.value, FEATURE_FLAGS.HELP_CENTER)
);

onMounted(() => store.dispatch('categories/index'));
</script>

<template>
  <div class="flex w-full h-full min-h-0">
    <section
      v-if="isHelpCenterEnabled"
      class="flex flex-1 h-full px-0 overflow-hidden bg-n-surface-1"
    >
      <router-view />
    </section>
    <UpgradePage v-else />
  </div>
</template>
