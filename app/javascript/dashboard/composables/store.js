import { computed, unref } from 'vue';
import { getCurrentInstance } from 'vue';

export const useStore = () => {
  const vm = getCurrentInstance();
  if (!vm) throw new Error('must be called in setup');
  return vm.proxy.$store;
};

export const useStoreGetters = () => {
  const store = useStore();
  return Object.fromEntries(
    Object.keys(store.getters || {}).map(getter => [
      getter,
      computed(() => store.getters[getter]),
    ])
  );
};

export const useMapGetter = (key, fallback = undefined) => {
  const store = useStore();
  return computed(() => {
    if (!key || !store.getters || !(key in store.getters)) {
      return fallback;
    }
    const val = store.getters[key];
    return val !== undefined ? val : fallback;
  });
};

export const useFunctionGetter = (key, ...args) => {
  const store = useStore();
  return computed(() => {
    if (!key || !store.getters || !(key in store.getters)) {
      return 0;
    }
    const fn = store.getters[key];
    if (typeof fn !== 'function') return fn;
    const unrefedArgs = args.map(arg => unref(arg));
    try {
      const res = fn(...unrefedArgs);
      return res !== undefined ? res : 0;
    } catch (e) {
      return 0;
    }
  });
};
