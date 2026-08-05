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
    const rawAccountId = route?.params?.accountId;
    if (rawAccountId && !Number.isNaN(Number(rawAccountId))) {
      return Number(rawAccountId);
    }
    return null;
  });
  
  const currentAccount = computed(() => {
    if (!accountId.value) return null;
    return getAccountFn.value ? getAccountFn.value(accountId.value) : null;
  });

  const accountScopedUrl = url => {
    return accountId.value ? `/app/accounts/${accountId.value}/${url}` : `/app/${url}`;
  };

  const isCloudFeatureEnabled = feature => {
    if (!currentAccount.value) return false;
    return isFeatureEnabledonAccount.value
      ? isFeatureEnabledonAccount.value(currentAccount.value.id, feature)
      : false;
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
    } catch (error) {
      throw error;
    }
  };

  const finishOnboarding = async data => {
    try {
      await store.dispatch('accounts/finishOnboarding', data);
    } catch (error) {
      throw error;
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
