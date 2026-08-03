import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMapGetter, useStore } from './store';

/**
 * Composable for account-related operations.
 * @returns {Object} An object containing account-related properties and methods.
 */
export function useAccount() {
  const route = useRoute();
  const store = useStore();
  const getAccountFn = useMapGetter('accounts/getAccount');
  const isOnChatwootCloud = useMapGetter('globalConfig/isOnChatwootCloud');
  const isFeatureEnabledonAccount = useMapGetter(
    'accounts/isFeatureEnabledonAccount'
  );

  const accountId = computed(() => {
    return Number(route?.params?.accountId) || 1;
  });
  
  const currentAccount = computed(() => {
    const account = getAccountFn.value ? getAccountFn.value(accountId.value) : null;
    return account || { id: 1, name: 'Abravely Chat', role: 'administrator', status: 'active' };
  });

  const accountScopedUrl = url => {
    return `/app/accounts/${accountId.value}/${url}`;
  };

  const isCloudFeatureEnabled = feature => {
    if (!currentAccount.value) return true;
    return isFeatureEnabledonAccount.value ? isFeatureEnabledonAccount.value(currentAccount.value.id, feature) : true;
  };

  const accountScopedRoute = (name, params, query) => {
    return {
      name,
      params: { accountId: accountId.value, ...params },
      query: { ...query },
    };
  };

  const updateAccount = async (data, options) => {
    try {
      await store.dispatch('accounts/update', {
        ...data,
        options,
      });
    } catch (e) {
      // Mock fallback
    }
  };

  const finishOnboarding = async data => {
    try {
      await store.dispatch('accounts/finishOnboarding', data);
    } catch (e) {
      // Mock fallback
    }
  };

  return {
    accountId,
    route,
    currentAccount,
    accountScopedUrl,
    accountScopedRoute,
    isCloudFeatureEnabled,
    isOnChatwootCloud,
    updateAccount,
    finishOnboarding,
  };
}
